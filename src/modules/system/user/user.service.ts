import { Injectable } from '@nestjs/common';
import { prisma } from 'src/prisma';
import { sys_user } from '@prisma/client';
import { UserInfo } from './user.entity';
import { isEmpty } from 'lodash';
import { ApiException } from 'src/common/exceptions/api.exception';

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
        userName: username,
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
  async getUserInfo(uuid: number, ip?: string): Promise<UserInfo> {
    const user: sys_user = await prisma.sys_user.findUnique({
      where: {
        userId: uuid,
      },
    });
    if (isEmpty(user)) {
      throw new ApiException(1004);
    }
    return {
      name: user.userName,
      nickName: user.nickName,
      email: user.email,
      phone: user.phonenumber,
      remark: user.remark,
      headImg: user.avatar,
      loginIP: ip,
    };
  }
}
