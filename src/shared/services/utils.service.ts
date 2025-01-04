import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { FastifyRequest } from 'fastify';
import { nanoid } from 'nanoid';
import { CODE_SUCCESS } from 'src/common/constants/code.constants';
import { MsgEnum } from 'src/common/enum';

@Injectable()
export class UtilService {
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
    console.log(req.headers['x-forwarded-for']);
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
  public responseMessage<T>(
    data: T,
    msg: string = MsgEnum.MSG_SUCCESS,
    code: number = CODE_SUCCESS,
  ): CommonType.Response<T> {
    return {
      data,
      msg,
      code,
      timestamp: new Date().toISOString(), // ISO 格式的时间戳
    };
  }
}
