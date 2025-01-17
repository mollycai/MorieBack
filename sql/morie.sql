-- ----------------------------
-- 1.用户表
-- ----------------------------
drop table if exists sys_user;
create table sys_user (
  user_id           int      				not null auto_increment    comment '用户ID',
  dept_id           int      				default null               comment '部门ID',
  user_name         varchar(30)     not null                   comment '用户账号',
  nick_name         varchar(30)     not null                   comment '用户昵称',
  user_type         varchar(2)      default '00'               comment '用户类型（00系统用户）',
  email             varchar(50)     default ''                 comment '用户邮箱',
  phonenumber       varchar(11)     default ''                 comment '手机号码',
  sex               char(1)         default '0'                comment '用户性别（0男 1女 2未知）',
  avatar            varchar(100)    default ''                 comment '头像地址',
  password          varchar(100)    default ''                 comment '密码',
  status            char(1)         default '0'                comment '帐号状态（0正常 1停用）',
  del_flag          char(1)         default '0'                comment '删除标志（0代表存在 2代表删除）',
  login_ip          varchar(128)    default ''                 comment '最后登录IP',
  login_date        datetime                                   comment '最后登录时间',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (user_id)
) engine=innodb auto_increment=100 comment = '用户信息表';

-- ----------------------------
-- 初始化-用户表数据
-- ----------------------------
insert into sys_user values(1,  null, 'superadmin', 'morie1', '00', 'ml@163.com', '15888888888', '0', 'https://avatars.githubusercontent.com/u/99068236?v=4', '46f94c8de14fb36680850768ff1b7f2a', '0', '0', '127.0.0.1', sysdate(), 'admin', sysdate(), '', null, '超级管理员');
insert into sys_user values(2,  null, 'admin', 'morie2', '00', 'ml@google.com', '15777777777', '0', '', '46f94c8de14fb36680850768ff1b7f2a', '0', '0', '127.0.0.1', sysdate(), 'admin', sysdate(), '', null, '管理员');
insert into sys_user values(3,  null, 'ml12345', 'morie123', '00', 'ml@qq.com', '15666666666', '0', '', '46f94c8de14fb36680850768ff1b7f2a', '0', '0', '127.0.0.1', sysdate(), 'admin', sysdate(), '', null, '测试员');

-- ----------------------------
-- 2.用户登录记录表
-- ----------------------------
drop table if exists sys_logininfor;
create table sys_logininfor (
  info_id        int     				not null auto_increment   comment '访问ID',
  user_name      varchar(50)    default ''                comment '用户账号',
  ipaddr         varchar(128)   default ''                comment '登录IP地址',
  status         char(1)        default '0'               comment '登录状态（0成功 1失败）',
  msg            varchar(255)   default ''                comment '提示信息',
	ua             varchar(255)    default ''                comment '浏览器ua',
  access_time    datetime                                 comment '访问时间',
  primary key (info_id),
  key idx_sys_logininfor_s  (status),
  key idx_sys_logininfor_lt (access_time)
) engine=innodb auto_increment=100 comment = '系统访问记录';

-- ----------------------------
-- 3.角色表
-- ----------------------------
drop table if exists sys_role;
create table sys_role (
  role_id              int      			 not null auto_increment    comment '角色ID',
  role_name            varchar(30)     not null                   comment '角色名称',
  role_key             varchar(100)    not null                   comment '角色权限字符串',
  role_sort            int(4)          not null                   comment '显示顺序',
  data_scope           char(1)         default '1'                comment '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）',
  menu_check_strictly  tinyint(1)      default 1                  comment '菜单树选择项是否关联显示',
  dept_check_strictly  tinyint(1)      default 1                  comment '部门树选择项是否关联显示',
  status               char(1)         not null                   comment '角色状态（0正常 1停用）',
  del_flag             char(1)         default '0'                comment '删除标志（0代表存在 2代表删除）',
  create_by            varchar(64)     default ''                 comment '创建者',
  create_time          datetime                                   comment '创建时间',
  update_by            varchar(64)     default ''                 comment '更新者',
  update_time          datetime                                   comment '更新时间',
  remark               varchar(500)    default null               comment '备注',
  primary key (role_id)
) engine=innodb auto_increment=100 comment = '角色信息表';

-- ----------------------------
-- 初始化-角色表数据
-- ----------------------------
insert into sys_role values('1', '超级管理员', 'superadmin',  1, 1, 1, 1, '0', '0', 'superadmin', sysdate(), '', null, '超级管理员');
insert into sys_role values('2', '管理员', 'admin',  2, 2, 1, 1, '0', '0', 'admin', sysdate(), '', null, '管理员');
insert into sys_role values('3', '普通角色', 'common', 3, 2, 1, 1, '0', '0', 'admin', sysdate(), '', null, '普通角色');

-- ----------------------------
-- 4.用户和角色关联
-- ----------------------------
drop table if exists sys_user_role;
create table sys_user_role (
  user_id   int not null comment '用户ID',
  role_id   int not null comment '角色ID',
  primary key(user_id, role_id)
) engine=innodb comment = '用户和角色关联表';

-- ----------------------------
-- 初始化-用户和角色关联表数据
-- ----------------------------
insert into sys_user_role values (1, 1);
insert into sys_user_role values (2, 2);
insert into sys_user_role values (3, 3);

-- ----------------------------
-- 5.菜单表
-- ----------------------------
drop table if exists sys_menu;
create table sys_menu (
  menu_id           int             not null auto_increment    comment '菜单ID',
  menu_name         varchar(50)     not null                   comment '菜单名称',
	menu_key          varchar(50)     default ''                 comment '菜单标识',
  parent_id         int             default 0                  comment '父菜单ID',
  order_num         int(4)          default 0                  comment '显示顺序',
  path              varchar(200)    default ''                 comment '路由地址',
  component         varchar(255)    default null               comment '组件路径',
  query             varchar(255)    default null               comment '路由参数',
  is_frame          char(1)         default '1'                comment '是否为外链（0是 1否）',
  is_cache          char(1)         default '0'                comment '是否缓存（0缓存 1不缓存）',
  menu_type         char(1)         default ''                 comment '菜单类型（M目录 C菜单 F按钮）',
  visible           char(1)         default '0'                comment '菜单状态（0显示 1隐藏）',
  status            char(1)         default '0'                comment '菜单状态（0正常 1停用）',
	del_flag          char(1)         default '0'                comment '删除标志（0代表存在 2代表删除）',
  perms             varchar(100)    default null               comment '权限标识',
  icon              varchar(100)    default '#'                comment '菜单图标',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default ''                 comment '备注',
  primary key (menu_id)
) engine=innodb auto_increment=2000 comment = '菜单权限表';

-- ----------------------------
-- 初始化-菜单表数据
-- ----------------------------
-- 插入一级菜单
INSERT INTO sys_menu (menu_id, menu_name, menu_key, parent_id, order_num, path, component, menu_type, is_frame, visible, status, icon, create_by, create_time, remark)
VALUES 
(1, '系统管理', 'system', 0, 2, '/system', null, 'M', '1', '0', '0', 'ep:menu', 'superadmin', sysdate(), '一级菜单：系统管理'),
(2, '系统监控', 'monitor', 0, 3, '/monitor', null, 'M', '1', '0', '0', 'ep:platform', 'superadmin', sysdate(), '一级菜单：系统监控'),
(3, '系统工具', 'tools', 0, 4, '/tools', null, 'M', '1', '0', '0', 'ep:tools', 'superadmin', sysdate(), '一级菜单：系统工具');

-- 插入二级菜单（系统管理）
INSERT INTO sys_menu (menu_id, menu_name, menu_key, parent_id, order_num, path, component, menu_type, is_frame, visible, status, perms, create_by, create_time, remark)
VALUES 
(101, '用户管理', 'user', 1, 1, '/system/user/index', '/system/user/index', 'C', '1', '0', '0', 'system:user:list', 'superadmin', sysdate(), '二级菜单：用户管理'),
(102, '角色管理', 'role', 1, 2, '/system/role/index', '/system/role/index', 'C', '1', '0', '0', 'system:role:list', 'superadmin', sysdate(), '二级菜单：角色管理'),
(103, '菜单管理', 'menu', 1, 3, '/system/menu/index', '/system/menu/index', 'C', '1', '0', '0', 'system:menu:list', 'superadmin', sysdate(), '二级菜单：菜单管理'),
(104, '部门管理', 'dept', 1, 4, '/system/dept/index', '/system/dept/index', 'C', '1', '0', '0', 'system:dept:list', 'superadmin', sysdate(), '二级菜单：部门管理'),
(105, '岗位管理', 'post', 1, 5, '/system/post/index', '/system/post/index', 'C', '1', '0', '0', 'system:post:list', 'superadmin', sysdate(), '二级菜单：岗位管理'),
(106, '日志管理', 'log', 1, 6, '/system/log', null, 'M', '1', '0', '0', '', 'superadmin', sysdate(), '二级目录：日志管理');

-- 三级菜单
INSERT INTO sys_menu (menu_id, menu_name, menu_key, parent_id, order_num, path, component, menu_type, is_frame, visible, status, perms, create_by, create_time, remark)
VALUES 
(601, '操作日志', 'operatelog', 106, 1, '/system/log/operate', '/system/log/operate', 'C', '1', '0', '0', 'system:operatelog:list', 'superadmin', sysdate(), '三级菜单：日志管理'),
(602, '登录日志', 'loginlog', 106, 2, '/system/log/login', '/system/log/login', 'C', '1', '0', '0', 'system:loginlog:list', 'superadmin', sysdate(), '三级菜单：日志管理');

-- 插入二级菜单（系统监控）
INSERT INTO sys_menu (menu_id, menu_name, menu_key, parent_id, order_num, path, component, menu_type, is_frame, visible, status, perms, create_by, create_time, remark)
VALUES 
(201, '在线用户', 'online', 2, 1, '/monitor/online/index', '/monitor/online/index', 'C', '1', '0', '0', 'monitor:online:list', 'superadmin', sysdate(), '二级菜单：在线用户'),
(202, '数据监控', 'data', 2, 2, '/monitor/data/index', '/monitor/data/index', 'C', '1', '0', '0', 'monitor:data:list', 'superadmin', sysdate(), '二级菜单：数据监控');

-- 插入二级菜单（系统工具）
INSERT INTO sys_menu (menu_id, menu_name, menu_key, parent_id, order_num, path, component, menu_type, is_frame, visible, status, perms, create_by, create_time, remark)
VALUES 
(301, '测试页面', 'test', 3, 1, '/tools/test/index', '/tools/test/index', 'C', '1', '0', '0', 'tool:test:list', 'superadmin', sysdate(), '二级菜单：测试页面');

-- 插入按钮权限（系统管理 - 增删改查）
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, is_frame, visible, status, perms, icon, create_by, create_time, remark)
VALUES 
-- 用户管理按钮
(1001, '用户新增', 101, 1, null, null, 'F', '1', '0', '0', 'system:user:add', null, 'superadmin', sysdate(), '按钮：用户新增'),
(1002, '用户编辑', 101, 2, null, null, 'F', '1', '0', '0', 'system:user:edit', null, 'superadmin', sysdate(), '按钮：用户编辑'),
(1003, '用户删除', 101, 3, null, null, 'F', '1', '0', '0', 'system:user:remove', null, 'superadmin', sysdate(), '按钮：用户删除'),
(1004, '用户查看', 101, 4, null, null, 'F', '1', '0', '0', 'system:user:query', null, 'superadmin', sysdate(), '按钮：用户查看'),
(1005, '用户导出', 101, 4, null, null, 'F', '1', '0', '0', 'system:user:export', null, 'superadmin', sysdate(), '按钮：用户导出'),
(1006, '用户导入', 101, 4, null, null, 'F', '1', '0', '0', 'system:user:import', null, 'superadmin', sysdate(), '按钮：用户导入'),
(1007, '重置密码', 101, 4, null, null, 'F', '1', '0', '0', 'system:user:resetpwd', null, 'superadmin', sysdate(), '按钮：重置密码'),

-- 角色管理按钮
(1021, '角色新增', 102, 1, null, null, 'F', '1', '0', '0', 'system:role:add', null, 'superadmin', sysdate(), '按钮：角色新增'),
(1022, '角色编辑', 102, 2, null, null, 'F', '1', '0', '0', 'system:role:edit', null, 'superadmin', sysdate(), '按钮：角色编辑'),
(1023, '角色删除', 102, 3, null, null, 'F', '1', '0', '0', 'system:role:remove', null, 'superadmin', sysdate(), '按钮：角色删除'),
(1024, '角色查看', 102, 4, null, null, 'F', '1', '0', '0', 'system:role:query', null, 'superadmin', sysdate(), '按钮：角色查看'),
(1025, '角色导出', 102, 4, null, null, 'F', '1', '0', '0', 'system:role:export', null, 'superadmin', sysdate(), '按钮：角色导出'),

-- 菜单管理按钮
(1031, '菜单新增', 103, 1, null, null, 'F', '1', '0', '0', 'system:menu:add', null, 'superadmin', sysdate(), '按钮：菜单新增'),
(1032, '菜单编辑', 103, 2, null, null, 'F', '1', '0', '0', 'system:menu:edit', null, 'superadmin', sysdate(), '按钮：菜单编辑'),
(1033, '菜单删除', 103, 3, null, null, 'F', '1', '0', '0', 'system:menu:remove', null, 'superadmin', sysdate(), '按钮：菜单删除'),
(1034, '菜单查看', 103, 4, null, null, 'F', '1', '0', '0', 'system:menu:query', null, 'superadmin', sysdate(), '按钮：菜单查看'),

-- 部门管理按钮
(1041, '部门新增', 104, 1, null, null, 'F', '1', '0', '0', 'system:dept:add', null, 'superadmin', sysdate(), '按钮：部门新增'),
(1042, '部门编辑', 104, 2, null, null, 'F', '1', '0', '0', 'system:dept:edit', null, 'superadmin', sysdate(), '按钮：部门编辑'),
(1043, '部门删除', 104, 3, null, null, 'F', '1', '0', '0', 'system:dept:remove', null, 'superadmin', sysdate(),'按钮：部门删除'),
(1044, '部门查看', 104, 4, null, null, 'F', '1', '0', '0', 'system:dept:query', null, 'superadmin', sysdate(), '按钮：部门查看'),

-- 岗位管理按钮
(1051, '岗位新增', 105, 1, null, null, 'F', '1', '0', '0', 'system:post:add', null, 'superadmin', sysdate(), '按钮：岗位新增'),
(1052, '岗位编辑', 105, 2, null, null, 'F', '1', '0', '0', 'system:post:edit', null, 'superadmin', sysdate(), '按钮：岗位编辑'),
(1053, '岗位删除', 105, 3, null, null, 'F', '1', '0', '0', 'system:post:remove', null, 'superadmin', sysdate(),'按钮：岗位删除'),
(1054, '岗位查看', 105, 4, null, null, 'F', '1', '0', '0', 'system:post:query', null, 'superadmin', sysdate(), '按钮：岗位查看');

-- ----------------------------
-- 6.角色和菜单关联
-- ----------------------------
drop table if exists sys_role_menu;
create table sys_role_menu (
  role_id   int not null comment '角色ID',
  menu_id   int not null comment '菜单ID',
  primary key(role_id, menu_id)
) engine=innodb comment = '角色和菜单关联表';

-- 超级管理员
-- 一级菜单
INSERT INTO sys_role_menu VALUES (1, 1); -- 系统管理
INSERT INTO sys_role_menu VALUES (1, 2); -- 系统监控
INSERT INTO sys_role_menu VALUES (1, 3); -- 系统工具

-- 系统管理子菜单
INSERT INTO sys_role_menu VALUES (1, 101); -- 用户管理
INSERT INTO sys_role_menu VALUES (1, 102); -- 角色管理
INSERT INTO sys_role_menu VALUES (1, 103); -- 菜单管理
INSERT INTO sys_role_menu VALUES (1, 104); -- 部门管理
INSERT INTO sys_role_menu VALUES (1, 105); -- 岗位管理
INSERT INTO sys_role_menu VALUES (1, 106); -- 日志管理


INSERT INTO sys_role_menu VALUES (1, 601); -- 操作日志管理
INSERT INTO sys_role_menu VALUES (1, 602); -- 登录日志管理

-- 系统监控子菜单
INSERT INTO sys_role_menu VALUES (1, 201); -- 在线用户
INSERT INTO sys_role_menu VALUES (1, 202); -- 数据监控

-- 系统工具子菜单
INSERT INTO sys_role_menu VALUES (1, 301); -- 测试页面

-- 按钮权限（增删改查）
INSERT INTO sys_role_menu VALUES (1, 1001); -- 用户新增
INSERT INTO sys_role_menu VALUES (1, 1002); -- 用户编辑
INSERT INTO sys_role_menu VALUES (1, 1003); -- 用户删除
INSERT INTO sys_role_menu VALUES (1, 1004); -- 用户查看
INSERT INTO sys_role_menu VALUES (1, 1005); -- 用户导出
INSERT INTO sys_role_menu VALUES (1, 1006); -- 用户导入
INSERT INTO sys_role_menu VALUES (1, 1007); -- 重置密码
INSERT INTO sys_role_menu VALUES (1, 1021); -- 角色新增
INSERT INTO sys_role_menu VALUES (1, 1022); -- 角色编辑
INSERT INTO sys_role_menu VALUES (1, 1023); -- 角色删除
INSERT INTO sys_role_menu VALUES (1, 1024); -- 角色查看
INSERT INTO sys_role_menu VALUES (1, 1025); -- 角色导入
INSERT INTO sys_role_menu VALUES (1, 1031); -- 菜单新增
INSERT INTO sys_role_menu VALUES (1, 1032); -- 菜单编辑
INSERT INTO sys_role_menu VALUES (1, 1033); -- 菜单删除
INSERT INTO sys_role_menu VALUES (1, 1034); -- 菜单查看
INSERT INTO sys_role_menu VALUES (1, 1041); -- 部门新增
INSERT INTO sys_role_menu VALUES (1, 1042); -- 部门编辑
INSERT INTO sys_role_menu VALUES (1, 1043); -- 部门删除
INSERT INTO sys_role_menu VALUES (1, 1044); -- 部门查看
INSERT INTO sys_role_menu VALUES (1, 1051); -- 岗位新增
INSERT INTO sys_role_menu VALUES (1, 1052); -- 岗位编辑
INSERT INTO sys_role_menu VALUES (1, 1053); -- 岗位删除
INSERT INTO sys_role_menu VALUES (1, 1054); -- 岗位查看

-- 管理员
-- 一级菜单
INSERT INTO sys_role_menu VALUES (2, 1); -- 系统管理
INSERT INTO sys_role_menu VALUES (2, 3); -- 系统工具

-- 系统管理子菜单
INSERT INTO sys_role_menu VALUES (2, 101); -- 用户管理
INSERT INTO sys_role_menu VALUES (2, 102); -- 角色管理
INSERT INTO sys_role_menu VALUES (2, 103); -- 菜单管理
INSERT INTO sys_role_menu VALUES (2, 104); -- 部门管理
INSERT INTO sys_role_menu VALUES (2, 105); -- 岗位管理

-- 系统工具子菜单
INSERT INTO sys_role_menu VALUES (2, 301); -- 测试页面

-- 按钮权限（增删改查）
INSERT INTO sys_role_menu VALUES (2, 1001); -- 用户新增
INSERT INTO sys_role_menu VALUES (2, 1002); -- 用户编辑
INSERT INTO sys_role_menu VALUES (2, 1003); -- 用户删除
INSERT INTO sys_role_menu VALUES (2, 1004); -- 用户查看
INSERT INTO sys_role_menu VALUES (2, 1007); -- 重置密码
INSERT INTO sys_role_menu VALUES (2, 1024); -- 角色查看
INSERT INTO sys_role_menu VALUES (2, 1034); -- 菜单查看
INSERT INTO sys_role_menu VALUES (2, 1041); -- 部门新增
INSERT INTO sys_role_menu VALUES (2, 1042); -- 部门编辑
INSERT INTO sys_role_menu VALUES (2, 1043); -- 部门删除
INSERT INTO sys_role_menu VALUES (2, 1044); -- 部门查看

-- 普通用户
-- 一级菜单
INSERT INTO sys_role_menu VALUES (3, 3); -- 系统工具

-- 系统工具子菜单
INSERT INTO sys_role_menu VALUES (3, 301); -- 测试页面


-- ----------------------------
-- 7、部门表
-- ----------------------------
drop table if exists sys_dept;
create table sys_dept (
  dept_id           int             not null auto_increment    comment '部门id',
  parent_id         int             default 0                  comment '父部门id',
  ancestors         varchar(50)     default ''                 comment '祖级列表',
  dept_name         varchar(30)     default ''                 comment '部门名称',
  order_num         int(4)          default 0                  comment '显示顺序',
  leader            varchar(20)     default null               comment '负责人',
  phone             varchar(11)     default null               comment '联系电话',
  email             varchar(50)     default null               comment '邮箱',
  status            char(1)         default '0'                comment '部门状态（0正常 1停用）',
  del_flag          char(1)         default '0'                comment '删除标志（0代表存在 2代表删除）',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time 	    datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (dept_id)
) engine=innodb auto_increment=200 comment = '部门表';

-- ----------------------------
-- 8、角色和部门关联表  角色1-N部门
-- ----------------------------
drop table if exists sys_role_dept;
create table sys_role_dept (
  role_id   int        not null comment '角色ID',
  dept_id   int        not null comment '部门ID',
  primary key(role_id, dept_id)
) engine=innodb comment = '角色和部门关联表';

-- ----------------------------
-- 初始化-角色和部门关联表数据
-- ----------------------------


-- ----------------------------
-- 9、岗位信息表
-- ----------------------------
drop table if exists sys_post;
create table sys_post
(
  post_id       int             not null auto_increment    comment '岗位ID',
  post_code     varchar(64)     not null                   comment '岗位编码',
  post_name     varchar(50)     not null                   comment '岗位名称',
  post_sort     int(4)          not null                   comment '显示顺序',
  status        char(1)         not null                   comment '状态（0正常 1停用）',
  create_by     varchar(64)     default ''                 comment '创建者',
  create_time   datetime                                   comment '创建时间',
  update_by     varchar(64)     default ''			       comment '更新者',
  update_time   datetime                                   comment '更新时间',
  remark        varchar(500)    default null               comment '备注',
  del_flag      char(1)         default '0'                comment '删除标志（0代表存在 2代表删除）',
  primary key (post_id)
) engine=innodb comment = '岗位信息表';

-- ----------------------------
-- 10、用户与岗位关联表  用户1-N岗位
-- ----------------------------
drop table if exists sys_user_post;
create table sys_user_post
(
  user_id   int        not null comment '用户ID',
  post_id   int        not null comment '岗位ID',
  primary key (user_id, post_id)
) engine=innodb comment = '用户与岗位关联表';

-- ----------------------------
-- 初始化-用户与岗位关联表数据
-- ----------------------------
