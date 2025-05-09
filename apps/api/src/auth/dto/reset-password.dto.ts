// src/auth/dto/reset-password.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    readonly newPassword: string;

    @IsString()
    readonly resetToken: string;
}
