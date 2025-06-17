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
    UseGuards, Req,
} from '@nestjs/common';
import { Response } from 'express';
import { DriversService } from './drivers.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';
import {CompanyAccessGuard} from "../auth/guards/company-access.guard";
import {privilegesOptions, roleHasPrivilege} from "../shared/permissions";
import {RequestWithUser} from "../auth/interfaces/request-with-user.interface";
import {RequireScopedModel} from "../auth/decorators/require-scoped-model.decorator";

@Controller('drivers')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class DriversController {
    constructor(private readonly driversService: DriversService) {}

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
        return this.driversService.create(data);
    }

    @Get()
    async list(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {
        const { skip, take } = getPagination(query);
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);
        const filter = buildFilters(query, req.companyScope ? req.user.companyId : null);

        const [drivers, total] = await this.driversService.findAll(skip, take, filter, sortObj);

        res.setHeader('Content-Range', `drivers ${skip}-${skip + drivers.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return drivers;
    }

    @RequireScopedModel('Driver')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.driversService.findOne(+id);
    }

    @RequireScopedModel('Driver')
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateDriverDto: Prisma.DriverUpdateInput
    ) {
        return this.driversService.update(+id, updateDriverDto);
    }

    @RequireScopedModel('Driver')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.driversService.remove(+id);
    }
}
