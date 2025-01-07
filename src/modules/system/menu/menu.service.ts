import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UtilService } from 'src/shared/services/utils.service';
import { MenuParamsDto } from './menu.dto';
import { convertFlatDataToTree } from './menu.utils';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private utilService: UtilService,
  ) {}
  /**
   * 查询所有菜单
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
    return this.utilService.responseMessage(convertFlatDataToTree(menuList));
  }
}
