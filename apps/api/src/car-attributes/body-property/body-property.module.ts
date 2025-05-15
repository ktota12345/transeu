import { Module } from '@nestjs/common';
import { BodyPropertyService } from './body-property.service';
import { BodyPropertyController } from './body-property.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BodyPropertyController],
    providers: [BodyPropertyService],
})
export class BodyPropertyModule {}
