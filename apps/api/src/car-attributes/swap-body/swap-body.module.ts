import { Module } from '@nestjs/common';
import { SwapBodyService } from './swap-body.service';
import { SwapBodyController } from './swap-body.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SwapBodyController],
    providers: [SwapBodyService],
})
export class SwapBodyModule {}
