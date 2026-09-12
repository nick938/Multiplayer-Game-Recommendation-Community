/**
 * Starter catalog (plan §23–25): ~40 hand-curated co-op games.
 *
 * Facts are editor-curated from general knowledge (confidence: editor,
 * verified_at: 2026-09-01). Before production, re-verify every crossplay rule
 * against official sources via the correction workflow (plan §29–30) — a
 * single wrong rule costs user trust (plan §24).
 */
import type { CopyRequirement, CrossplayStatus, GenreId, Intensity, PlatformId, SessionLength, TagId } from '@mgc/domain'

export interface SeedGame {
  slug: string
  name: string
  releaseYear: number
  developer: string
  publisher: string
  popularity: number
  hue: number
  featured?: boolean
  platforms: PlatformId[]
  genres: GenreId[]
  tags: TagId[]
  onlineMin: number
  onlineMax: number
  local?: [number, number]
  splitScreen?: boolean
  lan?: boolean
  dedicated?: boolean | null
  friendPass?: boolean
  copies?: CopyRequirement
  session: SessionLength
  difficulty?: number
  grind?: number
  communication?: number
  intensity: Intensity
  /** 'full' | 'family' | 'none' or explicit pair overrides */
  crossplay?: 'full' | 'family' | 'none' | Array<[PlatformId, PlatformId, CrossplayStatus, string?]>
  crossSave?: boolean
  communityRating: number
  groupRatings?: Partial<Record<2 | 3 | 4 | 5, number>>
  note?: string
  descEn: { short: string; long: string }
  descZh: { short: string; long: string }
  sourceUrl?: string
}

const FAMILY_NOTE = '同世代主机间互通'
const JAVE_NOTE = '仅 Bedrock 基岩版互通；Java 版需同版本或第三方服务器'
const DRG_NOTE = '跨平台仅限微软商店版与 Xbox；Steam 与主机不互通'

export const SEED_GAMES: SeedGame[] = [
  // ------------------------------------------------------------------
  // Survival / Crafting (plan §25)
  // ------------------------------------------------------------------
  {
    slug: 'valheim', name: 'Valheim', releaseYear: 2021, developer: 'Iron Gate Studio', publisher: 'Coffee Stain Publishing',
    popularity: 82, hue: 150, featured: true,
    platforms: ['pc', 'xbox-series'], genres: ['survival', 'crafting', 'sandbox'], tags: ['pve', 'building', 'exploration', 'long-term'],
    onlineMin: 1, onlineMax: 10, dedicated: true, lan: true, session: 'long', difficulty: 4, grind: 6, communication: 4, intensity: 'medium',
    crossplay: [['pc', 'xbox-series', 'SUPPORTED']], communityRating: 9.0,
    groupRatings: { 2: 9.0, 3: 9.2, 4: 9.4, 5: 8.6 },
    descEn: { short: 'Norse survival where a small viking crew builds, sails and slays bosses.', long: 'A 1–10 player co-op survival game set in a procedurally generated Norse world. Building feels great, bosses demand real preparation, and dedicated servers let a crew keep a long-running world alive.' },
    descZh: { short: '北欧神话生存游戏，小队一起建造、航行、讨伐 Boss。', long: '支持 1–10 人合作的北欧生存游戏，世界程序生成。建造系统出色，Boss 战需要认真准备，支持专用服务器，适合长期经营同一个世界。' },
    sourceUrl: 'https://www.valheimgame.com/',
  },
  {
    slug: 'grounded', name: 'Grounded', releaseYear: 2022, developer: 'Obsidian Entertainment', publisher: 'Xbox Game Studios',
    popularity: 74, hue: 100, featured: true,
    platforms: ['pc', 'xbox-series'], genres: ['survival', 'crafting', 'adventure'], tags: ['pve', 'building', 'exploration'],
    onlineMin: 1, onlineMax: 4, session: 'medium', difficulty: 3, grind: 4, communication: 4, intensity: 'medium',
    crossplay: [['pc', 'xbox-series', 'SUPPORTED']], crossSave: true,
    communityRating: 8.6, groupRatings: { 2: 9.0, 3: 9.3, 4: 9.6 },
    descEn: { short: 'Honey-I-Shrunk-the-Kids survival: four friends vs a hostile backyard.', long: 'First-person survival in a shrunken backyard. Tight 4-player scale, friendly to shorter sessions, and the story campaign gives a group a clear reason to keep playing.' },
    descZh: { short: '缩小到蚂蚁大小的后院生存，4 人小队的童年噩梦大冒险。', long: '第一人称后院生存游戏，玩家被缩小到蚂蚁尺寸。4 人规模设计紧凑，单局时间友好，主线剧情让小队有持续玩下去的目标。' },
  },
  {
    slug: 'palworld', name: 'Palworld', releaseYear: 2024, developer: 'Pocketpair', publisher: 'Pocketpair',
    popularity: 88, hue: 200, featured: true,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['survival', 'crafting', 'rpg'], tags: ['pve', 'building', 'grindy', 'long-term'],
    onlineMin: 1, onlineMax: 32, dedicated: true, session: 'long', difficulty: 4, grind: 6, communication: 3, intensity: 'medium',
    crossplay: 'full', crossSave: false,
    communityRating: 8.4, groupRatings: { 2: 8.6, 3: 9.0, 4: 9.4, 5: 8.2 },
    note: '小队最多 4 人，公会/服务器最多 32 人（专用服务器）',
    descEn: { short: 'Open-world survival with collectible Pals, base building and guns.', long: 'Survival crafting with creature collecting. A 4-player party shares a base; dedicated servers host up to 32 players. Crossplay arrived in v0.5 across PC, PlayStation and Xbox.' },
    descZh: { short: '捕捉帕鲁、建造基地的开放世界生存游戏。', long: '带宠物收集要素的生存建造游戏，4 人小队共享基地，专用服务器最多容纳 32 人。v0.5 起支持 PC / PlayStation / Xbox 全平台跨平台联机。' },
    sourceUrl: 'https://www.pocketpair.jp/palworld',
  },
  {
    slug: 'minecraft', name: 'Minecraft', releaseYear: 2011, developer: 'Mojang Studios', publisher: 'Mojang Studios',
    popularity: 95, hue: 120, featured: true,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one', 'switch'],
    genres: ['sandbox', 'survival', 'crafting'], tags: ['family-friendly', 'building', 'exploration', 'relaxing', 'pve'],
    onlineMin: 1, onlineMax: 8, dedicated: true, session: 'long', difficulty: 2, grind: 3, communication: 2, intensity: 'casual',
    crossplay: 'full', crossSave: true,
    communityRating: 9.2, groupRatings: { 2: 9.3, 3: 9.4, 4: 9.5, 5: 9.0 },
    note: JAVE_NOTE,
    descEn: { short: 'The sandbox that needs no introduction — build anything together.', long: 'Bedrock Edition connects PC, console and mobile players with full crossplay and cross-save. The default answer when a mixed-platform group just wants to hang out and build.' },
    descZh: { short: '不用介绍的沙盒游戏，一起建造一切。', long: '基岩版（Bedrock）连接 PC、主机与手机玩家，全平台互通且支持跨平台存档。当一支混合平台的小队只想一起放松建造时，这几乎总是默认答案。' },
    sourceUrl: 'https://help.minecraft.net/',
  },
  {
    slug: 'terraria', name: 'Terraria', releaseYear: 2011, developer: 'Re-Logic', publisher: 'Re-Logic',
    popularity: 80, hue: 20,
    platforms: ['pc', 'ps5', 'xbox-series', 'switch'], genres: ['action', 'adventure', 'sandbox', 'crafting'], tags: ['pve', 'building', 'exploration'],
    onlineMin: 1, onlineMax: 8, dedicated: true, session: 'long', difficulty: 3, grind: 4, communication: 2, intensity: 'medium',
    crossplay: [['pc', 'ps5', 'UNKNOWN', '1.4.5 更新计划中加入跨平台，截至 2026-09 未上线'], ['pc', 'xbox-series', 'UNKNOWN', '1.4.5 更新计划中'], ['pc', 'switch', 'UNKNOWN', '1.4.5 更新计划中'], ['ps5', 'xbox-series', 'UNKNOWN'], ['ps5', 'switch', 'UNKNOWN'], ['xbox-series', 'switch', 'UNKNOWN']],
    communityRating: 9.3, groupRatings: { 2: 9.0, 3: 9.0, 4: 9.2, 5: 8.6 },
    descEn: { short: '2D sandbox with hundreds of hours of bosses, loot and building.', long: 'The definitive 2D sandbox adventure. Crossplay has been announced for the long-running 1.4.5 update but is not live yet, so cross-platform groups must wait or consolidate platforms.' },
    descZh: { short: '2D 沙盒冒险，Boss、装备与建造内容量惊人。', long: '最经典的 2D 沙盒冒险游戏。官方宣布跨平台功能将随 1.4.5 更新推出，但截至 2026-09 尚未上线，跨平台组队目前只能等待或统一平台。' },
  },
  {
    slug: 'project-zomboid', name: 'Project Zomboid', releaseYear: 2013, developer: 'The Indie Stone', publisher: 'The Indie Stone',
    popularity: 62, hue: 0,
    platforms: ['pc'], genres: ['survival', 'crafting', 'rpg'], tags: ['pve', 'permadeath', 'difficult', 'long-term'],
    onlineMin: 1, onlineMax: 16, dedicated: true, lan: true, session: 'long', difficulty: 6, grind: 5, communication: 5, intensity: 'hardcore',
    communityRating: 8.8, groupRatings: { 2: 8.8, 3: 8.6, 4: 9.0, 5: 8.4 },
    descEn: { short: 'Deep isometric zombie survival — how long can your group last?', long: 'Hardcore zombie survival with deep systems and permanent death. PC only, best with a private dedicated server; the definitive "this is how you died" group experience.' },
    descZh: { short: '硬核等距视角丧尸生存——你们能活多久？', long: '系统深度极高的丧尸生存游戏，死亡即永久。仅限 PC，建议自建专用服务器游玩，是"这就是你们死亡的方式"式的小队体验。' },
  },
  {
    slug: '7-days-to-die', name: '7 Days to Die', releaseYear: 2024, developer: 'The Fun Pimps', publisher: 'The Fun Pimps',
    popularity: 66, hue: 30,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['survival', 'crafting', 'shooter'], tags: ['pve', 'building', 'horror', 'long-term'],
    onlineMin: 1, onlineMax: 8, dedicated: true, session: 'long', difficulty: 5, grind: 6, communication: 4, intensity: 'medium',
    crossplay: 'full',
    communityRating: 8.0, groupRatings: { 2: 8.0, 3: 8.2, 4: 8.6, 5: 8.0 },
    descEn: { short: 'Zombie survival with tower defense: every 7th night gets deadly.', long: 'The 1.0 release brought full crossplay across PC, PS5 and Xbox Series. A weekly horde night gives the group a rhythm and a shared base to defend.' },
    descZh: { short: '丧尸生存+塔防：每第 7 夜都是尸潮之夜。', long: '1.0 版本起 PC、PS5、Xbox Series 全面跨平台联机。每七天一次的尸潮给小队带来节奏感，共同守卫同一个基地。' },
  },
  {
    slug: 'ark-survival-ascended', name: 'ARK: Survival Ascended', releaseYear: 2023, developer: 'Studio Wildcard', publisher: 'Studio Wildcard',
    popularity: 60, hue: 190,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['survival', 'crafting', 'action'], tags: ['pve', 'grindy', 'building', 'long-term'],
    onlineMin: 1, onlineMax: 10, dedicated: true, session: 'long', difficulty: 5, grind: 8, communication: 4, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 7.4, groupRatings: { 2: 7.6, 3: 7.8, 4: 8.2, 5: 7.4 },
    descEn: { short: 'Tame dinosaurs, build tribes, survive an island of giants.', long: 'Unreal Engine 5 remake of ARK with full crossplay and cross-save. Taming and base upkeep demand a real time investment — great for a committed crew, rough for casuals.' },
    descZh: { short: '驯龙、建部落，在巨兽之岛上生存。', long: '虚幻 5 重制版，全平台跨平台联机与跨平台存档。驯龙和基地维护需要大量时间投入——适合固定小队长期游玩，休闲玩家会感到吃力。' },
  },
  {
    slug: 'raft', name: 'Raft', releaseYear: 2022, developer: 'Redbeet Interactive', publisher: 'Axolot Games',
    popularity: 58, hue: 210,
    platforms: ['pc'], genres: ['survival', 'crafting', 'adventure'], tags: ['relaxing', 'pve', 'building', 'family-friendly', 'exploration'],
    onlineMin: 1, onlineMax: 8, session: 'medium', difficulty: 2, grind: 3, communication: 2, intensity: 'casual',
    communityRating: 8.4, groupRatings: { 2: 9.0, 3: 8.8, 4: 8.8, 5: 8.2 },
    descEn: { short: 'Build a raft together and drift across a calm shark-infested ocean.', long: 'Cozy ocean survival for up to 8 players. Low pressure, family-friendly and genuinely relaxing — a great first co-op game for mixed-age groups.' },
    descZh: { short: '一起造一艘木筏，漂在有大白鲨的平静海面上。', long: '最多 8 人的休闲海上生存。压力低、全年龄友好、真的很放松——是混合年龄小队的入门合作游戏首选。' },
  },
  {
    slug: 'dont-starve-together', name: "Don't Starve Together", releaseYear: 2016, developer: 'Klei Entertainment', publisher: 'Klei Entertainment',
    popularity: 56, hue: 45,
    platforms: ['pc', 'ps4', 'xbox-one', 'switch'], genres: ['survival', 'crafting', 'roguelike'], tags: ['permadeath', 'pve', 'difficult'],
    onlineMin: 1, onlineMax: 6, dedicated: true, session: 'long', difficulty: 5, grind: 3, communication: 4, intensity: 'medium',
    crossplay: 'none',
    communityRating: 8.6, groupRatings: { 2: 9.0, 3: 8.8, 4: 8.8, 5: 8.4 },
    descEn: { short: 'Gothic wilderness survival where starving is the least of your worries.', long: 'Distinctive gothic art and unforgiving survival. Cross-platform support is essentially absent, so pick one platform as a group before buying.' },
    descZh: { short: '哥特画风荒野生存——饿死只是死法之一。', long: '画风独特、生存规则严苛。基本不支持跨平台联机，购买前全队先统一平台。' },
  },
  {
    slug: 'core-keeper', name: 'Core Keeper', releaseYear: 2024, developer: 'Pugstorm', publisher: 'Fireshine Games',
    popularity: 54, hue: 280,
    platforms: ['pc', 'ps5', 'xbox-series', 'switch'], genres: ['survival', 'crafting', 'sandbox', 'rpg'], tags: ['pve', 'building', 'exploration', 'relaxing'],
    onlineMin: 1, onlineMax: 8, session: 'medium', difficulty: 3, grind: 4, communication: 2, intensity: 'casual',
    crossplay: 'full',
    communityRating: 8.7, groupRatings: { 2: 9.2, 3: 9.0, 4: 9.2, 5: 8.6 },
    descEn: { short: 'Underground mining sandbox with farming, bosses and base building.', long: 'A pixel-art mining sandbox that launched 1.0 with full crossplay across PC and all three consoles. Chill pacing makes it easy to recommend to almost any group.' },
    descZh: { short: '地下挖矿沙盒，种田、打 Boss、建基地。', long: '像素风地下挖矿沙盒，1.0 版本起 PC 与三大主机全面跨平台联机。节奏轻松，几乎适合推荐给任何类型的小队。' },
  },
  {
    slug: 'enshrouded', name: 'Enshrouded', releaseYear: 2024, developer: 'Keen Games', publisher: 'Keen Games',
    popularity: 64, hue: 260,
    platforms: ['pc'], genres: ['survival', 'crafting', 'rpg', 'action'], tags: ['pve', 'building', 'exploration'],
    onlineMin: 1, onlineMax: 16, dedicated: true, session: 'long', difficulty: 4, grind: 5, communication: 3, intensity: 'medium',
    communityRating: 8.3, groupRatings: { 2: 8.6, 3: 8.8, 4: 9.0, 5: 8.4 },
    descEn: { short: 'Voxel survival action-RPG with stunning building and a shroud to fight into.', long: 'Survival meets action-RPG in a voxel world with superb freeform building. Up to 16 players on a dedicated server; console versions are still on the roadmap.' },
    descZh: { short: '体素世界生存动作 RPG，自由建造手感一流。', long: '生存+动作 RPG，体素世界的自由建造非常出色。专用服务器最多 16 人，主机版仍在开发计划中。' },
  },
  {
    slug: 'satisfactory', name: 'Satisfactory', releaseYear: 2024, developer: 'Coffee Stain Studios', publisher: 'Coffee Stain Publishing',
    popularity: 66, hue: 60,
    platforms: ['pc'], genres: ['simulation', 'crafting', 'sandbox'], tags: ['building', 'relaxing', 'long-term', 'pve'],
    onlineMin: 1, onlineMax: 4, dedicated: true, session: 'long', difficulty: 4, grind: 6, communication: 3, intensity: 'medium',
    communityRating: 9.0, groupRatings: { 2: 8.8, 3: 9.0, 4: 9.2 },
    descEn: { short: 'First-person factory building on an alien planet, together.', long: 'Build ever-growing factories with up to 4 players. Sessions stretch long, but the shared factory is one of the most satisfying group projects in gaming.' },
    descZh: { short: '第一人称工厂建设，在外星星球一起搞工业化。', long: '最多 4 人共同建设不断扩张的工厂。单局时间长，但共同经营的工厂是游戏界最令人满足的小队工程之一。' },
  },
  {
    slug: 'sons-of-the-forest', name: 'Sons of the Forest', releaseYear: 2024, developer: 'Endnight Games', publisher: 'Endnight Games',
    popularity: 58, hue: 130,
    platforms: ['pc'], genres: ['survival', 'crafting', 'horror'], tags: ['horror', 'pve', 'building', 'difficult'],
    onlineMin: 1, onlineMax: 8, session: 'long', difficulty: 5, grind: 3, communication: 4, intensity: 'medium',
    communityRating: 7.8, groupRatings: { 2: 8.4, 3: 8.6, 4: 8.6, 5: 8.0 },
    descEn: { short: 'Cannibal island survival with a buddy system and real scares.', long: 'Sequel to The Forest. Terrifying at night, hilarious by day — a strong pick for groups that want survival with occasional jumpscares.' },
    descZh: { short: '食人族海岛生存，白天搞笑、晚上吓人。', long: '《森林》续作。夜晚非常吓人、白天非常搞笑——适合想要生存玩法+偶尔惊吓的小队。' },
  },

  // ------------------------------------------------------------------
  // PvE Shooters (plan §25)
  // ------------------------------------------------------------------
  {
    slug: 'deep-rock-galactic', name: 'Deep Rock Galactic', releaseYear: 2020, developer: 'Ghost Ship Games', publisher: 'Coffee Stain Publishing',
    popularity: 72, hue: 350, featured: true,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one'], genres: ['shooter', 'roguelike', 'action'], tags: ['pve', 'funny', 'casual', 'looting'],
    onlineMin: 1, onlineMax: 4, session: 'medium', difficulty: 4, grind: 5, communication: 5, intensity: 'medium',
    crossplay: [['pc', 'ps5', 'NOT_SUPPORTED', 'Steam 与主机不互通'], ['pc', 'ps4', 'NOT_SUPPORTED', 'Steam 与主机不互通'], ['pc', 'xbox-series', 'PARTIAL', DRG_NOTE], ['pc', 'xbox-one', 'PARTIAL', DRG_NOTE], ['ps5', 'xbox-series', 'NOT_SUPPORTED'], ['ps5', 'xbox-one', 'NOT_SUPPORTED'], ['ps4', 'xbox-series', 'NOT_SUPPORTED'], ['ps4', 'xbox-one', 'NOT_SUPPORTED'], ['ps4', 'ps5', 'SUPPORTED', FAMILY_NOTE], ['xbox-one', 'xbox-series', 'SUPPORTED', FAMILY_NOTE]],
    communityRating: 9.0, groupRatings: { 2: 8.8, 3: 9.2, 4: 9.6 },
    note: DRG_NOTE,
    descEn: { short: '4-player dwarven mining shooters. Rock and Stone!', long: 'Fully co-op cave mining with four distinct classes and endless goodwill. Beware: crossplay is limited to the Microsoft Store/Xbox ecosystem — Steam players cannot join console friends.' },
    descZh: { short: '4 人矮人矿工射击，Rock and Stone！', long: '纯合作的洞穴挖掘射击，四个职业分工明确、社区氛围极佳。注意：跨平台仅限微软商店版与 Xbox 生态，Steam 玩家无法与主机好友联机——是"跨平台矩阵"重要性的典型例子。' },
    sourceUrl: 'https://www.ghostshipgames.com/',
  },
  {
    slug: 'helldivers-2', name: 'Helldivers 2', releaseYear: 2024, developer: 'Arrowhead Game Studios', publisher: 'Sony Interactive Entertainment',
    popularity: 90, hue: 210, featured: true,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['shooter', 'action'], tags: ['pve', 'funny', 'casual'],
    onlineMin: 1, onlineMax: 4, session: 'short', difficulty: 4, grind: 5, communication: 4, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 8.5, groupRatings: { 2: 8.4, 3: 9.0, 4: 9.4 },
    descEn: { short: 'Managed democracy delivered via 4-player orbital strikes.', long: 'The definitive friendly-fire co-op shooter. Full crossplay and cross-save across PC, PS5 and Xbox Series, with missions that fit neatly into an evening.' },
    descZh: { short: '用 4 人轨道轰炸传播"管理下的民主"。', long: '最容易误伤队友的合作射击游戏。PC、PS5、Xbox Series 全平台跨平台联机+跨平台存档，任务时长正好适合一个晚上。' },
    sourceUrl: 'https://www.playstation.com/games/helldivers-2/',
  },
  {
    slug: 'remnant-ii', name: 'Remnant II', releaseYear: 2023, developer: 'Gunfire Games', publisher: 'Gearbox Publishing',
    popularity: 60, hue: 15,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['shooter', 'action', 'rpg'], tags: ['pve', 'looting', 'difficult'],
    onlineMin: 1, onlineMax: 3, session: 'medium', difficulty: 6, grind: 5, communication: 4, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 8.4, groupRatings: { 2: 8.6, 3: 9.2 },
    note: '合作人数恰好 3 人，三排小队的完美选择',
    descEn: { short: 'Soulslike shooter built for exactly three players.', long: '"Souls with guns" — a 3-player co-op shooter with roguelike world generation. Full crossplay and cross-save. The rare game whose sweet spot is exactly a trio.' },
    descZh: { short: '为"恰好三人"设计的魂味合作射击。', long: '"拿枪的魂"——3 人合作射击，世界随机生成。全平台跨平台联机+跨平台存档。少见的最佳人数正好是三人小队的游戏。' },
  },
  {
    slug: 'warframe', name: 'Warframe', releaseYear: 2013, developer: 'Digital Extremes', publisher: 'Digital Extremes',
    popularity: 68, hue: 300,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one', 'switch'], genres: ['shooter', 'action', 'mmo'], tags: ['grindy', 'pve', 'looting', 'long-term', 'casual'],
    onlineMin: 1, onlineMax: 4, session: 'short', difficulty: 5, grind: 9, communication: 2, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 8.6, groupRatings: { 2: 8.0, 3: 8.4, 4: 8.8 },
    descEn: { short: 'Free space-ninja looter with a decade of content and full crossplay.', long: 'Space ninjas at ludicrous speed. Ten years of free content, full crossplay and cross-save everywhere — but the grind is legendary, so bring low expectations of pacing.' },
    descZh: { short: '免费太空忍者刷宝游戏，十年内容量。', long: '速度感拉满的太空忍者。十年免费更新，全平台跨平台联机+跨平台存档——但肝度也是传奇级的，请调整对节奏的预期。' },
  },
  {
    slug: 'risk-of-rain-2', name: 'Risk of Rain 2', releaseYear: 2020, developer: 'Hopoo Games', publisher: 'Gearbox Publishing',
    popularity: 58, hue: 25,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one', 'switch'], genres: ['shooter', 'roguelike', 'action'], tags: ['pve', 'casual', 'short-sessions'],
    onlineMin: 1, onlineMax: 4, session: 'short', difficulty: 4, grind: 3, communication: 2, intensity: 'casual',
    crossplay: 'full',
    communityRating: 8.6, groupRatings: { 2: 8.6, 3: 9.0, 4: 9.2 },
    descEn: { short: 'Escalating roguelike runs that fit into any game night.', long: 'Third-person roguelike where difficulty scales with time. Runs take 30–60 minutes, making it the perfect opener or closer for a session. Crossplay across all platforms.' },
    descZh: { short: '难度随时间升级的 Roguelike，单局 30–60 分钟。', long: '第三人称 Roguelike，难度随时间推移升级。单局 30–60 分钟，是联机之夜完美的开场或收尾游戏。全平台跨平台联机。' },
  },

  // ------------------------------------------------------------------
  // Couples / 2 Player (plan §25)
  // ------------------------------------------------------------------
  {
    slug: 'it-takes-two', name: 'It Takes Two', releaseYear: 2021, developer: 'Hazelight Studios', publisher: 'Electronic Arts',
    popularity: 78, hue: 320, featured: true,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one', 'switch'], genres: ['action', 'adventure', 'platformer', 'puzzle'], tags: ['couple-friendly', 'family-friendly', 'funny'],
    onlineMin: 2, onlineMax: 2, local: [2, 2], splitScreen: true, friendPass: true, copies: 'friend_pass', session: 'medium', difficulty: 3, grind: 1, communication: 5, intensity: 'casual',
    crossplay: 'family',
    communityRating: 9.0, groupRatings: { 2: 9.6 },
    descEn: { short: 'The two-player co-op masterpiece — one buys, one plays free.', long: 'Every level reinvents itself; both players always matter. Friend\'s Pass lets a second player join free on the same platform family, but there is no crossplay between PC/PlayStation/Xbox/Switch.' },
    descZh: { short: '双人合作神作——一人购买，一人免费玩。', long: '每一关都在重新发明玩法，两名玩家始终同等重要。好友通行证让第二位玩家在同平台家族免费加入，但 PC / PlayStation / Xbox / Switch 之间不支持跨平台。' },
  },
  {
    slug: 'a-way-out', name: 'A Way Out', releaseYear: 2018, developer: 'Hazelight Studios', publisher: 'Electronic Arts',
    popularity: 56, hue: 220,
    platforms: ['pc', 'ps4', 'xbox-one'], genres: ['action', 'adventure'], tags: ['couple-friendly', 'story-rich'],
    onlineMin: 2, onlineMax: 2, local: [2, 2], splitScreen: true, friendPass: true, copies: 'friend_pass', session: 'medium', difficulty: 2, grind: 1, communication: 6, intensity: 'casual',
    crossplay: 'family',
    communityRating: 8.0, groupRatings: { 2: 8.6 },
    descEn: { short: 'Prison-break buddy movie you play from two sides of the screen.', long: 'A split-screen co-op crime story designed for exactly two players, with a Friend\'s Pass on the same platform. Around 6–8 hours, best finished in a weekend.' },
    descZh: { short: '双人分屏越狱" buddy movie"。', long: '为恰好两名玩家设计的分屏合作犯罪剧情游戏，支持好友通行证（同平台）。流程 6–8 小时，适合一个周末通关。' },
  },
  {
    slug: 'split-fiction', name: 'Split Fiction', releaseYear: 2025, developer: 'Hazelight Studios', publisher: 'Electronic Arts',
    popularity: 84, hue: 265, featured: true,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['action', 'adventure', 'platformer'], tags: ['couple-friendly', 'funny'],
    onlineMin: 2, onlineMax: 2, local: [2, 2], splitScreen: true, friendPass: true, copies: 'friend_pass', session: 'medium', difficulty: 3, grind: 1, communication: 5, intensity: 'casual',
    crossplay: 'family',
    communityRating: 9.1, groupRatings: { 2: 9.5 },
    descEn: { short: 'Hazelight\'s sci-fi × fantasy two-player rollercoaster.', long: 'Mio and Zoe\'s genre-hopping co-op adventure. Friend\'s Pass works within the same platform family only; no crossplay between PC, PS5 and Xbox Series.' },
    descZh: { short: 'Hazelight 的科幻×奇幻双人过山车。', long: '米欧与佐伊的类型跳跃式双人合作冒险。好友通行证仅限同平台家族使用，PC / PS5 / Xbox Series 之间不支持跨平台。' },
  },
  {
    slug: 'portal-2', name: 'Portal 2', releaseYear: 2011, developer: 'Valve', publisher: 'Valve',
    popularity: 62, hue: 190,
    platforms: ['pc'], genres: ['puzzle', 'platformer'], tags: ['difficult', 'funny'],
    onlineMin: 2, onlineMax: 2, session: 'short', difficulty: 4, grind: 1, communication: 7, intensity: 'medium',
    communityRating: 9.4, groupRatings: { 2: 9.6 },
    descEn: { short: 'The all-time great two-player puzzle campaign.', long: 'A dedicated co-op campaign built on communication and portal physics. PC only these days; the puzzles still outclass most modern co-op design.' },
    descZh: { short: '史上最佳双人解谜战役。', long: '基于传送门物理与沟通的双人专门战役。如今仅 PC 平台，但谜题设计依然胜过大多数现代合作游戏。' },
  },
  {
    slug: 'we-were-here-together', name: 'We Were Here Together', releaseYear: 2019, developer: 'Total Mayhem Games', publisher: 'Total Mayhem Games',
    popularity: 44, hue: 185,
    platforms: ['pc'], genres: ['puzzle', 'adventure'], tags: ['couple-friendly'],
    onlineMin: 2, onlineMax: 2, session: 'short', difficulty: 3, grind: 1, communication: 9, intensity: 'casual',
    communityRating: 8.0, groupRatings: { 2: 8.8 },
    note: '两名玩家被分隔在不同房间，全靠对讲机沟通解谜',
    descEn: { short: 'Two players, two rooms, one pair of walkie-talkies.', long: 'Asymmetric co-op puzzling where communication is the entire game. You each see half the solution — talking precisely is the puzzle.' },
    descZh: { short: '两个人、两个房间、一对对讲机。', long: '非对称合作解谜——沟通就是玩法本身。你们各自只看到答案的一半，精准描述就是解谜。' },
  },

  // ------------------------------------------------------------------
  // Co-op Adventure / Open World
  // ------------------------------------------------------------------
  {
    slug: 'sea-of-thieves', name: 'Sea of Thieves', releaseYear: 2018, developer: 'Rare', publisher: 'Xbox Game Studios',
    popularity: 70, hue: 195,
    platforms: ['pc', 'xbox-series', 'ps5'], genres: ['action', 'adventure', 'simulation'], tags: ['pvp', 'pve', 'exploration', 'funny'],
    onlineMin: 1, onlineMax: 4, dedicated: true, session: 'medium', difficulty: 4, grind: 5, communication: 8, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 8.2, groupRatings: { 2: 8.2, 3: 8.6, 4: 9.0 },
    note: '共享世界含 PvP——厌恶 PvP 的小队会被排除本作',
    descEn: { short: 'Sail, loot and sing shanties — with other pirates hunting you.', long: 'A shared-world pirate sandbox with full crossplay and cross-save on PC, Xbox and PlayStation. Contains PvP: magical for the right crew, a dealbreaker if your group hates it.' },
    descZh: { short: '扬帆、劫掠、唱船歌——同时提防其他海盗。', long: '共享世界海盗沙盒，PC / Xbox / PlayStation 全平台跨平台联机+跨平台存档。包含 PvP：对合适的小队是魔法，对讨厌 PvP 的小队是劝退点。' },
  },
  {
    slug: 'no-mans-sky', name: "No Man's Sky", releaseYear: 2016, developer: 'Hello Games', publisher: 'Hello Games',
    popularity: 62, hue: 240,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one', 'switch'], genres: ['adventure', 'simulation', 'sandbox'], tags: ['relaxing', 'exploration', 'building'],
    onlineMin: 1, onlineMax: 4, session: 'medium', difficulty: 3, grind: 6, communication: 1, intensity: 'casual',
    crossplay: 'full', crossSave: true,
    communityRating: 8.4, groupRatings: { 2: 8.8, 3: 8.6, 4: 8.6, 5: 8.2 },
    descEn: { short: 'Infinite universe exploring, now a genuinely good co-op journey.', long: 'Years of free updates turned NMS into a relaxing co-op exploration game with full crossplay and cross-save. Low-pressure: nobody has to optimize anything.' },
    descZh: { short: '无限宇宙探索，如今是真正好玩的合作之旅。', long: '多年免费更新让《无人深空》成为轻松的合作探索游戏，全平台跨平台联机+跨平台存档。压力极低：没有人需要"优化 gameplay"。' },
  },
  {
    slug: 'stardew-valley', name: 'Stardew Valley', releaseYear: 2016, developer: 'ConcernedApe', publisher: 'ConcernedApe',
    popularity: 76, hue: 110, featured: true,
    platforms: ['pc', 'ps4', 'xbox-one', 'switch'], genres: ['simulation', 'rpg'], tags: ['relaxing', 'family-friendly', 'couple-friendly', 'long-term', 'casual'],
    onlineMin: 1, onlineMax: 4, session: 'short', difficulty: 1, grind: 4, communication: 1, intensity: 'casual',
    crossplay: 'none',
    communityRating: 9.2, groupRatings: { 2: 9.4, 3: 9.0, 4: 9.2, 5: 8.6 },
    descEn: { short: 'Run a farm together at the gentlest possible pace.', long: 'The coziest co-op there is: farming, fishing and festival-going for up to 4. No crossplay between platforms, so pick one and settle in for years of updates-free charm.' },
    descZh: { short: '用最温柔的节奏一起经营农场。', long: '最治愈的合作游戏：最多 4 人种田、钓鱼、逛节日。不支持跨平台联机，选定一个平台后可以一直玩下去。' },
  },

  // ------------------------------------------------------------------
  // RPG
  // ------------------------------------------------------------------
  {
    slug: 'baldurs-gate-3', name: "Baldur's Gate 3", releaseYear: 2023, developer: 'Larian Studios', publisher: 'Larian Studios',
    popularity: 92, hue: 45, featured: true,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['rpg', 'adventure', 'strategy'], tags: ['story-rich', 'long-term', 'pve'],
    onlineMin: 1, onlineMax: 4, local: [2, 2], splitScreen: true, session: 'long', difficulty: 5, grind: 4, communication: 6, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 9.6, groupRatings: { 2: 9.4, 3: 9.4, 4: 9.6 },
    note: '跨平台联机由 8 号补丁（2025-04）加入',
    descEn: { short: 'The best co-op RPG ever made — argue with your party, not with the game.', long: 'A 100+ hour D&D campaign where the real boss is your party\'s decision-making. Crossplay arrived in Patch 8 alongside cross-save; local split-screen on console for two.' },
    descZh: { short: '史上最佳合作 RPG——队友之间的争论才是真 Boss。', long: '100+ 小时的 D&D 战役，真正的 Boss 是你们小队的决策过程。8 号补丁起支持跨平台联机+跨平台存档，主机支持两人本地分屏。' },
  },
  {
    slug: 'divinity-original-sin-2', name: 'Divinity: Original Sin 2', releaseYear: 2017, developer: 'Larian Studios', publisher: 'Larian Studios',
    popularity: 58, hue: 40,
    platforms: ['pc', 'ps4', 'xbox-one', 'switch'], genres: ['rpg', 'strategy', 'adventure'], tags: ['story-rich', 'pve', 'long-term', 'difficult'],
    onlineMin: 1, onlineMax: 4, local: [2, 2], splitScreen: true, session: 'long', difficulty: 5, grind: 4, communication: 6, intensity: 'medium',
    crossplay: 'none',
    communityRating: 9.2, groupRatings: { 2: 9.2, 3: 9.0, 4: 9.4 },
    descEn: { short: 'The systemic CRPG that set the stage for BG3.', long: 'Deep systemic co-op CRPG with friendly-fire chaos. No crossplay between platforms — same-platform groups only.' },
    descZh: { short: '为 BG3 铺路的系统系 CRPG。', long: '系统深度极高的合作 CRPG，队友误伤是喜剧要素。平台之间不支持跨平台，只能同平台组队。' },
  },
  {
    slug: 'monster-hunter-wilds', name: 'Monster Hunter Wilds', releaseYear: 2025, developer: 'Capcom', publisher: 'Capcom',
    popularity: 78, hue: 85,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['action', 'rpg'], tags: ['grindy', 'pve', 'looting', 'long-term'],
    onlineMin: 1, onlineMax: 4, session: 'medium', difficulty: 6, grind: 7, communication: 4, intensity: 'medium',
    crossplay: 'full', crossSave: false,
    communityRating: 8.2, groupRatings: { 2: 8.0, 3: 9.0, 4: 9.2 },
    note: '支持跨平台联机但不支持跨平台存档',
    descEn: { short: 'Hunt giant monsters as a 4-person research squad.', long: 'Full crossplay across PC, PS5 and Xbox Series (no cross-save). The hunt loop is tuned around a tight 4-player squad and gets better the more your crew commits.' },
    descZh: { short: '4 人调查小队一起狩猎巨型魔物。', long: 'PC / PS5 / Xbox Series 全平台跨平台联机（不支持跨平台存档）。狩猎循环围绕 4 人小队设计，队伍投入越深体验越好。' },
  },
  {
    slug: 'diablo-iv', name: 'Diablo IV', releaseYear: 2023, developer: 'Blizzard Entertainment', publisher: 'Blizzard Entertainment',
    popularity: 74, hue: 0,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one'], genres: ['rpg', 'action'], tags: ['grindy', 'looting', 'pve', 'casual'],
    onlineMin: 1, onlineMax: 4, session: 'medium', difficulty: 4, grind: 8, communication: 1, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 7.8, groupRatings: { 2: 8.0, 3: 8.2, 4: 8.6 },
    descEn: { short: 'Slay loot demons together, on the couch or across platforms.', long: 'Full crossplay and cross-save everywhere, seasonal resets every few months. Easy to drop in for an evening; easy to burn out on if your group only logs in casually.' },
    descZh: { short: '一起刷装备恶魔，沙发联机或跨平台都行。', long: '全平台跨平台联机+跨平台存档，每隔几个月一次赛季重置。适合随时来一晚，但休闲小队容易在重复刷图中倦怠。' },
  },
  {
    slug: 'path-of-exile-2', name: 'Path of Exile 2', releaseYear: 2024, developer: 'Grinding Gear Games', publisher: 'Grinding Gear Games',
    popularity: 70, hue: 50,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['rpg', 'action'], tags: ['grindy', 'difficult', 'looting', 'hardcore'],
    onlineMin: 1, onlineMax: 6, session: 'medium', difficulty: 7, grind: 9, communication: 1, intensity: 'hardcore',
    crossplay: 'full', crossSave: true,
    communityRating: 8.6, groupRatings: { 2: 8.2, 3: 8.4, 4: 8.8 },
    descEn: { short: 'The hardcore ARPG for groups who think Diablo is too casual.', long: 'Deep, demanding and proud of it. Full crossplay and cross-save, but expect spreadsheets — this is not a pick-up-and-play co-op game.' },
    descZh: { short: '给"觉得暗黑太休闲"的小队的硬核 ARPG。', long: '深度极高、门槛高且以此为荣。全平台跨平台联机+跨平台存档，但请准备好研究 build——这不是随手开一局的合作游戏。' },
  },
  {
    slug: 'destiny-2', name: 'Destiny 2', releaseYear: 2017, developer: 'Bungie', publisher: 'Sony Interactive Entertainment',
    popularity: 66, hue: 230,
    platforms: ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one'], genres: ['shooter', 'mmo', 'action'], tags: ['grindy', 'pve', 'pvp', 'looting', 'long-term'],
    onlineMin: 1, onlineMax: 6, session: 'short', difficulty: 5, grind: 9, communication: 6, intensity: 'medium',
    crossplay: 'full', crossSave: true,
    communityRating: 7.6, groupRatings: { 2: 7.8, 3: 8.4, 4: 8.4, 5: 8.0 },
    descEn: { short: 'Space gunplay with the best raids in the business — and endless grind.', long: 'Full crossplay and cross-save. The raid experience is unmatched for a committed 6-player crew, but the new-player onboarding is famously hostile.' },
    descZh: { short: '太空枪战+业界最好的团本——以及无尽的肝。', long: '全平台跨平台联机+跨平台存档。对固定的 6 人小队来说团本体验无可匹敌，但新人引导对新玩家出了名的不友好。' },
  },

  // ------------------------------------------------------------------
  // Party (plan §25)
  // ------------------------------------------------------------------
  {
    slug: 'overcooked-2', name: 'Overcooked! 2', releaseYear: 2018, developer: 'Ghost Town Games', publisher: 'Team17',
    popularity: 60, hue: 15,
    platforms: ['pc', 'ps4', 'xbox-one', 'switch'], genres: ['party', 'simulation', 'puzzle'], tags: ['funny', 'family-friendly', 'casual', 'short-sessions'],
    onlineMin: 1, onlineMax: 4, local: [1, 4], splitScreen: true, session: 'short', difficulty: 4, grind: 1, communication: 9, intensity: 'casual',
    crossplay: 'full',
    communityRating: 8.4, groupRatings: { 2: 8.8, 3: 8.6, 4: 9.0, 5: 8.4 },
    descEn: { short: 'Chaotic kitchen co-op that will test every friendship.', long: 'Shouting "THE ONIONS ARE ON FIRE" with your best friends. Full crossplay, local split-screen, and levels built for exactly 2 or 4 cooks.' },
    descZh: { short: '混乱厨房合作——友情的终极试炼。', long: '和好朋友一起大喊"洋葱着火了！"。全平台跨平台联机，支持本地分屏，关卡为恰好 2 或 4 名厨师设计。' },
  },
  {
    slug: 'plateup', name: 'PlateUp!', releaseYear: 2022, developer: 'It\'s happening', publisher: 'Yogscast Games',
    popularity: 48, hue: 35,
    platforms: ['pc', 'ps5', 'xbox-series', 'switch'], genres: ['roguelike', 'simulation', 'party'], tags: ['casual', 'funny', 'short-sessions'],
    onlineMin: 1, onlineMax: 4, local: [1, 4], splitScreen: true, session: 'short', difficulty: 4, grind: 2, communication: 7, intensity: 'casual',
    crossplay: [['pc', 'ps5', 'UNKNOWN', '截至 2026-09 未确认跨平台状态'], ['pc', 'xbox-series', 'UNKNOWN', '截至 2026-09 未确认'], ['pc', 'switch', 'UNKNOWN', '截至 2026-09 未确认'], ['ps5', 'xbox-series', 'UNKNOWN'], ['ps5', 'switch', 'UNKNOWN'], ['xbox-series', 'switch', 'UNKNOWN']],
    communityRating: 8.3, groupRatings: { 2: 8.8, 3: 8.4, 4: 8.8 },
    descEn: { short: 'Overcooked meets roguelike: cook, then design your own kitchen.', long: 'Cooking chaos with a strategic restaurant-building layer. Crossplay status across consoles remains unclear — same-platform groups are the safe bet.' },
    descZh: { short: 'Overcooked × Roguelike：做完菜还要自己设计厨房。', long: '烹饪混乱+餐厅经营策略层。主机版跨平台状态不明——同平台组队最稳妥。' },
  },
  {
    slug: 'pummel-party', name: 'Pummel Party', releaseYear: 2018, developer: 'Rebuilt Games', publisher: 'Rebuilt Games',
    popularity: 46, hue: 130,
    platforms: ['pc'], genres: ['party', 'action'], tags: ['funny', 'casual', 'competitive'],
    onlineMin: 1, onlineMax: 8, local: [1, 4], splitScreen: true, session: 'medium', difficulty: 2, grind: 1, communication: 2, intensity: 'casual',
    communityRating: 8.0, groupRatings: { 3: 8.4, 4: 9.0, 5: 9.2 },
    descEn: { short: 'Mario Party\'s meaner PC cousin with way more minigames.', long: 'Board game + absurd minigames for up to 8 online (4 on split-screen). A guaranteed loud night, PC only.' },
    descZh: { short: 'PC 版"更损"的马派，小游戏多到离谱。', long: '桌图+无厘头小游戏，线上最多 8 人（分屏 4 人）。保证吵闹的一晚，仅 PC 平台。' },
  },
  {
    slug: 'party-animals', name: 'Party Animals', releaseYear: 2023, developer: 'Recreate Games', publisher: 'Source Technology',
    popularity: 62, hue: 50,
    platforms: ['pc', 'xbox-series', 'xbox-one'], genres: ['party', 'action'], tags: ['funny', 'family-friendly', 'pvp', 'casual'],
    onlineMin: 1, onlineMax: 8, session: 'short', difficulty: 2, grind: 1, communication: 2, intensity: 'casual',
    crossplay: [['pc', 'xbox-series', 'SUPPORTED'], ['pc', 'xbox-one', 'SUPPORTED'], ['xbox-one', 'xbox-series', 'SUPPORTED', FAMILY_NOTE]],
    communityRating: 8.2, groupRatings: { 2: 8.0, 3: 8.4, 4: 9.0, 5: 9.2 },
    descEn: { short: 'Gang Beasts-style floppy animal brawling on Game Pass.', long: 'Adorable physics brawling for up to 8 players, full crossplay between PC and Xbox. Contains PvP by design — great for rowdy groups.' },
    descZh: { short: '软趴趴动物大乱斗，XGP 明星。', long: '最多 8 人的可爱物理乱斗，PC 与 Xbox 全跨平台。默认包含 PvP——适合吵吵闹闹的小队。' },
  },
  {
    slug: 'lethal-company', name: 'Lethal Company', releaseYear: 2023, developer: 'Zeekerss', publisher: 'Zeekerss',
    popularity: 72, hue: 90, featured: true,
    platforms: ['pc'], genres: ['horror', 'action'], tags: ['funny', 'horror', 'casual', 'short-sessions'],
    onlineMin: 1, onlineMax: 4, session: 'short', difficulty: 3, grind: 2, communication: 7, intensity: 'casual',
    communityRating: 8.8, groupRatings: { 2: 8.4, 3: 9.2, 4: 9.6 },
    descEn: { short: 'Scrap-hauling horror where the proximity chat is the game.', long: 'Cheap, hilarious and scary in the same round. Three-player sweet spot with proximity voice; PC only, runs on anything.' },
    descZh: { short: '捡垃圾恐怖游戏——近距离语音才是本体。', long: '便宜、搞笑又吓人。三人最佳，近距离语音是灵魂。仅 PC，配置要求极低。' },
  },
  {
    slug: 'phasmophobia', name: 'Phasmophobia', releaseYear: 2020, developer: 'Kinetic Games', publisher: 'Kinetic Games',
    popularity: 68, hue: 100,
    platforms: ['pc', 'ps5', 'xbox-series'], genres: ['horror', 'simulation'], tags: ['horror', 'short-sessions'],
    onlineMin: 1, onlineMax: 4, session: 'short', difficulty: 4, grind: 2, communication: 7, intensity: 'medium',
    crossplay: 'full',
    communityRating: 8.6, groupRatings: { 2: 8.6, 3: 9.0, 4: 9.4 },
    descEn: { short: 'Ghost hunting with voice recognition — the ghost hears you.', long: '4-player paranormal investigation with in-game voice detection. Full crossplay across PC, PS5 and Xbox Series; genuinely scary with the lights off.' },
    descZh: { short: '语音识别捉鬼——鬼听得见你说话。', long: '4 人灵异调查，游戏内语音会被"鬼"听到。PC / PS5 / Xbox Series 全平台跨平台联机；关灯玩是真的吓人。' },
  },

  // ------------------------------------------------------------------
  // Strategy
  // ------------------------------------------------------------------
  {
    slug: 'civilization-vi', name: 'Sid Meier\'s Civilization VI', releaseYear: 2016, developer: 'Firaxis Games', publisher: '2K',
    popularity: 58, hue: 45,
    platforms: ['pc', 'ps4', 'xbox-one', 'switch'], genres: ['strategy', 'simulation'], tags: ['pvp', 'competitive', 'long-term'],
    onlineMin: 2, onlineMax: 12, session: 'long', difficulty: 5, grind: 7, communication: 3, intensity: 'medium',
    crossplay: 'none',
    communityRating: 8.4, groupRatings: { 2: 8.4, 3: 8.2, 4: 8.6, 5: 8.4 },
    descEn: { short: 'One more turn — together, for six hours, usually hostile.', long: 'Co-op-ish empire building that tends to end in betrayal. No crossplay between platforms; sessions run very long.' },
    descZh: { short: "再来一回合——一起玩六小时，最后背刺。", long: '半合作帝国建设，通常以背叛收场。平台之间不支持跨平台联机，单局时间非常长。' },
  },
  {
    slug: 'age-of-empires-ii-de', name: 'Age of Empires II: Definitive Edition', releaseYear: 2019, developer: 'Forgotten Empires', publisher: 'Xbox Game Studios',
    popularity: 54, hue: 35,
    platforms: ['pc', 'xbox-series'], genres: ['strategy'], tags: ['competitive', 'pvp', 'long-term'],
    onlineMin: 2, onlineMax: 8, session: 'long', difficulty: 6, grind: 4, communication: 5, intensity: 'medium',
    crossplay: [['pc', 'xbox-series', 'SUPPORTED']],
    communityRating: 8.8, groupRatings: { 2: 8.6, 3: 8.4, 4: 8.6 },
    descEn: { short: 'The timeless RTS, now with PC↔Xbox crossplay and co-op campaigns.', long: 'Definitive Edition holds up beautifully. PC and Xbox players share servers, and there are co-op campaigns and vs-AI modes for less competitive groups.' },
    descZh: { short: '永不过时的 RTS，现已支持 PC↔Xbox 跨平台。', long: '决定版依然耐玩。PC 与 Xbox 共享服务器，还有合作战役和 vs AI 模式适合不那么竞技的小队。' },
  },
]
