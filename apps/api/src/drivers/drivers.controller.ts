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
import { DriversService } from './drivers.service';
import { Prisma } from '../../generated/prisma/client';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
    constructor(private readonly driversService: DriversService) {}

    @Post()
    create(@Body() createDriverDto: Prisma.DriverCreateInput) {
        return this.driversService.create(createDriverDto);
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
                filterObj[fieldName] = { contains: value }; // można rozszerzyć na inne operatory
            }
        }

        const [drivers, total] = await this.driversService.findAll(skip, take, filterObj, sortObj);

        res.setHeader('Content-Range', `drivers ${skip}-${skip + drivers.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return drivers;
    }


    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.driversService.findOne(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateDriverDto: Prisma.DriverUpdateInput
    ) {
        return this.driversService.update(+id, updateDriverDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.driversService.remove(+id);
    }
}
