import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import {privilegesOptions, roleHasPrivilege} from '../../shared/permissions';

@Injectable()
export class UserAccessGuard implements CanActivate {
    constructor(
        private readonly usersService: UsersService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user; // zakładamy, że auth middleware dodał usera
        const targetUserId = parseInt(request.params.id);

        if (!user) throw new ForbiddenException('No user context found');

        // Sprawdź uprawnienia
        if (!roleHasPrivilege(user.role, privilegesOptions.MANAGE_USERS)) {
            throw new ForbiddenException('Missing MANAGE_USERS privilege');
        }

        const targetUser = await this.usersService.findOne(targetUserId);

        if (!targetUser) {
            throw new ForbiddenException('Target user not found');
        }

        // Sprawdź czy może zarządzać userem spoza swojej firmy
        if (
            targetUser.companyId !== user.companyId &&
            !roleHasPrivilege(user.role, privilegesOptions.MANAGE_ALL_USERS)
        ) {
            throw new ForbiddenException('Cannot access users outside your company');
        }

        return true;
    }
}
