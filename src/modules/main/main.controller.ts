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
import { MenuService } from '../system/menu/menu.service';
import {
	ImageCaptcha,
	ImageCaptchaDto,
	LoginInfoDto,
	LoginInfoDtoWithCaptcha,
	LoginToken,
} from './main.dto';
import { MainService } from './main.service';

@ApiTags('登录模块')
@Controller()
export class MainController {
  constructor(
    private readonly mainService: MainService,
    private readonly utilService: UtilService,
		private readonly menuService: MenuService
  ) {}

  @ApiOperation({
    summary: '获取登录图片验证码',
  })
  @Get('captchaIamge')
  @Authorize()
  async getCaptchaImage(@Query() dto: ImageCaptchaDto): Promise<ImageCaptcha> {
    return await this.mainService.createImageCaptcha(dto);
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
    await this.mainService.checkImageCaptcha(dto.captchaId, dto.verifyCode);
    // 登录获取token
    const token = await this.mainService.getLoginSign(
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
  login(
    @Body() dto: LoginInfoDto,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string,
  ): Promise<any> {
    // 登录获取token
    return this.mainService.getLoginSign(
      dto.username,
      dto.password,
      this.utilService.getIpAddr(req),
      ua,
    );
  }

  /**
   * @description: 根据用户返回路由菜单
   * @param params
   * @returns
   */
	@ApiOperation({ summary: '根据用户返回路由菜单' })
  @Get('/route')
  findMenuByUserId(@Query() params: { userId: number }) {
    return this.menuService.findMenusByUserId(params.userId);
  }
}
