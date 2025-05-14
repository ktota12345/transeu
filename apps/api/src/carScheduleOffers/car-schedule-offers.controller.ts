import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CarScheduleOffersService } from './car-schedule-offers.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { buildFilters, buildSort ,getPagination } from '../helpers/helpers';

@Controller('car-schedule-offers')
@UseGuards(JwtAuthGuard)
export class CarScheduleOffersController {
    constructor(private readonly offersService: CarScheduleOffersService) {}

    @Post()
    create(@Body() createDto: Prisma.CarScheduleOfferCreateInput) {
        return this.offersService.create(createDto);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        // --- Paginacja ---
        const { skip, take } = getPagination(query);  // Wyciągamy paginację

        // --- Sortowanie ---
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);

        // --- Filtry ---
        const filters = buildFilters(query);  // Tworzymy filtry

        // --- Zapytanie do bazy ---
        const [offers, total] = await this.offersService.findAll(skip, take, filters, sortObj);

        // --- Nagłówki dla paginacji (React Admin) ---
        res.setHeader('Content-Range', `offers ${skip}-${skip + offers.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return offers;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.offersService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: Prisma.CarScheduleOfferUpdateInput) {
        return this.offersService.update(+id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.offersService.remove(+id);
    }
}
