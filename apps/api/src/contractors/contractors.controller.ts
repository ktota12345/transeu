import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Patch,
    Delete,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ContractorsService } from './contractors.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';

@Controller('contractors')
@UseGuards(JwtAuthGuard)
export class ContractorsController {
    constructor(private readonly contractorsService: ContractorsService) {}

    @Post()
    create(@Body() data: Prisma.ContractorCreateInput) {
        return this.contractorsService.create(data);
    }

    @Get()
    async list(
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sort = buildSort(query['sort[field]'], query['sort[order]']);
        const filter = buildFilters(query);

        const [contractors, total] = await this.contractorsService.findAll(skip, take, filter, sort);

        res.setHeader('Content-Range', `contractors ${skip}-${skip + contractors.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return contractors;
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contractorsService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: Prisma.ContractorUpdateInput) {
        return this.contractorsService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contractorsService.remove(+id);
    }
    @Patch(':id/blacklist')
    async toggleBlacklist(
        @Param('id') id: string,
        @Body() body: { blacklisted: boolean; reason?: string }
    ) {
        return this.contractorsService.toggleBlacklist(+id, body.blacklisted, body.reason);
    }

}
