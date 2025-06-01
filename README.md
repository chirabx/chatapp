# Chatty - 智能聊天应用

一个基于现代 Web 技术栈开发的智能聊天应用，集成了实时通讯、AI 对话、趣味游戏等功能。

## 主要功能

### 1. 用户系统
- 用户注册和登录
- 个人资料管理
- 好友系统（添加好友、好友请求管理）
- 在线状态显示

### 2. 实时通讯
- 一对一实时聊天
- 消息历史记录
- 图片发送和预览
- 在线状态实时更新

### 3. AI 对话系统
- 智能对话机器人
- 支持文本和图片输入
- 对话历史记录
- 会话管理（新建、切换、导出）
- 支持导出对话记录（JSON/CSV/PDF格式）

### 4. AI 趣味游戏
- AI 猜数字（演示二分查找算法）
- AI 图像识别挑战
- AI 走迷宫挑战（演示寻路算法）
- 更多游戏开发中...

## 技术栈

### 前端
- React.js + JavaScript
- Tailwind CSS + DaisyUI（UI框架）
- Socket.io-client（实时通讯）
- React Router（路由管理）
- Zustand（状态管理）
- Axios（HTTP请求）
- React Hot Toast（消息提示）

### 后端
- Node.js + Express
- MongoDB（数据库）
- Socket.io（WebSocket服务）
- JWT（身份认证）
- Cloudinary（图片存储）
- Deepseek API（AI对话）
- 图像识别API

## 项目结构

```
chatapp/
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── pages/         # 页面
│   │   ├── store/         # 状态管理
│   │   ├── lib/           # 工具函数
│   │   └── App.jsx        # 主应用
│   └── package.json
├── backend/                # 后端项目
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── lib/           # 工具函数
│   │   └── index.js       # 入口文件
│   └── package.json
├── package.json           # 根目录配置
└── README.md             # 项目文档
```

## 快速开始

### 环境要求
- Node.js (v16.0.0 或更高版本)
- npm (v7.0.0 或更高版本)
- MongoDB (本地或远程数据库，在这里演示的是远程数据库 MongoDB Atlas)

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd chatapp
```

2. 安装所有依赖
```bash
npm run install-all
```

3. 配置环境变量
在根目录创建 `.env` 文件：
```
# 服务器配置
PORT=5001
NODE_ENV=development

# 数据库配置
MONGODB_URI=your_mongodb_connection_string(云数据库配置地址：https://cloud.mongodb.com/)

# JWT配置
JWT_SECRET=your_jwt_secret

# AI API配置
IMAGE_API_KEY=your_image_api_key(用于图像识别的API)
DEEPSEEK_API_KEY=your_deepseek_api_key(用于AI对话的API)

# 图片存储配置
CLOUDINARY_CLOUD_NAME=your_cloud_name(图片存储库配置地址：https://cloudinary.com/)
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 开发环境运行

在项目根目录下运行：
```bash
npm run dev
```
这将同时启动前端和后端开发服务器：
- 前端：http://localhost:5173
- 后端：http://localhost:5001

### 生产环境部署

1. 安装所有依赖
```bash
npm run install-all
```

2. 构建生产版本
```bash
npm run build
```

3. 启动生产服务器
```bash
npm run start
```

## API 文档

### 认证相关
- POST `/auth/register` - 用户注册
- POST `/auth/login` - 用户登录
- GET `/auth/logout` - 用户登出
- GET `/auth/me` - 获取当前用户信息

### 好友相关
- GET `/friends` - 获取好友列表
- POST `/friends/request` - 发送好友请求
- GET `/friends/requests` - 获取好友请求列表
- PUT `/friends/request/:requestId` - 处理好友请求

### 消息相关
- GET `/messages/:userId` - 获取与指定用户的聊天记录
- POST `/messages` - 发送消息

### AI 相关
- POST `/bot/message` - 发送消息给AI机器人
- GET `/bot/messages` - 获取AI对话历史
- GET `/bot/conversations` - 获取AI会话列表
- GET `/bot/export` - 导出AI对话记录

### 游戏相关
- POST `/games/image-recognition` - 图像识别游戏
- GET `/games/code-example/concepts` - 获取代码示例概念列表
- POST `/games/code-example/generate` - 生成代码示例

## 开发指南

### 前端开发
- 使用 `npm run dev` 启动开发服务器
- 支持热重载
- 使用 ESLint 和 Prettier 保持代码风格一致

### 后端开发
- 使用 `npm run dev` 启动开发服务器
- 支持热重载
- 遵循 RESTful API 设计规范

## 生产环境注意事项

1. 环境变量配置
   - 确保所有必要的环境变量都已正确配置
   - 生产环境使用更强的密钥和密码

2. 安全性
   - 启用 HTTPS
   - 配置适当的 CORS 策略
   - 设置请求速率限制
   - 启用安全相关的 HTTP 头

3. 性能优化
   - 启用数据库索引
   - 配置适当的缓存策略
   - 使用 PM2 进行进程管理
   - 配置日志记录

## 常见问题

1. 端口占用
   - 修改 `.env` 文件中的 `PORT` 配置
   - 确保没有其他服务占用相同端口

2. 数据库连接
   - 确保 MongoDB 服务正在运行
   - 检查连接字符串是否正确
   - 验证数据库用户权限

3. AI 服务
   - 确保 API 密钥配置正确
   - 检查 API 调用限制
   - 验证网络连接

4. 图片上传
   - 检查文件大小限制
   - 验证图片格式
   - 确保存储服务配置正确


