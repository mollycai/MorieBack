import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { UtilService } from 'src/shared/services/utils.service';
import {
	AUTHORIZE_KEY_METADATA
} from '../constants/decorator.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private utilService: UtilService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检测是否是开放类型，如：获取验证码类型的接口不需要校验
    const authorize = this.reflector.get<boolean>(
      AUTHORIZE_KEY_METADATA,
      context.getHandler(),
    );
    if (authorize) {
      return true;
    }
    // 在request中获取token并检测
		const request = context.switchToHttp().getRequest<FastifyRequest>();
    this.utilService.verifyToken(request);
    // @Todo 密码版本不一样的情况，登录时修改过密码
    // @Todo 判断该用户的角色是否有对应的权限
    // 通过
    return true;
  }
}
