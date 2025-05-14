import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
    Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CarsService } from './cars.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { buildFilters, buildSort ,getPagination } from '../helpers/helpers';

@Controller('cars')
@UseGuards(JwtAuthGuard)
export class CarsController {
    constructor(private readonly carsService: CarsService) {}

    @Post()
    create(@Body() createCarDto: Prisma.CarCreateInput) {
        return this.carsService.create(createCarDto);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);  // Wyciągamy paginację za pomocą funkcji
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filters = buildFilters(query);
        const [cars, total] = await this.carsService.findAll(skip, take, filters, sortObj);
        res.setHeader('Content-Range', `cars ${skip}-${skip + cars.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return cars;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.carsService.findOne(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateCarDto: Prisma.CarUpdateInput
    ) {
        return this.carsService.update(+id, updateCarDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.carsService.remove(+id);
    }
}
