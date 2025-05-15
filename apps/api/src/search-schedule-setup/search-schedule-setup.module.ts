import { Module } from '@nestjs/common';
import { SearchScheduleSetupService } from './search-schedule-setup.service';
import { SearchScheduleSetupController } from './search-schedule-setup.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SearchScheduleSetupController],
    providers: [SearchScheduleSetupService],
})
export class SearchScheduleSetupModule {}
