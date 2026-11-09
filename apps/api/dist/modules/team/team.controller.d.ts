import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    getActive(): Promise<import("../../entities/team-member.entity").TeamMember[]>;
    getBySlug(slug: string): Promise<import("../../entities/team-member.entity").TeamMember>;
    getAllAdmin(): Promise<import("../../entities/team-member.entity").TeamMember[]>;
    create(dto: CreateTeamMemberDto): Promise<import("../../entities/team-member.entity").TeamMember>;
    update(id: string, dto: UpdateTeamMemberDto): Promise<import("../../entities/team-member.entity").TeamMember>;
    reorder(items: {
        id: string;
        sortOrder: number;
    }[]): Promise<void>;
    remove(id: string): Promise<void>;
}
