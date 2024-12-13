import { Module } from '@nestjs/common';
import { LoginModule } from './modules/login/login.module';
import { SystemModule } from './modules/system/system.module';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
    }),
		SharedModule,
    LoginModule,
    SystemModule,
  ]
})
export class AppModule {}
