import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInquiry, InquiryStatus } from '../../entities/contact-inquiry.entity';
import { CreateInquiryDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactInquiry)
    private readonly inquiryRepository: Repository<ContactInquiry>,
  ) {}

  async createInquiry(dto: CreateInquiryDto): Promise<ContactInquiry> {
    const inquiry = this.inquiryRepository.create(dto);
    return this.inquiryRepository.save(inquiry);
  }

  async getAllInquiries(): Promise<ContactInquiry[]> {
    return this.inquiryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: InquiryStatus, internalNotes?: string): Promise<ContactInquiry> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    inquiry.status = status;
    if (internalNotes !== undefined) inquiry.internalNotes = internalNotes;
    return this.inquiryRepository.save(inquiry);
  }

  async deleteInquiry(id: string): Promise<{ success: boolean; id: string }> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    await this.inquiryRepository.remove(inquiry);
    return { success: true, id };
  }
}

