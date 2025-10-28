# Chatty - 智能聊天应用

一个基于现代 Web 技术栈开发的智能聊天应用，集成了实时通讯、AI 对话、趣味游戏等功能。

## 技术栈

- 前端：React、React Router、Zustand、Axios、Tailwind CSS、DaisyUI、Socket.io-client
- 后端：Node.js、Express、Socket.io、MongoDB、JWT、Cloudinary



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
2. 配置环境变量
在backend目录下创建 `.env` 文件，并添加以下配置：
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

在项目backend目录下运行：
```bash
npm install
npm run dev
```
在项目frontend目录下运行：
```bash
npm install
npm run dev
```
这将同时启动前端和后端开发服务器：
- 前端：http://localhost:5173
- 后端：http://localhost:5001

### 生产环境部署

1. 构建生产版本
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

