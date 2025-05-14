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

@Controller('carSchedules')
@UseGuards(JwtAuthGuard)
export class CarSchedulesController {
    constructor(private readonly service: CarSchedulesService) {}

    @Post()
    create(@Body() data: Prisma.CarScheduleCreateInput) {
        return this.service.create(data);
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
                if (fieldName.toLowerCase().includes('id')) {
                    filterObj[fieldName] = { equals: parseInt(value, 10) };
                } else {
                    filterObj[fieldName] = { contains: value };
                }
            }
        }

        const [items, total] = await this.service.findAll(skip, take, filterObj, sortObj);

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
