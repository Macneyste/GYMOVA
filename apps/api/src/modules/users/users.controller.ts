import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Permissions, type AuthUser } from '@gymova/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ConflictError } from '../../common/errors/app.errors';
import { PrincipalService, principalInclude } from '../../common/auth/principal.service';
import type { RequestUser } from '../../common/auth/request-user';
import { UpdateMeDto } from './dto/update-me.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly principals: PrincipalService,
  ) {}

  @Get('me')
  @RequirePermissions(Permissions.PROFILE_READ_SELF)
  @ApiOperation({ summary: 'The signed-in account with roles and permissions' })
  async me(@CurrentUser() user: RequestUser): Promise<AuthUser> {
    return (await this.principals.loadAuthUser(user.id)) as AuthUser;
  }

  @Patch('me')
  @RequirePermissions(Permissions.PROFILE_WRITE_SELF)
  @ApiOperation({ summary: 'Update name, phone, language or theme' })
  async updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateMeDto): Promise<AuthUser> {
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { phone: true } });
    const data: Prisma.UserUpdateInput = {
      fullName: dto.fullName,
      preferredLanguage: dto.preferredLanguage,
      themePreference: dto.themePreference,
    };
    if (dto.phone !== undefined && dto.phone !== current.phone) {
      data.phone = dto.phone;
      data.phoneVerifiedAt = null; // a new number must be verified again
    }
    try {
      const updated = await this.prisma.user.update({ where: { id: user.id }, data, include: principalInclude });
      return PrincipalService.toAuthUser(updated);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('An account with this phone number already exists', { field: 'phone' });
      }
      throw err;
    }
  }
}
