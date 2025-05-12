// src/agents/dto/update-agent.dto.ts
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAgentDto {
    @IsInt()
    id: number;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsBoolean()
    isActive: boolean;

    @IsDateString()
    createdAt: string;

    @IsDateString()
    updatedAt: string;

    @IsArray()
    @IsString({ each: true })
    specializations: string[];

    @IsArray()
    @IsString({ each: true })
    priorityClients: string[];

    @IsArray()
    @IsString({ each: true })
    cargoTypes: string[];

    @IsArray()
    @IsString({ each: true })
    additionalServices: string[];

    @IsOptional()
    @IsString()
    destinationCity?: string | null;

    @IsOptional()
    @IsInt()
    searchRadius?: number | null;
}
