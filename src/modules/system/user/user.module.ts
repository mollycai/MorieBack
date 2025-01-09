import { Module } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UtilService } from 'src/shared/services/utils.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, UtilService],
  exports: [UserService],
})
export class UserModule {}
