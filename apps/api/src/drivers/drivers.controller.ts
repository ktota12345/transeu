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
import { DriversService } from './drivers.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
    constructor(private readonly driversService: DriversService) {}

    @Post()
    create(@Body() createDriverDto: Prisma.DriverCreateInput) {
        return this.driversService.create(createDriverDto);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filterObj = buildFilters(query);

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
