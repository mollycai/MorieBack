import { Injectable } from '@nestjs/common';
import { sys_user } from '@prisma/client';
import { isEmpty } from 'lodash';
import {
	CODE_DUPLICATE,
	CODE_EMPTY,
	CODE_FORBIDDEN,
	CODE_NOT_FOUND,
	MSG_CREATE,
	MSG_UPDATE,
} from 'src/common/constants/code.constants';
import { IS_DELETE, NOT_DELETE } from 'src/common/constants/user.constant';
import { ApiException } from 'src/common/exceptions/api.exception';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { prisma } from 'src/prisma';
import { UtilService } from 'src/shared/services/utils.service';
import { IN } from './user.constant';
import {
	AllocatedListDto,
	BatchAuthDto,
	CreateUserDto,
	ListUserDto,
	UpdateUserDto,
} from './user.dto';

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
        role_id: +roleId,
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
      msg: `成功取消 ${result.count} 个用户对角色ID ${roleId} 的授权`,
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

  /**
   * @description: 查询用户列表
	 * @param ListUserDto
   */
  async findAll({
    userId,
    userName,
    status,
    pageNum,
    pageSize,
    params,
  }: ListUserDto) {
    const where = {
      del_flag: NOT_DELETE,
    };
    if (userId) {
      where['user_id'] = userId;
    }
    if (status) {
      where['status'] = status;
    }
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

    const take = Number(pageSize);
    const skip = (Number(pageNum) - 1) * take;

    const records = await this.prisma.sys_user.findMany({
      skip,
      take,
      where,
      orderBy: [{ create_time: 'desc' }],
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
   * @description: 创建用户
	 * @param createUserDto
   */
  async create(createUserDto: CreateUserDto) {
    const {
      deptId,
      roleId,
      userName,
      nickName,
      password,
      email,
      phonenumber,
      sex,
      avatar,
      status,
      remark,
      createTime = new Date(),
      createBy = 'superadmin',
    } = createUserDto;
    /**@TODO post和dept暂时不做 */
    console.log(password, isEmpty(roleId));
    if (isEmpty(userName) || isEmpty(nickName)) {
      return this.utilService.responseMessage({
        msg: '用户名和昵称不能为空',
        code: CODE_EMPTY,
      });
    }
    if (isEmpty(password)) {
      return this.utilService.responseMessage({
        msg: '密码不能为空',
        code: CODE_EMPTY,
      });
    }
    if (!roleId) {
      return this.utilService.responseMessage({
        msg: '角色不能为空',
        code: CODE_EMPTY,
      });
    }

    // DTO 字段与数据库字段映射
    const data = {
      dept_id: deptId,
      user_name: userName,
      nick_name: nickName,
      password: this.utilService.md5(`${password}`), // 加密
      email,
      phonenumber,
      sex,
      avatar,
      status,
      remark,
      create_time: createTime,
      create_by: createBy,
    };

    await this.prisma.$transaction(async (prisma) => {
      const { user_id } = await prisma.sys_user.create({
        data,
        select: { user_id: true },
      });
      await prisma.sys_user_role.create({
        data: {
          user_id,
          role_id: roleId,
        },
      });
    });
    return this.utilService.responseMessage({
      msg: MSG_CREATE,
    });
  }

  /**
   * @description: 更新用户
	 * @param updateUserDto
   */
  async update(updateUserDto: UpdateUserDto) {
    const {
      userId,
      deptId,
      roleId,
      userName,
      nickName,
      email,
      phonenumber,
      sex,
      avatar,
      status,
      remark,
      updateTime = new Date(),
      updateBy = 'superadmin',
    } = updateUserDto;
    if (!userId) {
      return this.utilService.responseMessage({
        msg: '用户ID不能为空',
        code: CODE_EMPTY,
      });
    }
    if (isEmpty(userName) || isEmpty(nickName)) {
      return this.utilService.responseMessage({
        msg: '用户名和昵称不能为空',
        code: CODE_EMPTY,
      });
    }
    if (!roleId) {
      return this.utilService.responseMessage({
        msg: '角色不能为空',
        code: CODE_EMPTY,
      });
    }
    await this.prisma.$transaction(async (prisma) => {
      // 先根据userId，查原来的roleId
      const { role_id } = await prisma.sys_user_role.findFirst({
        where: { user_id: userId },
      });

      // 再更新对应userId新的roleId
      await prisma.sys_user_role.update({
        where: {
          user_id_role_id: {
            // 复合主键
            role_id,
            user_id: userId,
          },
        },
        data: {
          role_id: roleId,
        },
      });

      // 更新user信息
      await prisma.sys_user.update({
        where: { user_id: userId },
        data: {
          dept_id: deptId,
          user_name: userName,
          nick_name: nickName,
          email,
          phonenumber,
          sex,
          avatar,
          status,
          remark,
          update_time: updateTime,
          update_by: updateBy,
        },
      });
    });

    return this.utilService.responseMessage({
      msg: MSG_UPDATE,
    });
  }

  /**
   * @description: 删除用户（软删除，将 del_flag 设置为 2）
	 * @param userIds
   */
  async remove(userIds: number[]) {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.sys_user_role.deleteMany({
        where: {
          user_id: { in: userIds },
        },
      });
      await prisma.sys_user.updateMany({
        where: {
          user_id: {
            in: userIds,
          },
        },
        data: {
          del_flag: IS_DELETE, // 暂时做成不删除，修改del_flag，但这或许会引发无用数据过的的问题，待讨论@TODO
        },
      });
    });

    return this.utilService.responseMessage({
      msg: '删除成功',
    });
  }

  /**
   * 根据userId查角色
   * @param userId
   */
  async findRoleIdByUserId(userId: number) {
    const { role_id } = await prisma.sys_user_role.findFirst({
      where: { user_id: userId },
    });
    return this.utilService.responseMessage({
      data: role_id,
    });
  }
}
