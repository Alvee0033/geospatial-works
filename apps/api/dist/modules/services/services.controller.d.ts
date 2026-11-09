import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(): Promise<import("../../entities/service.entity").Service[]>;
    findBySlug(slug: string): Promise<import("../../entities/service.entity").Service>;
    findAllAdmin(): Promise<import("../../entities/service.entity").Service[]>;
    create(dto: CreateServiceDto): Promise<import("../../entities/service.entity").Service>;
    update(id: string, dto: UpdateServiceDto): Promise<import("../../entities/service.entity").Service>;
    delete(id: string): Promise<void>;
}
