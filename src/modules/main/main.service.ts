import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { isEmpty, uniq } from 'lodash';
import { UtilService } from 'src/shared/services/utils.service';
import * as svgCaptcha from 'svg-captcha';
import {
  CAPTCHA_IMG_KEY,
  USER_PERMS_KEY,
  USER_TOKEN_KEY,
} from '../../common/constants/redis.constans';
import { ApiException } from '../../common/exceptions/api.exception';
import { LogService } from '../system/log/log.service';
import { UserService } from '../system/user/user.service';
import { ImageCaptcha, ImageCaptchaDto } from './main.dto';
import { RoleService } from '../system/role/role.service';
import { MenuService } from '../system/menu/menu.service';

@Injectable()
export class MainService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRedis() private readonly redisService: Redis,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
    private readonly utilService: UtilService,
    private readonly roleService: RoleService,
    private readonly menuService: MenuService,
  ) {}

  /**
   * 生成验证码
   * @param captcha
   * @returns
   */
  async createImageCaptcha(captcha: ImageCaptchaDto): Promise<ImageCaptcha> {
    const svg = svgCaptcha.create({
      size: 4, //验证码长度
      ignoreChars: '0o1i', // 验证码字符中排除 0o1i
      noise: 4, // 干扰线条的数量
      color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
      background: '#1f6feb', // 背景颜色
      width: isEmpty(captcha.width) ? 100 : captcha.width,
      height: isEmpty(captcha.height) ? 50 : captcha.height,
    });
    const result = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: await this.utilService.generateUUID(),
    };
    // 设置过期时间为12小时
    await this.redisService.set(
      `${CAPTCHA_IMG_KEY}:${result.id}`,
      svg.text,
      'EX',
      60 * 60 * 12,
    );
    return result;
  }

  /**
   * 检验验证码
   * @param captchaId
   * @param verifyCode
   */
  async checkImageCaptcha(
    captchaId: string,
    verifyCode: string,
  ): Promise<void> {
    const result = await this.redisService.get(
      `${CAPTCHA_IMG_KEY}:${captchaId}`,
    );
    if (isEmpty(result) || result.toLowerCase() !== verifyCode.toLowerCase()) {
      throw new ApiException(1002);
    }
  }

  /**
   * 登录
   * @param username
   * @param password
   * @param ipAddr
   * @param ua
   * @returns
   */
  async getLoginSign(
    username: string,
    password: string,
    ipAddr: string,
    ua: string,
  ): Promise<any> {
    // 查询用户
    const user = await this.userService.getUserByUsername(username);
    if (isEmpty(user)) {
      throw new ApiException(1003);
    }
    // 加密并对比用户名
    const cryptoPwd = this.utilService.md5(`${password}`);
    if (user.password !== cryptoPwd) {
      throw new ApiException(1003);
    }
    // 根据用户查询角色
    const roleIds = await this.roleService.findRoleByUserId(user.userId);
		const roleKeys = await this.roleService.findRoleKeyByRoleId(roleIds)

    let perms = [];
    if (roleIds.includes(1)) {
      // 超级管理员
      perms = ['*:*:*'];
    } else {
      // 根据角色查询菜单权限
      const permsList = await this.menuService.findPermsByRoleId(roleIds);
			perms = uniq(permsList);
    }

    // 生成token
    const expiresIn = Number(this.configService.get<string>('JWT_EXPIRES_IN'));
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const jwtSign = this.jwtService.sign(
      {
        uid: parseInt(user.userId.toString()),
        pv: 1,
      },
      {
        expiresIn,
      },
    );
    // redis 设置token缓存时间和缓存菜单
    await this.redisService
      .pipeline()
      .set(`${USER_TOKEN_KEY}:${user.userId}`, jwtSign, 'EX', expiresIn)
      .set(`${USER_PERMS_KEY}:${user.userId}`, JSON.stringify(perms))
      .exec();
    // @Todo redis 缓存菜单
    await this.logService.saveLoginLog(Number(user.userId), ipAddr, ua);

    return this.utilService.responseMessage({
      data: {
        userId: user.userId,
        accessToken: jwtSign,
        refreshToken: jwtSign,
        username: user.userName,
        nickName: user.nickName,
        avatar: user.avatar,
        expires: expiresAt,
        roles: roleKeys,
				permissions: perms
      },
      msg: '登录成功',
    });
  }
}
