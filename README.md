# AI Novel Rewriter R

> 中文应用名：**鲸鱼娘改写中**

一款运行在 Android 手机上的本地 AI 小说逐章改写工具。小说、结果和上下文保存在手机本地，模型请求由手机直接发送到用户配置的第三方 API。

## 功能

- Android 原生 SSE 流式输出，支持正文与 reasoning 分离显示
- 本机多书籍存档、完整 JSON 备份和批量 ZIP 导入/导出
- 单章处理、重 roll、断点续跑和严格串行批量处理
- 连续上下文、增量摘要及中途起章前置原文压缩
- 历史章节按显示章节精确重 roll，保留并隔离后续结果
- 请求失败、空正文、缺少标题和正文过短自动重试
- DeepSeek `/responses` + `web_search` 章节联网搜索
- MiMo TTS 语音朗读及生成时同步朗读
- 阅读模式、Prompt 预设、TXT 小说化导出、主题与字号设置

## 下载与安装

**[直接下载 AI Novel Rewriter R v1.11.3 APK](https://github.com/RAMU324E/ai-novel-rewriter-r/releases/download/v1.11.3/AI-Novel-Rewriter-R-v1.11.3-debug.apk)**

当前公开包使用 Debug 签名，仅供测试和直接分发。历史版本及发布说明可在 [Releases](https://github.com/RAMU324E/ai-novel-rewriter-r/releases) 页面查看。

要求 Android 7.0（API 24）或更高版本。升级时请直接覆盖安装，不要先卸载旧版，否则手机本地存档和 API 配置可能被清除。

## 基本使用

1. 在“设置 → API 设置”中填写 Base URL 和 API Key。
2. 拉取并选择模型。
3. 导入 TXT 小说，App 会自动创建本机存档。
4. 选择章节进行单章处理，或在“书籍 → 连续批量处理”中设置范围。
5. 定期使用“批量导出 ZIP”或“导出完整 JSON”备份数据。

## 数据与隐私

- 小说原文、章节结果、连续上下文和摘要保存在 App 本机 IndexedDB。
- 本项目不运营模型中转服务器，也不提供 API Key。
- 小说内容会直接发送到用户填写的模型服务商。
- 开启 DeepSeek 联网搜索后，章节请求会使用 DeepSeek `/responses` 与 `web_search`。
- 开启 MiMo TTS 后，需要朗读的正文会发送到用户配置的 MiMo API。
- API Key 和 MiMo Key 不写入书籍 JSON、TXT 或批量备份 ZIP。
- 卸载 App 或清除应用数据会删除本机书库，请提前备份。

## 从源码构建

环境要求：

- Node.js 22+
- JDK 21
- Android SDK 36

设置 `JAVA_HOME` 和 `ANDROID_HOME`（或 `ANDROID_SDK_ROOT`）后执行：

```powershell
npm ci
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

构建产物：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Linux/macOS 可将最后一条命令改为：

```bash
./gradlew assembleDebug
```

## 重要限制

- 当前不是锁屏后长期运行的 Android 前台服务，长批量任务建议保持 App 在前台。
- 多次生成只保存最终成功结果；失败、截断或质量检查未通过的回答不会覆盖旧结果。
- 第三方接口格式、模型能力、费用和可用性由对应服务商决定。
- Debug 签名版本适合测试和直接分发，不适合应用商店发布。

## 许可证

本项目源码仅允许个人学习、研究和非商业使用。商业使用需要获得仓库所有者的书面许可，详见 [LICENSE](LICENSE)。

项目包含的第三方组件及其许可证见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 免责声明

本软件按“现状”提供。使用第三方模型接口产生的费用、输出内容、数据处理和合规责任由用户自行承担。本项目与 DeepSeek、小米 MiMo 及其他第三方服务商没有隶属或官方合作关系。
