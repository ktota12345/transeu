// guards/company-access.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {Request} from 'express';
import {privilegesOptions, roleHasPrivilege} from '../../shared/permissions';
import {SCOPE_MODEL_NAME} from '../decorators/require-scoped-model.decorator';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class CompanyAccessGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { companyScope?: number | null }>();
        const user = request.user;


        if (!user) {
            throw new ForbiddenException('No user in context');
        }

        if (roleHasPrivilege(user.role, privilegesOptions.GLOBAL_CONTEXT)) {
            request.companyScope = null;
            return true;
        }

        const routeParams = request.params;
        const modelId = routeParams.id;
        if (!modelId) {
            request.companyScope = user.companyId;
            return true;
        }


        const scopeModel = this.reflector.get<string>(
            SCOPE_MODEL_NAME,
            context.getHandler()
        );
        if (!scopeModel) {
            throw new ForbiddenException('You dont have access to this model');
        }
        const record = await this.prisma[scopeModel].findUnique({
            where: {id: +modelId},
            select: {companyId: true},
        });

        if (!record || record.companyId !== user.companyId) {
            throw new ForbiddenException('Access denied for record scope');
        } else {

            request.companyScope = record.companyId;
            return true;
        }

    }
}
