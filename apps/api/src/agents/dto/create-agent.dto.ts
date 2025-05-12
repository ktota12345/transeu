import { IsString, IsBoolean, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateAgentDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsBoolean()
    isActive: boolean;

    @IsInt()
    @IsOptional()
    selectedLogisticsBase?: number;

    @IsArray()
    @IsOptional()
    preferredCargoTypes?: string[];

    @IsArray()
    @IsOptional()
    unwantedCargoTypes?: string[];

}
