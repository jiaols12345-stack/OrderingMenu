# OrderingMenu

一个基于 Next.js App Router 和 TypeScript 构建的点餐界面示例项目。页面模拟餐厅自助点餐流程，用户可以浏览菜品、筛选分类、搜索菜名、选择份量、加入订单，并查看当前已点餐品和最近提交记录。

## 功能特点

- 菜品分类筛选：全部菜品、招牌热菜、主食套餐、饮品甜品
- 菜品搜索：支持按菜名和描述关键词过滤
- 份量选择：小份、标准份、大份，不同份量自动计算价格
- 购物车管理：加入订单、数量加减、清空购物车、合计金额
- 订单查看：弹窗展示当前已点餐品和最近提交订单
- 本地静态菜品图：图片资源位于 `public/dishes`
- 响应式布局：适配桌面和移动端浏览

## 技术栈

- Next.js 16
- React 19
- TypeScript
- ESLint 9
- CSS

## 项目结构

```text
.
├── app
│   ├── globals.css      # 全局样式
│   ├── layout.tsx       # 根布局和页面元信息
│   └── page.tsx         # 点餐页主逻辑
├── public
│   └── dishes           # 菜品 SVG 图片
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 本地运行

安装依赖：

```powershell
npm.cmd install
```

启动开发服务器：

```powershell
npm.cmd run dev
```

浏览器访问：

```text
http://127.0.0.1:3000
```

停止开发服务器：

```text
Ctrl + C
```

## 常用命令

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
npm.cmd run start
```

## 说明

本项目目前没有接入后端或数据库。购物车和最近提交订单只保存在当前浏览器页面状态中，刷新页面后会重置。
