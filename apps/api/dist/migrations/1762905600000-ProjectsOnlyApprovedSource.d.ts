import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class ProjectsOnlyApprovedSource1762905600000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
