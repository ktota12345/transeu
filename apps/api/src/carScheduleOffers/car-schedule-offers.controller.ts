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
    UseGuards, Patch, Req,
} from '@nestjs/common';
import { Response } from 'express';
import { CarScheduleOffersService } from './car-schedule-offers.service';
import { Prisma } from '../../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { buildFilters, buildSort ,getPagination } from '../helpers/helpers';
import {CompanyAccessGuard} from "../auth/guards/company-access.guard";
import {privilegesOptions, roleHasPrivilege} from "../shared/permissions";
import {RequestWithUser} from "../auth/interfaces/request-with-user.interface";
import {RequireScopedModel} from "../auth/decorators/require-scoped-model.decorator";


@Controller('car-schedule-offers')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class CarScheduleOffersController {
    constructor(private readonly offersService: CarScheduleOffersService) {}

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
        return this.offersService.create(data);
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
        const [offers, total] = await this.offersService.findAll(skip, take, filter, sortObj);

        // --- Nagłówki dla paginacji (React Admin) ---
        res.setHeader('Content-Range', `offers ${skip}-${skip + offers.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return offers;
    }

    @RequireScopedModel('CarScheduleOffer')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.offersService.findOne(+id);
    }

    @RequireScopedModel('CarScheduleOffer')
    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: Prisma.CarScheduleOfferUpdateInput) {
        return this.offersService.update(+id, updateDto);
    }

    @RequireScopedModel('CarScheduleOffer')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.offersService.remove(+id);
    }

    @Post('assign')
    async assignOffer(
        @Req() req: RequestWithUser,
        @Body() data: any
    ) {
        const companyId = (roleHasPrivilege(req.user.role, privilegesOptions.GLOBAL_CONTEXT)) ? (data.companyId ?? req.user.companyId) : req.user.companyId;
        data.company = {
            connect: {
                id: companyId
            },
        };
        delete data.companyId;
        return this.offersService.assignExternalOffer(data);
    }

    @RequireScopedModel('CarScheduleOffer')
    @Post(':id/accept')
    async acceptOffer(@Param('id') id: string) {
        return this.offersService.update(+id, { status: 'confirmed' });
    }

    @RequireScopedModel('CarScheduleOffer')
    @Post(':id/reject')
    async rejectOffer(@Param('id') id: string) {
        return this.offersService.update(+id, { status: 'rejected' });
    }
    @RequireScopedModel('CarScheduleOffer')
    @Patch(':id')
    patch(@Param('id') id: string, @Body() body:any) {
        return this.offersService.update(+id, body);
    }


}
