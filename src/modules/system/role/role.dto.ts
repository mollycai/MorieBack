import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Length,
} from 'class-validator';
import { DateDTO, PaginatingDTO } from 'src/common/dto/params.dto';
import { StatusEnum } from 'src/common/enum/data.enum';

export class ListRoleDto extends PaginatingDTO {
  @ApiProperty({
    type: String,
    description: '角色id',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  roleId?: string;

  @ApiProperty({
    type: String,
    description: '角色名称',
    default: '超级管理员',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  roleName?: string;

  @ApiProperty({
    type: String,
    description: '角色字符',
    default: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  roleKey?: string;

  @ApiProperty({
    type: String,
    description: '状态',
    default: '0',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}

export class CreateRoleDto extends DateDTO {
  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 30)
  roleName: string;

  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 100)
  roleKey: string;

  @IsOptional()
  @IsArray()
  menuIds?: Array<number>;

  @IsOptional()
  @IsArray()
  deptIds?: Array<number>;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsNumber()
  roleSort: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  dataScope?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;

  @IsOptional()
  @IsBoolean()
  menuCheckStrictly?: boolean;

  @IsOptional()
  @IsBoolean()
  deptCheckStrictly?: boolean;
}

export class UpdateRoleDto extends CreateRoleDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  roleId: number;
}
