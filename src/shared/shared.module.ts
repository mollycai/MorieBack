import { Global, Module } from '@nestjs/common';
import { UtilService } from './services/utils.service';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/common/guard/auth.guard';

/**
 * 全局共享模块
 */
@Global()
@Module({
  imports: [
    // jwt
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
    // redis
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const pwd = configService.get<string>('REDIS_PASSWORD');
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');
        const db = configService.get<string>('REDIS_DB');
        return {
          type: 'single',
          url: `redis://:${pwd}@${host}:${port}/${db}`,
        };
      },
    }),
  ],
  providers: [
    UtilService,
    // 权限守卫
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [JwtModule, UtilService],
})
export class SharedModule {}
