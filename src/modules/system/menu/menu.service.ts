import { Injectable } from '@nestjs/common';
import { isEmpty, uniq } from 'lodash';
import {
	CODE_EMPTY,
	CODE_EXIST,
	MSG_CREATE,
	MSG_DELETE,
	MSG_UPDATE,
} from 'src/common/constants/code.constants';
import { IS_DELETE, NOT_DELETE } from 'src/common/constants/user.constant';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UtilService } from 'src/shared/services/utils.service';
import { RoleService } from '../role/role.service';
import { MENU_TYPE } from './menu.constants';
import { CreateMenuDto, MenuParamsDto, UpdateMenuDto } from './menu.dto';
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
    const where = {
      del_flag: NOT_DELETE,
    };
    if (status) {
      where['status'] = status;
    }
    if (menuName) {
      where['menu_name'] = { contains: menuName, mode: 'insensitive' };
    }
    const menuList = await this.prisma.sys_menu.findMany({
      where,
    });
    return this.utilService.responseMessage({
      data: convertFlatDataToTree(menuList, MENU_TYPE),
    });
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
        del_flag: NOT_DELETE,
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
    return this.utilService.responseMessage({
      data: convertFlatDataToTree(menuList, MENU_TYPE),
    });
  }

  /**
   * @TODO 再添加个checkedKeys列表
   * 根据角色id查询菜单
   * @param roleId
   */
  async roleMenuTreeSelect({ roleId }) {
    // 查询角色对应的菜单ID列表
    const menuWithRoleList = await this.prisma.sys_role_menu.findMany({
      where: {
        role_id: +roleId,
      },
      select: {
        menu_id: true,
      },
    });

    // 去重菜单ID
    const menuIds = uniq(menuWithRoleList.map((menu) => menu.menu_id));

    // 查询菜单列表
    const menuList = await this.prisma.sys_menu.findMany({
      where: {
        del_flag: NOT_DELETE, // 未删除
      },
      orderBy: {
        order_num: 'asc', // 按照排序字段升序
      },
    });

    // 构造树状结构
    return this.utilService.responseMessage({
      data: {
        menu: convertFlatDataToTree(menuList, MENU_TYPE),
        checkedKeys: menuIds,
      },
    });
  }

  /**
   * 创建菜单
   * @param createMenuDto
   * @returns
   */
  async create(createMenuDto: CreateMenuDto) {
    const {
      parentId, // 解构并重命名字段
      orderNum: order_num,
      isFrame: is_frame,
      isCache: is_cache,
      menuKey: menu_key,
      menuName: menu_name,
      menuType: menu_type,
      createTime: create_time = new Date(),
      createBy: create_by = 'superadmin',
      ...rest
    } = createMenuDto;

    if (isEmpty(menu_name) || isEmpty(menu_key)) {
      return this.utilService.responseMessage({
        msg: '请输入菜单名和菜单标识',
        code: CODE_EMPTY,
      });
    }

    if (isEmpty(menu_type)) {
      return this.utilService.responseMessage({
        msg: '请选择菜单类型',
        code: CODE_EMPTY,
      });
    }

    await this.prisma.sys_menu.create({
      data: {
        parent_id: parentId || 0,
        order_num,
        is_frame,
        is_cache,
        menu_key,
        menu_type,
        menu_name,
        create_time,
        create_by,
        ...rest, // 其他字段直接映射
      },
    });

    return this.utilService.responseMessage({
      msg: MSG_CREATE,
    });
  }

  async update(updateMenuDto: UpdateMenuDto) {
    const {
      menuId,
      parentId: parent_id, // 解构并重命名字段
      orderNum: order_num,
      isFrame: is_frame,
      isCache: is_cache,
      menuType: menu_type,
      menuKey: menu_key,
      menuName: menu_name,
      updateTime: update_time = new Date(),
      updateBy: update_by = 'superadmin',
      ...rest
    } = updateMenuDto;

    await this.prisma.sys_menu.update({
      where: { menu_id: menuId },
      data: {
        parent_id,
        order_num,
        is_frame,
        is_cache,
        menu_key,
        menu_type,
        menu_name,
        update_time,
        update_by,
        ...rest, // 其他字段直接映射
      },
    });

    return this.utilService.responseMessage({
      msg: MSG_UPDATE,
    });
  }

  /**
   * 删除菜单 (逻辑删除)
   * @param menuId
   */
  async remove(menuId: number) {
    // 检查是否有子菜单
    const childMenus = await this.prisma.sys_menu.findMany({
      where: {
        parent_id: menuId,
        del_flag: NOT_DELETE, // 未删除的子菜单
      },
    });

    if (childMenus.length > 0) {
      // 如果存在子菜单，返回错误信息
      return this.utilService.responseMessage({
        msg: '无法删除：该菜单下还有子菜单，请先删除子菜单。',
        code: CODE_EXIST, // 自定义错误码
      });
    }

    // 如果没有子菜单，执行逻辑删除
    await this.prisma.sys_menu.update({
      where: {
        menu_id: menuId,
      },
      data: {
        del_flag: IS_DELETE, // 标记为已删除
      },
    });

    return this.utilService.responseMessage({
      msg: MSG_DELETE,
    });
  }
}
