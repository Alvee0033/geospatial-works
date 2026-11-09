import { FleetService } from './fleet.service';
export declare class FleetController {
    private readonly fleetService;
    constructor(fleetService: FleetService);
    getEquipment(): Promise<import("../../entities/equipment.entity").Equipment[]>;
    getPartners(): Promise<import("../../entities/partner.entity").Partner[]>;
    createEquipment(data: any): Promise<import("../../entities/equipment.entity").Equipment>;
    updateEquipment(id: string, data: any): Promise<import("../../entities/equipment.entity").Equipment>;
    deleteEquipment(id: string): Promise<void>;
    createPartner(data: any): Promise<import("../../entities/partner.entity").Partner>;
    deletePartner(id: string): Promise<void>;
}
