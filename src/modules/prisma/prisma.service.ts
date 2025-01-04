import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
		// 设置日志级别
    super({
      log: ['query', 'info', 'warn', 'error'], 
    });
  }
  async onModuleInit() {
		// 在模块初始化时连接到数据库
    await this.$connect(); 
  }

  async onModuleDestroy() {
		// 在应用程序关闭时断开与数据库的连
    await this.$disconnect(); 
  }
}