import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { StatusEnum } from "src/common/enum";

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