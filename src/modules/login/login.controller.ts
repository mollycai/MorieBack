import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Req,
  Headers,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { ImageCaptchaDto, LoginInfoDto } from './login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImageCaptcha, LoginToken } from './login.entity';
import { FastifyRequest } from 'fastify';
import { UtilService } from 'src/shared/services/utils.service';
import { Authorize } from 'src/common/decorators/authorize.decorator';

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
    summary: '管理员登录',
  })
  @Post('login')
	@Authorize()
  async login(
    @Body() dto: LoginInfoDto,
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
}
