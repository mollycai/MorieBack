import { Module } from '@nestjs/common';
import { LogModule } from './log/log.module';
import { MenuModule } from './menu/menu.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [LogModule, MenuModule, UserModule, RoleModule],
})
export class SystemModule {}
