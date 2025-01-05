import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { UtilService } from 'src/shared/services/utils.service';
import { PERMISSIONS_METADATA } from '../constants/decorator.constants';
import { ApiException } from '../exceptions/api.exception';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private utilService: UtilService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取路由上设置的权限标识
    const requirePermission = this.reflector.get<string[]>(
      PERMISSIONS_METADATA,
      context.getHandler(),
    );
    if (!requirePermission) {
      return true; // 如果没有设置权限标识，默认通过
    }
    // 所有权限
    const AllPermission = '*:*:*';
    // 校验token
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const payload = await this.utilService.verifyToken(request);
    // 从redis获取用户权限
    const userId = payload.uid;
    const premissionList = JSON.parse(
      await this.utilService.getRedisPermsById(userId),
    );
    // 校验用户权限
    const hasPermission =
      premissionList.includes(AllPermission) ||
      premissionList.some((permission) => permission === requirePermission);
    if (!hasPermission) {
      throw new ApiException(1103);
    }
    return true;
  }
}
