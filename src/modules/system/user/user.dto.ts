import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
	ArrayNotEmpty,
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Length,
} from 'class-validator';
import { DateDTO, PaginatingDTO } from 'src/common/dto/params.dto';

export class AllocatedListDto extends PaginatingDTO {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  userName?: string;

  @ApiProperty({ description: '角色ID', required: false })
  @IsNumber()
  roleId: number;
}

export class BatchAuthDto {
  @ApiProperty({ description: '角色ID', required: true })
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: '用户ID列表', required: true })
  @IsArray()
  @ArrayNotEmpty()
  userIds: number[];
}

export class ListUserDto extends PaginatingDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['0', '1']) // 0: 禁用, 1: 启用
  status?: string;

	@ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nickName?: string;

	@ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateUserDto extends DateDTO{
	@ApiProperty({ required: true })
  @IsNumber()
	@Optional()
  @Length(0, 30)
  deptId?: number;

	@ApiProperty({ required: true })
	@IsArray()
  roleIds: number[];

	@ApiProperty({ required: true })
  @IsNumber()
  @Length(0, 30)
  postId?: number;

  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 30)
  userName: string;

	@ApiProperty({ required: true })
  @IsString()
  @Length(0, 30)
  nickName: string;

  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 30)
  password: string;

  @ApiProperty({ required: false })
  @IsString()
  @Optional()
  @Length(0, 30)
  email?: string;

	@ApiProperty({ required: false })
  @IsString()
  @Optional()
  @Length(0, 30)
  phoneNumber?: string;

	@ApiProperty({ required: false })
  @IsString()
  @Optional()
	@IsEnum(['0', '1', '2'])
  sex?: string;

	@ApiProperty({ required: false })
  @IsString()
  @Optional()
  @Length(0, 100)
  avatar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['0', '1']) // 0: 禁用, 1: 启用
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateUserDto extends CreateUserDto {
  @ApiProperty({ required: true })
  @IsNumber()
  userId: number;
}
