import { Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.agent.findMany();
    }

    async findOne(id: string) {
        const agentId = parseInt(id, 10); // Konwertujemy id na liczbę
        if (isNaN(agentId)) {
            throw new NotFoundException(`Agent with ID ${id} not found`);
        }

        const agent = await this.prisma.agent.findUnique({
            where: { id: agentId },
        });

        if (!agent) {
            throw new NotFoundException(`Agent with ID ${id} not found`);
        }

        return agent;
    }
    async update(id: number, data: UpdateAgentDto) {
        const { id: _removedId, ...rest } = data;

        if (rest.destinationCity === null) {
            delete rest.destinationCity;
        }

        return this.prisma.agent.update({
            where: { id },
            data: rest,
        });
    }

    async remove(id: number) {
        const agent = await this.prisma.agent.findUnique({
            where: { id },
        });

        if (!agent) {
            throw new NotFoundException(`Agent with ID ${id} not found`);
        }

        return this.prisma.agent.delete({
            where: { id },
        });
    }
    async create(createAgentDto: any) {
        return this.prisma.agent.create({
            data: {
                ...createAgentDto
            },
        });
    }


}
