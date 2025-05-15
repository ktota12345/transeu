import { Module } from '@nestjs/common';
import { VehicleLoadSecuringService } from './vehicle-load-securing.service';
import { VehicleLoadSecuringController } from './vehicle-load-securing.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [VehicleLoadSecuringController],
    providers: [VehicleLoadSecuringService],
})
export class VehicleLoadSecuringModule {}
