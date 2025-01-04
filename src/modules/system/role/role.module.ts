import { Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService, PrismaService],
})
export class RoleModule {}
