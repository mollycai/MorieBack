import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginatingDTO } from 'src/common/dto/params.dto';
import { StatusEnum } from 'src/common/enum';

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
    default: 'superadmin',
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
