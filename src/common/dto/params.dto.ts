import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsDateString,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	Min,
} from 'class-validator';

/**
 * @description 时间区间对象
 */
export class DateParamsDTO {
  @IsDateString()
  beginTime?: string;

  @IsDateString()
  endTime?: string;
}

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
    type: DateParamsDTO,
    description: '时间区间',
    required: false,
  })
  @IsOptional()
  @IsString()
  params?: DateParamsDTO;
}
