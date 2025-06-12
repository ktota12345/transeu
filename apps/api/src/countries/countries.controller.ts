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
import { CountriesService } from './countries.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';

@Controller('countries')
@UseGuards(JwtAuthGuard)
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    @Post()
    create(@Body() createCountryDto: Prisma.CountryCreateInput) {
        return this.countriesService.create(createCountryDto);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);

        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filterObj = buildFilters(query);

        const [countries, total] = await this.countriesService.findAll(skip, 250, filterObj, sortObj);

        res.setHeader('Content-Range', `countries ${skip}-${skip + countries.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return countries;
    }

    @Get(':code')
    findOne(@Param('code') code: string) {
        return this.countriesService.findOne(code);
    }

    @Put(':code')
    update(
        @Param('code') code: string,
        @Body() updateCountryDto: Prisma.CountryUpdateInput
    ) {
        return this.countriesService.update(code, updateCountryDto);
    }

    @Delete(':code')
    remove(@Param('code') code: string) {
        return this.countriesService.remove(code);
    }
}
