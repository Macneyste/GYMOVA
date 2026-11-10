import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../database/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  @Get()
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'Liveness + database readiness probe' })
  async check() {
    const database = (await this.prisma.isHealthy()) ? 'up' : 'down';
    const payload = {
      status: database === 'up' ? 'ok' : 'degraded',
      database,
      version: process.env.npm_package_version ?? '1.0.0',
      environment: this.config.nodeEnv,
      timestamp: new Date().toISOString(),
    };
    if (database !== 'up') throw new ServiceUnavailableException(payload);
    return payload;
  }
}
