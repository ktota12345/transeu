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
import { CarSchedulesService } from './car-schedules.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { buildFilters, buildSort, getPagination } from '../helpers/helpers';

@Controller('carSchedules')
@UseGuards(JwtAuthGuard)
export class CarSchedulesController {
    constructor(private readonly service: CarSchedulesService) {}

    @Post()
    create(@Body() data: Prisma.CarScheduleCreateInput) {
        return this.service.create(data);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filters = buildFilters(query);

        const [items, total] = await this.service.findAll(skip, take, filters, sortObj);

        res.setHeader('Content-Range', `carSchedules ${skip}-${skip + items.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return items;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: Prisma.CarScheduleUpdateInput) {
        return this.service.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
