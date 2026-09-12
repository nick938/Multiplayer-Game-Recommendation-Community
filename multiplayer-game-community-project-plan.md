# 联机游戏推荐社区项目计划书

> 版本：v1.0  
> 日期：2026-09  
> 项目类型：联机游戏发现 / 推荐 / 社区平台  
> 核心目标：让一群朋友快速回答——**“我们几个现在适合一起玩什么？”**  
> 部署策略：**同一套源码，国际版与中国大陆版双部署；国际版多语言，中国大陆版仅简体中文。**  
> 当前商业策略：**先做产品与用户增长，暂不接广告。**

---

# 1. 项目结论

## 1.1 是否值得做

建议：**GO**

但产品不应定义为：

> 一个“联机游戏资讯网站”

也不应只是：

> 一个“联机游戏数据库”

而应该定义成：

# **联机游戏推荐社区**

更准确一点：

> **一个帮助朋友、小队、情侣、家庭，根据人数、平台、偏好和游戏习惯，找到真正适合一起玩的游戏的平台。**

核心问题不是：

> 《Palworld》支持几个人？

而是：

> 我们 3 个人，一个 PC、一个 PS5、一个 Xbox，晚上每次只玩 1～2 小时，不喜欢 PvP，有什么适合我们的游戏？

---

# 2. 产品定位

## 2.1 一句话定位

### 国际版

**Find games your group can actually play together.**

### 国内版

**帮你们找到真正适合一起玩的联机游戏。**

---

# 3. 产品核心价值

平台解决 4 个问题：

## 3.1 能不能一起玩

例如：

- PC 和 PS5 能否联机
- PC 和 Xbox 能否联机
- PS4 与 PS5 是否互通
- Switch 与 PC 是否支持 Crossplay
- 是否需要相同版本
- 是否需要平台账号
- 是否支持 Dedicated Server

---

## 3.2 几个人适合玩

不是只保存：

```text
Max Players: 8
```

而是社区回答：

```text
2 人体验：8.8
3 人体验：9.4
4 人体验：9.6
5+ 人体验：8.1
```

因为：

> “最多支持 8 人”

不等于：

> “8 人体验最好”。

---

## 3.3 我们适不适合玩

维度包括：

- 人数
- 平台
- PvE / PvP
- 生存
- RPG
- 建造
- 探索
- 刷装备
- Roguelike
- 恐怖
- 派对
- 轻松
- 高强度
- 是否需要长期投入
- 单局时间
- 学习成本
- 是否适合情侣
- 是否适合固定小队
- 是否适合休闲玩家

---

## 3.4 下一款玩什么

最终产品价值：

```text
我们：
3个人
PC + PC + PS5

喜欢：
Grounded
Deep Rock Galactic
It Takes Two

不喜欢：
PvP
MMO
特别肝

每次：
1～2小时

预算：
$30/人
```

结果：

```text
推荐：

1. Remnant II        匹配 94%
2. Helldivers 2      匹配 91%
3. ...
```

---

# 4. 国际版 + 国内版总体策略

推荐使用两个独立品牌域名或同品牌不同域名。

例如：

```text
国际版：
example.com

国内版：
example.cn
```

不推荐：

```text
cn.example.com
```

作为唯一中国大陆方案。

原因：

- 中国大陆部署和 ICP 更适合独立备案域名
- 中国版与国际版用户数据应尽量隔离
- 国内外 CDN / DNS / 登录 / 存储均不同
- 后期品牌运营可以分别调整
- 降低跨境依赖

---

# 5. 源码策略

核心原则：

# **源码统一，运行环境隔离**

不是：

```text
global-repo
china-repo
```

而是：

```text
一个 Git Repository
        ↓
两套 Build Profile
        ↓
Global Deployment
China Deployment
```

---

# 6. 国际版与国内版功能矩阵

| 功能 | 国际版 | 国内版 |
|---|---|---|
| 游戏数据库 | ✓ | ✓ |
| 游戏推荐器 | ✓ | ✓ |
| 游戏详情页 | ✓ | ✓ |
| Crossplay 查询 | ✓ | ✓ |
| 收藏 | ✓ | ✓ |
| 玩过 / 想玩 | ✓ | ✓ |
| 游戏评分 | ✓ | ✓ |
| 一句话评价 | ✓ | 合规后开放 |
| 评论 | ✓ | 合规后开放 |
| 推荐求助帖 | ✓ | 合规后开放 |
| 多语言 | ✓ | × |
| 简体中文 | 可选 | ✓ |
| 日语 | ✓ | × |
| 韩语 | ✓ | × |
| 英语 | ✓ | × |
| 繁中 | ✓ | × |
| 手机号认证 | 可选 | ✓ |
| Google OAuth | 可选 | × |
| Discord OAuth | 可选 | × |
| Steam 登录 | 后期 | 后期 |
| 国内内容审核 | × | ✓ |
| IP 属地展示 | × | 视功能要求实现 |

---

# 7. 国际版语言规划

国际版不要一开始上十几种语言。

建议：

## Phase 1

```text
en
ja
ko
zh-Hant
```

即：

- 英语
- 日语
- 韩语
- 繁体中文

国内：

```text
zh-Hans
```

即：

- 简体中文

好处：

国际站不会和国内站产生大量简体中文重复内容。

---

# 8. URL 设计

## 国际版

```text
/en/
/en/games/
/en/game/palworld/
/en/recommend/
/en/compare/

/ja/game/palworld/
/ko/game/palworld/
/zh-hant/game/palworld/
```

## 国内版

```text
/
/games/
/game/palworld/
/recommend/
/compare/
```

国内版隐藏 locale prefix。

---

# 9. 国际化实现

推荐：

**next-intl**

当前 next-intl 已支持 Next.js 16 和 App Router。

翻译文件：

```text
messages/
├── en.json
├── ja.json
├── ko.json
├── zh-Hant.json
└── zh-Hans.json
```

但不要把所有游戏内容写进 JSON。

---

# 10. 多语言数据设计

游戏名称、简介、标签等应该单独建本地化表。

例如：

```text
games

game_localizations
├── game_id
├── locale
├── name
├── short_description
├── description
└── seo_title
```

这样：

```text
Palworld
```

可以对应不同语言介绍。

---

# 11. UGC 多语言原则

用户评论不建议第一阶段自动翻译。

例如：

```text
日本用户：
「3人で遊ぶのがちょうどいい。」

英文用户仍可看到原文。
```

未来可以增加：

```text
[Translate]
```

但自动翻译属于增强功能，不应该阻塞 MVP。

---

# 12. 产品模块

平台分成 6 个核心模块。

---

# 13. 模块 1：Game Finder

这是整个网站最重要的功能。

用户输入：

## 人数

```text
2
3
4
5+
```

## 平台

例如：

```text
Player A：PC
Player B：PS5
Player C：Xbox Series
```

## 联机方式

```text
Online
Local
Split-screen
LAN
```

## 游戏偏好

```text
PvE
PvP
Survival
RPG
Crafting
Exploration
Shooter
Party
Horror
Casual
```

## 时间

```text
< 30 min
30～60 min
1～2 hours
2～4 hours
Long session
```

## 投入程度

```text
Casual
Medium
Hardcore
```

## 不喜欢

```text
PvP
Grinding
MMO
Permadeath
Horror
Competitive
```

最后：

```text
Find Games
```

---

# 14. 推荐结果

结果不要只是一个游戏列表。

应该：

```text
Grounded

Match: 94%

为什么推荐：

✓ 4 人合作
✓ 支持 PC / Xbox Crossplay
✓ PvE
✓ 生存 + 建造
✓ 3 人体验评分很高
✓ 社区认为学习成本适中
✓ 可以长期玩

可能不适合：

△ 前期需要收集资源
```

---

# 15. 模块 2：Game Detail

例如：

```text
/game/grounded/
```

页面包括：

## 基础信息

- 游戏名
- 开发商
- 发行时间
- 平台
- 类型

## 联机信息

```text
Online Co-op
Local Co-op
Split Screen
LAN
Max Players
Dedicated Server
Friend Pass
Crossplay
Cross-save
```

---

# 16. Crossplay 信息不能只存一个 Boolean

很多游戏并不是：

```text
crossplay = true
```

这么简单。

例如可能是：

```text
PC ↔ Xbox     ✓
PC ↔ PS5      ✓
PS5 ↔ Xbox    ×
Switch ↔ PC   ×
```

因此必须存：

**Platform Pair Compatibility**

---

# 17. Crossplay 数据模型

例如：

```text
crossplay_rules

game_id
platform_a
platform_b
status
note
source
verified_at
```

状态：

```text
SUPPORTED
PARTIAL
NOT_SUPPORTED
UNKNOWN
```

这是平台未来非常重要的数据资产。

---

# 18. 模块 3：社区评分

普通游戏网站：

```text
8.7 / 10
```

我们的评分应该更有场景性。

例如：

```text
适合两人        9.4
适合三人        9.1
适合四人        9.5

适合情侣        8.9
适合固定小队    9.4
适合休闲玩家    7.8

入门难度        5.2
肝度            7.4
沟通需求        6.5
```

---

# 19. 模块 4：用户游戏库

用户账号可以维护：

```text
Played
Playing
Want to Play
Dropped
```

例如：

```text
✓ Grounded
✓ Valheim
✓ Deep Rock Galactic

Want:
○ Enshrouded
○ Remnant II
```

推荐系统利用这些信息。

---

# 20. 模块 5：推荐求助

后期社区核心。

用户发：

```text
我们 4 个人

平台：
PC

喜欢：
Terraria
Valheim
Palworld

不喜欢：
PvP
竞技游戏

每周玩：
2～3 晚

有什么推荐？
```

社区回答：

```text
Enshrouded

理由：
四个人玩正合适。
```

---

# 21. 模块 6：游戏对比

例如：

```text
Valheim vs Grounded
```

展示：

| 维度 | Valheim | Grounded |
|---|---|---|
| 4人体验 | 9.4 | 9.6 |
| Crossplay | 部分 | 是 |
| 生存 | 强 | 中 |
| 建造 | 强 | 中 |
| Boss | 强 | 强 |
| 单局时长 | 长 | 中 |
| 学习成本 | 中 | 低 |
| 社区推荐 | 92% | 94% |

非常适合分享和搜索。

---

# 22. MVP 不要做论坛

第一版不要出现：

```text
综合讨论区
水区
闲聊区
游戏专区
```

原因：

**没人。**

空论坛会严重降低产品可信度。

---

# 23. MVP 范围

第一版建议：

## 游戏数据

**300～500 款高质量联机游戏**

不是 18,000 款。

---

## 功能

必须：

1. Game Finder
2. Game Detail
3. Crossplay 数据
4. Player Count
5. 标签筛选
6. 推荐理由
7. 用户账号
8. 收藏
9. Played / Want to Play
10. 结构化评分
11. 一句话评价
12. Share Result

暂缓：

- 私信
- 好友
- Feed
- 公会
- 语音
- 实时聊天室
- 找队友大厅

---

# 24. 为什么只做 300～500 款

因为用户真正需要的是：

**准确。**

而不是：

**多。**

例如：

```text
Crossplay
Player Count
Dedicated Server
Friend Pass
Cross-save
```

如果错误一次，用户就会开始不信任网站。

因此：

> 500 个准确游戏 > 20,000 个半准确游戏

---

# 25. 初期游戏选择策略

首批重点：

## Survival / Crafting

例如：

- Valheim
- Grounded
- Palworld
- Enshrouded
- Minecraft
- Terraria
- Project Zomboid
- 7 Days to Die
- ARK

## PvE Shooter

- Deep Rock Galactic
- Helldivers
- Remnant
- Warframe

## Couples / 2 Player

- It Takes Two
- A Way Out
- Portal 2
- We Were Here

## Party

- Overcooked
- Pummel Party
- PlateUp
- Party Animals

优先覆盖：

**用户真的会搜索“我们能不能一起玩”的游戏。**

---

# 26. 数据来源策略

不要让在线页面实时依赖第三方 API。

架构应该：

```text
Third-party API
      ↓
Data Import
      ↓
Internal Game Database
      ↓
Website
```

而不是：

```text
User
↓
Website
↓
实时调用第三方 API
```

---

# 27. 可用的基础数据源

## RAWG

可以提供：

- 游戏基础数据
- 平台
- Genres
- Developers
- Publishers
- Release Date
- 图片
- Ratings

目前 RAWG 的公开条款允许小型商业项目在一定规模内免费使用，但要求署名和链接；超过其 MAU / PV 阈值后需要商业条款。

因此：

**可以作为 MVP Bootstrap 数据源，但不能把整个商业模式绑死在 RAWG 上。**

---

## IGDB

IGDB API 数据非常丰富。

但官方说明：

- 非商业使用免费
- 商业需求需要合作

所以如果未来商业化：

需要正式处理授权问题。

---

# 28. 最重要的数据必须自己维护

真正形成护城河的是：

```text
Crossplay
Max Players
Local Players
Split Screen
Friend Pass
Copy Requirement
Dedicated Server
Cross-save
Recommended Group Size
```

这些应该进入：

**自己的数据库。**

---

# 29. 数据可信体系

每个重要字段增加：

```text
source_url
verified_at
verified_by
confidence
```

例如：

```text
Crossplay:
PC ↔ PS5

Status:
Supported

Source:
Official FAQ

Verified:
2026-09-02
```

---

# 30. 用户纠错

每个页面都提供：

```text
Report incorrect information
```

用户可以提交：

```text
Crossplay information is outdated.
```

后台进入审核队列。

---

# 31. 推荐算法 v1

第一版不要上 AI。

首先做：

**规则过滤 + 权重排序。**

---

# 32. 推荐流程

第一层：

## Hard Filters

必须满足：

```text
人数
平台兼容
Crossplay
Online / Local
```

不满足直接淘汰。

---

第二层：

## Preference Score

例如：

```text
Genre Similarity      25%
Group Size Fit        20%
Community Rating      15%
Play Style Match      15%
Session Length        10%
Difficulty Match       5%
Popularity             5%
Freshness              5%
```

---

# 33. 最关键算法：Platform Compatibility

用户：

```text
PC
PS5
Xbox
```

算法需要判断：

对于某款游戏：

这三个平台是否属于同一个可联机兼容集合。

而不是简单：

```text
game.crossplay === true
```

---

# 34. 推荐系统 v2

当拥有足够用户数据以后：

增加：

```text
Collaborative Filtering
```

例如：

喜欢：

```text
Grounded
Valheim
Palworld
```

的用户：

也大量喜欢：

```text
Enshrouded
```

推荐权重提高。

---

# 35. 推荐系统 v3

再后期可以：

用户输入一句话：

```text
我们三个人，喜欢轻松的 PvE，不喜欢特别肝，晚上玩一小时左右。
```

AI 把自然语言转成：

```json
{
  "players": 3,
  "pve": true,
  "grindy": false,
  "session": "short"
}
```

真正的游戏排序仍由自己的 Recommendation Engine 完成。

不要让 LLM 直接随便推荐游戏。

---

# 36. 技术选型

建议：

| 模块 | 技术 |
|---|---|
| Web | Next.js 16 |
| UI | React |
| Language | TypeScript |
| CSS | Tailwind CSS |
| i18n | next-intl |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | Better Auth |
| Search | Meilisearch |
| Cache | Redis |
| Schema Validation | Zod |
| Storage | Adapter |
| Analytics | Umami / 自建 |
| Repo | GitHub |
| Package Manager | pnpm |
| Monorepo | pnpm workspace / Turborepo 可选 |

---

# 37. 为什么不用 Astro

这个项目未来包含：

- 登录
- 收藏
- 用户 Profile
- 评论
- 评分
- 推荐
- 社区
- Server Actions / APIs
- 搜索
- Dashboard
- 管理后台

已经是：

**动态 Web Application**

Next.js 更合适。

当前 Next.js 16.3 是 2026 年稳定主线之一。

---

# 38. 项目仓库

推荐：

```text
repo/
├── apps/
│   └── web/
│
├── packages/
│   ├── db/
│   ├── domain/
│   ├── auth/
│   ├── recommendation/
│   ├── search/
│   ├── moderation/
│   ├── storage/
│   ├── i18n/
│   ├── ui/
│   └── config/
│
├── scripts/
│   ├── import-games/
│   ├── sync-data/
│   └── rebuild-search/
│
└── infra/
    ├── global/
    └── china/
```

---

# 39. 不要在代码里到处写

禁止：

```ts
if (isChina) {
 ...
}
```

散落整个项目。

应该统一：

```ts
runtimeConfig.region
runtimeConfig.locales
runtimeConfig.features
runtimeConfig.providers
```

---

# 40. 部署配置

例如：

```env
DEPLOYMENT_TARGET=global
```

或者：

```env
DEPLOYMENT_TARGET=cn
```

---

# 41. Feature Flags

例如：

```ts
features = {
  ugc: true,
  comments: true,
  recommendationPosts: true,
  socialLogin: true,
  phoneLogin: false,
  ads: false,
  aiTranslation: false
}
```

国内：

```ts
features = {
  ugc: false, // 合规准备完成后再打开
  comments: false,
  recommendationPosts: false,
  socialLogin: false,
  phoneLogin: true,
  ads: false,
  aiTranslation: false
}
```

后期只改配置。

---

# 42. Provider Adapter

这是双部署最重要的技术设计。

例如：

```text
StorageProvider
EmailProvider
SmsProvider
CaptchaProvider
AnalyticsProvider
ModerationProvider
GeoIPProvider
```

---

# 43. Storage

统一接口：

```ts
interface StorageProvider {
  upload()
  delete()
  getPublicUrl()
}
```

国际：

```text
Cloudflare R2
```

国内：

```text
Alibaba OSS
```

---

# 44. Auth Provider

国际：

```text
Email
Google（可选）
Discord（可选）
Steam（后期）
```

国内：

```text
手机号 + SMS
```

Better Auth 做基础账号与 Session。

手机号实名逻辑单独做 Adapter。

---

# 45. Captcha

国际：

```text
Cloudflare Turnstile
```

国内：

```text
腾讯云 / 阿里云验证码
```

不要让国内版本依赖：

- Google reCAPTCHA
- Google Fonts
- Google Analytics
- Google OAuth

---

# 46. 搜索系统

初期：

**Meilisearch**

原因：

- 拼写容错
- Faceted Search
- Filter
- Fast
- Self-host 可用
- 国内外都能独立部署

国际：

```text
Meilisearch Cloud
```

或自建。

国内：

```text
Self-hosted Meilisearch
```

Meilisearch Community Edition 当前是 MIT License。

---

# 47. 搜索过滤

例如：

```text
platform = PC
players >= 3
crossplay = true
genre = survival
pve = true
```

非常适合 Meilisearch。

---

# 48. 数据库核心表

建议：

```text
users
user_profiles

games
game_localizations

platforms
game_platforms

genres
game_genres

game_coop_profiles
crossplay_rules
cross_save_rules

game_sources

user_game_status
user_collections

ratings
group_size_ratings

reviews
review_votes

recommendation_requests
comments

reports
moderation_cases

game_corrections
```

---

# 49. Game Coop Profile

例如：

```text
game_coop_profiles

game_id

online_coop
local_coop
split_screen
lan

min_online_players
max_online_players

min_local_players
max_local_players

coop_campaign

dedicated_server

friend_pass

copies_required
```

---

# 50. 国内外数据库必须隔离

推荐：

```text
Global PostgreSQL
        ×
China PostgreSQL
```

不要：

```text
China User
↓
Global Database
```

原因：

- 网络延迟
- 稳定性
- 数据合规
- 未来跨境个人信息复杂度

---

# 51. 哪些数据可以同步

可以：

```text
Game Metadata
Platform
Genre
Crossplay Facts
Game Translation
```

不要自动同步：

```text
用户账号
手机号
Email
评论
收藏
私信
行为日志
```

---

# 52. 游戏公共数据同步方案

建立：

```text
Game Catalog Export
```

例如：

```text
catalog-2026-09-11.json
```

里面只有：

**非个人数据。**

分别导入：

```text
Global DB
China DB
```

---

# 53. 国际部署方案

建议 MVP：

```text
Domain
↓
Cloudflare DNS
↓
Vercel
↓
Next.js
↓
Neon PostgreSQL
↓
Redis
↓
Meilisearch
↓
Cloudflare R2
```

---

# 54. 国际版推荐服务

## Web

Vercel Pro。

截至 2026 年：

```text
$20 / 月
```

Hobby 免费，但官方定位为个人、非商业用途。

即使第一阶段不广告，既然这是准备长期运营的项目，建议正式上线使用 Pro。

---

# 55. 国际数据库

Neon PostgreSQL。

早期可以免费。

正式有用户后：

Launch 典型成本约：

```text
$15 / 月起
```

具体按 Compute / Storage。

---

# 56. 国际对象存储

Cloudflare R2。

当前 Standard：

```text
$0.015 / GB-month
```

并且：

```text
Internet Egress = $0
```

免费额度包括：

```text
10 GB-month
```

对于游戏社区 MVP 足够轻量。

---

# 57. 国际版初期预算

大概：

| 项目 | 月成本 |
|---|---:|
| Vercel | $20 |
| PostgreSQL | $0～20 |
| R2 | $0～5 |
| Redis | $0～10 |
| Search | $0～30 |
| 邮件 | $0～10 |
| 总计 | **约 $20～95/月** |

人民币大约：

**¥150～700/月**

视实际流量。

---

# 58. 国内部署方案

推荐：

```text
域名 .cn
↓
ICP
↓
阿里云 DNS
↓
阿里云 CDN
↓
ECS / SAE
↓
Next.js Docker
↓
RDS PostgreSQL
↓
Redis
↓
Meilisearch
↓
OSS
```

腾讯云也可以。

为了减少供应商数量：

建议第一阶段全部用：

**阿里云。**

---

# 59. 国内 Web 部署

第一阶段：

```text
1 台 ECS
Docker
Nginx
Next.js
Meilisearch
```

Database 使用：

RDS。

不要一开始 Kubernetes。

---

# 60. 国内规模大以后

再拆：

```text
Web
Worker
Meilisearch
Redis
Database
```

或迁移：

```text
ACK / SAE
```

---

# 61. 为什么不建议中国版直接 Vercel

Vercel 官方明确说明：

- 没有中国大陆节点
- 中国大陆访问可能较慢或不稳定
- 大陆内部署还涉及 ICP 和本地监管要求

因此：

**国内版应该真正部署在中国大陆。**

---

# 62. Cloudflare China 不适合 MVP

Cloudflare China Network：

需要：

- Cloudflare Enterprise
- China Network 单独订阅
- ICP

成本明显不适合个人项目 MVP。

所以不考虑。

---

# 63. 国内合规最低清单

中国版如果部署大陆：

至少提前考虑：

## ICP

根据现行《互联网信息服务管理办法》：

- 非经营性互联网信息服务：备案
- 经营性互联网信息服务：许可

当前不收费、不广告、不付费：

可以先按非经营性思路准备。

实际应以：

- 云服务商
- 所在地通信管理局
- 业务模式

最终判断为准。

---

# 64. 公安联网备案

对于相关主体，正式联网后还存在公安联网备案要求。

建议把：

```text
ICP
公安备案
```

都列入中国版上线 Checklist。

---

# 65. 中国版 UGC 特别重要

如果开放：

- 评论
- 发帖
- 信息发布
- 推荐帖

当前账号管理规则要求：

提供信息发布等服务时，应进行真实身份信息认证。

手机号是规定列举的认证方式之一。

因此国内版：

# **手机号登录应该是主方案**

---

# 66. 后台实名、前台昵称

产品表现：

```text
后台：
138****1234

前台：
游戏昵称
```

用户无需公开真实姓名。

---

# 67. IP 属地

当前互联网用户账号信息管理规则包含 IP 地址归属地展示要求。

因此国内版的数据模型提前预留：

```text
ip_country
ip_province
```

避免以后重新改架构。

---

# 68. 内容审核

中国版社区必须预留：

```text
发布前机器审核
↓
高风险进入人工审核
↓
正常发布
↓
用户举报
↓
后台处理
```

---

# 69. 举报系统

必须有：

```text
举报评论
举报用户
举报游戏资料
举报帖子
```

后台：

```text
Pending
Reviewing
Resolved
Rejected
```

---

# 70. 日志

现行网络安全规则要求网络运行日志按规定留存，相关义务中明确不少于 6 个月。

所以中国版从第一天：

```text
Audit Log
Auth Log
Moderation Log
Security Log
```

设计好保留策略。

---

# 71. 个人信息

国内用户数据：

建议全部留在国内。

避免默认把：

```text
手机号
Email
用户行为
评论账号映射
```

同步到国际环境。

如果未来确需跨境：

再单独做个人信息跨境合规评估。

---

# 72. 推荐算法合规

中国版的推荐功能本质上可能涉及：

- 排序精选
- 检索过滤
- 个性化推荐

现行《互联网信息服务算法推荐管理规定》适用于相关算法推荐服务。

并不是“所有小网站都自动必须备案”，但如果服务具有：

**舆论属性或社会动员能力**

可能涉及算法备案和安全评估。

因此建议：

项目规模起来后、尤其国内社区开放前：

**找熟悉互联网平台业务的律师 / 合规顾问做一次正式判断。**

---

# 73. 为什么国内版早期建议先“工具化”

中国版可以先上线：

- 游戏数据库
- Game Finder
- Crossplay
- 收藏
- 推荐器

而把：

- 发帖
- 评论
- 社区 Feed

放到第二阶段。

这样：

**产品可以先验证，不必让社区合规阻塞整个项目。**

---

# 74. CI/CD

Repository：

```text
main
```

Merge：

```text
GitHub Actions
```

触发：

```text
Global Deploy
China Build
```

---

# 75. Build Matrix

例如：

```yaml
target:
  - global
  - cn
```

国际：

```text
push → Vercel
```

国内：

```text
push
↓
Docker Build
↓
Alibaba Container Registry
↓
ECS / SAE Deploy
```

---

# 76. Docker

项目必须保证：

```text
docker build
docker run
```

能正常运行。

即使国际版用了 Vercel。

这样避免：

**代码和 Vercel 深度绑定。**

---

# 77. Runtime 原则

尽量使用：

**Node Runtime**

不要大量依赖：

```text
Vercel-specific API
Cloudflare-specific runtime
```

业务代码全部标准化。

---

# 78. Analytics

建议不要一开始用 GA4。

原因：

中国版不适合依赖 Google。

建议：

**Umami**

国际和国内分别部署/统计。

统一事件模型：

```text
finder_started
finder_completed
game_viewed
recommendation_clicked
game_saved
game_rated
review_created
share_created
```

---

# 79. 核心指标

初期不要看：

```text
广告 RPM
收入
```

看：

## Activation

多少用户完成一次 Game Finder。

## CTR

推荐出来以后：

多少人点进游戏详情。

## Save Rate

多少人收藏。

## Review Rate

多少人产生社区数据。

## Return Rate

7 天 / 30 天回来多少。

---

# 80. 北极星指标

推荐：

# **Weekly Successful Game Discoveries**

可以定义为：

用户完成 Finder 后：

```text
点击游戏
+
收藏 / 想玩
```

算一次成功发现。

比 PageView 更有意义。

---

# 81. 社区冷启动

社区最难不是技术。

而是：

**没人。**

---

# 82. 冷启动方法

第一阶段靠：

```text
数据库
推荐器
SEO
编辑内容
```

给用户价值。

而不是靠：

```text
论坛
```

---

# 83. 第一个社区行为

应该非常低门槛：

```text
👍 适合3人玩
```

而不是：

```text
请写500字评测
```

---

# 84. 第二个社区行为

```text
一句话评价
```

例如：

> 我和女朋友打了 40 小时，非常适合两个人。

---

# 85. 第三个社区行为

```text
游戏评分维度
```

---

# 86. 第四个社区行为

才是：

```text
推荐求助帖
```

社区自然逐层形成。

---

# 87. 用户 Reputation

后期增加：

```text
Helpful Votes
Verified Correction
Reviews
Contribution
```

产生：

```text
Level 1
Level 2
Trusted Contributor
Moderator
```

鼓励维护游戏数据。

---

# 88. SEO 国际版

主要页面：

```text
/game/palworld/
/game/palworld/crossplay/
/game/palworld/player-count/

/recommend/2-player/
/recommend/3-player/
/recommend/4-player/

/recommend/pc-ps5-crossplay/

/games-like/it-takes-two/

/compare/valheim-vs-grounded/
```

---

# 89. Programmatic SEO 原则

不要生成：

```text
10万空页面
```

组合页只有满足：

```text
>= 一定数量有效游戏
+
有独特数据
+
有搜索价值
```

才 index。

其余：

```text
noindex
```

---

# 90. 国内搜索

主要兼容：

- 百度
- Bing
- 360
- 搜狗

但中国版初期增长不要完全押 SEO。

可以通过：

- Bilibili
- 小红书
- 知乎
- 游戏群
- Steam 中文社区

传播：

**“我们几个玩什么？”**

这个产品天然适合截图分享。

---

# 91. Share Card

这是非常重要的增长功能。

例如用户生成：

```text
我们 4 人小队的推荐：

1. Grounded
2. Deep Rock Galactic
3. Valheim
4. Enshrouded
```

生成漂亮卡片。

可分享：

- Discord
- Reddit
- X
- 微信
- QQ
- 小红书

---

# 92. 首发 12 周路线

## Week 1～2

基础：

- Brand
- Domain
- Next.js
- Database
- i18n
- Design System
- Deploy
- Analytics

---

## Week 3～4

Game Catalog：

- Games
- Platforms
- Genres
- Localization
- 100 个种子游戏

实现：

```text
Game Detail
```

---

## Week 5～6

Co-op Data：

- Player Count
- Online
- Local
- Crossplay
- Dedicated Server
- Friend Pass

扩到：

```text
300 Games
```

---

## Week 7～8

核心：

# Game Finder

完成：

```text
人数
平台
偏好
Hard Filter
Recommendation Ranking
```

---

## Week 9

账号：

- Login
- Profile
- 收藏
- Played
- Want to Play

---

## Week 10

社区轻功能：

- Rating
- Group Size Rating
- One-line Review

---

## Week 11

增长：

- Share Result
- Games Like
- 2/3/4 player pages
- Crossplay landing pages

---

## Week 12

Beta：

国际版：

```text
开放
```

国内版：

```text
数据库 + Finder
```

社区部分按备案 / 认证 / 审核准备情况决定开放。

---

# 93. 第 4～6 月

重点：

- 游戏扩到 1,000+
- 数据纠错系统
- 推荐算法 v2
- Compare
- Recommendation Requests
- Moderator
- Game Lists
- SEO
- 国际多语言完善

---

# 94. 第 6～12 月

再考虑：

- Steam Library Import
- Discord Bot
- Developer Game Submission
- 公共 API
- 玩家小队 Profile
- 社区榜单
- 个性化首页

最后才考虑：

- 广告
- Affiliate
- Sponsored Game

---

# 95. 暂时不要广告是正确的

当前阶段：

# **完全赞成不接广告。**

因为前期最重要的是：

```text
推荐体验
留存
社区密度
数据质量
```

广告：

会干扰：

- Finder
- 页面体验
- 品牌感
- 社区信任

---

# 96. 但代码提前预留商业化

组件里可以有：

```text
<MonetizationSlot />
```

默认：

```text
return null
```

未来才启用：

```text
Ad
Affiliate
Sponsored
```

不需要以后重构页面。

---

# 97. 未来可能的商业模式

等用户量起来：

## 1. Display Ads

游戏详情、推荐列表等。

## 2. Game Affiliate

第三方游戏平台。

## 3. Dedicated Server Affiliate

例如：

- Valheim
- Palworld
- Minecraft
- Project Zomboid

这可能非常适合联机社区。

## 4. Sponsored Games

独立开发者买曝光。

但：

必须标：

```text
Sponsored
```

且不能影响 Organic Ranking。

## 5. Premium

例如：

- 高级筛选
- 小队 Profile
- 推荐历史
- 无广告

后期再考虑。

---

# 98. 风险

## 风险 1：数据维护工作巨大

解决：

- 先 300～500 款
- Source Tracking
- Community Correction
- Contributor System

---

## 风险 2：社区没人

解决：

- 工具优先
- 数据库优先
- 社区渐进式

---

## 风险 3：国内外逻辑越来越不同

解决：

- Adapter
- Feature Flag
- Shared Domain Layer

不要 Copy Code。

---

## 风险 4：推荐不准

解决：

先规则推荐。

不要过早 AI。

---

## 风险 5：游戏数据授权

解决：

基础数据供应商必须：

- 查看 API Terms
- 记录数据来源
- 避免侵权图片
- 用户量扩大前处理商业授权

---

# 99. 最推荐的最终架构

```text
                     GitHub
                       │
                 Single Codebase
                       │
        ┌──────────────┴──────────────┐
        │                             │
      GLOBAL                         CHINA
        │                             │
 example.com                     example.cn
        │                             │
     Vercel                      Alibaba CDN
        │                             │
    Next.js                        Next.js
        │                             │
   Global DB                       China DB
        │                             │
 Global Search                    China Search
        │                             │
      R2                             OSS
```

双方只同步：

```text
Game Catalog
Translations
Public Game Facts
```

绝不默认同步：

```text
Users
Phone
Email
Comments
Behavior
```

---

# 100. 我的最终产品建议

这个项目不要变成：

> “另一个游戏资讯网站。”

也不要变成：

> “中文版 co-op.gg。”

它应该成为：

# **一款真正帮助朋友决定“今晚玩什么”的产品。**

最核心三个页面：

## 1.

```text
Find a Game
```

## 2.

```text
Game Detail
```

## 3.

```text
Community Recommendation
```

产品飞轮：

```text
游戏数据库
      ↓
Game Finder
      ↓
用户找到游戏
      ↓
收藏 / 评分
      ↓
社区数据
      ↓
推荐越来越准
      ↓
用户回来
```

如果这个飞轮跑起来：

广告只是一种后续变现方式。

真正有价值的资产会是：

- 联机游戏数据库
- Crossplay 数据
- 小队适配数据
- 玩家行为
- 推荐算法
- 社区关系
- 品牌

---

# 101. 推荐技术版本

启动时建议锁定：

```text
Node.js 22 LTS 或届时当前受支持 LTS
Next.js 16.x
React
TypeScript
PostgreSQL
Drizzle
Better Auth
next-intl
Meilisearch
Redis
Tailwind
```

依赖版本每季度安全升级一次。

---

# 102. 当前建议的执行顺序

不要先做 Logo。

建议：

```text
1. 确定数据模型
2. 确定 300 个首发游戏
3. 确定 Crossplay 数据结构
4. 搭项目骨架
5. 做 Game Detail
6. 做 Game Finder
7. 再做账号
8. 再做社区
9. 最后品牌包装
```

---

# 103. 当前最重要的技术任务

正式编码前，建议优先把下面三件事设计准确：

## A. Crossplay 数据结构

这是产品核心。

## B. Recommendation Input Schema

例如：

```ts
type GroupPreferences = {
  players: number
  platforms: Platform[]
  genres: Genre[]
  avoidTags: Tag[]
  sessionLength: string
  intensity: string
}
```

## C. Game Coop Profile Schema

决定以后能不能扩展。

这三个模型如果一开始设计错，后期迁移成本会非常高。

---

# 104. 参考资料

Next.js 16  
https://nextjs.org/

next-intl  
https://next-intl.dev/

Better Auth  
https://better-auth.com/

Meilisearch  
https://www.meilisearch.com/

RAWG API  
https://rawg.io/apidocs

IGDB API  
https://api-docs.igdb.com/

Cloudflare R2 Pricing  
https://developers.cloudflare.com/r2/pricing/

Vercel Pricing  
https://vercel.com/pricing

Cloudflare China Network  
https://developers.cloudflare.com/china-network/

互联网信息服务管理办法  
https://sdca.miit.gov.cn/zwgk/fgbz/art/2026/art_fea940f81f1d423e87101adf147ab979.html

互联网用户账号信息管理规定  
https://www.cac.gov.cn/2022-06/26/c_1657868775042841.htm

互联网信息服务算法推荐管理规定  
https://www.cac.gov.cn/2022-01/04/c_1642894606364259.htm

中华人民共和国个人信息保护法  
https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm

---

# 最终结论

推荐正式推进。

产品核心：

# **联机游戏推荐社区**

部署：

# **同源码、双部署、双数据库**

国际版：

# **多语言 + 全球社区**

国内版：

# **简体中文 + 独立基础设施 + 独立用户数据**

第一阶段：

# **不要广告，不要大论坛，不要 2 万游戏。**

先把：

# **500 个游戏 + 一个非常好用的 Game Finder**

做到真的有人愿意用。

然后社区自然往上长。
