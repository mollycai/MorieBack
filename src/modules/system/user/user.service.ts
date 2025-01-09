import { Injectable } from '@nestjs/common';
import { sys_user } from '@prisma/client';
import { isEmpty } from 'lodash';
import {
	CODE_DUPLICATE,
	CODE_EMPTY,
	CODE_FORBIDDEN,
	CODE_NOT_FOUND,
} from 'src/common/constants/code.constants';
import { NOT_DELETE } from 'src/common/constants/user.constant';
import { ApiException } from 'src/common/exceptions/api.exception';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { prisma } from 'src/prisma';
import { UtilService } from 'src/shared/services/utils.service';
import { IN } from './user.constant';
import { AllocatedListDto, BatchAuthDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly utilService: UtilService,
    private readonly prisma: PrismaService,
  ) {}

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
  async getUserInfo(uuid: number, ip?: string): Promise<Partial<sys_user>> {
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

  /**
   * @description: 获取角色下的所有用户
   * @param allocatedListDto
   * @param relation 关系，决定查某角色下的用户还是某角色下未授权该角色的用户
   */
  async allocatedList(
    { roleId, userName, pageNum, pageSize, params }: AllocatedListDto,
    relation = IN,
  ) {
    if (!roleId) {
      return this.utilService.responseMessage({
        msg: '角色为空',
        code: CODE_EMPTY,
      });
    }

    // 通过 roleId 获取关联的 userId 列表
    const userMappings = await this.prisma.sys_user_role.findMany({
      where: {
        role_id: roleId,
      },
      select: {
        user_id: true,
      },
    });

    // 提取 userIds
    const userIds = userMappings.map((mapping) => mapping.user_id);
    if (userIds.length === 0) {
      return this.utilService.responseMessage<CommonType.PageResponse>({
        data: {
          records: [],
          total: 0,
        },
      });
    }

    const where = {
      user_id: {
        [relation]: userIds,
      },
      del_flag: NOT_DELETE,
    };
    if (userName) {
      where['user_name'] = { contains: userName, mode: 'insensitive' };
    }
    const beginTime = params?.beginTime;
    const endTime = params?.endTime;
    if (beginTime && endTime) {
      where['create_time'] = {
        gte: new Date(Number(beginTime)),
        lte: new Date(Number(endTime)),
      };
    }

    // 分页处理
    const take = Number(pageSize);
    const skip = (Number(pageNum) - 1) * take;

    // 通过 userIds 查询用户详细信息
    const records = await this.prisma.sys_user.findMany({
      skip,
      take,
      where,
      orderBy: [
        { create_by: 'desc' }, // 按照createdAt字段降序
      ],
    });

		const total = await this.prisma.sys_user.count({ where });

    return this.utilService.responseMessage({
			data: {
        records,
        total,
        pageNum: Number(pageNum),
        pageSize: take,
      },
		});
  }

  /**
   * @description: 解除用户授权
   * @param batchAuthDto
   */
  async cancelAuth(batchAuthDto: BatchAuthDto) {
    const { roleId, userIds } = batchAuthDto;

    if (!roleId || !userIds || userIds.length === 0) {
      return this.utilService.responseMessage({
        msg: '角色ID或用户ID列表为空',
        code: CODE_EMPTY,
      });
    }

    // 检查是否为用户的 common 权限
    const isCommonRole = await this.prisma.sys_role.findFirst({
      where: {
        role_id: roleId,
        role_key: 'common', // 假设 common 权限的 role_key 为 'common'
      },
    });

    if (isCommonRole) {
      return this.utilService.responseMessage({
        msg: '无法取消用户的 common 权限',
        code: CODE_FORBIDDEN,
      });
    }

    // 删除 sys_user_role 表中对应的记录
    const result = await this.prisma.sys_user_role.deleteMany({
      where: {
        role_id: roleId,
        user_id: {
          in: userIds,
        },
      },
    });

    if (result.count === 0) {
      return this.utilService.responseMessage({
        msg: '未找到任何匹配的授权记录',
        code: CODE_NOT_FOUND,
      });
    }

    return this.utilService.responseMessage({
      msg: `成功取消 ${result.count} 个用户对角色ID ${roleId} 的授权`
    });
  }

  /**
   * @description: 授权用户
   * @param batchAuthDto
   */
  async grantAuth(batchAuthDto: BatchAuthDto) {
    const { roleId, userIds } = batchAuthDto;

    if (!roleId || !userIds || userIds.length === 0) {
      return this.utilService.responseMessage({
        msg: '角色ID或用户ID列表为空',
        code: CODE_EMPTY,
      });
    }

    // 检查角色是否存在
    const role = await this.prisma.sys_role.findUnique({
      where: {
        role_id: roleId,
      },
    });

    if (!role) {
      return this.utilService.responseMessage({
        msg: '指定的角色不存在',
        code: CODE_NOT_FOUND,
      });
    }

    // 遍历用户列表，过滤已授权的用户
    const existingUserRoles = await this.prisma.sys_user_role.findMany({
      where: {
        role_id: roleId,
        user_id: {
          in: userIds,
        },
      },
      select: {
        user_id: true,
      },
    });

    const alreadyAuthorizedUserIds = existingUserRoles.map(
      (userRole) => userRole.user_id,
    );
    const newUserIds = userIds.filter(
      (userId) => !alreadyAuthorizedUserIds.includes(userId),
    );

    if (newUserIds.length === 0) {
      return this.utilService.responseMessage({
        msg: '所有用户已被授权，无需重复授权',
        code: CODE_DUPLICATE,
      });
    }

    // 批量插入新的授权记录
    const insertData = newUserIds.map((userId) => ({
      role_id: roleId,
      user_id: userId,
    }));

    await this.prisma.sys_user_role.createMany({
      data: insertData,
      skipDuplicates: true, // 防止重复插入
    });

    return this.utilService.responseMessage({
      msg: `成功为 ${newUserIds.length} 个用户分配角色`,
    });
  }
}
