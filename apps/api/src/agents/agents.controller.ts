import {Controller, Get, Req, UseGuards, Param, Put, Body, Delete, Post} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
export class AgentsController {
    constructor(private readonly agentsService: AgentsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async index(@Req() req) {
        return this.agentsService.findAll();
    }
    @Get(':id')
    @UseGuards(JwtAuthGuard) // Jeśli chcesz zabezpieczyć endpoint
    async findOne(@Param('id') id: string) {
        return this.agentsService.findOne(id); // Przesyłamy id jako string
    }


    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updateAgentDto: UpdateAgentDto
    ) {
        return this.agentsService.update(parseInt(id, 10), updateAgentDto);
    }


    @Delete(':id')
    @UseGuards(JwtAuthGuard) // Zabezpieczamy endpoint
    async remove(@Param('id') id: string) {
        return this.agentsService.remove(parseInt(id, 10)); // Przesyłamy id jako int
    }

    @Post()
    @UseGuards(JwtAuthGuard) // Zabezpieczamy endpoint
    async create(@Body() createAgentDto: CreateAgentDto) {
        return this.agentsService.create(createAgentDto); // Przekazujemy dane do serwisu
    }
}
