import { Global, Module } from '@nestjs/common';
import { LogModule } from '../system/log/log.module';
import { MenuModule } from '../system/menu/menu.module';
import { UserModule } from '../system/user/user.module';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { RoleModule } from '../system/role/role.module';

// 不设置全局模块的话，在别处引入会报错
@Global()
@Module({
  imports: [LogModule, UserModule, MenuModule, RoleModule],
  controllers: [MainController],
  providers: [MainService],
  exports: [MainService],
})
export class MainModule {}
