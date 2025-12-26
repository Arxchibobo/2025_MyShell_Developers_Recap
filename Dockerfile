# 多阶段构建 Dockerfile
# 用于 Google Cloud Build 和 AI Studio 部署

# 阶段 1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖（使用 legacy-peer-deps 处理 React 19 兼容性）
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 阶段 2: 生产阶段
FROM node:20-alpine AS production

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 安装生产依赖（可选，如果需要运行服务器）
RUN npm install --production --legacy-peer-deps

# 暴露端口（AI Studio 通常使用 8080）
EXPOSE 8080

# 启动命令（使用 preview 或自定义服务器）
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
