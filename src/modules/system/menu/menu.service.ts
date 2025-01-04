import { Injectable } from '@nestjs/common';
import type { sys_menu } from '@prisma/client';
import { prisma } from 'src/prisma';

@Injectable()
export class MenuService {
  constructor() {}
  async queryAllMenu(): Promise<sys_menu[]> {
		const menuList = await prisma.sys_menu.findMany()
		return menuList
  }
}
