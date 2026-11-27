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

    const isCvRequest = /^CV request\b/i.test(inquiry.serviceType || '');
    const requestedMember = isCvRequest
      ? inquiry.serviceType?.match(/^CV request:\s*(.+)$/i)?.[1] ||
        inquiry.message.match(/^CV request for (.+?)\. Organization:/)?.[1] ||
        'a team member'
      : '';
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

    const notificationSubject = isCvRequest
      ? `CV request for ${requestedMember} — ${inquiry.fullName}`
      : `[${inquiry.serviceType || 'Inquiry'}] from ${inquiry.fullName}`;
    const notificationHtml = isCvRequest
      ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#12284b"><div style="border-top:5px solid #ec2d31;padding:24px;border-radius:8px;background:#f5f8fc"><p style="font-size:12px;font-weight:bold;letter-spacing:.12em;color:#2865ba">GEOSPATIAL WORKS · CV REQUEST</p><h1 style="font-size:24px;line-height:1.25;margin:12px 0">${escapeHtml(requestedMember)}</h1><p style="margin:0 0 20px">${escapeHtml(inquiry.fullName)} requested this team member’s CV.</p><table style="width:100%;border-collapse:collapse;font-size:14px"><tr><td style="padding:8px 0;color:#52627a">Requester</td><td>${escapeHtml(inquiry.fullName)}</td></tr><tr><td style="padding:8px 0;color:#52627a">Email</td><td>${escapeHtml(inquiry.email)}</td></tr><tr><td style="padding:8px 0;color:#52627a">Phone</td><td>${escapeHtml(inquiry.phone || 'Not provided')}</td></tr></table><div style="background:white;padding:16px;margin-top:20px;border-radius:8px;white-space:pre-wrap">${escapeHtml(inquiry.message)}</div><p style="font-size:13px;margin-top:20px">Reply to this email and attach the requested CV. Your reply will go to ${escapeHtml(inquiry.email)}.</p></div></div>`
      : `<p><strong>Name:</strong> ${escapeHtml(inquiry.fullName)}</p><p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p><p><strong>Phone:</strong> ${escapeHtml(inquiry.phone || '—')}</p><p><strong>Type:</strong> ${escapeHtml(inquiry.serviceType || 'General')}</p><p><strong>Message:</strong><br/>${escapeHtml(inquiry.message).replace(/\n/g, '<br/>')}</p>`;

    await Promise.all([
      send(
        notifyTo,
        notificationSubject,
        notificationHtml,
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

