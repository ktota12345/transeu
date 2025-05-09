import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('agents')
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async index(@Req() req) {
        return this.agentsService.findAll();
    }
}
