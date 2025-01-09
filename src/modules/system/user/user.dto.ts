import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { PaginatingDTO } from "src/common/dto/params.dto";

export class AllocatedListDto extends PaginatingDTO {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  userName?: string;

  @ApiProperty({ description: '角色ID', required: false })
  @IsOptional()
  @IsNumber()
  roleId?: number;
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