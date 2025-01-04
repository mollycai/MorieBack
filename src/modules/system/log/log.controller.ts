import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogService } from './log.service';

@ApiTags('日志模块')
@Controller('system/log')
export class LogController {
  constructor(private readonly logService: LogService) {}

}
