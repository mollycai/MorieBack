import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListRoleDto } from './role.dto';
import { RoleService } from './role.service';

@ApiTags('角色模块')
@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * @description: 查询角色列表
   */
  @Get()
  @ApiOkResponse({ type: ListRoleDto })
  @ApiOperation({ summary: '获取角色管理列表' })
  // @RequiresPermissions('system:role:list')
  findAll(@Query() params: ListRoleDto) {
    return this.roleService.findAll(params);
  }
}
