import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDate,
	IsInt,
	IsNotEmpty,
	IsNumberString,
	IsOptional,
	IsString,
	Min,
} from 'class-validator';

/**
 * @description 分页对象
 */
export class PaginatingDTO {
  @ApiProperty({
    type: Number,
    description: '当前页码',
    default: 1,
    required: true,
  })
  @IsInt({ message: 'pageNum 参数只能是 number 类型' })
  @Min(1, { message: 'pageNum 参数不能小于 1' })
  @IsNotEmpty({ message: '缺少 pageNum 页码参数' })
  @Transform(({ value }) => parseInt(value, 10))
  pageNum: number;

  @ApiProperty({
    type: Number,
    description: '当前页条数',
    default: 10,
    required: true,
  })
  @IsInt({ message: 'pageSize 参数只能是 number 类型' })
  @Min(1, { message: 'pageSize 参数不能小于 1' })
  @IsNotEmpty({ message: '缺少 pageSize 页码参数' })
  @Transform(({ value }) => parseInt(value, 10))
  pageSize: number;

	@ApiProperty({
    type: Number,
    description: '开始日期',
    default: 1721145600000,
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: '开始日期必须是时间戳格式' })
  beginTime?: string;

  @ApiProperty({
    type: Number,
    description: '结束日期',
    default: 1721318399999,
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: '结束日期必须是时间戳格式' })
  endTime?: string;
}

/**
 * @description 创建记录的DTO
 */
export class DateDTO {
  @ApiProperty({
    type: Date,
    description: '创建日期',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  createTime?: Date;

  @ApiProperty({
    type: String,
    description: '创建人',
    default: 'superadmin',
    required: false,
  })
  @IsOptional()
  @IsString()
  createBy?: string;

	@ApiProperty({
    type: Date,
    description: '更新日期',
    default: new Date(),
    required: false,
  })
  @IsOptional()
  @IsDate()
  updateTime?: Date;

  @ApiProperty({
    type: String,
    description: '更新人',
    default: 'superadmin',
    required: false,
  })
  @IsOptional()
  @IsString()
  updateBy?: string;
}