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
} as const;

export type ErrorCodeMapType = keyof typeof ErrorCodeMap;

/**
 * @description: 统一定义状态码
 */
export const CODE_SUCCESS = 200;
