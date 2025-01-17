import { Injectable } from '@nestjs/common';
import { sys_role } from '@prisma/client';
import { uniq } from 'lodash';
import {
  CODE_EMPTY,
  CODE_EXIST,
  CODE_NOT_EXIST,
  CODE_SUCCESS,
  MSG_CREATE,
  MSG_DELETE,
  MSG_UPDATE,
} from 'src/common/constants/code.constants';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UtilService } from 'src/shared/services/utils.service';
import { CreateRoleDto, ListRoleDto, UpdateRoleDto } from './role.dto';
import { DeleteEnum } from 'src/common/enum/data.enum';

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
    private utilService: UtilService,
  ) {}

  /**
   * @description: 查询角色列表
   */
  async findAll({
    roleId,
    roleName,
    roleKey,
    status,
    pageNum,
    pageSize,
    beginTime,
    endTime,
  }: ListRoleDto) {
    // 条件判断
    const where = {
      delFlag: DeleteEnum.EXIST,
    };
    if (roleId) {
      where['roleId'] = +roleId;
    }
    if (status) {
      where['status'] = status;
    }
    // 模糊查询
    if (roleName) {
      where['roleName'] = { contains: roleName };
    }
    if (roleKey) {
      where['roleKey'] = { contains: roleKey };
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
    // 获取记录
    const records = await this.prisma.sys_role.findMany({
      skip,
      take,
      where,
      orderBy: [
        { roleSort: 'asc' }, // 按照sort字段升序
        { createBy: 'asc' }, // 如果sort相同，再按照createdAt字段降序
      ],
    });
    // 获取总条数
    const total = await this.prisma.sys_role.count({ where });
    return this.utilService.responseMessage<CommonType.PageResponse<sys_role>>({
      data: {
        records,
        total,
        pageNum: Number(pageNum),
        pageSize: take,
      },
    });
  }

  async findRoleKeyByRoleId(roleIds: Array<number>) {
    const roles = await this.prisma.sys_role.findMany({
      where: {
        roleId: {
          in: roleIds,
        },
      },
      select: {
        roleKey: true,
      },
    });
    const roleNameList = roles.map((role) => role.roleKey);
    return roleNameList;
  }

  /**
   * 根据userId查询角色
   * @param userId
   */
  async findRoleByUserId(userId: number) {
    // @TODO 其实还要考虑根据角色id查询角色的status是否被停用，但正在使用的角色应该不能被停用
    const userWithRoleList = await this.prisma.sys_user_role.findMany({
      where: {
        // @TODO 这里强转下，前端传number到这里仍然变成string
        userId: +userId,
      },
      select: {
        roleId: true,
      },
    });
    const roleIds = userWithRoleList.map((role) => role.roleId);
    return uniq(roleIds);
  }

  /**
   * 创建角色
   * @param createRoleDto
   * @returns
   */
  async create(createRoleDto: CreateRoleDto) {
    const {
      roleName,
      roleKey,
      roleSort,
      menuIds,
      createTime = new Date(),
      createBy = 'superadmin',
      ...rest
    } = createRoleDto;

    // 检查角色是否已经存在
    const existingRole = await this.prisma.sys_role.findFirst({
      where: {
        OR: [{ roleName }, { roleKey }],
        delFlag: DeleteEnum.EXIST,
      },
    });
    if (existingRole) {
      return this.utilService.responseMessage({
        msg: '该角色已存在',
        code: CODE_EXIST,
      });
    }

    // 使用事务确保角色和菜单分配操作的原子性
    await this.prisma.$transaction(async (prisma) => {
      // 创建角色记录
      const createdRole = await prisma.sys_role.create({
        data: {
          roleName,
          roleKey,
          roleSort,
          createTime,
          createBy,
          ...rest,
        },
      });
      // 为角色分配菜单（插入 sys_role_menu 表）
      if (menuIds && menuIds.length > 0) {
        await prisma.sys_role_menu.createMany({
          data: menuIds.map((menuId) => ({
            roleId: createdRole.roleId,
            menuId,
          })),
        });
      }
      return createdRole;
    });

    return this.utilService.responseMessage({
      code: CODE_SUCCESS,
      msg: MSG_CREATE,
    });
  }

  /**
   * 更新角色
   * @param UpdateRoleDto
   * @returns
   */
  async update(UpdateRoleDto: UpdateRoleDto) {
    const {
      roleId,
      roleName,
      roleKey,
      roleSort,
      menuIds,
      updateTime = new Date(),
      updateBy = 'superadmin',
    } = UpdateRoleDto;

    // 检查角色是否存在
    const existingRole = await this.prisma.sys_role.findUnique({
      where: { roleId: roleId, delFlag: DeleteEnum.EXIST },
    });

    if (!existingRole) {
      return this.utilService.responseMessage({
        code: CODE_NOT_EXIST,
        msg: '该角色不存在',
      });
    }

    // 使用事务确保角色更新和菜单分配操作的原子性
    await this.prisma.$transaction(async (prisma) => {
      // 更新角色基本信息
      const updated = await prisma.sys_role.update({
        where: { roleId: roleId },
        data: {
          roleId,
          roleName,
          roleKey,
          roleSort,
          updateTime,
          updateBy,
        },
      });
      // 删除旧的菜单关联
      await prisma.sys_role_menu.deleteMany({
        where: { roleId },
      });
      // 插入新的菜单关联
      if (menuIds && menuIds.length > 0) {
        await prisma.sys_role_menu.createMany({
          data: menuIds.map((menuId) => ({
            roleId,
            menuId,
          })),
        });
      }

      return updated;
    });

    return this.utilService.responseMessage({
      msg: MSG_UPDATE,
    });
  }

  /**
   * 删除角色
   * @param roleIds
   */
  async remove(roleIds: number[]) {
    if (!roleIds || roleIds.length === 0) {
      return this.utilService.responseMessage({
        msg: '角色为空',
        code: CODE_EMPTY,
      });
    }
    // 使用事务确保角色删除和菜单清理操作的原子性
    await this.prisma.$transaction(async (prisma) => {
      // 删除 `sys_role_menu` 表中与角色相关的记录
      await prisma.sys_role_menu.deleteMany({
        where: {
          roleId: { in: roleIds },
        },
      });
      // 删除 `sys_user_role` 表中与角色相关的记录
      await prisma.sys_user_role.deleteMany({
        where: {
          roleId: { in: roleIds },
        },
      });
      // 删除 `sys_role` 表中角色记录
      await prisma.sys_role.updateMany({
        where: {
          roleId: {
            in: roleIds,
          },
        },
        data: {
          delFlag: DeleteEnum.DELETE, // 设置为逻辑删除
        },
      });
    });

    return this.utilService.responseMessage({
      msg: MSG_DELETE,
    });
  }

  /**
   * 获取角色选选项
   */
  async getRoleOptions() {
    const roleList = await this.prisma.sys_role.findMany();
    const roleOptions = roleList.map((role) => {
      return {
        roleId: role.roleId,
        roleName: role.roleName,
        status: role.status,
      };
    });
    return this.utilService.responseMessage({
      data: roleOptions,
    });
  }
}
