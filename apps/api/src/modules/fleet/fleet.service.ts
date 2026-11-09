import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { Partner } from '../../entities/partner.entity';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
  ) {}

  // Equipment
  async getEquipment(): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    const item = this.equipmentRepository.create(data);
    return this.equipmentRepository.save(item);
  }

  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
    const item = await this.equipmentRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Equipment not found');
    Object.assign(item, data);
    return this.equipmentRepository.save(item);
  }

  async deleteEquipment(id: string): Promise<void> {
    await this.equipmentRepository.delete(id);
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return this.partnerRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async createPartner(data: Partial<Partner>): Promise<Partner> {
    const partner = this.partnerRepository.create(data);
    return this.partnerRepository.save(partner);
  }

  async deletePartner(id: string): Promise<void> {
    await this.partnerRepository.delete(id);
  }
}

