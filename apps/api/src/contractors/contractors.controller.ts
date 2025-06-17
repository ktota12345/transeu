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
    UseGuards, Req,
} from '@nestjs/common';
import {Response} from 'express';
import {ContractorsService} from './contractors.service';
import {Prisma} from '../../generated/prisma/client';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {getPagination, buildSort, buildFilters} from '../helpers/helpers';
import {CompanyAccessGuard} from "../auth/guards/company-access.guard";
import {privilegesOptions, roleHasPrivilege} from "../shared/permissions";
import {RequestWithUser} from "../auth/interfaces/request-with-user.interface";
import {RequireScopedModel} from "../auth/decorators/require-scoped-model.decorator";

@Controller('contractors')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@RequireScopedModel('contractors')
export class ContractorsController {
    constructor(private readonly contractorsService: ContractorsService) {
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
        return this.contractorsService.create(data);
    }

    @Get()
    async list(
        @Req() req: RequestWithUser,
        @Res({passthrough: true}) res: Response,
        @Query() query: Record<string, any>
    ) {
        const {skip, take} = getPagination(query);
        const sort = buildSort(query['sort[field]'], query['sort[order]']);
        const filter = buildFilters(query, req.companyScope ? req.user.companyId : null);

        const [contractors, total] = await this.contractorsService.findAll(skip, take, filter, sort);

        res.setHeader('Content-Range', `contractors ${skip}-${skip + contractors.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return contractors;
    }

    @RequireScopedModel('Contractor')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contractorsService.findOne(+id);
    }

    @RequireScopedModel('Contractor')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: Prisma.ContractorUpdateInput) {
        return this.contractorsService.update(+id, data);
    }

    @RequireScopedModel('Contractor')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contractorsService.remove(+id);
    }

    @RequireScopedModel('Contractor')
    @Patch(':id/blacklist')
    async toggleBlacklist(
        @Param('id') id: string,
        @Body() body: { blacklisted: boolean; reason?: string }
    ) {
        return this.contractorsService.toggleBlacklist(+id, body.blacklisted, body.reason);
    }

}
