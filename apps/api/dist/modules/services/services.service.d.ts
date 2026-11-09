import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
export declare class ServicesService {
    private readonly serviceRepository;
    constructor(serviceRepository: Repository<Service>);
    findAll(activeOnly?: boolean): Promise<Service[]>;
    findBySlug(slug: string): Promise<Service>;
    create(dto: CreateServiceDto): Promise<Service>;
    update(id: string, dto: UpdateServiceDto): Promise<Service>;
    delete(id: string): Promise<void>;
}
