import { sys_menu } from '@prisma/client';
import { isURL } from 'class-validator';
import {
	IS_CACHE,
	IS_VISIBLE,
	NOT_FRAME,
	TYPE_BUTTON,
} from 'src/common/constants/user.constant';
import { MENU_TYPE, ROUTER_TYPE } from './menu.constants';
import { MenuItem, RouteItem } from './menu.type';

/**
 * 将平坦列表转化为树形结构
 * @param flatData
 * @param root
 */
export const convertFlatDataToTree = (
  flatData: sys_menu[],
  type: string,
  rootId?: any,
): MenuItem[] | RouteItem[] => {
  // 缓存各级节点的图
  const map: Record<any, MenuItem | RouteItem> = {};
  // 存放树形结构
  const roots: MenuItem[] | RouteItem[] = [];
  // 将所有节点添加到map中，以id作为key，并进行格式化
  flatData.forEach((node) => {
    if (
      type === MENU_TYPE ||
      (type === ROUTER_TYPE && node.menu_type !== TYPE_BUTTON)
    ) {
      const currentNode = {
        ...(type === MENU_TYPE ? formatMenuNode(node) : formatRouteNode(node)),
        children: [], // 初始化 children
      };
      map[currentNode.id] = currentNode;
    }
  });
  // 遍历所有节点，构建树形结构
  flatData.forEach((node) => {
    // 过滤掉 BUTTON_TYPE 节点
    if (type === ROUTER_TYPE && node.menu_type === TYPE_BUTTON) {
      return;
    }
    const currentNode = map[node.menu_id];
    const parentNode = map[node.parent_id ?? rootId];
    if (currentNode) {
      if (parentNode) {
        parentNode.children.push(currentNode);
        // @TODO 设置 redirect 到第一个子菜单（仅针对路由类型）
      } else {
        // 如果没有父节点，将当前节点作为根节点
        roots.push(currentNode);
      }
    }
  });
  return roots;
};

/**
 * 格式化菜单节点
 * @param menuNode
 */
const formatMenuNode = (menuNode: sys_menu): MenuItem => {
  return {
    id: menuNode.menu_id,
    parentId: menuNode.parent_id,
    path: menuNode.path,
    name: menuNode.menu_key,
    type: menuNode.menu_type,
    title: menuNode.menu_name,
    icon: menuNode.icon,
    component: menuNode.component,
    rank: menuNode.order_num,
    status: menuNode.status,
    createTime: menuNode.create_time,
    isCache: menuNode.is_cache === IS_CACHE,
    isFrame: isInnerLink(menuNode),
    isShow: menuNode.visible === IS_VISIBLE,
    permission: menuNode.perms,
  };
};

/**
 * 是否为外链链接（@TODO 暂时不做）
 * @param menuNode
 * @return
 */
const isInnerLink = (menuNode: sys_menu): boolean => {
  return menuNode.is_frame === NOT_FRAME && isURL(menuNode.path);
};

/**
 * 格式化路由节点
 * @param menuNode
 * @returns
 */
const formatRouteNode = (menuNode: sys_menu): RouteItem => {
  return {
    id: menuNode.menu_id,
    parentId: menuNode.parent_id,
    path: menuNode.path,
    name: menuNode.menu_key,
    component: menuNode.component,
    meta: {
      title: menuNode.menu_name,
      icon: menuNode.icon,
      isCache: menuNode.is_cache === IS_CACHE,
      isFrame: isInnerLink(menuNode),
    },
  };
};
