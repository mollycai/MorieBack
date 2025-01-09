/**
 * @description: 统一定义错误代码
 */
export const ErrorCodeMap = {
  1000: '参数校验异常',
  1001: '系统用户已存在',
  1002: '填写验证码有误',
  1003: '用户名或密码有误',
  1004: '不存在此用户',
  1101: '登录无效或无权限访问',
  1102: '登录身份已过期',
  1103: '权限不足',
  1104: 'token令牌无效',
} as const;

export type ErrorCodeMapType = keyof typeof ErrorCodeMap;

/**
 * @description: 统一定义状态码
 */
export const CODE_SUCCESS = 200;
export const CODE_EXIST = 201;
export const CODE_NOT_EXIST = 202;
export const CODE_EMPTY = 203;
export const CODE_FORBIDDEN = 204;
export const CODE_NOT_FOUND = 205;
export const CODE_DUPLICATE = 206;

/**
 * @description: 统一定义状CRUD message
 */

export const MSG_CREATE = '创建成功';
export const MSG_UPDATE = '修改成功';
export const MSG_DELETE = '删除成功';
