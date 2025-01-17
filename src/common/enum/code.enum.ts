/**
 * @description: 统一定义提示语
 */
export enum MsgEnum {
  MSG_SUCCESS = '请求成功',
  MSG_FAILED = '请求失败',
	MSG_CREATE = '创建成功',
  MSG_UPDATE = '修改成功',
  MSG_DELETE = '删除成功',
}

/**
 * @description: 统一定义状态码
 */
export enum CodeEnum {
  CODE_SUCCESS = 200,
  CODE_EXIST = 201,
  CODE_NOT_EXIST = 202,
  CODE_EMPTY = 203,
  CODE_FORBIDDEN = 204,
  CODE_NOT_FOUND = 205,
  CODE_DUPLICATE = 206,
}