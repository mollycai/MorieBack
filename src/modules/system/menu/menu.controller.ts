import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('菜单模块')
@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
}
