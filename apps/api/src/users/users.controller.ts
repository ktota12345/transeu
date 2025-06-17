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
import {UserAccessGuard} from "../auth/guards/user-access.guard";

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(
        @Body() data: any,
        @Req() req: RequestWithUser,
    ) {
        const companyId =(roleHasPrivilege(req.user.role, privilegesOptions.MANAGE_ALL_USERS)) ? data.companyId : req.user.companyId;
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


        const user = req.user;
        const hasAllUsers = roleHasPrivilege(user.role, privilegesOptions.MANAGE_ALL_USERS);

        const filters = buildFilters(query, hasAllUsers ? null: user.companyId);

        const [users, total] = await this.usersService.findAll(skip, take, filters, sortObj);
        res.setHeader('Content-Range', `users ${skip}-${skip + users.length - 1}/${total}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');

        return users;
    }
    @Get(':id')
    @UseGuards(UserAccessGuard)
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findOne(+id);
        if (user) {
            const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }


    @Put(':id')
    @UseGuards(UserAccessGuard)
    update(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput) {
        return this.usersService.update(+id, data);
    }

    @Delete(':id')
    @UseGuards(UserAccessGuard)
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
