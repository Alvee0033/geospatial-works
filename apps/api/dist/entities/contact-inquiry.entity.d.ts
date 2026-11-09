export declare enum InquiryStatus {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED"
}
export declare class ContactInquiry {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    serviceType: string;
    message: string;
    status: InquiryStatus;
    internalNotes: string;
    createdAt: Date;
    updatedAt: Date;
}
