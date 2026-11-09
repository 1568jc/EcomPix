# 橙宝 AI 修图智能体

> 橙宝旗下 AI 图片编辑项目。访问[橙宝官网](https://chengbaolog.com/)了解更多信息。

## 一、项目介绍

橙宝 AI 修图智能体是一套以 **AI Agent 驱动的图片编辑** 为核心的全栈项目，基于 Python 3.13 + FastAPI + LangChain + LangGraph + React 19 + Konva。输入一句话，AI 即可规划修图步骤并调用编辑工具，完成文生图、抠图调色、区域编辑和图层拆分等任务。

### 为什么做这个项目？

1. 将 AI 生图与专业图片编辑结合，覆盖真实的内容生产场景。
2. 包含 LangChain 模型接入、LangGraph 智能体、异步任务队列、对象存储、Canvas 画布引擎、图层系统和选区交互等完整技术链路。
3. 前后端功能完整，既可作为 AI 修图工具使用，也适合继续学习和二次开发。

## 二、核心能力

### 1. AI 文生图

在创作页输入提示词，AI 自动生成四张候选图，以四宫格展示。生成过程通过 SSE 实时推送进度，选中图片后可直接进入编辑器继续修图。

### 2. 专业级画布编辑器

基于 react-konva 搭建画布编辑器，支持缩放平移、图层文档管理、撤销重做，以及前后对比滑杆。

### 3. 自然语言驱动修图

输入“把背景换成海滩”“提高亮度和饱和度”等指令，AI Agent 会自动分析需求、规划步骤并调用工具执行。手动工具与 Agent 共用同一套工具注册表。

### 4. 丰富的编辑工具

内置 rembg 一键抠图、11 参调色、裁剪、翻转、缩放、旋转、移动、AI 换背景、AI 扩图和超分辨率放大等工具，覆盖主流修图场景。

### 5. 智能区域选择

集成 SAM（Segment Anything Model）点选能力，点击画面即可选中物体，也支持笔刷涂抹模式。首次点击计算 embedding，后续点击只需运行 decoder。

### 6. 局部精细编辑

支持局部消除和局部替换。局部消除通过 AI inpainting 填补背景，局部替换根据提示词修改选区内容，尽量保持其他区域不变。

### 7. 图层拆分和独立操作

可将图片按语义拆成主体层、背景层和 OCR 文字层。每个图层可独立缩放、调色和移动，图层数据使用 JSONB 持久化。

### 8. 多步计划和人机协作

复杂需求会生成包含依赖关系的结构化 JSON 计划。服务端完成工具校验、参数检查、依赖补全、环检测和拓扑排序，用户可确认执行、单步重试或取消后续步骤。

## 三、技术架构

项目采用前后端分离 + 异步 Worker 架构：

- 前端：React 19 + Konva 单页应用，通过 REST API 和 SSE 与后端通信。
- 后端：Python FastAPI，按路由层、业务服务层和数据访问层组织。
- 智能体：LangChain 接入规划模型，LangGraph 负责计划编排，ToolRegistry 统一编辑工具。
- 异步任务：ARQ + Redis Pub/Sub + SSE 执行耗时任务并推送实时进度。
- 数据存储：PostgreSQL 保存业务数据，Redis 处理缓存和消息，MinIO 保存图片资源。

核心流程：用户输入自然语言指令 → Agent 规划修图步骤 → 服务端校验和拓扑排序 → 用户确认计划 → 按依赖执行工具 → 结果推送前端 → 画布实时更新。

## 四、快速运行

### 前置条件

- Docker >= 20（含 Compose）
- Python >= 3.13
- Node.js >= 18（推荐 20+）
- 一个[阿里云百炼 API Key](https://bailian.console.aliyun.com/)（可选，用于真实 AI 文生图、图像编辑和 Agent 对话）

### 1. 获取项目

从[橙宝官网](https://chengbaolog.com/)获取项目源码，解压后进入项目目录。

### 2. 启动中间件

```bash
docker compose up -d
```

### 3. 启动后端

```bash
cd backend

# 安装 uv（已有可跳过）
curl -LsSf https://astral.sh/uv/install.sh | sh   # Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 安装依赖（国内可加 --index-url https://pypi.tuna.tsinghua.edu.cn/simple）
uv sync --all-extras --python 3.13
```

在项目根目录创建环境配置：

```bash
cp .env.example .env                  # Windows PowerShell: Copy-Item .env.example .env
```

`IMAGE_PROVIDER=mock` 可免费跑通本地流程；使用真实模型时改为 `dashscope` 并填写 `DASHSCOPE_API_KEY`。

初始化数据库并启动服务：

```bash
cd backend
uv run alembic upgrade head

# API 服务（终端一）
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 7302

# Worker（终端二）
uv run arq app.worker.WorkerSettings
```

启动成功后访问 [http://localhost:7302/api/health](http://localhost:7302/api/health)，三个字段全是 `ok` 即为正常。

### 4. 启动前端

新开一个终端：

```bash
cd frontend
npm install                           # 国内可加 --registry=https://registry.npmmirror.com
npm run dev
```

浏览器打开 [http://localhost:7301](http://localhost:7301) 即可使用。

### 5. 运行测试

```bash
cd backend
uv run pytest
```

测试通过 mock 隔离大模型和第三方接口调用，不消耗 API 额度。

### 6. 部署

`Dockerfile` 提供多阶段构建，前端编译后由后端同源托管。服务器安全组放开 7302、7313 端口，然后：

```bash
cp .env.example .env
# 生产环境必改：JWT_SECRET（openssl rand -hex 32）、S3_PUBLIC_ENDPOINT=http://你的公网IP:7313

docker compose --profile deploy up -d --build
docker compose --profile deploy exec app alembic upgrade head
```

浏览器打开 `http://你的公网IP:7302`。

## 五、橙宝官网

访问[https://chengbaolog.com/](https://chengbaolog.com/)了解橙宝及更多项目动态。
