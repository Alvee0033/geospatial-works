import { Repository } from 'typeorm';
import { TeamMember } from '../../entities/team-member.entity';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
export declare class TeamService {
    private readonly teamRepository;
    constructor(teamRepository: Repository<TeamMember>);
    findAllActive(): Promise<TeamMember[]>;
    findAllAdmin(): Promise<TeamMember[]>;
    findBySlug(slug: string): Promise<TeamMember>;
    create(dto: CreateTeamMemberDto): Promise<TeamMember>;
    update(id: string, dto: UpdateTeamMemberDto): Promise<TeamMember>;
    remove(id: string): Promise<void>;
    reorder(items: {
        id: string;
        sortOrder: number;
    }[]): Promise<void>;
}
