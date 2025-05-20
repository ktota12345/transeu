import { Module } from '@nestjs/common';
import { VehicleBodyService } from './vehicle-body.service';
import { VehicleBodyController } from './vehicle-body.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [VehicleBodyController],
    providers: [VehicleBodyService],
})
export class VehicleBodyModule {}
