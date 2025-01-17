import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Length } from "class-validator";
import { DateDTO } from "src/common/dto/params.dto";
import { StatusEnum } from "src/common/enum/data.enum";

export class MenuParamsDto {
  @ApiProperty({
    type: String,
    description: '菜单名称',
    required: false,
  })
  menuName?: string;

	@ApiProperty({
		type: String,
    description: '菜单状态',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum)
  status?: string;
}

export class CreateMenuDto extends DateDTO {
  @ApiProperty({ required: true })
  @IsString()
  @Length(1, 50)
  menuName: string;

  @ApiProperty({ required: false })
	@IsOptional()
  @IsString()
  @Length(0, 50)
  menuKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  orderNum?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  isFrame?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  isCache?: string;

  @ApiProperty({ required: false })
  @IsString()
  menuType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visible?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  perms?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateMenuDto extends CreateMenuDto {
	@ApiProperty({ required: true })
  @IsOptional()
  @IsInt()
	menuId: number
}