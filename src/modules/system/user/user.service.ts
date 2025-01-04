import { Injectable } from '@nestjs/common';
import { sys_user } from '@prisma/client';
import { isEmpty } from 'lodash';
import { ApiException } from 'src/common/exceptions/api.exception';
import { prisma } from 'src/prisma';

@Injectable()
export class UserService {
  /**
   * @description 根据用户名查询用户
   * @param username
   * @returns
   */
  async getUserByUsername(username: string): Promise<sys_user | undefined> {
    return await prisma.sys_user.findFirst({
      where: {
        user_name: username,
        status: '0',
      },
    });
  }

	/**
	 * 根据用户id获取信息
	 * @param uuid 
	 * @param ip 
	 * @returns 
	 */
  async getUserInfo(uuid: number, ip?: string): Promise<Partial<sys_user>>  {
    const user: sys_user = await prisma.sys_user.findUnique({
      where: {
        user_id: uuid,
      },
    });
    if (isEmpty(user)) {
      throw new ApiException(1004);
    }
    return {
      user_name: user.user_name,
      nick_name: user.nick_name,
      email: user.email,
      phonenumber: user.phonenumber,
      remark: user.remark,
      avatar: user.avatar,
      login_ip: ip,
    };
  }
}
