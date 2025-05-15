import { Module } from '@nestjs/common';
import { VehicleEquipmentService } from './vehicle-equipment.service';
import { VehicleEquipmentController } from './vehicle-equipment.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [VehicleEquipmentController],
    providers: [VehicleEquipmentService],
})
export class VehicleEquipmentModule {}
