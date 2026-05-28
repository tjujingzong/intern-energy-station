# 实习能量站 · 业务部新人成长导航

> 一站式解决「导师标准化带教 / 实习生成长迷茫 / HR & 招聘协同低效」三大痛点的 AI 智能看板。
> 纯前端 + 浏览器直连 DeepSeek，可一键部署到 GitHub Pages。

## ✨ 功能总览

| 角色 | 核心模块 | 关键能力 |
| --- | --- | --- |
| 🎓 实习生 | 我的看板 / 成长地图 / AI 周报助手 / AI 导师答疑 | 4 阶段路径可视化、技能雷达、AI 一键起草周报、随时问 AI 导师 |
| 🧑‍🏫 导师 | 我的实习生 / 实习生详情 / AI 反馈助手 / SOP 模板库 | 进度风险一眼可见、AI 按 STAR 起草反馈、模板一键下发任务 |
| 🧑‍💼 HR（含招聘协同） | 全景看板 / 风险预警 / AI 批次报告 / 适岗度评估 / 批次趋势 | 20 人一图掌握、5 类风险信号自动识别、一键 AI 总结报告、ABC 分级适岗评估 + AI 转正建议、四周趋势分析 |

> 4 阶段标准化成长路径：入职准备 → 业务熟悉 → 独立产出 → 答辩转正
> 5 维技能雷达：业务理解 / 沟通协作 / 执行力 / 学习力 / 产出质量

## 🚀 快速开始

```bash
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```

默认账号（密码统一 `123456`）：

| 账号 ID | 角色 | 姓名 |
| --- | --- | --- |
| `intern01` | 实习生 | 张子轩 |
| `mentor01` | 导师 | 陈思远 |
| `hr01` | HR（含招聘协同） | 苏晓彤 |

> 顶部「演示切换」可以一键在三种角色之间无缝切换，方便快速体验。

## 🤖 接入真实 AI（可选）

未配置 Key 时，所有 AI 功能将自动回落到 **本地模拟回答**（已内置 5 种场景化模板），演示完全可用。
如希望体验真实大模型：

1. 登录后进入「设置」页；
2. 填入 DeepSeek API Key（[控制台地址](https://platform.deepseek.com/api_keys)）；
3. 保存后全站 AI 调用即由 DeepSeek `deepseek-chat` 完成。

Key 仅保存在浏览器 `localStorage`，不会发往任何第三方。

## 🛰 部署到 GitHub Pages

1. Fork 或将代码推到自己的仓库 `your-name/intern-energy-station`；
2. 仓库 → Settings → Pages → Source 选 **GitHub Actions**；
3. push 到 `main` 即可自动构建发布到 `https://<your-name>.github.io/intern-energy-station/`。

> 如仓库名不同，请同步修改 [`vite.config.ts`](./vite.config.ts) 中的 `base`。
> 使用 `HashRouter`，已规避 GitHub Pages 子路径下刷新 404 的问题，并附带 `404.html` 兜底。

## 🧱 技术栈

- React 18 + TypeScript + Vite 5
- Tailwind CSS（自定义 brand 色系）
- React Router 6（HashRouter）
- Zustand + persist（localStorage 持久化所有数据）
- Recharts（雷达 / 饼图 / 柱图 / 折线）
- lucide-react 图标
- DeepSeek Chat API（前端直连，失败自动回落本地模拟）

## 📂 目录结构

```
src/
├─ api/deepseek.ts        # DeepSeek 调用 + 本地 mock 回退
├─ components/            # Layout / AIChat / SkillRadar / GrowthPath
├─ data/                  # users + seed 任务/周报/反馈
├─ pages/
│  ├─ intern/             # 实习生 4 页
│  ├─ mentor/             # 导师 4 页
│  ├─ hr/                 # HR 3 页（全景 / 预警 / AI 报告）
│  └─ recruit/            # 原招聘 2 页（适岗 / 批次） · 现挂载在 /hr/fit 与 /hr/batch
├─ store/                 # authStore + dataStore（zustand）
├─ App.tsx                # 路由聚合
└─ main.tsx
```

## 📋 设计文档

完整方案说明见 [`docs/solution.md`](./docs/solution.md)（≤ 1000 字）。

## 🪶 License

MIT
