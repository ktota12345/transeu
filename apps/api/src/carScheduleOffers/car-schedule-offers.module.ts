import { Module } from '@nestjs/common';
import { CarScheduleOffersService } from './car-schedule-offers.service';
import { CarScheduleOffersController } from './car-schedule-offers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CarScheduleOffersController],
    providers: [CarScheduleOffersService],
})
export class CarScheduleOffersModule {}
