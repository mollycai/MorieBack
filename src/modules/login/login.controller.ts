import {
	Body,
	Controller,
	Get,
	Headers,
	Post,
	Query,
	Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { Authorize } from 'src/common/decorators/authorize.decorator';
import { UtilService } from 'src/shared/services/utils.service';
import {
	ImageCaptchaDto,
	LoginInfoDto,
	LoginInfoDtoWithCaptcha,
} from './login.dto';
import { ImageCaptcha, LoginToken } from './login.entity';
import { LoginService } from './login.service';

@ApiTags('登录模块')
@Controller()
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly utilService: UtilService,
  ) {}

  @ApiOperation({
    summary: '获取登录图片验证码',
  })
  @Get('captchaIamge')
  @Authorize()
  async getCaptchaImage(@Query() dto: ImageCaptchaDto): Promise<ImageCaptcha> {
    return await this.loginService.createImageCaptcha(dto);
  }

  @ApiOperation({
    summary: '登录(带验证码)',
  })
  @Post('loginWithCaptcha')
  @Authorize()
  async loginWithCaptcha(
    @Body() dto: LoginInfoDtoWithCaptcha,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string,
  ): Promise<LoginToken> {
    // 校验验证码
    await this.loginService.checkImageCaptcha(dto.captchaId, dto.verifyCode);
    // 登录获取token
    const token = await this.loginService.getLoginSign(
      dto.username,
      dto.password,
      this.utilService.getIpAddr(req),
      ua,
    );
    return { token };
  }

  @ApiOperation({
    summary: '登录(不带验证码)',
  })
  @Post('login')
  @Authorize()
  async login(
    @Body() dto: LoginInfoDto,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string,
  ): Promise<any> {
    // 登录获取token
    const token = await this.loginService.getLoginSign(
      dto.username,
      dto.password,
      this.utilService.getIpAddr(req),
      ua,
    );
    // @TODO 返回的信息先写死
    return {
      success: true,
      data: {
        avatar: 'https://avatars.githubusercontent.com/u/99068236?v=4',
        username: 'superadmin',
        nickname: 'morie',
        roles: ['superadmin'],
        permissions: ['*:*:*'],
				token: token,
        accessToken: 'eyJhbGciOiJIUzUxMiJ9.superadmin',
        refreshToken: 'eyJhbGciOiJIUzUxMiJ9.superadminRefresh',
        expires: '2030/10/30 00:00:00',
      },
    }
  }
}
