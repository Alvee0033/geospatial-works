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
    const saved = await this.inquiryRepository.save(inquiry);
    void this.sendInquiryEmails(saved).catch(() => undefined);
    return saved;
  }

  private async sendInquiryEmails(inquiry: ContactInquiry): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Geospatial Works <noreply@geospatialworks.com.bd>';
    const notifyTo = process.env.ADMIN_NOTIFY_EMAIL || 'admin@geospatialworks.com.bd';
    if (!apiKey) return;

    const send = (to: string, subject: string, html: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, html }),
        signal: AbortSignal.timeout(10000),
      });

    await Promise.allSettled([
      send(
        notifyTo,
        `[${inquiry.serviceType || 'Inquiry'}] from ${inquiry.fullName}`,
        `<p><strong>Name:</strong> ${inquiry.fullName}</p><p><strong>Email:</strong> ${inquiry.email}</p><p><strong>Phone:</strong> ${inquiry.phone || '—'}</p><p><strong>Type:</strong> ${inquiry.serviceType || 'General'}</p><p><strong>Message:</strong><br/>${inquiry.message}</p>`,
      ),
      send(
        inquiry.email,
        `Request received — Geospatial Works`,
        `<p>Dear ${inquiry.fullName},</p><p>Thank you for contacting Geospatial Works regarding <strong>${inquiry.serviceType || 'your inquiry'}</strong>. Our team has received your request and will respond shortly.</p><p>Best regards,<br/>Geospatial Works Bangladesh</p>`,
      ),
    ]);
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

