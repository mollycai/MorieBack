import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Permission } from 'src/common/decorators/permissions.decorator';
import { RoleService } from '../role/role.service';
import { CreateUserDto, ListUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@ApiTags('用户模块')
@Controller('system/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  /**
   * @description: 用户列表
   */
  @Get()
  @ApiOperation({ summary: '用户管理-列表' })
  @ApiBody({
    type: ListUserDto,
    required: true,
  })
  @Permission('system:user:list')
  findAll(@Query() params: ListUserDto) {
    return this.userService.findAll(params);
  }

  /**
   * @description: 创建用户
   */
  @Post()
  @ApiOperation({ summary: '用户管理-新增' })
  @ApiBody({
    type: CreateUserDto,
    required: true,
  })
  @Permission('system:user:add')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * @description: 更新用户
   */
  @Put()
  @ApiOperation({ summary: '用户管理-编辑' })
  @ApiBody({
    type: UpdateUserDto,
    required: true,
  })
  @Permission('system:user:edit')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  /**
   * @description: 删除用户
   */
  @Delete()
  @ApiOperation({ summary: '用户管理-删除' })
  @ApiBody({
    type: Array<number>,
    required: true,
  })
  @Permission('system:user:remove')
  remove(@Body() body: { userIds: number[] }) {
    return this.userService.remove(body.userIds);
  }

  /**
   * @description: 根据用户查询角色
   */
  @Get('/role')
  @ApiOperation({ summary: '用户管理-根据用户查询角色' })
  @ApiQuery({
    type: Array<number>,
    required: true,
  })
  @Permission('system:role:query')
  findRoleIdByUserId(@Query() params: { userId: number }) {
    return this.userService.findRoleIdByUserId(params.userId);
  }

  /**
   * @description: 查询角色选项
   */
  @Get('/roleOptions')
  @ApiOperation({ summary: '用户管理-查询角色选项' })
  @Permission('system:role:query')
  getRoleOptions() {
    return this.roleService.getRoleOptions();
  }
}
