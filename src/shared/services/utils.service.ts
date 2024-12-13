import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { FastifyRequest } from 'fastify';
import { nanoid } from 'nanoid';

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
	public getIpAddr(req: FastifyRequest){
		console.log(req.headers['x-forwarded-for'])
		return (
      // 判断是否有反向代理 IP
      (
        (req.headers['x-forwarded-for'] as string) ||
        // 判断后端的 socket 的 IP
        req.socket.remoteAddress
      ).replace('::ffff:', '')
    );
	}
}
