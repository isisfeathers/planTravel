# 使用 Node.js 官方輕量級 Lts-alpine 映像檔作為基礎
FROM node:20-alpine AS builder

# 設定容器工作目錄
WORKDIR /app

# 複製 package.json 進行套件安裝（善用 Docker 快取層）
COPY package*.json ./

# 安裝全部依賴
RUN npm ci

# 複製所有原始碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# --- 生產階段 (Production Stage) ---
FROM node:20-alpine AS runner

WORKDIR /app

# 僅安裝生產環境依賴
COPY package*.json ./
RUN npm ci --only=production

# 從編譯階段複製產出的 js 程式碼
COPY --from=builder /app/dist ./dist

# 設定環境變數
ENV PORT=3002
ENV NODE_ENV=production

EXPOSE 3002

# 啟動命令
CMD ["node", "dist/server.js"]
