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
import { SearchScheduleSetupService } from './search-schedule-setup.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';

@Controller('search-schedule-setup')
@UseGuards(JwtAuthGuard)
export class SearchScheduleSetupController {
    constructor(private readonly service: SearchScheduleSetupService) {}

    @Post()
    create(@Body() data: Prisma.SearchScheduleSetupCreateInput) {
        return this.service.create(data);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filterObj = buildFilters(query);

        const [records, total] = await this.service.findAll(skip, take, filterObj, sortObj);

        res.setHeader('Content-Range', `search-schedule-setup ${skip}-${skip + records.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return records;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: Prisma.SearchScheduleSetupUpdateInput) {
        return this.service.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
