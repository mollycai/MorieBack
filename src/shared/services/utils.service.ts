import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';
import { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { isEmpty } from 'lodash';
import { nanoid } from 'nanoid';
import { CODE_SUCCESS } from 'src/common/constants/code.constants';
import {
	USER_PERMS_KEY,
	USER_TOKEN_KEY,
} from 'src/common/constants/redis.constans';
import { MsgEnum } from 'src/common/enum/code.enum';
import { ApiException } from 'src/common/exceptions/api.exception';

@Injectable()
export class UtilService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redisService: Redis,
  ) {}

  /**
   * md5加密
   * @param msg
   * @returns
   */
  public md5(msg: string): string {
    return CryptoJS.MD5(msg).toString();
  }

  /**
   * 生成一个UUID
   */
  public async generateUUID(): Promise<string> {
    return nanoid();
  }

  /**
   * 获取ip地址
   * @param req
   * @returns
   */
  public getIpAddr(req: FastifyRequest): string {
    return (
      // 判断是否有反向代理 IP
      (
        (req.headers['x-forwarded-for'] as string) ||
        // 判断后端的 socket 的 IP
        req.socket.remoteAddress
      ).replace('::ffff:', '')
    );
  }

  /**
   * 统一返回体
   * @param data 返回的数据
   * @param msg 返回的消息
   * @param code 状态码，默认值 200 表示成功
   * @returns 统一的返回体对象
   */
  public responseMessage<T>({
    data,
    msg = MsgEnum.MSG_SUCCESS,
    code = CODE_SUCCESS,
  }: {
    data?: T;
    msg?: string;
    code?: number;
  }): CommonType.Response<T> {
    return {
      data,
      msg,
      code,
      timestamp: new Date().toISOString(), // ISO 格式的时间戳
    };
  }

  /**
   * 检验token是否过期
   * @param request 请求体
   */
  public async verifyToken(request: FastifyRequest): Promise<any> {
    const token = request.headers.authorization?.split(' ').pop();
    if (!token) {
      throw new ApiException(1104);
    }
    let payload: any;
    try {
      // 验证 Token 的合法性
      payload = await this.jwtService.verify(token);
    } catch (err) {
      throw new ApiException(1104);
    }
    if (isEmpty(payload)) {
      throw new ApiException(1104);
    }
    // 判断token是否与redis缓存的一致
    const redisToken = await this.getRedisTokenById(payload.uid);

    if (token !== redisToken) {
      throw new ApiException(1102);
    }
    return payload;
  }

  /**
   * 根据id获取token
   * @param id
   * @returns
   */
  async getRedisTokenById(id: number): Promise<string> {
    return this.redisService.get(`${USER_TOKEN_KEY}:${id}`);
  }

  /**
   * 根据id获取权限
   * @param id
   * @returns
   */
  async getRedisPermsById(id: number): Promise<string> {
    return this.redisService.get(`${USER_PERMS_KEY}:${id}`);
  }
}
