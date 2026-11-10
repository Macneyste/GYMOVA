import { Body, Controller, Get, Injectable, Module, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import * as argon2 from 'argon2';
import { PrismaService } from './prisma.service';
import { JwtStrategy } from './jwt.strategy';
class RegisterDto { @IsEmail() email!:string; @IsString() @MinLength(2) fullName!:string; @IsString() @MinLength(10) password!:string; }
class LoginDto { @IsEmail() email!:string; @IsString() password!:string; }
class RefreshDto { @IsString() refreshToken!:string; }
@Injectable() class AuthService {
  constructor(private db:PrismaService, private jwt:JwtService) {}
  async register(dto:RegisterDto) { const passwordHash=await argon2.hash(dto.password,{type:argon2.argon2id}); const user=await this.db.user.create({data:{email:dto.email.toLowerCase(),fullName:dto.fullName,passwordHash,profile:{create:{}}}}); return this.issue(user.id,user.email,user.fullName); }
  async login(dto:LoginDto) { const user=await this.db.user.findUnique({where:{email:dto.email.toLowerCase()}}); if(!user || !(await argon2.verify(user.passwordHash,dto.password))) throw new UnauthorizedException('Invalid email or password'); return this.issue(user.id,user.email,user.fullName); }
  async issue(sub:string,email:string,fullName:string) { const accessToken=await this.jwt.signAsync({sub,email},{secret:process.env.JWT_ACCESS_SECRET,expiresIn:'15m'}); const refreshToken=await this.jwt.signAsync({sub},{secret:process.env.JWT_REFRESH_SECRET,expiresIn:'30d'}); await this.db.refreshToken.create({data:{userId:sub,tokenHash:await argon2.hash(refreshToken),expiresAt:new Date(Date.now()+30*864e5)}}); return {accessToken,refreshToken,user:{id:sub,email,fullName}}; }
  async refresh(token:string) { try { const payload=await this.jwt.verifyAsync<{sub:string}>(token,{secret:process.env.JWT_REFRESH_SECRET}); const tokens=await this.db.refreshToken.findMany({where:{userId:payload.sub,revokedAt:null,expiresAt:{gt:new Date()}}}); const stored=await Promise.any(tokens.map(async t => (await argon2.verify(t.tokenHash,token))?t:Promise.reject())).catch(()=>null); if(!stored) throw new Error(); await this.db.refreshToken.update({where:{id:stored.id},data:{revokedAt:new Date()}}); const user=await this.db.user.findUniqueOrThrow({where:{id:payload.sub}}); return this.issue(user.id,user.email,user.fullName); } catch { throw new UnauthorizedException('Session expired'); } }
}
@Injectable() class JwtAuthGuard extends AuthGuard('jwt') {}
@ApiTags('auth') @Controller('auth') class AuthController { constructor(private auth:AuthService){} @Post('register') register(@Body() dto:RegisterDto){return this.auth.register(dto)} @Post('login') login(@Body() dto:LoginDto){return this.auth.login(dto)} @Post('refresh') refresh(@Body() dto:RefreshDto){return this.auth.refresh(dto.refreshToken)} }
@Module({imports:[PassportModule.register({defaultStrategy:'jwt'}),JwtModule.register({})],providers:[AuthService,JwtAuthGuard,JwtStrategy],controllers:[AuthController],exports:[JwtAuthGuard,JwtModule]}) export class AuthModule {}
