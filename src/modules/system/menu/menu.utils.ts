import { sys_menu } from '@prisma/client';
import { isURL } from 'class-validator';
import { IS_CACHE, NOT_FRAME } from 'src/common/constants/user.constant';
import { MenuItem } from './menu.type';

/**
 * 将菜单列表转化为树形结构
 * @param flatData
 * @param root
 */
export const convertFlatDataToTree = (
  flatData: sys_menu[],
  rootId?: any,
): MenuItem[] => {
  // 缓存各级节点的图
  const map: Record<any, MenuItem> = {};
  // 存放树形结构
  const roots: MenuItem[] = [];
  // 将所有节点添加到map中，以id作为key，并进行格式化
  flatData.forEach((node) => {
    const currentNode: MenuItem = {
      ...formatMenuNode(node),
      children: [],
    };
    map[currentNode.id] = currentNode;
  });
  // 遍历所有节点，构建树形结构
  flatData.forEach((node) => {
    // 取出父节点。没有的话则为默认根节点
    const parentNode = map[node.parent_id ?? rootId];
    const currentNode = map[node.menu_id];
    if (parentNode) {
      parentNode.children.push(currentNode);
    } else {
      // 如果没有父节点，将当前节点作为根节点
      roots.push(currentNode);
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
    query: menuNode.query,
    path: menuNode.path,
    name: menuNode.menu_key,
    meta: setMeta(menuNode),
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
 * 设置路由元信息
 * @param menuNode
 */
const setMeta = (menuNode: sys_menu) => {
  return {
    title: menuNode.menu_name,
    icon: menuNode.icon,
    components: menuNode.component,
    rank: menuNode.order_num,
    status: menuNode.status,
		createTime: menuNode.create_time,
    isCache: menuNode.is_cache === IS_CACHE,
    permission: menuNode.perms,
  };
};
