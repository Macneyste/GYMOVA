import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? [{ emit: 'event', level: 'warn' }, { emit: 'event', level: 'error' }] : [{ emit: 'event', level: 'error' }],
    });
    // Never log query parameters: they can contain health data and credentials.
    (this as unknown as { $on: (e: string, cb: (ev: { message: string }) => void) => void }).$on('error', (e) =>
      this.logger.error(e.message),
    );
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
