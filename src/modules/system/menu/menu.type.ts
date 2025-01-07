/**
 * @description: 菜单数据
 */
export type MenuItem = {
  id: number;
  parentId?: number;
  path?: string;
  name?: string; // 路由名字（保持唯一）
  component?: string; // 按需加载组件
  redirect?: string; // 路由重定向
  query?: string; // 路由参数
  meta?: {
    title: string; // 菜单名称
    icon?: string; // 菜单图标
    rank?: number; // 菜单升序排序
    components?: string, // 组件
		createTime: Date, // 创建时间
		status?: number, // 状态
    isCache?: boolean; // 是否缓存
		permission?: string; // 权限标识
  };
  /** 子路由配置项 */
  children?: MenuItem[];
};
