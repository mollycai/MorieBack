import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permissions.decorator';
import { MenuParamsDto } from './menu.dto';
import { MenuService } from './menu.service';

@ApiTags('菜单模块')
@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}
	
  /**
   * @description: 菜单列表
   * @param params
   * @returns
   */
  @Get()
  @ApiOperation({ summary: '菜单管理-列表' })
  @Permission('system:menu:list')
  findAll(@Query() params: MenuParamsDto) {
    return this.menuService.findAll(params);
  }

}
