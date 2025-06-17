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
import { CarriersService } from './carriers.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getPagination, buildSort, buildFilters } from '../helpers/helpers';
import {CompanyAccessGuard} from "../auth/guards/company-access.guard";
import {privilegesOptions, roleHasPrivilege} from "../shared/permissions";
import {RequestWithUser} from "../auth/interfaces/request-with-user.interface";
import {RequireScopedModel} from "../auth/decorators/require-scoped-model.decorator";

@Controller('carriers')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class CarriersController {
    constructor(private readonly carriersService: CarriersService) {}

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
        return this.carriersService.create(data);
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

        const [carriers, total] = await this.carriersService.findAll(skip, take, filter, sortObj);

        res.setHeader('Content-Range', `carriers ${skip}-${skip + carriers.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return carriers;
    }

    @RequireScopedModel('Carrier')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.carriersService.findOne(+id);
    }

    @RequireScopedModel('Carrier')
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateCarrierDto: Prisma.CarrierUpdateInput
    ) {
        return this.carriersService.update(+id, updateCarrierDto);
    }

    @RequireScopedModel('Carrier')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.carriersService.remove(+id);
    }
}
