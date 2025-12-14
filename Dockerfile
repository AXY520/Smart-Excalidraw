# ============================================
# 依赖安装阶段
# ============================================
FROM node:20-alpine AS deps

# 设置工作目录
WORKDIR /app

# 安装 pnpm（使用 corepack 更轻量）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 只复制依赖相关文件
COPY package.json pnpm-lock.yaml* ./

# 安装所有依赖（包括开发依赖，构建时需要）
RUN pnpm install --frozen-lockfile

# ============================================
# 构建阶段
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 构建应用（Next.js 会自动进行优化）
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm build && \
    # 清理构建缓存
    rm -rf .next/cache

# ============================================
# 生产依赖安装阶段
# ============================================
FROM node:20-alpine AS prod-deps

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile && \
    # 清理 pnpm 缓存
    pnpm store prune

# ============================================
# 最终运行阶段（最小化镜像）
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 只复制必要的文件
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 创建数据目录
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用（使用 standalone 模式，无需 pnpm）
CMD ["node", "server.js"]