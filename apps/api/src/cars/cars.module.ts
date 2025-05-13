import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Jeśli używasz PrismaService

@Module({
    imports: [PrismaModule], // Importujemy PrismaModule, który udostępnia PrismaService
    controllers: [CarsController],
    providers: [CarsService],
})
export class CarsModule {}
