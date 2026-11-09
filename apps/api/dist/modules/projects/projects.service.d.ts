import { Repository } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
export declare class ProjectsService {
    private readonly projectRepository;
    constructor(projectRepository: Repository<Project>);
    findAll(milestonesOnly?: boolean): Promise<Project[]>;
    findBySlug(slug: string): Promise<Project>;
    create(dto: CreateProjectDto): Promise<Project>;
    update(id: string, dto: UpdateProjectDto): Promise<Project>;
    delete(id: string): Promise<void>;
}
