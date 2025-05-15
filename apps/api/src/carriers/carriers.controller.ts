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
import { CarriersService } from './carriers.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';

@Controller('carriers')
@UseGuards(JwtAuthGuard)
export class CarriersController {
    constructor(private readonly carriersService: CarriersService) {}

    @Post()
    create(@Body() createCarrierDto: Prisma.CarrierCreateInput) {
        return this.carriersService.create(createCarrierDto);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filterObj = buildFilters(query);

        const [carriers, total] = await this.carriersService.findAll(skip, take, filterObj, sortObj);

        res.setHeader('Content-Range', `carriers ${skip}-${skip + carriers.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return carriers;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.carriersService.findOne(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateCarrierDto: Prisma.CarrierUpdateInput
    ) {
        return this.carriersService.update(+id, updateCarrierDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.carriersService.remove(+id);
    }
}
