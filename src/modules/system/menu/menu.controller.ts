import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
}
