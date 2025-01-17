import { sys_menu } from '@prisma/client';
import { isURL } from 'class-validator';
import { MENU_TYPE, ROUTER_TYPE, SELECTTREE_TYPE } from './menu.constants';
import { MenuItem, RouteItem, SelectTreeItem } from './menu.type';
import { CharEnum, MenuEnum } from 'src/common/enum/data.enum';

/**
 * 递归清理空的 children和其他数据
 * @param tree 树形结构
 */
const formateRoute = (tree: MenuItem[] | RouteItem[], type: string): void => {
  tree.forEach((node) => {
    if (node.children && node.children.length === 0) {
      delete node.children; // 删除空的 children
    } else if (node.children) {
      // 递归处理子节点
      formateRoute(node.children, type);
    }
    // 删除parentId
    if (type === ROUTER_TYPE) {
      delete node.parentId;
    }
  });
};

/**
 * 将平坦列表转化为树形结构
 * @param flatData
 * @param root
 */
export const convertFlatDataToTree = (
  flatData: sys_menu[],
  type: string,
  rootId?: any,
): MenuItem[] | RouteItem[] | SelectTreeItem[] => {
  // 缓存各级节点的图
  const map: Record<any, MenuItem | RouteItem | SelectTreeItem> = {};
  // 存放树形结构
  const roots: MenuItem[] | RouteItem[] | SelectTreeItem[] = [];
  // 将所有节点添加到map中，以id作为key，并进行格式化
  flatData.forEach((node) => {
    if (
      type === MENU_TYPE ||
      type === SELECTTREE_TYPE ||
      (type === ROUTER_TYPE && node.menuType !== MenuEnum.TYPE_BUTTON)
    ) {
      const currentNode = {
        ...(type === MENU_TYPE
          ? formatMenuNode(node)
          : type === ROUTER_TYPE
            ? formatRouteNode(node)
            : formatSelectTreeNdoe(node)),
        children: [], // 初始化 children
      };
      map[currentNode.id] = currentNode;
    }
  });
  // 遍历所有节点，构建树形结构
  flatData.forEach((node) => {
    // 过滤掉 BUTTON_TYPE 节点
    if (type === ROUTER_TYPE && node.menuType === MenuEnum.TYPE_BUTTON) {
      return;
    }
    const currentNode = map[node.menuId];
    const parentNode = map[node.parentId ?? rootId];
    if (currentNode) {
      if (parentNode) {
        (parentNode.children as (MenuItem | RouteItem | SelectTreeItem)[]).push(
          currentNode,
        );
      } else {
        // 如果没有父节点，将当前节点作为根节点
        (roots as (MenuItem | RouteItem | SelectTreeItem)[]).push(currentNode);
      }
    }
  });
  // 清理空的children
  formateRoute(roots, type);
  return roots;
};

const formatSelectTreeNdoe = (menuNode: sys_menu): SelectTreeItem => {
  return {
    id: menuNode.menuId,
    parentId: menuNode.parentId,
    label: menuNode.menuName,
  };
};

/**
 * 格式化菜单节点
 * @param menuNode
 */
const formatMenuNode = (menuNode: sys_menu): MenuItem => {
  return {
    id: menuNode.menuId,
    parentId: menuNode.parentId,
    path: menuNode.path,
    name: menuNode.menuKey,
    type: menuNode.menuType,
    title: menuNode.menuName,
    icon: menuNode.icon,
    component: menuNode.component,
    rank: menuNode.orderNum,
    status: menuNode.status,
    createTime: menuNode.createTime,
    isCache: menuNode.isCache === CharEnum.YES,
    isFrame: isInnerLink(menuNode),
    isShow: menuNode.visible === CharEnum.YES,
    permission: menuNode.perms,
  };
};

/**
 * 是否为外链链接（@TODO 暂时不做）
 * @param menuNode
 * @return
 */
const isInnerLink = (menuNode: sys_menu): boolean => {
  return menuNode.isFrame === CharEnum.YES && isURL(menuNode.path);
};

/**
 * 格式化路由节点
 * @param menuNode
 * @returns
 */
const formatRouteNode = (menuNode: sys_menu): RouteItem => {
  return {
    id: menuNode.menuId,
    parentId: menuNode.parentId,
    path: menuNode.path,
    name: menuNode.menuKey,
    component: menuNode.component,
    meta: {
      title: menuNode.menuName,
      icon: menuNode.icon,
      isCache: menuNode.isCache === CharEnum.YES,
      isFrame: isInnerLink(menuNode),
      rank: menuNode.orderNum,
    },
  };
};
