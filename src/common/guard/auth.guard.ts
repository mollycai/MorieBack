import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { LoginService } from 'src/modules/login/login.service';
import {
  ADMIN_USER,
  AUTHORIZE_KEY_METADATA,
} from '../constants/decorator.constants';
import { FastifyRequest } from 'fastify';
import { isEmpty } from 'lodash';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private loginService: LoginService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
		console.log('guard')
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
    const url = request.url;
    const path = url.split('?')[0];
    let token = request.headers['authorization'] as string;
    // 没有权限
    if (isEmpty(token)) {
      throw new ApiException(1101);
    }
    // token无法通过校验
    try {
      token = token.split(' ').pop();
			// 这啥玩意
      request[ADMIN_USER] = this.jwtService.verify(token);
    } catch (error) {
			throw new ApiException(1101)
		}
		if(isEmpty(request[ADMIN_USER])) {
			throw new ApiException(1101)
		}
    // @Todo 密码版本不一样的情况，登录时修改过密码
    // 判断token是否与redis缓存的一致
		const redisToken = await this.loginService.getRedisTokenById(request[ADMIN_USER].uid)
		if(token !== redisToken) {
			throw new ApiException(1102)
		}
		// @Todo 判断该用户的角色是否有对应的权限
		// 通过
    return true;
  }
}
