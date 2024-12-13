import { Global, Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { LogModule } from '../system/log/log.module';
import { UserModule } from '../system/user/user.module';

// 不设置全局模块的话，在别处引入会报错
@Global()
@Module({
  imports: [LogModule, UserModule],
  controllers: [LoginController],
  providers: [LoginService],
	exports: [LoginService]
})
export class LoginModule {}
