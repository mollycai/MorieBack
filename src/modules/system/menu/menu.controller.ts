import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permissions.decorator';
import { CreateMenuDto, MenuParamsDto, UpdateMenuDto } from './menu.dto';
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

  /**
   * @description: 创建菜单
   */
  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @ApiBody({
    type: CreateMenuDto,
    required: true,
  })
	@Permission('system:menu:create')
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  /**
   * @description: 修改菜单
   */
  @Put()
  @ApiOperation({ summary: '修改菜单' })
  @ApiBody({
    type: UpdateMenuDto,
    required: true,
  })
	@Permission('system:menu:edit')
  update(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(updateMenuDto);
  }

  /**
   * @description: 删除菜单
   */
  @Delete()
  @ApiOperation({ summary: '删除菜单' })
  @ApiBody({
    type: Object,
    required: true,
  })
	@Permission('system:menu:remove')
  remove(@Body() body: { menuId: number }) {
    return this.menuService.remove(body.menuId);
  }
}
