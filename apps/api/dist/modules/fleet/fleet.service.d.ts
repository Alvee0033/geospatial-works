import { Repository } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { Partner } from '../../entities/partner.entity';
export declare class FleetService {
    private readonly equipmentRepository;
    private readonly partnerRepository;
    constructor(equipmentRepository: Repository<Equipment>, partnerRepository: Repository<Partner>);
    getEquipment(): Promise<Equipment[]>;
    createEquipment(data: Partial<Equipment>): Promise<Equipment>;
    updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment>;
    deleteEquipment(id: string): Promise<void>;
    getPartners(): Promise<Partner[]>;
    createPartner(data: Partial<Partner>): Promise<Partner>;
    deletePartner(id: string): Promise<void>;
}
