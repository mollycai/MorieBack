import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permissions.decorator';
import { ListRoleDto } from './role.dto';
import { RoleService } from './role.service';

@ApiTags('角色模块')
@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
	 * @description: 角色列表
	 * @param params 
	 * @returns 
	 */
  @Get()
  @ApiOperation({ summary: '角色管理-列表' })
  @Permission('system:role:list')
  findAll(@Query() params: ListRoleDto) {
    return this.roleService.findAll(params);
  }
}
