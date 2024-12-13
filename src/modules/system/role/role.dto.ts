import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateRoleDto {
  @ApiProperty({
    description: '角色名称',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: '角色唯一标识',
  })
  @IsString()
  @Matches(/^[a-z0-9A-Z]+$/)
  label: string;

  @ApiProperty({
    description: '角色备注',
    required: false,
  })
  @IsString()
  @IsOptional()
  remark: string;

  @ApiProperty({
    description: '关联菜单、权限编号',
    required: false,
  })
  @IsOptional()
  @IsArray()
  menus: number[];

  @ApiProperty({
    description: '关联部门编号',
    required: false,
  })
  @IsOptional()
  @IsArray()
  depts: number[];
}