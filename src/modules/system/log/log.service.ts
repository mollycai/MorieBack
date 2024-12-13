import { Injectable } from '@nestjs/common';
import { prisma } from 'src/prisma';

@Injectable()
export class LogService {
	/**
	 * 保存登录日志
	 * @param uid 
	 * @param ip 
	 */
  async saveLoginLog(uid: number, ip: string): Promise<void> {
    await prisma.sys_logininfor.create({
      data: {
        ipaddr: ip,
        userName: uid.toString(),
      },
    });
  }
}
