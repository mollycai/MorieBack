import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoginModule } from './modules/login/login.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SystemModule } from './modules/system/system.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
    }),
    SharedModule,
    LoginModule,
    SystemModule,
    PrismaModule,
  ],
})
export class AppModule {}
