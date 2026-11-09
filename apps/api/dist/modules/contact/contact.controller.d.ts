import { ContactService } from './contact.service';
import { CreateInquiryDto } from './dto/contact.dto';
import { InquiryStatus } from '../../entities/contact-inquiry.entity';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    createInquiry(dto: CreateInquiryDto): Promise<import("../../entities/contact-inquiry.entity").ContactInquiry>;
    getAllInquiries(): Promise<import("../../entities/contact-inquiry.entity").ContactInquiry[]>;
    updateStatus(id: string, status: InquiryStatus, internalNotes?: string): Promise<import("../../entities/contact-inquiry.entity").ContactInquiry>;
    deleteInquiry(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
