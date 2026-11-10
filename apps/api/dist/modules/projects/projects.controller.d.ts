import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(milestonesOnly?: string): Promise<import("../../entities/project.entity").Project[]>;
    findAllAdmin(): Promise<import("../../entities/project.entity").Project[]>;
    findBySlug(slug: string): Promise<import("../../entities/project.entity").Project>;
    create(dto: CreateProjectDto): Promise<import("../../entities/project.entity").Project>;
    update(id: string, dto: UpdateProjectDto): Promise<import("../../entities/project.entity").Project>;
    delete(id: string): Promise<void>;
}
