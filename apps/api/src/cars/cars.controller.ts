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
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@Controller('cars')
//@UseGuards(JwtAuthGuard)
export class CarsController {
    constructor(private readonly carsService: CarsService) {}

    @Post()
    create(@Body() createCarDto: Prisma.CarCreateInput) {
        return this.carsService.create(createCarDto);
    }

    @Get()
    async findAll(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        // --- Pagination ---
        const page = parseInt(query['pagination[page]'] ?? '1', 10);
        const perPage = parseInt(query['pagination[perPage]'] ?? '10', 10);
        const skip = (page - 1) * perPage;
        const take = perPage;

        // --- Sortowanie ---
        const sortField = query['sort[field]'];
        const sortOrder = query['sort[order]'];
        let sortObj: { [key: string]: 'asc' | 'desc' } | undefined;

        if (sortField && sortOrder) {
            sortObj = {
                [sortField]: sortOrder.toLowerCase() as 'asc' | 'desc',
            };
        }

        // --- Filtry ---
        const filterObj: Record<string, any> = {};
        for (const key in query) {
            const match = key.match(/^filter\[(.+)]$/);
            if (match) {
                const fieldName = match[1];
                const value = query[key];
                filterObj[fieldName] = { contains: value };
            }
        }

        // --- Zapytanie do bazy ---
        const [cars, total] = await this.carsService.findAll(skip, take, filterObj, sortObj);

        // --- Nagłówki dla paginacji (React Admin) ---
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
