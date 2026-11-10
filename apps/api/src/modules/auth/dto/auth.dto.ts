import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Length, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

// Messages are i18n keys shared with the mobile client (see packages/shared-validation).
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const normaliseEmail = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const emptyToUndefined = ({ value }: { value: unknown }) => (typeof value === 'string' && value.trim() === '' ? undefined : trim({ value }));

const PASSWORD_RULES = [
  MinLength(10, { message: 'password.min' }),
  MaxLength(128, { message: 'password.max' }),
  Matches(/[A-Za-z]/, { message: 'password.letter' }),
  Matches(/[0-9]/, { message: 'password.number' }),
];
function StrongPassword(): PropertyDecorator {
  return (target, key) => {
    IsString({ message: 'password.required' })(target, key);
    for (const rule of PASSWORD_RULES) rule(target, key);
  };
}

export class RegisterDto {
  @ApiProperty({ example: 'Amina Yusuf' })
  @Transform(trim)
  @IsString()
  @MinLength(2, { message: 'name.min' })
  @MaxLength(80, { message: 'name.max' })
  fullName!: string;

  @ApiProperty({ example: 'amina@example.com' })
  @Transform(normaliseEmail)
  @IsEmail({}, { message: 'email.invalid' })
  @MaxLength(254)
  email!: string;

  @ApiPropertyOptional({ example: '+252611234567' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'phone.invalid' })
  phone?: string;

  @ApiProperty({ minLength: 10 })
  @StrongPassword()
  password!: string;

  @ApiPropertyOptional({ enum: ['en', 'so'], default: 'en' })
  @IsOptional()
  @IsIn(['en', 'so'])
  preferredLanguage?: 'en' | 'so';
}

export class LoginDto {
  @ApiProperty()
  @Transform(normaliseEmail)
  @IsEmail({}, { message: 'email.invalid' })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'password.required' })
  @MaxLength(128)
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @Length(20, 200)
  refreshToken!: string;
}

export class LogoutDto {
  @ApiPropertyOptional({ nullable: true })
  @ValidateIf((o: LogoutDto) => o.refreshToken !== null && o.refreshToken !== undefined)
  @IsString()
  @MaxLength(200)
  refreshToken?: string | null;
}

export class VerifyDto {
  @ApiProperty({ enum: ['EMAIL_VERIFY', 'PHONE_VERIFY'] })
  @IsIn(['EMAIL_VERIFY', 'PHONE_VERIFY'])
  purpose!: 'EMAIL_VERIFY' | 'PHONE_VERIFY';

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'otp.invalid' })
  code!: string;
}

export class ResendVerificationDto {
  @ApiProperty({ enum: ['EMAIL_VERIFY', 'PHONE_VERIFY'] })
  @IsIn(['EMAIL_VERIFY', 'PHONE_VERIFY'])
  purpose!: 'EMAIL_VERIFY' | 'PHONE_VERIFY';
}

export class ForgotPasswordDto {
  @ApiProperty()
  @Transform(normaliseEmail)
  @IsEmail({}, { message: 'email.invalid' })
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @Transform(normaliseEmail)
  @IsEmail({}, { message: 'email.invalid' })
  email!: string;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'otp.invalid' })
  code!: string;

  @ApiProperty({ minLength: 10 })
  @StrongPassword()
  password!: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'password.required' })
  @MaxLength(128)
  currentPassword!: string;

  @ApiProperty({ minLength: 10 })
  @StrongPassword()
  newPassword!: string;
}
