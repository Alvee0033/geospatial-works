import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInquiry, InquiryStatus } from '../../entities/contact-inquiry.entity';
import { PageSection } from '../../entities/page-section.entity';
import { CreateInquiryDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(
    @InjectRepository(ContactInquiry)
    private readonly inquiryRepository: Repository<ContactInquiry>,
    @InjectRepository(PageSection)
    private readonly pageSectionRepository: Repository<PageSection>,
  ) {}

  async createInquiry(dto: CreateInquiryDto): Promise<ContactInquiry> {
    const inquiry = this.inquiryRepository.create(dto);
    const saved = await this.inquiryRepository.save(inquiry);
    void this.sendInquiryEmails(saved).catch((error: unknown) => {
      this.logger.error(`Email notification failed for inquiry ${saved.id}`, error instanceof Error ? error.stack : String(error));
    });
    return saved;
  }

  private async sendInquiryEmails(inquiry: ContactInquiry): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    const contactSection =
      (await this.pageSectionRepository
        .findOne({ where: { pageKey: 'contact', sectionKey: 'contact_info' } })
        .catch(() => null)) ||
      (await this.pageSectionRepository
        .findOne({ where: { pageKey: 'contact', sectionKey: 'office' } })
        .catch(() => null));
    const content = (contactSection?.content || {}) as Record<string, any>;

    const rawSender = String(content.senderEmail || '').trim();
    const from = rawSender
      ? rawSender.includes('<')
        ? rawSender
        : `Geospatial Works <${rawSender}>`
      : process.env.RESEND_FROM || process.env.EMAIL_FROM || 'Geospatial Works <noreply@geospatialworks.com.bd>';

    const isCvRequest = /cv|resume/i.test(inquiry.serviceType || '');
    const notifyTo = String(
      (isCvRequest
        ? content.cvRequestEmail || content.emailCareers
        : content.emailInquiries || content.email) ||
        content.cvRequestEmail ||
        content.email ||
        process.env.ADMIN_NOTIFY_EMAIL ||
        'admin@geospatialworks.com.bd',
    ).trim();

    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character] || character);

    const send = async (to: string, subject: string, html: string, replyTo?: string) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}`);
    };

    await Promise.all([
      send(
        notifyTo,
        `[${inquiry.serviceType || 'Inquiry'}] from ${inquiry.fullName}`,
        `<p><strong>Name:</strong> ${escapeHtml(inquiry.fullName)}</p><p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p><p><strong>Phone:</strong> ${escapeHtml(inquiry.phone || '—')}</p><p><strong>Type:</strong> ${escapeHtml(inquiry.serviceType || 'General')}</p><p><strong>Message:</strong><br/>${escapeHtml(inquiry.message).replace(/\n/g, '<br/>')}</p><p>Reply to this email to send the CV to the requester.</p>`,
        inquiry.email,
      ),
      send(
        inquiry.email,
        `Request received — Geospatial Works`,
        `<p>Dear ${escapeHtml(inquiry.fullName)},</p><p>Thank you for contacting Geospatial Works regarding <strong>${escapeHtml(inquiry.serviceType || 'your inquiry')}</strong>. Our team has received your request and will respond shortly.</p><p>Best regards,<br/>Geospatial Works Bangladesh</p>`,
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

