import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'name.min' })
  @MaxLength(80, { message: 'name.max' })
  fullName?: string;

  /** Send null or "" to remove the phone number. */
  @ApiPropertyOptional({ nullable: true, example: '+252611234567' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? (value.trim() === '' ? null : value.trim()) : value))
  @ValidateIf((o: UpdateMeDto) => o.phone !== null)
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'phone.invalid' })
  phone?: string | null;

  @ApiPropertyOptional({ enum: ['en', 'so'] })
  @IsOptional()
  @IsIn(['en', 'so'])
  preferredLanguage?: 'en' | 'so';

  @ApiPropertyOptional({ enum: ['SYSTEM', 'DARK', 'LIGHT'] })
  @IsOptional()
  @IsIn(['SYSTEM', 'DARK', 'LIGHT'])
  themePreference?: 'SYSTEM' | 'DARK' | 'LIGHT';
}
