import { Injectable } from '@nestjs/common';
import { sys_role } from '@prisma/client';
import { uniq } from 'lodash';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UtilService } from 'src/shared/services/utils.service';
import { ListRoleDto } from './role.dto';

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
    params,
  }: ListRoleDto) {
    // 条件判断
    const where = {};
    if (roleId) {
      where['roleId'] = roleId;
    }
    if (status) {
      where['status'] = status;
    }
    // 模糊查询
    if (roleName) {
      where['roleName'] = { contains: roleName, mode: 'insensitive' };
    }
    if (roleKey) {
      where['roleKey'] = { contains: roleKey, mode: 'insensitive' };
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
    // 获取记录
    const records = await this.prisma.sys_role.findMany({
      skip,
      take,
      where,
      orderBy: [
        { role_sort: 'desc' }, // 按照sort字段升序
        { create_by: 'desc' }, // 如果sort相同，再按照createdAt字段降序
      ],
    });
    // 获取总条数
    const total = await this.prisma.sys_role.count({ where });
    return this.utilService.responseMessage<CommonType.PageResponse<sys_role>>({
      records,
      total,
      pageNum: Number(pageNum),
      pageSize: take,
    });
  }

  /**
   * 根据userId查询角色
   * @param userId
   */
  async findRoleByUserId(userId: number) {
		// @TODO 其实还要考虑根据角色id查询角色的status是否被停用，但正在使用的角色应该不能被停用
    const userWithRoleList = await this.prisma.sys_user_role.findMany({
      where: { // @TODO 这里强转下，前端传number到这里仍然变成string
        user_id: +userId,
      },
      select: {
        role_id: true,
      },
    });
    const roleIds = userWithRoleList.map((role) => role.role_id);
    return uniq(roleIds);
  }
}
