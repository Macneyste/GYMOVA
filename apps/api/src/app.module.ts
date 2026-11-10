import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth';
import { PrismaService } from './prisma.service';
import { FitnessModule } from './fitness';
import { CatalogueModule } from './catalogue';
import { TrackingModule } from './tracking';
@Module({ imports:[ConfigModule.forRoot({isGlobal:true}),AuthModule,FitnessModule,CatalogueModule,TrackingModule], providers:[PrismaService] }) export class AppModule {}
