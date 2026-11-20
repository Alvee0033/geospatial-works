import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientContact } from '../../entities/client-contact.entity';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClientContact])],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
