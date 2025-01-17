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
import { DeleteEnum, StatusEnum } from 'src/common/enum/data.enum';

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
        userName: username,
        status: StatusEnum.NORMAL,
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
    const { userName, nickName, email, phoneNumber, remark, avatar }: sys_user =
      await prisma.sys_user.findUnique({
        where: {
          userId: uuid,
        },
      });
    if (isEmpty(userName)) {
      throw new ApiException(1004);
    }
    return {
      userName,
      nickName,
      email,
      phoneNumber,
      remark,
      avatar,
      loginIp: ip,
    };
  }

  /**
   * @description: 获取角色下的所有用户
   * @param allocatedListDto
   * @param relation 关系，决定查某角色下的用户还是某角色下未授权该角色的用户
   */
  async allocatedList(
    {
      roleId,
      userName,
      pageNum,
      pageSize,
      beginTime,
      endTime,
    }: AllocatedListDto,
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
        roleId: +roleId,
      },
      select: {
        userId: true,
      },
    });

    // 提取 userIds
    const userIds = userMappings.map((mapping) => mapping.userId);
    if (userIds.length === 0) {
      return this.utilService.responseMessage<CommonType.PageResponse>({
        data: {
          records: [],
          total: 0,
        },
      });
    }

    const where = {
      userId: {
        [relation]: userIds,
      },
      delFlag: DeleteEnum.EXIST,
    };
    if (userName) {
      where['userName'] = { contains: userName };
    }
    if (beginTime && endTime) {
      where['createTime'] = {
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
        { createBy: 'desc' }, // 按照createdAt字段降序
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
        roleId: roleId,
        roleKey: 'common', // 假设 common 权限的 role_key 为 'common'
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
        roleId: roleId,
        userId: {
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
        roleId: roleId,
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
        roleId: roleId,
        userId: {
          in: userIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const alreadyAuthorizedUserIds = existingUserRoles.map(
      (userRole) => userRole.userId,
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
      roleId: roleId,
      userId: userId,
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
    nickName,
    phoneNumber,
    pageNum,
    pageSize,
    beginTime,
    endTime,
  }: ListUserDto) {
    const where = {
      delFlag: DeleteEnum.EXIST,
    };
    if (userId) {
      where['userId'] = userId;
    }
    if (status) {
      where['status'] = status;
    }
    if (userName) {
      where['userName'] = { contains: userName };
    }
    if (nickName) {
      where['nickName'] = { contains: nickName };
    }
    if (phoneNumber) {
      where['phoneNumber'] = { contains: phoneNumber };
    }

    if (beginTime && endTime) {
      where['createTime'] = {
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
      orderBy: [{ createTime: 'asc' }],
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
      roleIds,
      userName,
      nickName,
      password,
      createTime = new Date(),
      createBy = 'superadmin',
      ...rest
    } = createUserDto;
    /**@TODO post和dept暂时不做 */
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
    if (roleIds.length === 0) {
      return this.utilService.responseMessage({
        msg: '角色不能为空',
        code: CODE_EMPTY,
      });
    }

    // DTO 字段与数据库字段映射
    const data = {
      userName,
      nickName,
      password: this.utilService.md5(`${password}`), // 加密
      createTime,
      createBy,
      ...rest,
    };

    await this.prisma.$transaction(async (prisma) => {
      const { userId } = await prisma.sys_user.create({
        data,
        select: { userId: true },
      });
      // 注意不能用foreach，foreach不会等待异步操作完成，此处使用使用 Promise.all 并行插入所有角色
      await Promise.all(
        roleIds.map((roleId) =>
          prisma.sys_user_role.create({
            data: {
              userId,
              roleId,
            },
          }),
        ),
      );
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
      roleIds,
      userName,
      nickName,
      updateTime = new Date(),
      updateBy = 'superadmin',
      ...rest
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
    if (roleIds.length === 0) {
      return this.utilService.responseMessage({
        msg: '角色不能为空',
        code: CODE_EMPTY,
      });
    }
    await this.prisma.$transaction(async (prisma) => {
      // 删除原来的角色关系
      await prisma.sys_user_role.deleteMany({
        where: { userId },
      });
      // 插入新的角色关系
      const userRoleData = roleIds.map((roleId) => ({
        userId,
        roleId,
      }));
      await prisma.sys_user_role.createMany({
        data: userRoleData,
      });
      // 更新user信息
      await prisma.sys_user.update({
        where: { userId },
        data: {
          userName,
          nickName,
          updateTime,
          updateBy,
          ...rest,
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
    if (userIds.length === 0) {
      return this.utilService.responseMessage({
        code: CODE_EMPTY,
        msg: '角色为空',
      });
    }
    await this.prisma.$transaction(async (prisma) => {
      await prisma.sys_user_role.deleteMany({
        where: {
          userId: { in: userIds },
        },
      });
      await prisma.sys_user.updateMany({
        where: {
          userId: {
            in: userIds,
          },
        },
        data: {
          delFlag: DeleteEnum.DELETE, // 暂时做成不删除，修改del_flag，但这或许会引发无用数据过的的问题，待讨论@TODO
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
    const userRole = await prisma.sys_user_role.findMany({
      where: { userId: +userId },
    });
    const roleIds = userRole.map((item) => item.roleId);
    return this.utilService.responseMessage({
      data: roleIds,
    });
  }
}
