export declare const uploadDir: string;
export declare class MediaController {
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
    }>;
    listMedia(): Promise<{
        uploaded: {
            url: string;
            filename: string;
            size: number;
            updatedAt: Date;
        }[];
        stock: {
            url: string;
            filename: string;
        }[];
    }>;
}
