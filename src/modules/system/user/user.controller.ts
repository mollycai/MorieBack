import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('用户模块')
@Controller('system/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
	
}
