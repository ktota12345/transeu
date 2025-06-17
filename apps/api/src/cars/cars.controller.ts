import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
    Res, UseGuards, Req,
} from '@nestjs/common';
import {Response} from 'express';
import {CarsService} from './cars.service';
import {Prisma} from '../../generated/prisma/client';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {buildFilters, buildSort, getPagination} from '../helpers/helpers';
import {CompanyAccessGuard} from "../auth/guards/company-access.guard";
import {privilegesOptions, roleHasPrivilege} from "../shared/permissions";
import {RequestWithUser} from "../auth/interfaces/request-with-user.interface";
import {RequireScopedModel} from "../auth/decorators/require-scoped-model.decorator";

@Controller('cars')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class CarsController {
    constructor(private readonly carsService: CarsService) {
    }

    @Post()
    create(
        @Body() data: any,
        @Req() req: RequestWithUser
    ) {
        const companyId = (roleHasPrivilege(req.user.role, privilegesOptions.GLOBAL_CONTEXT)) ? (data.companyId ?? req.user.companyId) : req.user.companyId;
        data.company = {
            connect: {
                id: companyId
            },
        };
        delete data.companyId;
        return this.carsService.create(data);
    }

    @Get()
    async list(
        @Req() req: RequestWithUser,
        @Res({passthrough: true}) res: Response,
        @Query() query: Record<string, any>
    ) {
        const {skip, take} = getPagination(query);  // Wyciągamy paginację za pomocą funkcji
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filter = buildFilters(query, req.companyScope ? req.user.companyId : null);
        const [cars, total] = await this.carsService.findAll(skip, take, filter, sortObj);
        res.setHeader('Content-Range', `cars ${skip}-${skip + cars.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return cars;
    }

    @RequireScopedModel('Car')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.carsService.findOne(+id);
    }

    @RequireScopedModel('Car')
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateCarDto: Prisma.CarUpdateInput
    ) {
        return this.carsService.update(+id, updateCarDto);
    }

    @RequireScopedModel('Car')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.carsService.remove(+id);
    }
}
