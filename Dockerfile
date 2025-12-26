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

# 阶段 2: 生产阶段（使用 nginx 提供静态文件）
FROM nginx:alpine AS production

# 从构建阶段复制构建产物到 nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建 nginx 配置文件（支持 SPA 路由）
RUN echo 'server { \
    listen 8080; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 暴露端口（Cloud Run 使用 8080）
EXPOSE 8080

# 启动 nginx（前台运行）
CMD ["nginx", "-g", "daemon off;"]
