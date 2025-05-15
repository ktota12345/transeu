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
import { BodyPropertyService } from './body-property.service';
import { Prisma } from '../../../generated/prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../../helpers/helpers';

@Controller('body-property')
@UseGuards(JwtAuthGuard)
export class BodyPropertyController {
    constructor(private readonly service: BodyPropertyService) {}

    @Post()
    create(@Body() dto: Prisma.BodyPropertyCreateInput) {
        return this.service.create(dto);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filterObj = buildFilters(query);

        const [items, total] = await this.service.findAll(skip, take, filterObj, sortObj);

        res.setHeader('Content-Range', `body-property ${skip}-${skip + items.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return items;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: Prisma.BodyPropertyUpdateInput) {
        return this.service.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
