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
import { CompaniesService } from './companies.service';
import { Prisma } from '../../generated/prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {}

    @Post()
    create(@Body() data: Prisma.CompanyCreateInput) {
        return this.companiesService.create(data);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sort = buildSort(query['sort[field]'], query['sort[order]']);
        const filter = buildFilters(query);

        const [companies, total] = await this.companiesService.findAll(skip, take, filter, sort);

        res.setHeader('Content-Range', `companies ${skip}-${skip + companies.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return companies;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.companiesService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: Prisma.CompanyUpdateInput) {
        return this.companiesService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.companiesService.remove(+id);
    }
}
