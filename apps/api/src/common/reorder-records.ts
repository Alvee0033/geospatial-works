import { BadRequestException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderRecordsDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  ids: string[];
}

export async function reorderRecords<T extends ObjectLiteral>(repository: Repository<T>, ids: string[]): Promise<void> {
  await repository.manager.transaction(async (manager) => {
    const target = manager.getRepository(repository.target);
    const records = await target.find({ select: ['id'] });
    const existingIds = new Set(records.map((record) => record.id as string));
    if (ids.length !== existingIds.size || ids.some((id) => !existingIds.has(id))) {
      throw new BadRequestException('The list has changed. Refresh and try again.');
    }
    for (const [index, id] of ids.entries()) {
      await target.update(id, { sortOrder: index + 1 } as unknown as QueryDeepPartialEntity<T>);
    }
  });
}
