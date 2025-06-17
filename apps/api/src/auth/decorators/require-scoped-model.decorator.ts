// decorators/require-privilege.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SCOPE_MODEL_NAME = 'GLOBAL_CONTEXT';

export const RequireScopedModel = (scopeModelName: string) =>
    SetMetadata(SCOPE_MODEL_NAME, scopeModelName);
