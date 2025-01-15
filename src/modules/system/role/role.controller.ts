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
import { MenuService } from '../menu/menu.service';
import { NOTIN } from '../user/user.constant';
import { AllocatedListDto, BatchAuthDto } from '../user/user.dto';
import { UserService } from '../user/user.service';
import { CreateRoleDto, ListRoleDto, UpdateRoleDto } from './role.dto';
import { RoleService } from './role.service';

@ApiTags('角色模块')
@Controller('system/role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
    private readonly menuService: MenuService,
  ) {}

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

  /**
   * @description: 创建角色
   * @param createRoleDto
   * @returns
   */
  @Post()
  @ApiOperation({ summary: '角色管理-创建' })
  @ApiBody({
    type: CreateRoleDto,
    required: true,
  })
  @Permission('system:role:add')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  /**
   * @description: 更新角色
   * @param body
   * @returns
   */
  @Put()
  @ApiOperation({ summary: '角色管理-更新' })
  @ApiBody({
    type: UpdateRoleDto,
    required: true,
  })
  @Permission('system:role:edit')
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  /**
   * @description: 删除角色
   * @param ids
   * @returns
   */
  @Delete()
  @ApiOperation({ summary: '角色管理-删除' })
  @ApiBody({
    type: Array<number>,
    required: true,
  })
  @Permission('system:role:remove')
  remove(@Body() body: { roleIds: number[] }) {
    return this.roleService.remove(body.roleIds);
  }

  @ApiOperation({
    summary: '角色管理-已分配角色的用户列表',
  })
  @ApiBody({
    type: AllocatedListDto,
    required: true,
  })
  @Permission('system:role:query')
  @Get('auth/allocated')
  authUserAllocatedList(@Query() query: AllocatedListDto) {
    return this.userService.allocatedList(query);
  }

  @ApiOperation({
    summary: '角色管理-未分配角色的用户列表',
  })
  @ApiBody({
    type: AllocatedListDto,
    required: true,
  })
  @Permission('system:role:query')
  @Get('auth/unallocated')
  authUserUnAllocatedList(@Query() query: AllocatedListDto) {
    return this.userService.allocatedList(query, NOTIN);
  }

  @ApiOperation({
    summary: '角色管理-解绑角色',
  })
  @ApiBody({
    type: BatchAuthDto,
    required: true,
  })
  @Permission('system:role:edit')
  @Put('auth/cancel')
  authUserCancel(@Body() body: BatchAuthDto) {
    return this.userService.cancelAuth(body);
  }

  @ApiOperation({
    summary: '角色管理-授予角色',
  })
  @ApiBody({
    type: BatchAuthDto,
    required: true,
  })
  @Permission('system:role:edit')
  @Put('auth/grant')
  authUserGrant(@Body() body: BatchAuthDto) {
    return this.userService.grantAuth(body);
  }

  /**
   * @description: 根据角色查询菜单列表
   * @param roleId
   * @returns
   */
  @Get('/roleMenuTreeSelect')
  @ApiOperation({
    summary: '角色管理-根据角色查询菜单列表',
  })
  @Permission('system:menu:query')
  roleMenuTreeSelect(@Query() query: { roleId: number }) {
    return this.menuService.roleMenuTreeSelect(query);
  }

  /**
   * @description: 根据角色查询菜单列表
   * @param roleId
   * @returns
   */
  @Get('/menuTreeSelect')
  @ApiOperation({
    summary: '角色管理-根据角色查询菜单列表',
  })
  @Permission('system:menu:query')
  menuTreeSelect() {
    return this.menuService.menuTreeSelect();
  }
}
