import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async findAll(activeOnly = true): Promise<Service[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.serviceRepository.find({
      where,
      order: { sortOrder: 'ASC', title: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { slug } });
    if (!service) {
      throw new NotFoundException(`Service with slug '${slug}' not found`);
    }
    return service;
  }

  async create(dto: CreateServiceDto): Promise<Service> {
    const existing = await this.serviceRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Service with slug '${dto.slug}' already exists`);
    }
    const service = this.serviceRepository.create(dto);
    return this.serviceRepository.save(service);
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    Object.assign(service, dto);
    return this.serviceRepository.save(service);
  }

  async delete(id: string): Promise<void> {
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }
}

