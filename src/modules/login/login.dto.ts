import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginInfoDto {
	@ApiProperty({ description: '用户名'})
	@IsString()
  @MinLength(4)
	username: string

	@ApiProperty({ description: '密码'})
	@IsString()
  @MinLength(6)
	password: string

	@ApiProperty({ description: '验证码标识'})
	@IsString()
	captchaId: string

	@ApiProperty({ description: '用户输入的验证码'})
	@IsString()
  @MinLength(4)
  @MaxLength(4)
	verifyCode: string
}

export class ImageCaptchaDto {
  @ApiProperty({
    required: false,
    description: '验证码宽度',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly width: number = 100;

  @ApiProperty({
    required: false,
    description: '验证码高度',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly height: number = 50;
}