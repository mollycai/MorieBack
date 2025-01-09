import { Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService, PrismaService, UserService],
  exports: [RoleModule],
})
export class RoleModule {}
