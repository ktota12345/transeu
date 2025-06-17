import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Query,
    Res, Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Prisma } from '../../generated/prisma/client';
import { Response } from 'express';
import { buildFilters, buildSort, getPagination } from '../helpers/helpers';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

import {privilegesOptions, roleHasPrivilege} from "../shared/permissions";
import {CompanyAccessGuard} from "../auth/guards/company-access.guard";
import {RequireScopedModel} from "../auth/decorators/require-scoped-model.decorator";

@Controller('users')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(
        @Body() data: any,
        @Req() req: RequestWithUser,
    ) {
        const companyId =(roleHasPrivilege(req.user.role, privilegesOptions.GLOBAL_CONTEXT)) ? (data.companyId??req.user.companyId) : req.user.companyId;
            data.company = {
                connect: {
                    id:companyId
                },
            };
            delete data.companyId;
        return this.usersService.create(data);
    }

    @Get()
    async findAll(
        @Req() req: RequestWithUser,
        @Res({ passthrough: true }) res: Response,
        @Query() query: Record<string, any>
    ) {

        const { skip, take } = getPagination(query);
        const sortObj = buildSort(query['sort[field]'], query['sort[order]']);



        const filters = buildFilters(query, req.companyScope ?? null);

        const [users, total] = await this.usersService.findAll(skip, take, filters, sortObj);
        res.setHeader('Content-Range', `users ${skip}-${skip + users.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return users;
    }
    @RequireScopedModel('User')
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(+id);
        if (user) {
            const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }


    @RequireScopedModel('User')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput) {
        return this.usersService.update(+id, data);
    }

    @RequireScopedModel('User')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
