import { HttpException } from '@nestjs/common';
import { ErrorCodeMap, ErrorCodeMapType } from '../constants/code.constants';

export class ApiException extends HttpException {
	/**
	 * 业务类型错误代码
	 */
  private errorCode: ErrorCodeMapType;

	constructor(errorCode: ErrorCodeMapType) {
		super(ErrorCodeMap[errorCode], 200)
		this.errorCode = errorCode
	}

	getErrorCode(): ErrorCodeMapType {
		return this.errorCode
	}
}
