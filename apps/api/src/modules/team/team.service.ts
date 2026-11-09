import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from '../../entities/team-member.entity';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamRepository: Repository<TeamMember>,
  ) {}

  async findAllActive(): Promise<TeamMember[]> {
    return this.teamRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<TeamMember[]> {
    return this.teamRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<TeamMember> {
    const member = await this.teamRepository.findOne({ where: { slug } });
    if (!member) throw new NotFoundException(`Team member with slug ${slug} not found`);
    return member;
  }

  async create(dto: CreateTeamMemberDto): Promise<TeamMember> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newMember = this.teamRepository.create({ ...dto, slug });
    return this.teamRepository.save(newMember);
  }

  async update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember> {
    const member = await this.teamRepository.findOne({ where: { id } });
    if (!member) throw new NotFoundException(`Team member not found`);
    Object.assign(member, dto);
    return this.teamRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const result = await this.teamRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Team member not found`);
  }

  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    for (const item of items) {
      await this.teamRepository.update(item.id, { sortOrder: item.sortOrder });
    }
  }
}

