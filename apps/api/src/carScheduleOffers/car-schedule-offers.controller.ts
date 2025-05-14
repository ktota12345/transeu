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

@Controller('car-schedule-offers')
@UseGuards(JwtAuthGuard)
export class CarScheduleOffersController {
    constructor(private readonly offersService: CarScheduleOffersService) {}

    @Post()
    create(@Body() createDto: Prisma.CarScheduleOfferCreateInput) {
        return this.offersService.create(createDto);
    }

    @Get()
    async findAll(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const page = parseInt(query['pagination[page]'] ?? '1', 10);
        const perPage = parseInt(query['pagination[perPage]'] ?? '10', 10);
        const skip = (page - 1) * perPage;
        const take = perPage;

        const sortField = query['sort[field]'];
        const sortOrder = query['sort[order]'];
        let sortObj: { [key: string]: 'asc' | 'desc' } | undefined;

        if (sortField && sortOrder) {
            sortObj = {
                [sortField]: sortOrder.toLowerCase() as 'asc' | 'desc',
            };
        }

        const filterObj: Record<string, any> = {};
        for (const key in query) {
            const match = key.match(/^filter\[(.+)]$/);
            if (match) {
                const fieldName = match[1];
                const value = query[key];
                filterObj[fieldName] = { contains: value };
            }
        }

        const [offers, total] = await this.offersService.findAll(skip, take, filterObj, sortObj);

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
