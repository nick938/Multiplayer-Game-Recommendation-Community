# 联机游戏推荐社区 (CoopFinder)

> 一个帮助朋友、小队、情侣、家庭，根据**人数、平台、偏好**找到真正适合一起玩的联机游戏的平台。
> 依据 `multiplayer-game-community-project-plan.md`（下称"计划书"）实现。
> **已上线**：https://coopfinder.liuyi4781.workers.dev （Cloudflare Workers + Neon PostgreSQL）

## 已实现范围（对应计划书）

| 计划书章节 | 实现 |
|---|---|
| §3 产品核心价值 | Game Finder + 推荐理由（✓ 优点 / △ 注意点） |
| §8 / §39–42 URL 与双区域架构 | `runtimeConfig` 单一来源，`global` / `cn` 两套 Build Profile，无散落的 `if (isChina)` |
| §13–14 Game Finder | 人数 / 每人平台 / 联机方式 / 类型 / 偏好 / 雷点 / 单局时长 / 强度 |
| §16–17 Crossplay 平台对模型 | `crossplay_rules`（SUPPORTED / PARTIAL / NOT_SUPPORTED / UNKNOWN + 备注 + 来源 + 核验时间），详情页渲染矩阵 |
| §19 用户游戏库 | 玩过 / 在玩 / 想玩 / 弃坑（Better Auth 账号） |
| §23–25 MVP 范围 | 41 款精选游戏种子数据（生存建造 / PvE 射击 / 双人合作 / 派对 / RPG / 策略） |
| §29–30 数据可信 | `source_url` / `verified_at` / `confidence` + 页面纠错入口（进审核队列，不自动生效） |
| §31–33 推荐算法 v1 | 硬过滤（人数 / 平台对连通性 BFS / 模式 / 雷点）+ 计划书权重表评分，纯函数 + 22 个单测 |
| §48 核心表 | `games`、`game_localizations`、`crossplay_rules`、`cross_save_rules`、`game_coop_profiles`、`ratings`、`group_size_ratings`、`reviews`、`game_corrections`、`reports`、`audit_logs` 等 |
| §41 / §65–67 国内预留 | CN Profile：仅简中、无 URL 前缀、UGC 关闭、手机号登录开关、IP 属地字段已预留 |
| §83–84 社区冷启动 | 低门槛行为：人数适配评分 → 一句话评价（280 字内） |
| §91 Share Result | 结果页 URL 即分享链接（一键复制） |
| §96 商业化预留 | `<MonetizationSlot />`，`features.ads` 关闭时渲染 null |

## 技术栈

Next.js 16.3 (App Router / Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
next-intl 4（en / zh-hans / zh-hant / ja / ko）· PostgreSQL + Drizzle ORM · Better Auth 1.7 · Zod 4 · pnpm workspace · Vitest ·
线上部署 Cloudflare Workers (OpenNext) + Neon（Workers 上经 neon-http 驱动，见 DEPLOYMENT.md）

## 运行

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

无需任何外部服务：未设置 `DATABASE_URL` 时自动使用 **PGlite**（内嵌 Postgres），
首次启动自动建表并灌入 41 款游戏的种子数据（数据目录 `apps/web/.pglite-data`）。

```bash
pnpm test         # 推荐引擎单测（22 个）
pnpm typecheck    # 全仓类型检查
pnpm build        # 生产构建
pnpm db:generate  # 修改 schema 后生成迁移（SQL）
pnpm db:embed     # 将迁移 SQL 内嵌进运行时（generate 之后必须跑）
```

### 连接真实 PostgreSQL（为部署准备）

```bash
DATABASE_URL=postgres://user:pass@host:5432/db pnpm dev
```

同一套迁移与查询；驱动切换见 `packages/db/src/client.ts`。

## 区域切换（同源码双部署）

```bash
DEPLOYMENT_TARGET=global pnpm dev   # 默认；5 语言，默认英语，/ja /ko /zh-hant 前缀
DEPLOYMENT_TARGET=cn    pnpm dev   # 仅简中，URL 无前缀，UGC 关闭，手机号登录开关开启
```

配置唯一来源：`packages/config/src/index.ts`（regions / features / providers，计划书 §39–42）。

## 环境变量

见 `.env.example`。本地零配置即可跑通；社交媒体登录、短信等仅在相应密钥存在时启用。

## 目录结构

```
apps/web                 Next.js 应用（页面、组件、server actions、i18n）
packages/config          区域 Profile + Feature Flags（计划书 §39–42）
packages/domain          共享类型：平台/类型/标签、GroupPreferences、CoopProfile（§103）
packages/recommendation  推荐引擎：平台对兼容 BFS → 硬过滤 → 加权评分 → 理由生成（§31–33）
packages/db              Drizzle schema、迁移（内嵌运行时）、PGlite/PG 双驱动、种子数据、查询层
packages/auth            Better Auth（邮箱密码；Google/Discord 按环境变量启用）、短信 Provider 接口（§44）
```

## 刻意的技术取舍（与计划书的差异）

- **搜索**：目录规模 ≤ 数百款时直接内存过滤（查询层已按可替换设计）；Meilisearch（§46）在游戏数过千或需要拼写容错时再引入。
- **Redis**：MVP 无缓存需求，未引入。
- **推荐匹配百分比**：由权重引擎真实计算，不伪造精度；评分数据在社区票数 ≥ 3 前使用**编辑评估**分并明确标注（解决"冷启动时谁填分"的问题）。
- **图片**：程序化渐变封面（hue 存在 `games.cover_hue`），不外链版权素材（§25/风险 5）。
- **社交/评论/帖子等表**：schema 已含 MVP 所需全部表；`recommendation_requests`、`comments`、`moderation_cases` 属第二阶段社区模块，随功能一起加。

## 上线前必须完成（代码之外的功课）

1. 重新人工核验 41 款游戏的 crossplay 矩阵与联机数据（种子数据标记 `confidence=editor`，核验日期 2026-09-01）。
2. 游戏扩充到计划书目标 300–500 款。
3. CN 版：Cloudflare 单部署路线下无国内接入商、走不了 ICP 备案——**无备案灰区运营，
   `features.ugc` 保持关闭**；`DEPLOYMENT_TARGET=cn` 构建开关仍可用（仅语言/URL 差异）。
4. 自定义域名：阿里云购买域名 → NS 切到 Cloudflare → Worker 绑定 Custom Domain
   （顺带解决 workers.dev 国内阻断；详见 DEPLOYMENT.md「后置事项」）。

## 部署

完整部署方案与 runbook 见 **[DEPLOYMENT.md](DEPLOYMENT.md)**（Cloudflare Workers + Neon，
secrets 配置、数据库操作、验证清单、坑与约束）。

```sh
cd apps/web
CLOUDFLARE_ACCOUNT_ID=<账号ID> pnpm deploy:worker   # 构建 + 部署到 Cloudflare Workers
```

环境变量见 `.env.example`。本地零配置即可跑通；社交媒体登录、短信等仅在相应密钥存在时启用。
