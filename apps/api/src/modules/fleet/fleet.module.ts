import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { Partner } from '../../entities/partner.entity';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment, Partner])],
  controllers: [FleetController],
  providers: [FleetService],
  exports: [FleetService],
})
export class FleetModule {}

