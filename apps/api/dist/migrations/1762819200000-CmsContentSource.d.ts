import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CmsContentSource1762819200000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(): Promise<void>;
}
