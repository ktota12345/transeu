import { Module } from '@nestjs/common';
import { CarSchedulesService } from './car-schedules.service';
import { CarSchedulesController } from './car-schedules.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CarSchedulesController],
    providers: [CarSchedulesService],
})
export class CarSchedulesModule {}
