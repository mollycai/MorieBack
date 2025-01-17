import { ApiProperty } from '@nestjs/swagger';

import { CODE_SUCCESS } from '../constants/code.constants';
import { MsgEnum } from '../enum/code.enum';

export class ResponseDto {
  @ApiProperty({
    type: Number,
    description: '业务状态码',
    default: MsgEnum.MSG_SUCCESS,
  })
  code: number;

  @ApiProperty({
    type: String,
    description: '业务信息',
    default: CODE_SUCCESS,
  })
  msg: string;

  @ApiProperty({ description: '业务数据' })
  data?: any;

  @ApiProperty({ type: Number, description: '时间戳', default: 1720685424078 })
  timestamp: number;
}
