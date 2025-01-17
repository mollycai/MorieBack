/**
 * @description:数据状态:0正常,1停用
 */
export enum StatusEnum {
  NORMAL = '0',
  STOP = '1',
}

/**
 * @description: CharEnum 字段枚举
 */
export enum CharEnum {
  YES = '0',
  NO = '1',
}

/**
 * @description: Status字段枚举
 */
export enum DeleteEnum {
  EXIST = '0',
  DELETE = '2',
}

/**
 * @description: number类型字段枚举
 */
export enum NumberEnum {
  YES = 0,
  NO = 1,
}

/**
 * @description: 菜单类型枚举
 */
export enum MenuEnum {
  /** 菜单类型（目录） */
  TYPE_DIR = 'M',
  /** 菜单类型（菜单） */
  TYPE_MENU = 'C',
  /** 菜单类型（按钮） */
  TYPE_BUTTON = 'F',
}
