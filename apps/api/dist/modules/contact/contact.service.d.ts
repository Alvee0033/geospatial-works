import { Repository } from 'typeorm';
import { ContactInquiry, InquiryStatus } from '../../entities/contact-inquiry.entity';
import { CreateInquiryDto } from './dto/contact.dto';
export declare class ContactService {
    private readonly inquiryRepository;
    constructor(inquiryRepository: Repository<ContactInquiry>);
    createInquiry(dto: CreateInquiryDto): Promise<ContactInquiry>;
    getAllInquiries(): Promise<ContactInquiry[]>;
    updateStatus(id: string, status: InquiryStatus, internalNotes?: string): Promise<ContactInquiry>;
    deleteInquiry(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
