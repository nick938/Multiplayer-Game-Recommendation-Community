# 部署方案（Cloudflare Workers，已上线）

> 状态：**已上线** — https://coopfinder.sololeveling.top （主地址，Cloudflare 自定义域名）
> 备用：https://coopfinder.liuyi4781.workers.dev （workers.dev，wrangler.jsonc `workers_dev: true` 保留）
> 部署决策（2026-09-12）：**只部署到 Cloudflare Workers**，不用 Vercel，不用阿里云。
> 仓库只保留这一条部署路径；国际版/国内版差异由 `DEPLOYMENT_TARGET` 构建开关控制，
> 与托管平台无关。

```
GitHub（单一代码库）
      │  main 分支
      ▼
pnpm deploy:worker（opennextjs-cloudflare build + deploy）
      │
Cloudflare Workers（Next.js 16 经 OpenNext 适配，静态资源走 Workers Assets）
      │  每条查询 = 一次 HTTPS 请求（@neondatabase/serverless HTTP SQL API）
      ▼
Neon PostgreSQL（项目 green-breeze-49108960，us-east-1）
```

## 为什么是 Neon HTTP 驱动（关键约束）

**workerd 的 socket 绑定在创建它的那个请求上下文上**：连接池（postgres.js、pg Pool
都实测过）跨请求复用必然挂起——每个 isolate 只有首次请求成功，之后
`code had hung` → 1101，且按 isolate 粘性成串。2026-09-12 对照实验定位，
已改用 `drizzle-orm/neon-http`（每条查询是一次 fetch，无 socket 生命周期）修复。
**不要再把长寿命连接池驱动带回 Workers 路径**，Hyperdrive 也一样（它的 socket
代理正是被绕开的坑）。

## 一、资源清单

| 资源 | 服务 | 用途 | 费用 |
|---|---|---|---|
| Web | Cloudflare Workers | Next.js 托管（OpenNext 适配） | 免费档起步；超 CPU 限额升 Paid $5/月 |
| 数据库 | Neon | PostgreSQL，us-east-1 | 免费档起步 |
| 域名 | （后置）阿里云购买 → DNS 托管 Cloudflare | 自定义域名 + 绕开 workers.dev 国内阻断 | ~¥60/年 |

## 二、部署步骤（全量）

前置：`wrangler login`（当前账号 liuyi4781@gmail.com）。账号下另有 Naddod 团队账号，
**非交互部署必须显式指定 `CLOUDFLARE_ACCOUNT_ID=92b495890da98068a5b5f4c3703fe2fb`**。

1. Secrets（一次性，`apps/web` 目录下执行）：

   ```sh
   # Neon **pooled** 连接串（主机名带 -pooler），末尾不要换行
   printf '%s' 'postgresql://<user>:<pass>@ep-xxx-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require' \
     | CLOUDFLARE_ACCOUNT_ID=… npx wrangler secret put DATABASE_URL
   CLOUDFLARE_ACCOUNT_ID=… npx wrangler secret put BETTER_AUTH_SECRET   # openssl rand -base64 32
   ```

2. 构建并部署（`apps/web` 目录）：

   ```sh
   CLOUDFLARE_ACCOUNT_ID=… pnpm deploy:worker
   # = pnpm --filter @mgc/db embed && opennextjs-cloudflare build && deploy
   ```

3. 部署后验证（go-live 最小集）：

   ```sh
   # 连打 12 次必须全 200 —— 一次 500 即 socket/驱动问题复发
   for i in 1 2 3 4 5 6 7 8 9 10 11 12; do curl -s -o /dev/null -w "%{http_code} " \
     https://coopfinder.liuyi4781.workers.dev/api/health; done
   # 多语言：/ /ja /ko /zh-hant 应 200（/en 307 → / 是 global Profile 的预期行为）
   # 写路径：POST /api/auth/sign-up/email 注册一个 QA 账号应 200
   ```

## 三、数据库操作 runbook

Workers 上**不执行迁移和 seed**（neon-http 跑不了 drizzle migrator），schema 变更
必须从宿主机对 Neon 执行，任何有 `DATABASE_URL` 的 Node 环境均可：

```sh
# 1. 改 packages/db/src/schema.ts 后生成迁移并内嵌
pnpm db:generate
pnpm db:embed

# 2. 对 Neon 应用迁移 + 空库时灌种子（走 postgres.js，幂等；
#    getDb() 在 Node 路径 = 先应用内嵌迁移，games 表非空则跳过 seed）
DATABASE_URL='postgresql://…@ep-xxx…neon.tech/neondb?sslmode=require' pnpm --filter @mgc/db seed

# 3. 重新部署应用（内嵌迁移随构建走）
CLOUDFLARE_ACCOUNT_ID=… pnpm deploy:worker
```

诊断：`npx wrangler tail --format pretty` 抓生产异常（1101 显示为 hung cancellation）。
注意 `wrangler dev --remote` 与生产行为有分叉，复现不出 1101 类问题。

## 四、本地开发

```sh
pnpm dev          # 零配置：无 DATABASE_URL 时用内嵌 PGlite，自动建表 + 灌 41 款种子
```

PGlite 仅限本地/Node 环境（serverless 运行时上无持久化，代码已显式拒绝启动）。

## 五、后置事项

- [x] **自定义域名（2026-09-12 完成）**：`sololeveling.top` 阿里云注册（当日购买）→
      NS 已切 Cloudflare（samara/peyton.ns.cloudflare.com，zone 激活）→ Worker 绑定
      `coopfinder.sololeveling.top`（wrangler.jsonc `routes.custom_domain`，DNS 记录与
      证书自动签发）。注意：加 routes 后 wrangler 默认**关闭 workers.dev 路由**，
      已用 `workers_dev: true` 显式保留备用入口。
      注意：Cloudflare 免费版无中国大陆节点，国内访问走跨境链路，延迟 200–400ms 属预期；
      该路线为无备案灰区，`features.ugc` 必须保持关闭。
- [ ] 种子数据人工复核（41 款 crossplay 矩阵，`confidence=editor`，核验日期 2026-09-01）。
- [ ] 游戏扩充到计划书目标 300–500 款。
- [ ] 监控：Cloudflare Workers observability 已开（wrangler.jsonc），可外加 uptime
      monitor 打 `/api/health`。

## 明确不做

- Vercel、阿里云（ECS/RDS/CDN/短信签名等部署资源）——决策已定，仓库已清理
  （原 Dockerfile / docker-compose / deploy/china / deploy-china.yml 已删除）。
- Cloudflare China Network（企业级成本，§62）。
- K8s、Redis、Meilisearch（规模到了再引入，见 README「刻意的技术取舍」）。
