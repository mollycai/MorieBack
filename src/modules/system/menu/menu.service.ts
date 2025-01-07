import { Injectable } from '@nestjs/common';
import { uniq } from 'lodash';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UtilService } from 'src/shared/services/utils.service';
import { RoleService } from '../role/role.service';
import { MENU_TYPE, ROUTER_TYPE } from './menu.constants';
import { MenuParamsDto } from './menu.dto';
import { convertFlatDataToTree } from './menu.utils';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private utilService: UtilService,
    private roleService: RoleService,
  ) {}
  /**
   * 查询所有菜单（菜单管理页面）
   * @returns
   */
  async findAll({ menuName, status }: MenuParamsDto) {
    const where = {};
    if (status) {
      where['status'] = status;
    }
    if (menuName) {
      where['menuName'] = { contains: menuName, mode: 'insensitive' };
    }
    const menuList = await this.prisma.sys_menu.findMany(where);
    return this.utilService.responseMessage(
      convertFlatDataToTree(menuList, MENU_TYPE),
    );
  }

  /**
   * 根据用户id查询菜单路由
   * @param userId
   */
  async findMenusByUserId(userId: number) {
    const roleIds = await this.roleService.findRoleByUserId(userId);
    const menuWithRoleList = await this.prisma.sys_role_menu.findMany({
      where: {
        role_id: {
          in: roleIds,
        },
      },
      select: {
        menu_id: true,
      },
    });
    // 去重菜单ids
    const menuIds = uniq(menuWithRoleList.map((menu) => menu.menu_id));
    // 菜单列表
    const menuList = await this.prisma.sys_menu.findMany({
      where: {
        del_flag: 0,
        status: 0,
        menu_id: {
          in: menuIds,
        },
      },
      orderBy: {
        order_num: 'asc',
      },
    });
    // 构造树
    return this.utilService.responseMessage(
      convertFlatDataToTree(menuList, ROUTER_TYPE),
    );
  }
}
