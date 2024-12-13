import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ADMIN_SECURITY } from './common/constants/decorator.constants';

export function setupSwagger(app: INestApplication): void {
  const configService: ConfigService = app.get(ConfigService);
  // @todo 可设计为自定义启用

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE'))
    .setDescription(configService.get<string>('SWAGGER_DESC'))
		// @todo 证书 github
		// @todo JWT鉴权
		.addSecurity(ADMIN_SECURITY, {
      description: '后台管理接口授权',
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
		.build();

	const document = SwaggerModule.createDocument(app,swaggerConfig)
	SwaggerModule.setup(configService.get<string>('SWAGGER_PATH', '/api-docs'), app, document)
}
