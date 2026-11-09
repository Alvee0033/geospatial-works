import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(milestonesOnly = false): Promise<Project[]> {
    const where = milestonesOnly ? { isMilestone: true } : {};
    return this.projectRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { slug } });
    if (!project) {
      throw new NotFoundException(`Project with slug '${slug}' not found`);
    }
    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const existing = await this.projectRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Project with slug '${dto.slug}' already exists`);
    }
    const project = this.projectRepository.create(dto);
    return this.projectRepository.save(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async delete(id: string): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}

