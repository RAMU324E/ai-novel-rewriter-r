(() => {
  "use strict";

  const SETTINGS_STORAGE_KEY = "novelAiSettingsMobile";
  const OUTPUT_LAYOUT_STORAGE_KEY = "novelAiOutputPreviewHeightMobile";
  const SETTINGS_VERSION = 12;
  const SESSION_DB_NAME = "novelAiWorkspaceMobileLegacy";
  const SESSION_DB_VERSION = 1;
  const SESSION_STORE_NAME = "records";
  const LAST_SHARED_SAVE_KEY = "novelAiLastLocalSaveIdMobile";
  const MOBILE_VIEW_STORAGE_KEY = "novelAiMobileView";
  const BOOK_FORMAT = "novel-ai-web-book";
  const BOOK_SCHEMA_VERSION = 1;
  const DEFAULT_CONTEXT_SUMMARY_INTERVAL = 40;
  const DEFAULT_CONTEXT_SUMMARY_RETAIN = 10;
  const DEFAULT_EMPTY_CONTENT_RETRY_COUNT = 3;
  const MAX_EMPTY_CONTENT_RETRY_COUNT = 10;
  const DEFAULT_SHORT_CONTENT_MIN_CHARS = 200;
  const DEFAULT_SHORT_CONTENT_MIN_RATIO = 15;
  const DEFAULT_TTS_BASE_URL = "https://api.xiaomimimo.com";
  const DEFAULT_TTS_MODEL = "mimo-v2.5-tts";
  const TTS_SEGMENT_CHARS = 1200;
  const DEFAULT_TTS_LIVE_FIRST_CHARS = 100;
  const DEFAULT_TTS_LIVE_NEXT_CHARS = 200;
  function normalizeTtsLiveChars(value, fallback) {
    const count = Math.floor(Number(value));
    return Number.isFinite(count) ? Math.max(100, Math.min(TTS_SEGMENT_CHARS, count)) : fallback;
  }
  const DEFAULT_EXPORT_WRAPPER_TAGS = "ds_safety, final, answer, response";
  const MODEL_STREAM_IDLE_TIMEOUT_MS = 300000;
  const MAX_LIBRARY_ZIP_BYTES = 104857600;
  const DEFAULT_PROMPT_PRESETS = [];
  const PROMPT_PRESET_LIMIT = 40;
  const SUMMARY_SOURCE_REWRITTEN = "rewrittenOnly";
  const SUMMARY_SOURCE_REQUEST_RESPONSE = "requestAndRewrite";
  const SUMMARY_SOURCE_LEGACY = "legacy";
  const SUMMARY_SOURCE_ORIGINAL = "originalPrelude";
  const SUMMARY_SOURCE_MIXED = "mixedPrelude";
  const SUMMARY_SOURCE_MODES = new Set([SUMMARY_SOURCE_REWRITTEN, SUMMARY_SOURCE_REQUEST_RESPONSE]);
  const SUMMARY_BLOCK_SOURCE_MODES = new Set([SUMMARY_SOURCE_REWRITTEN, SUMMARY_SOURCE_REQUEST_RESPONSE, SUMMARY_SOURCE_LEGACY, SUMMARY_SOURCE_ORIGINAL, SUMMARY_SOURCE_MIXED]);
  const SUMMARY_CONTEXT_ACK = "已读取该范围的增量摘要，后续改写将以其作为既有剧情背景。";
  const REWRITTEN_CONTEXT_ACK = "以下为该章节已经确认的最终改写成果，请只把它作为后续剧情和文风连续性背景。";
  const DEFAULT_CONTEXT_SUMMARY_PROMPT = `你是长篇小说连续改写任务的增量摘要助手。

请根据【已有摘要块】理解此前剧情，只针对【本次摘要范围】输出一个新的、可独立追加的增量摘要块。不要重写、复述或合并已有摘要块。

要求：
1. 忠实保留本次范围内新增或变化的人物身份、关系、性格、立场、能力、身体状态和称谓。
2. 保留事件顺序、时间线、地点、因果关系、关键冲突、当前剧情进度和状态变化。
3. 保留世界观规则、力量体系、组织势力、关键物品、约定、限制条件和重要数字。
4. 保留新增伏笔、未解决事项、秘密、误会、承诺和人物目标，并写明哪些事项在本范围内得到解决。
5. 保留已形成的叙事视角、人物口吻和重要改写连续性；删除重复修辞和不影响后续剧情的细枝末节。
6. 不续写、不评价、不猜测、不编造；专名、姓名、数字和关键限制必须准确。
7. 只输出本次范围的摘要正文，不解释总结过程，不复制已有摘要块。

建议结构：
【本范围剧情推进】
【人物、关系与状态变化】
【设定、势力与关键物品】
【伏笔、未解决事项与后续约束】
【改写风格与连续性变化】`;
  const PROJECT_SETTING_KEYS = ["systemPrompt", "firstPrompt", "includeContext", "contextRewrittenOnly", "contextSummaryEnabled", "contextPreludeCompressionEnabled", "contextSummaryInterval", "contextSummaryRetain", "contextSummarySourceMode", "contextSummaryPrompt", "emptyContentRetryEnabled", "emptyContentRetryCount", "allFailureRetryEnabled", "missingTitleRetryEnabled", "shortContentRetryEnabled", "shortContentMinChars", "shortContentMinRatio", "batchSize", "titleRepeat", "tailPrompt", "endMark", "navPrevious", "navBook", "navNext", "autoAdvance", "webSearchPrompt"];
  const DEFAULT_FONT_FAMILY = `"LXGW WenKai", "Microsoft YaHei", "PingFang SC", system-ui, -apple-system, "Segoe UI", sans-serif`;
  const LXGW_WENKAI_FALLBACK_CSS_URL = "https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@latest/style.css";
  const DEFAULT_CONTENT_FONT_SIZE = 14;
  const MIN_CONTENT_FONT_SIZE = 10;
  const MAX_CONTENT_FONT_SIZE = 32;
  const DEFAULT_FONT_CSS = `@import url("https://fontsapi.zeoseven.com/292/main/result.css");

body {
    font-family: "LXGW WenKai";
    font-weight: normal;
}`;
  const DEFAULT_ADVANCED_REQUEST = {
    reasoningEnabled: false,
    reasoningJson: "{\n  \"reasoning_effort\": \"high\"\n}",
    overrideEnabled: false,
    path: "chat/completions",
    method: "POST",
    headersJson: "{}",
    bodyJson: "{}"
  };
  const DEFAULTS = {
    settingsVersion: SETTINGS_VERSION,
    baseUrl: "https://api.deepseek.com/v1", model: "", apiKey: "", shareApiConfig: true,
    systemPrompt: "", firstPrompt: "你是一名小说改写助手。接下来我会逐章发送小说内容，请按每章末尾的要求处理，并只输出处理后的正文。",
    includeContext: true, contextRewrittenOnly: false, contextSummaryEnabled: false, contextPreludeCompressionEnabled: true, contextSummaryInterval: DEFAULT_CONTEXT_SUMMARY_INTERVAL, contextSummaryRetain: DEFAULT_CONTEXT_SUMMARY_RETAIN, contextSummarySourceMode: SUMMARY_SOURCE_REWRITTEN, contextSummaryPrompt: DEFAULT_CONTEXT_SUMMARY_PROMPT,
    emptyContentRetryEnabled: true, emptyContentRetryCount: DEFAULT_EMPTY_CONTENT_RETRY_COUNT, allFailureRetryEnabled: false,
    missingTitleRetryEnabled: true, shortContentRetryEnabled: true, shortContentMinChars: DEFAULT_SHORT_CONTENT_MIN_CHARS, shortContentMinRatio: DEFAULT_SHORT_CONTENT_MIN_RATIO,
    exportRemoveDuplicateTitles: true, exportStripWrapperTags: true, exportNormalizeWhitespace: true, exportWrapperTags: DEFAULT_EXPORT_WRAPPER_TAGS,
    promptPresets: DEFAULT_PROMPT_PRESETS, selectedPromptPresetId: "",
    batchSize: 10, titleRepeat: 3,
    tailPrompt: "把这一章改成xxx。对话提示语风格别改，保持原有叙事节奏、人物口吻和网文风格。",
    endMark: "(本章完)", navPrevious: "上一章", navBook: "书籍页", navNext: "下一章",
    autoAdvance: true, autoScroll: false, theme: "auto", enableThinking: true, outputPanelHeight: 0, contentFontSize: DEFAULT_CONTENT_FONT_SIZE, customFontCss: DEFAULT_FONT_CSS, optional: {},
    ttsEnabled: false, ttsLiveEnabled: false, ttsLiveFirstChars: 100, ttsLiveNextChars: 200, ttsApiKey: "", ttsBaseUrl: DEFAULT_TTS_BASE_URL, ttsModel: DEFAULT_TTS_MODEL, ttsVoice: "mimo_default", ttsVoiceCustom: "", ttsInstruction: "",
    webSearchEnabled: true, webSearchPrompt: "",
    advancedRequest: { ...DEFAULT_ADVANCED_REQUEST }
  };
  const PROJECT_DEFAULTS = Object.freeze(Object.fromEntries(PROJECT_SETTING_KEYS.map(key => [key, DEFAULTS[key]])));
  const BATCH_SIZES = new Set([5, 10, 20, 50]);
  const USAGE_FIELDS = ["prompt_tokens", "completion_tokens", "total_tokens"];
  const ENCODING_LABELS = { "utf-8":"UTF-8",gb18030:"GB18030 / GBK",big5:"Big5","utf-16le":"UTF-16 LE","utf-16be":"UTF-16 BE","utf-32le":"UTF-32 LE","utf-32be":"UTF-32 BE",shift_jis:"Shift-JIS","euc-jp":"EUC-JP","euc-kr":"EUC-KR","windows-1252":"Windows-1252" };
  const state = {
    settings: loadSettings(), fileBuffer: null, fileName: "", sourceText: "", chapterIndexes: [], chapterCache: new Map(),
    currentIndex: 0, currentBatch: 0, previewDirty: false, conversationHistory: [], chapterResults: new Map(), resultEntries: [], viewedResult: -1, controller: null, requesting: false,
    restoringSession: false, sessionSaveTimer: null, sessionSaveQueue: Promise.resolve(true), sessionSavePending: 0, sessionDbPromise: null,
    activeSaveId: "", activeSaveTitle: "", activeSaveCreatedAt: 0, activeSaveUpdatedAt: 0, saveCatalog: [], sharedSaveBusy: false, blockedSaveId: "",
    apiConfigSaveTimer: null, apiConfigSaveQueue: Promise.resolve(), loadingApiConfig: false,
    modelsLoading: false, workspaceImporting: false, generatedCommitBusy: false, batchStarting: false, batchRun: null,
    lastRequestFailure: null, readingChapterIndex: -1,
    contextCompression: { startChapterIndex: -1, summarizedThrough: -1, nextSummaryAt: -1, sourceMode: SUMMARY_SOURCE_REWRITTEN, needsRebuild: false, preludeCompleted: false, originalBootstrapThrough: -1, originalPreludeSourceThrough: -1, originalPreludeFrom: -1, originalPreludeTo: -1, blocks: [] }, allResultsPreview: null
  };
  const $ = selector => document.querySelector(selector);
  function setMobileView(view,persist=true){const allowed=new Set(["write","books","settings"]),target=allowed.has(view)?view:"write",main=$(".app-shell");if(!main)return;const apply=()=>{main.dataset.mobileView=target;document.querySelectorAll(".mobile-nav [data-mobile-view-target]").forEach(button=>button.setAttribute("aria-current",button.dataset.mobileViewTarget===target?"page":"false"));};if(persist&&typeof document.startViewTransition==="function"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.startViewTransition(()=>apply());else apply();if(persist)localStorage.setItem(MOBILE_VIEW_STORAGE_KEY,target);}
  function setupMobileViewNav(){const saved=localStorage.getItem(MOBILE_VIEW_STORAGE_KEY)||"write";setMobileView(saved,false);document.querySelectorAll(".mobile-nav [data-mobile-view-target]").forEach(button=>button.addEventListener("click",()=>setMobileView(button.dataset.mobileViewTarget)));}
  function mobileViewIs(view){return matchMedia("(max-width: 900px)").matches&&$(".app-shell")?.dataset.mobileView===view;}
  const INLINE_PREVIEW_CHARS = 240000;
  const COPY_ALL_CHAR_LIMIT = 2000000;
  const SUMMARY_SIZE_WARNING_CHARS = 600000;

  function batchLocked(){return state.batchStarting||!!state.batchRun;}
  function generatedLocked(){return state.requesting||state.generatedCommitBusy;}
  function mutationLocked(){return state.sharedSaveBusy||generatedLocked()||batchLocked()||state.workspaceImporting;}
  function batchPreflightBusy(){return mutationLocked()||state.modelsLoading||state.loadingApiConfig;}
  function runWhenMutable(action){if(!mutationLocked())action();}
  function requireActiveSave(){if(state.activeSaveId)return true;setSharedSaveStatus("当前内容尚未关联本机存档，请先点击“当前另存为”。","error");toast("请先将当前内容另存为本机存档");return false;}
  function refreshOperationControls(){refreshSharedControls();refreshResultNavigation();refreshChapters(false,false);refreshBatchControls();}
  globalThis.NovelMobileUiState=Object.freeze({isExitBlocked:()=>state.generatedCommitBusy||state.sharedSaveBusy||state.sessionSavePending>0||state.sessionSaveTimer!==null});

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== "[object Object]") return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }
  function normalizeContentFontSize(value) {
    const size = Number(value);
    if (!Number.isFinite(size)) return DEFAULT_CONTENT_FONT_SIZE;
    return Math.max(MIN_CONTENT_FONT_SIZE, Math.min(MAX_CONTENT_FONT_SIZE, Math.round(size)));
  }
  function normalizeContextSummaryInterval(value) {
    const interval = Math.floor(Number(value));
    return Number.isFinite(interval) ? Math.max(1, Math.min(200, interval)) : DEFAULT_CONTEXT_SUMMARY_INTERVAL;
  }
  function normalizeContextSummaryRetain(value, interval = DEFAULT_CONTEXT_SUMMARY_INTERVAL) {
    const limit = Math.max(0, normalizeContextSummaryInterval(interval) - 1), retain = Math.floor(Number(value));
    return Number.isFinite(retain) ? Math.max(0, Math.min(limit, retain)) : Math.min(DEFAULT_CONTEXT_SUMMARY_RETAIN, limit);
  }
  function normalizeSummarySourceMode(value) { return SUMMARY_SOURCE_MODES.has(value) ? value : SUMMARY_SOURCE_REWRITTEN; }
  function normalizeEmptyContentRetryCount(value) {
    const count = Math.floor(Number(value));
    return Number.isFinite(count) ? Math.max(0, Math.min(MAX_EMPTY_CONTENT_RETRY_COUNT, count)) : DEFAULT_EMPTY_CONTENT_RETRY_COUNT;
  }
  function normalizeShortContentMinChars(value){const count=Math.floor(Number(value));return Number.isFinite(count)?Math.max(0,Math.min(100000,count)):DEFAULT_SHORT_CONTENT_MIN_CHARS;}
  function normalizeShortContentMinRatio(value){const ratio=Number(value);return Number.isFinite(ratio)?Math.max(0,Math.min(100,Math.round(ratio*10)/10)):DEFAULT_SHORT_CONTENT_MIN_RATIO;}
  function normalizeExportWrapperTags(value) {
    const tags = String(value ?? DEFAULT_EXPORT_WRAPPER_TAGS).split(/[,，\s]+/).map(item => item.trim()).filter(item => /^[A-Za-z][A-Za-z0-9:_-]{0,63}$/.test(item));
    return [...new Set(tags.map(item => item.toLowerCase()))].slice(0, 32).join(", ") || DEFAULT_EXPORT_WRAPPER_TAGS;
  }
  function normalizePromptPreset(value){
    if(!isPlainObject(value))return null;const id=String(value.id||"").trim();const name=String(value.name||"").trim().slice(0,80);if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||!name)return null;
    return{id,name,systemPrompt:String(value.systemPrompt||""),firstPrompt:String(value.firstPrompt||""),tailPrompt:String(value.tailPrompt||""),contextSummaryPrompt:String(value.contextSummaryPrompt||""),createdAt:Number(value.createdAt)||0,updatedAt:Number(value.updatedAt)||0};
  }
  function normalizePromptPresets(values){const result=[],seen=new Set();for(const value of Array.isArray(values)?values:[]){const preset=normalizePromptPreset(value);if(!preset||seen.has(preset.id))continue;seen.add(preset.id);result.push(preset);if(result.length>=PROMPT_PRESET_LIMIT)break;}return result;}
  function createPromptPresetId(){return`preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`.slice(0,80);}
  function summaryBlockId(value, fromIndex, toIndex, createdAt = 0) {
    const id = String(value || "");
    if (/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return id;
    return `summary-${fromIndex}-${toIndex}-${Math.max(0, Math.floor(Number(createdAt) || 0)).toString(36)}`.slice(0, 80);
  }
  function normalizeSummaryBlock(value, chapterCount = Infinity) {
    if (!isPlainObject(value)) return null;
    const limit = Number.isInteger(chapterCount) && chapterCount >= 0 ? chapterCount : Infinity;
    const fromChapterIndex = Math.floor(Number(value.fromChapterIndex)), toChapterIndex = Math.floor(Number(value.toChapterIndex));
    if (!Number.isInteger(fromChapterIndex) || !Number.isInteger(toChapterIndex) || fromChapterIndex < 0 || toChapterIndex < fromChapterIndex || toChapterIndex >= limit) return null;
    const content = String(value.content || "").trim(); if (!content) return null;
    const createdAt = Math.max(0, Math.floor(Number(value.createdAt) || 0)), updatedAt = Math.max(createdAt, Math.floor(Number(value.updatedAt) || createdAt));
    const sourceMode = SUMMARY_BLOCK_SOURCE_MODES.has(value.sourceMode) ? value.sourceMode : normalizeSummarySourceMode(value.sourceMode);
    return { id: summaryBlockId(value.id, fromChapterIndex, toChapterIndex, createdAt), fromChapterIndex, toChapterIndex, sourceMode, content, createdAt, updatedAt, manuallyEdited: !!value.manuallyEdited };
  }
  function normalizeSummaryBlocks(values, chapterCount = Infinity) {
    const byRange = new Map();
    for (const raw of Array.isArray(values) ? values : []) { const block = normalizeSummaryBlock(raw, chapterCount); if (block) byRange.set(`${block.fromChapterIndex}:${block.toChapterIndex}`, block); }
    const sorted = [...byRange.values()].sort((a,b)=>a.fromChapterIndex-b.fromChapterIndex||a.toChapterIndex-b.toChapterIndex||a.createdAt-b.createdAt), result=[];
    for (const block of sorted) { if (result.length && block.fromChapterIndex <= result.at(-1).toChapterIndex) continue; result.push(block); }
    return result;
  }
  function contiguousSummaryBlocks(blocks, startChapterIndex) {
    if (!blocks.length) return [];
    const first = blocks[0];
    if (first.fromChapterIndex !== 0 && first.fromChapterIndex !== startChapterIndex) return [];
    const result = [first];
    for (const block of blocks.slice(1)) {
      if (block.fromChapterIndex !== result.at(-1).toChapterIndex + 1) break;
      result.push(block);
    }
    return result;
  }
  function emptyContextCompression(sourceMode = SUMMARY_SOURCE_REWRITTEN) { return { startChapterIndex: -1, summarizedThrough: -1, nextSummaryAt: -1, sourceMode: normalizeSummarySourceMode(sourceMode), needsRebuild: false, preludeCompleted: false, originalBootstrapThrough: -1, originalPreludeSourceThrough: -1, originalPreludeFrom: -1, originalPreludeTo: -1, blocks: [] }; }
  function normalizeContextCompression(value, chapterCount = Infinity) {
    const source = isPlainObject(value) ? value : {}, limit = Number.isInteger(chapterCount) && chapterCount >= 0 ? chapterCount : Infinity;
    let startChapterIndex = Number.isInteger(source.startChapterIndex) ? source.startChapterIndex : -1;
    let summarizedThrough = Number.isInteger(source.summarizedThrough) ? source.summarizedThrough : -1;
    let nextSummaryAt = Number.isInteger(source.nextSummaryAt) ? source.nextSummaryAt : -1;
    let originalBootstrapThrough = Number.isInteger(source.originalBootstrapThrough) ? source.originalBootstrapThrough : -1;
    let originalPreludeSourceThrough = Number.isInteger(source.originalPreludeSourceThrough) ? source.originalPreludeSourceThrough : -1;
    let originalPreludeFrom = Number.isInteger(source.originalPreludeFrom) ? source.originalPreludeFrom : -1;
    let originalPreludeTo = Number.isInteger(source.originalPreludeTo) ? source.originalPreludeTo : -1;
    if (startChapterIndex < -1 || startChapterIndex >= limit) startChapterIndex = -1;
    summarizedThrough = Math.max(-1, Math.min(summarizedThrough, limit === Infinity ? summarizedThrough : limit - 1));
    if (nextSummaryAt < -1) nextSummaryAt = -1;
    if(originalBootstrapThrough<0||originalBootstrapThrough>=startChapterIndex||originalBootstrapThrough>=limit)originalBootstrapThrough=-1;
    if(originalPreludeSourceThrough<0||originalPreludeSourceThrough>=startChapterIndex||originalPreludeSourceThrough>=limit)originalPreludeSourceThrough=-1;
    if(originalPreludeSourceThrough<0&&startChapterIndex>0&&(originalBootstrapThrough>=0||originalPreludeFrom>=0||(Array.isArray(source.blocks)&&source.blocks.some(block=>block?.sourceMode===SUMMARY_SOURCE_ORIGINAL||block?.sourceMode===SUMMARY_SOURCE_MIXED))))originalPreludeSourceThrough=startChapterIndex-1;
    if(originalPreludeFrom<0||originalPreludeTo<originalPreludeFrom||originalPreludeTo>originalPreludeSourceThrough||originalPreludeTo>=limit){originalPreludeFrom=-1;originalPreludeTo=-1;}
    let blocks = normalizeSummaryBlocks(source.blocks, limit);
    const legacyText = String(source.summaryText || "").trim();
    if (!blocks.length && legacyText && summarizedThrough >= 0) blocks = [{ id: summaryBlockId("legacy-summary", 0, summarizedThrough, 0), fromChapterIndex: 0, toChapterIndex: summarizedThrough, sourceMode: SUMMARY_SOURCE_LEGACY, content: legacyText, createdAt: 0, updatedAt: 0, manuallyEdited: false }];
    blocks = contiguousSummaryBlocks(blocks, startChapterIndex);
    if (blocks.length) summarizedThrough = blocks.at(-1).toChapterIndex;
    else {
      const preludeBoundary = startChapterIndex >= 0 ? startChapterIndex - 1 : -1;
      summarizedThrough = summarizedThrough === preludeBoundary ? preludeBoundary : -1;
    }
    if(blocks.length&&originalPreludeTo>=0&&blocks.at(-1).toChapterIndex>=originalPreludeTo){originalPreludeFrom=-1;originalPreludeTo=-1;}
    return { startChapterIndex, summarizedThrough, nextSummaryAt, sourceMode: normalizeSummarySourceMode(source.sourceMode), needsRebuild: !!source.needsRebuild, preludeCompleted: startChapterIndex === 0 || !!source.preludeCompleted, originalBootstrapThrough, originalPreludeSourceThrough, originalPreludeFrom, originalPreludeTo, blocks };
  }
  function loadSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}");
      const saved = isPlainObject(parsed) ? parsed : {};
      return {
        ...DEFAULTS,
        ...saved,
        settingsVersion: SETTINGS_VERSION,
        contentFontSize: normalizeContentFontSize(saved.contentFontSize),
        emptyContentRetryCount: normalizeEmptyContentRetryCount(saved.emptyContentRetryCount),
        allFailureRetryEnabled: saved.allFailureRetryEnabled === true,
        emptyContentRetryEnabled: saved.allFailureRetryEnabled === true ? false : saved.emptyContentRetryEnabled !== false,
        missingTitleRetryEnabled: saved.missingTitleRetryEnabled !== false,
        shortContentRetryEnabled: saved.shortContentRetryEnabled !== false,
        shortContentMinChars: normalizeShortContentMinChars(saved.shortContentMinChars),
        shortContentMinRatio: normalizeShortContentMinRatio(saved.shortContentMinRatio),
        exportRemoveDuplicateTitles: saved.exportRemoveDuplicateTitles !== false,
        exportStripWrapperTags: saved.exportStripWrapperTags !== false,
        exportNormalizeWhitespace: saved.exportNormalizeWhitespace !== false,
        exportWrapperTags: normalizeExportWrapperTags(saved.exportWrapperTags),
        promptPresets: normalizePromptPresets(saved.promptPresets),
        selectedPromptPresetId: String(saved.selectedPromptPresetId||""),
        optional: isPlainObject(saved.optional) ? { ...saved.optional } : {},
        advancedRequest: {
          ...DEFAULT_ADVANCED_REQUEST,
          ...(isPlainObject(saved.advancedRequest) ? saved.advancedRequest : {})
        }
      };
    } catch {
      return { ...DEFAULTS, optional: {}, advancedRequest: { ...DEFAULT_ADVANCED_REQUEST } };
    }
  }
  function saveSettings() {
    const copy = { ...state.settings, apiKey: "", ttsApiKey: "" };
    delete copy.saveKey;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(copy));
  }
  function toast(message) {
    const element = $("#toast"); element.textContent = message; element.classList.add("show");
    clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove("show"), 2200);
  }
  function setApiStatus(message, type = "") { const el = $("#api-status"); el.textContent = message; el.className = `status ${type}`; }
  function setRequestState(text, type = "neutral") { const el = $("#request-state"); el.textContent = text; el.className = `badge ${type}`; }
  function updateProgressStatus(){const rounds=Math.floor(state.conversationHistory.length/2),done=state.chapterResults.size,total=state.chapterIndexes.length,characters=state.conversationHistory.reduce((sum,item)=>sum+String(item.content||"").length,0),locked=mutationLocked();$("#context-status").textContent=`连续上下文：${rounds} 轮 · 约 ${characters.toLocaleString()} 字符${characters>100000?" · 注意模型上下文上限":""}`;$("#export-results").disabled=!done||locked;$("#preview-all-results").disabled=!done||locked;$("#result-position").textContent=state.viewedResult>=0&&state.resultEntries.length?`结果 ${state.viewedResult+1}/${state.resultEntries.length} · 已改写 ${done}/${total||0} 章`:`暂无生成结果 · 已改写 ${done}/${total||0} 章`;updateContextSummaryStatus();}
  function normalizeBaseUrl(value) { return String(value || "").trim().replace(/\/+$/, ""); }
  function endpoint(path,baseUrlValue=$("#base-url").value) { return `${normalizeBaseUrl(baseUrlValue)}/${String(path || "").replace(/^\/+/, "")}`; }
  function requestEndpoint(value,baseUrlValue=$("#base-url").value) {
    const target = String(value || "").trim();
    if (!target) throw new Error("聊天请求路径 / URL 不能为空。");
    if (/^https?:\/\//i.test(target)) return target;
    if (/^[a-z][a-z\d+.-]*:/i.test(target)) throw new Error("聊天请求 URL 只支持 HTTP 或 HTTPS。");
    return endpoint(target,baseUrlValue);
  }
  function assertSafeJson(value, label, location = "") {
    if (!value || typeof value !== "object") return;
    for (const [key, nested] of Object.entries(value)) {
      if (["__proto__", "prototype", "constructor"].includes(key)) {
        throw new Error(`${label}包含不安全字段“${location}${key}”。`);
      }
      assertSafeJson(nested, label, `${location}${key}.`);
    }
  }
  function parseJsonObject(text, label) {
    let value;
    try { value = JSON.parse(String(text || "").trim() || "{}"); }
    catch (error) { throw new Error(`${label}不是有效 JSON：${error.message || error}`); }
    if (!isPlainObject(value)) throw new Error(`${label}的顶层必须是 JSON 对象（{ ... }）。`);
    assertSafeJson(value, label);
    return value;
  }
  function mergeRequestHeaders(base, overrides) {
    const result = { ...base };
    for (const [rawName, value] of Object.entries(overrides)) {
      const name = rawName.trim();
      if (!name) throw new Error("请求头 JSON 不能包含空名称。");
      const existing = Object.keys(result).find(item => item.toLowerCase() === name.toLowerCase());
      if (value === null) {
        if (existing) delete result[existing];
        continue;
      }
      if (!["string", "number", "boolean"].includes(typeof value)) {
        throw new Error(`请求头“${name}”的值只能是字符串、数字、布尔值或 null。`);
      }
      result[existing || name] = String(value);
    }
    return result;
  }

  function setSharedSaveStatus(message, type = "") {
    const element = $("#shared-save-status");
    if (!element) return;
    element.textContent = message;
    element.className = `muted cache-status ${type}`;
  }
  function sessionDb() {
    if (!state.sessionDbPromise) {
      state.sessionDbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject(new Error("当前设备不支持本地数据库。"));
        const request = indexedDB.open(SESSION_DB_NAME, SESSION_DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(SESSION_STORE_NAME)) db.createObjectStore(SESSION_STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("无法打开旧本地会话数据库。"));
        request.onblocked = () => reject(new Error("旧本地会话数据库被其他页面占用。"));
      });
    }
    return state.sessionDbPromise;
  }
  async function sessionDbGet(key) {
    const db = await sessionDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(SESSION_STORE_NAME, "readonly").objectStore(SESSION_STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("读取旧本地会话失败。"));
    });
  }
  function formatCacheTime(timestamp) {
    if (!Number(timestamp)) return "刚刚";
    try { return new Date(timestamp).toLocaleString("zh-CN", { hour12: false }); }
    catch { return "刚刚"; }
  }
  function projectSettingsSnapshot() {
    const result = {};
    for (const key of PROJECT_SETTING_KEYS) result[key] = state.settings[key];
    return result;
  }
  function normalizeProjectSettings(value) {
    const source = isPlainObject(value) ? value : {};
    const result = { ...PROJECT_DEFAULTS };
    for (const key of ["systemPrompt", "firstPrompt", "contextSummaryPrompt", "tailPrompt", "endMark", "navPrevious", "navBook", "navNext", "webSearchPrompt"]) {
      if (typeof source[key] === "string") result[key] = source[key];
    }
    for (const key of ["includeContext", "contextRewrittenOnly", "contextSummaryEnabled", "contextPreludeCompressionEnabled", "emptyContentRetryEnabled", "allFailureRetryEnabled", "missingTitleRetryEnabled", "shortContentRetryEnabled", "autoAdvance"]) {
      if (typeof source[key] === "boolean") result[key] = source[key];
    }
    result.contextSummaryInterval = normalizeContextSummaryInterval(source.contextSummaryInterval);
    result.contextSummaryRetain = normalizeContextSummaryRetain(source.contextSummaryRetain, result.contextSummaryInterval);
    result.contextSummarySourceMode = result.contextRewrittenOnly ? SUMMARY_SOURCE_REWRITTEN : normalizeSummarySourceMode(source.contextSummarySourceMode);
    result.emptyContentRetryCount = normalizeEmptyContentRetryCount(source.emptyContentRetryCount);
    result.shortContentMinChars = normalizeShortContentMinChars(source.shortContentMinChars);
    result.shortContentMinRatio = normalizeShortContentMinRatio(source.shortContentMinRatio);
    if(result.allFailureRetryEnabled)result.emptyContentRetryEnabled=false;
    if (Number.isInteger(source.batchSize) && BATCH_SIZES.has(source.batchSize)) result.batchSize = source.batchSize;
    if (Number.isInteger(source.titleRepeat) && source.titleRepeat >= 0 && source.titleRepeat <= 10) result.titleRepeat = source.titleRepeat;
    return result;
  }
  function applyProjectSettings(value) {
    Object.assign(state.settings, normalizeProjectSettings(value));
    applySettings();
    saveSettings();
  }
  function normalizeUsage(value) {
    if (!isPlainObject(value)) return null;
    const result = {};
    for (const key of USAGE_FIELDS) {
      const item = value[key];
      if (item === null || ["string", "number"].includes(typeof item)) result[key] = item;
    }
    return result;
  }
  function normalizeResultEntry(value) {
    if (!isPlainObject(value) || !["first", "chapter"].includes(value.type)) return null;
    const result = {
      type: value.type,
      title: String(value.title || (value.type === "first" ? "首楼回答" : "未命名章节")),
      content: String(value.content || ""),
      reasoning: String(value.reasoning || ""),
      usage: normalizeUsage(value.usage),
      createdAt: Number.isFinite(Number(value.createdAt)) ? Number(value.createdAt) : Date.now()
    };
    if (value.type === "chapter") {
      const chapterIndex = Number(value.chapterIndex);
      if (!Number.isInteger(chapterIndex) || chapterIndex < 0) return null;
      result.chapterIndex = chapterIndex;
      result.prompt = String(value.prompt || "");
      result.rerolled = !!value.rerolled;
    }
    return result;
  }
  function normalizeConversationItem(value) {
    if (!isPlainObject(value) || !["user", "assistant"].includes(value.role)) return null;
    const item = { role: value.role, content: String(value.content || "") };
    const contextKey = typeof value.contextKey === "string" ? value.contextKey : "";
    if (/^chapter:(?:0|[1-9]\d{0,14})$/.test(contextKey)) item.contextKey = contextKey;
    return item;
  }
  function contextKeyChapterIndex(value){const match=/^chapter:(0|[1-9]\d{0,14})$/.exec(String(value||""));return match?Number(match[1]):-1;}
  function normalizeResultEntries(values,chapterCount=Infinity){
    const limit=Number.isInteger(chapterCount)&&chapterCount>=0?chapterCount:Infinity,first=[],chapters=new Map();
    for(const raw of Array.isArray(values)?values:[]){const item=normalizeResultEntry(raw);if(!item)continue;if(item.type==="first"){first.push(item);continue;}if(item.chapterIndex>=limit||!item.content.trim())continue;chapters.set(item.chapterIndex,item);}
    return[...first,...[...chapters.values()].sort((a,b)=>a.chapterIndex-b.chapterIndex)];
  }
  function normalizeConversationHistory(values,chapterCount=Infinity){
    const limit=Number.isInteger(chapterCount)&&chapterCount>=0?chapterCount:Infinity,items=(Array.isArray(values)?values:[]).map(normalizeConversationItem).filter(Boolean),unkeyed=[],keyed=new Map();
    for(let index=0;index<items.length-1;index++){
      const user=items[index],assistant=items[index+1];if(user.role!=="user"||assistant.role!=="assistant")continue;
      const userKey=user.contextKey||"",assistantKey=assistant.contextKey||"";
      if(!userKey&&!assistantKey){unkeyed.push([{role:"user",content:user.content},{role:"assistant",content:assistant.content}]);index++;continue;}
      const chapterIndex=contextKeyChapterIndex(userKey);
      if(chapterIndex<0||chapterIndex>=limit||assistantKey!==userKey||!assistant.content.trim())continue;
      keyed.set(chapterIndex,[{role:"user",content:user.content,contextKey:userKey},{role:"assistant",content:assistant.content,contextKey:userKey}]);index++;
    }
    return[...unkeyed.flat(),...[...keyed.entries()].sort((a,b)=>a[0]-b[0]).flatMap(([,pair])=>pair)];
  }
  function conversationHistoryAfterSummary(values,targetIndex,chapterCount=Infinity){
    const items=normalizeConversationHistory(values,chapterCount);if(!Number.isInteger(targetIndex)||targetIndex<0)return items;const result=[];
    for(let index=0;index<items.length-1;index++){const user=items[index],assistant=items[index+1];if(user.role!=="user"||assistant.role!=="assistant")continue;const chapterIndex=contextKeyChapterIndex(user.contextKey||"");if(chapterIndex<0||chapterIndex>targetIndex)result.push({...user},{...assistant});index++;}
    return normalizeConversationHistory(result,chapterCount);
  }
  function canonicalViewedResultIndex(results,selected){
    if(!results.length)return-1;if(!selected)return results.length-1;
    if(selected.type==="chapter"){const index=results.findIndex(item=>item.type==="chapter"&&item.chapterIndex===selected.chapterIndex);return index>=0?index:results.length-1;}
    const exact=results.findIndex(item=>item.type==="first"&&item.createdAt===selected.createdAt&&item.content===selected.content);if(exact>=0)return exact;const first=results.findIndex(item=>item.type==="first");return first>=0?first:results.length-1;
  }
  function normalizeBook(payload) {
    if (!isPlainObject(payload) || payload.format !== BOOK_FORMAT || Number(payload.schemaVersion) !== BOOK_SCHEMA_VERSION) {
      throw new Error("不是受支持的 Novel AI Web 存档。");
    }
    if (!isPlainObject(payload.source) || typeof payload.source.text !== "string") throw new Error("存档缺少小说正文。");
    if (!isPlainObject(payload.progress)) throw new Error("存档进度格式无效。");
    const progress = payload.progress,chapterCount=Math.max(0,Math.floor(Number(payload.summary?.chapterCount)||0)),chapterLimit=chapterCount>0?chapterCount:Infinity;
    const rawResults=Array.isArray(progress.results)?progress.results.map(normalizeResultEntry).filter(Boolean):[];
    const selected=Number.isInteger(progress.viewedResult)?rawResults[progress.viewedResult]||null:null;
    const results=normalizeResultEntries(rawResults,chapterLimit);
    const contextCompression=normalizeContextCompression(progress.contextCompression,chapterLimit);
    const conversationHistory=conversationHistoryAfterSummary(progress.conversationHistory,contextCompression.summarizedThrough,chapterLimit);
    return {
      format: BOOK_FORMAT,
      schemaVersion: BOOK_SCHEMA_VERSION,
      id: /^[a-f0-9]{32}$/.test(String(payload.id || "")) ? String(payload.id) : "",
      title: String(payload.title || String(payload.source.fileName || "未命名小说").replace(/\.txt$/i, "")).trim().slice(0, 160) || "未命名存档",
      createdAt: Number(payload.createdAt) || 0,
      updatedAt: Number(payload.updatedAt) || 0,
      source: { fileName: String(payload.source.fileName || "已保存小说.txt").slice(0, 260), text: payload.source.text },
      projectSettings: normalizeProjectSettings(payload.projectSettings),
      progress: {
        currentIndex: Math.max(0, Math.floor(Number(progress.currentIndex) || 0)),
        previewDirty: !!progress.previewDirty,
        previewText: String(progress.previewText || ""),
        conversationHistory,
        results,
        viewedResult: canonicalViewedResultIndex(results,selected),
        contextCompression
      },
      summary: { chapterCount }
    };
  }
  window.NovelMobile?.setBookNormalizer?.(normalizeBook);
  function buildBookPayload(title = state.activeSaveTitle) {
    const results = normalizeResultEntries(state.resultEntries,state.chapterIndexes.length);
    const contextCompression = normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);
    return {
      format: BOOK_FORMAT,
      schemaVersion: BOOK_SCHEMA_VERSION,
      id: state.activeSaveId,
      title: String(title || state.fileName.replace(/\.txt$/i, "") || "未命名存档").trim().slice(0, 160),
      createdAt: state.activeSaveCreatedAt || Date.now(),
      updatedAt: Date.now(),
      source: { fileName: state.fileName || "已保存小说.txt", text: state.sourceText },
      projectSettings: projectSettingsSnapshot(),
      progress: {
        currentIndex: state.currentIndex,
        previewDirty: state.previewDirty,
        previewText: state.previewDirty ? $("#chapter-preview").value : "",
        conversationHistory: conversationHistoryAfterSummary(state.conversationHistory,contextCompression.summarizedThrough,state.chapterIndexes.length),
        results,
        viewedResult: state.viewedResult,
        contextCompression
      },
      summary: { chapterCount: state.chapterIndexes.length }
    };
  }
  async function sharedApi(path, options = {}) {
    if(!window.NovelMobile?.localApi)throw new Error("手机本地存储模块未加载，请重新启动 App。");
    return window.NovelMobile.localApi(path,options);
  }
  function setSharedApiStatus(message, type = "") {
    const element = $("#shared-api-status");
    if (!element) return;
    element.textContent = message;
    element.className = `muted cache-status ${type}`;
  }
  function apiConfigSnapshot() {
    return {
      baseUrl: $("#base-url").value.trim(),
      apiKey: $("#api-key").value.trim(),
      model: $("#model").value.trim(),
      ttsApiKey: $("#tts-api-key").value.trim()
    };
  }
  function applySharedApiConfig(config) {
    const baseUrl = String(config?.baseUrl || "");
    const apiKey = String(config?.apiKey || "");
    const model = String(config?.model || "");
    const ttsApiKey = String(config?.ttsApiKey || "");
    state.settings.baseUrl = baseUrl;
    state.settings.apiKey = apiKey;
    state.settings.model = model;
    state.settings.ttsApiKey = ttsApiKey;
    $("#base-url").value = baseUrl;
    $("#api-key").value = apiKey;
    $("#tts-api-key").value = ttsApiKey;
    const select = $("#model");
    if (model && ![...select.options].some(option => option.value === model)) select.add(new Option(model, model));
    select.value = model && [...select.options].some(option => option.value === model) ? model : "";
    saveSettings();
  }
  async function saveSharedApiConfigNow() {
    clearTimeout(state.apiConfigSaveTimer);
    state.apiConfigSaveTimer = null;
    if (state.loadingApiConfig || !state.settings.shareApiConfig) return true;
    collectSettings();
    const snapshot = apiConfigSnapshot();
    setSharedApiStatus("正在保存本机 API 配置…");
    const task = async () => {
      try {
        const result = await sharedApi("/api/api-config", { method: "PUT", body: JSON.stringify(snapshot) });
        if (state.settings.shareApiConfig) setSharedApiStatus(`已保存到此手机 · ${formatCacheTime(result?.config?.updatedAt)}`, "ok");
        return true;
      } catch (error) {
        if (state.settings.shareApiConfig) setSharedApiStatus(`本机 API 配置保存失败：${error.message || error}`, "error");
        return false;
      }
    };
    state.apiConfigSaveQueue = state.apiConfigSaveQueue.catch(() => false).then(task);
    return state.apiConfigSaveQueue;
  }
  function scheduleSharedApiConfigSave(delay = 500) {
    if (state.loadingApiConfig || !state.settings.shareApiConfig) return;
    clearTimeout(state.apiConfigSaveTimer);
    state.apiConfigSaveTimer = setTimeout(saveSharedApiConfigNow, delay);
  }
  async function initSharedApiConfig() {
    clearTimeout(state.apiConfigSaveTimer);
    if (!state.settings.shareApiConfig) {
      setSharedApiStatus("本机 API 配置保存已关闭；当前设置只在本次运行中使用。");
      return;
    }
    state.loadingApiConfig = true;
    refreshOperationControls();
    setSharedApiStatus("正在读取此手机的 API 配置…");
    let shouldMigrateLocal = false;
    try {
      const result = await sharedApi("/api/api-config");
      if (result?.configured) {
        applySharedApiConfig(result.config);
        setSharedApiStatus(`已读取此手机的 API 配置 · ${formatCacheTime(result.config?.updatedAt)}`, "ok");
      } else {
        shouldMigrateLocal = !!(state.settings.apiKey || state.settings.model);
        setSharedApiStatus(shouldMigrateLocal ? "正在迁移当前页面的 API 配置…" : "尚未保存本机 API 配置；填写后会自动保存。");
      }
    } catch (error) {
      setSharedApiStatus(`本机 API 配置读取失败：${error.message || error}`, "error");
    } finally {
      state.loadingApiConfig = false;
      refreshOperationControls();
    }
    if (shouldMigrateLocal) await saveSharedApiConfigNow();
  }

  function selectedSaveId() {
    return $("#shared-save-select")?.value || "";
  }
  function catalogLabel(item) {
    const progress = item.chapterCount ? ` · ${item.completedCount || 0}/${item.chapterCount}章` : "";
    return `${item.title}${progress}`;
  }
  function renderSaveCatalog(preferredId = "") {
    const select = $("#shared-save-select");
    if (!select) return;
    const previous = preferredId || select.value || state.activeSaveId;
    select.innerHTML = "";
    if (!state.saveCatalog.length) {
      select.add(new Option("暂无本机存档", ""));
    } else {
      for (const item of state.saveCatalog) select.add(new Option(catalogLabel(item), item.id));
      select.value = state.saveCatalog.some(item => item.id === previous) ? previous : state.saveCatalog[0].id;
    }
    refreshSharedControls();
  }
  function refreshSharedControls() {
    const selected = !!selectedSaveId(), hasBook = !!state.fileBuffer, locked = state.sharedSaveBusy || mutationLocked();
    const states = {
      "#shared-save-select": locked,
      "#open-shared-save": locked || !selected,
      "#refresh-shared-saves": locked,
      "#save-as-shared": locked || !hasBook,
      "#rename-shared-save": locked || !selected,
      "#delete-shared-save": locked || !selected,
      "#export-workspace": locked || !hasBook,
      "#import-workspace": locked,
      "#batch-export-zip": locked || !state.saveCatalog.length,
      "#novel-file": locked
    };
    for (const [selector, disabled] of Object.entries(states)) {
      const element = $(selector);
      if (element) element.disabled = disabled;
    }
  }
  function setSharedSaveBusy(value) {
    state.sharedSaveBusy = !!value;
    refreshOperationControls();
  }
  function setWorkspaceImporting(value){state.workspaceImporting=!!value;refreshOperationControls();}
  function metadataFromBook(book) {
    return {
      id: book.id,
      title: book.title,
      fileName: book.source.fileName,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      chapterCount: Number(book.summary?.chapterCount) || state.chapterIndexes.length,
      completedCount: book.progress.results.filter(item => item.type === "chapter").length
    };
  }
  function updateCatalogBook(book) {
    const metadata = metadataFromBook(book);
    const index = state.saveCatalog.findIndex(item => item.id === metadata.id);
    if (index >= 0) state.saveCatalog[index] = metadata;
    else state.saveCatalog.unshift(metadata);
    state.saveCatalog.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
    renderSaveCatalog(state.activeSaveId || metadata.id);
  }
  async function refreshSaveCatalog(preferredId = "") {
    const payload = await sharedApi("/api/saves");
    state.saveCatalog = Array.isArray(payload?.saves) ? payload.saves : [];
    renderSaveCatalog(preferredId);
    return state.saveCatalog;
  }
  function comparableBookPayload(payload){const book=normalizeBook(payload);return JSON.stringify({title:book.title,source:book.source,projectSettings:book.projectSettings,progress:book.progress,summary:book.summary});}
  async function saveSessionNow() {
    clearTimeout(state.sessionSaveTimer);
    state.sessionSaveTimer = null;
    if (state.restoringSession || !state.fileBuffer || !state.activeSaveId || state.blockedSaveId === state.activeSaveId) return true;
    collectSettings();
    const saveId = state.activeSaveId;
    const snapshot = buildBookPayload();
    setSharedSaveStatus(`正在保存《${snapshot.title}》…`);
    state.sessionSavePending++;
    const task = async () => {
      try {
        let saved=null,reconciled=false;
        try{saved=normalizeBook(await sharedApi(`/api/saves/${saveId}`, { method: "PUT", body: JSON.stringify(snapshot),timeoutMs:60000 }));}
        catch(error){
          if(error?.code==="SHARED_API_HTTP")throw error;
          let remoteRead=false;
          try{const remote=normalizeBook(await sharedApi(`/api/saves/${saveId}`,{timeoutMs:15000}));remoteRead=true;if(comparableBookPayload(remote)===comparableBookPayload(snapshot)){saved=remote;reconciled=true;}}
          catch{}
          if(!saved){
            if(remoteRead){const mismatchError=new Error("保存异常，且手机本地存档与本次待保存内容不一致。");mismatchError.code="SHARED_SAVE_MISMATCH";throw mismatchError;}
            error.saveOutcomeUncertain=true;throw error;
          }
        }
        saved.summary = { chapterCount: snapshot.summary.chapterCount };
        if (state.activeSaveId === saveId) {
          state.activeSaveTitle = saved.title;
          state.activeSaveCreatedAt = saved.createdAt;
          state.activeSaveUpdatedAt = saved.updatedAt;
          updateCatalogBook(saved);
          setSharedSaveStatus(`${reconciled?"保存异常，但已从手机本地确认写入":"已保存到手机"} · ${formatCacheTime(saved.updatedAt)}`, "ok");
        }
        return true;
      } catch (error) {
        if(error?.saveOutcomeUncertain){
          if(state.activeSaveId===saveId)setSharedSaveStatus(`本机保存结果暂时无法确认：${error.message||error} 已保留本次页面结果；请先导出完整 JSON 备份。`,"error");
          return null;
        }
        if (state.activeSaveId === saveId) setSharedSaveStatus(`保存失败：${error.message || error}`, "error");
        return false;
      } finally {
        state.sessionSavePending=Math.max(0,state.sessionSavePending-1);
      }
    };
    state.sessionSaveQueue = state.sessionSaveQueue.catch(() => false).then(task);
    return state.sessionSaveQueue;
  }
  function scheduleSessionSave(delay=600) {
    if (state.restoringSession || !state.fileBuffer || !state.activeSaveId) return;
    clearTimeout(state.sessionSaveTimer);
    const attempt=()=>{if(state.generatedCommitBusy||batchLocked()){state.sessionSaveTimer=setTimeout(attempt,600);return;}state.sessionSaveTimer=null;saveSessionNow();};
    state.sessionSaveTimer=setTimeout(attempt,Math.max(0,Number(delay)||0));
  }
  async function flushSharedSave() {
    if (state.sessionSaveTimer) {
      clearTimeout(state.sessionSaveTimer);
      state.sessionSaveTimer = null;
      return saveSessionNow();
    }
    const outcome=await state.sessionSaveQueue;
    return outcome===null?saveSessionNow():outcome;
  }
  function restoreResultDisplay() {
    if (state.resultEntries.length) {
      const index = Math.max(0, Math.min(Number(state.viewedResult) || 0, state.resultEntries.length - 1));
      state.viewedResult = index;
      showResult(index);
    } else {
      state.viewedResult = -1;
      renderResponse("输出将在这里显示。", "");
      $("#usage").textContent = "";
      $("#copy-output").disabled = true;
      setRequestState("等待请求", "neutral");
      refreshResultNavigation();
    }
  }
  async function hydrateBook(payload) {
    const book = normalizeBook(payload);
    closeAllResultsPreview();closeReadingMode();
    state.restoringSession = true;
    clearTimeout(state.sessionSaveTimer);
    state.sessionSaveTimer = null;
    try {
      applyProjectSettings(book.projectSettings);
      state.fileName = book.source.fileName;
      state.fileBuffer = new TextEncoder().encode(book.source.text).buffer;
      $("#encoding").value = "utf-8";
      decodeFile();
      state.currentIndex = Math.max(0, Math.min(book.progress.currentIndex, Math.max(0, state.chapterIndexes.length - 1)));
      state.currentBatch = Math.floor(state.currentIndex / (Number(state.settings.batchSize) || 10));
      refreshChapters(true, true);
      const selectedResult=book.progress.results[book.progress.viewedResult]||null;
      state.conversationHistory=normalizeConversationHistory(book.progress.conversationHistory,state.chapterIndexes.length);
      state.contextCompression=normalizeContextCompression(book.progress.contextCompression,state.chapterIndexes.length);
      state.resultEntries=normalizeResultEntries(book.progress.results,state.chapterIndexes.length);
      state.chapterResults=new Map(state.resultEntries.filter(item=>item.type==="chapter").map(item=>[item.chapterIndex,item]));
      if(state.settings.contextRewrittenOnly)rewriteStoredChapterPrompts(true);
      const summarySettings=contextSummarySettings();if(summaryBlocksNeedRebuild(state.contextCompression,summarySettings.sourceMode,state.settings.contextRewrittenOnly))state.contextCompression={...cloneContextCompression(),needsRebuild:true};
      state.viewedResult=canonicalViewedResultIndex(state.resultEntries,selectedResult);
      book.progress.conversationHistory=state.conversationHistory;book.progress.results=state.resultEntries;book.progress.viewedResult=state.viewedResult;
      state.previewDirty = false;
      if (book.progress.previewDirty) {
        $("#chapter-preview").value = book.progress.previewText;
        state.previewDirty = true;
      }
      state.activeSaveId = book.id;
      state.activeSaveTitle = book.title;
      state.activeSaveCreatedAt = book.createdAt;
      state.activeSaveUpdatedAt = book.updatedAt;
      localStorage.setItem(LAST_SHARED_SAVE_KEY, book.id);
      resetBatchRange();
      book.summary = { chapterCount: state.chapterIndexes.length };
      updateCatalogBook(book);
      restoreResultDisplay();
      renderSummaryBlocks();
      updateProgressStatus();
      setSharedSaveStatus(`当前：《${book.title}》 · 已保存 ${formatCacheTime(book.updatedAt)}`, "ok");
      refreshSharedControls();
      return book;
    } finally {
      state.restoringSession = false;
    }
  }
  async function openSharedSave(saveId = selectedSaveId()) {
    if (!saveId || mutationLocked() || state.sharedSaveBusy) return;
    collectSettings();
    setSharedSaveBusy(true);
    try {
      if (state.activeSaveId) {
        const saved = await flushSharedSave();
        if (saved !== true) throw new Error("当前存档尚未确认保存成功，已取消打开。");
      }
      setSharedSaveStatus("正在读取手机本地存档…");
      const book = await hydrateBook(await sharedApi(`/api/saves/${saveId}`));
      toast(`已打开《${book.title}》`);
    } catch (error) {
      setSharedSaveStatus(`打开失败：${error.message || error}`, "error");
    } finally {
      setSharedSaveBusy(false);
    }
  }
  async function createSharedSave(title, payload = null, options = {}) {
    if (generatedLocked() || batchLocked() || (state.workspaceImporting && !options.allowImport)) return null;
    collectSettings();
    const snapshot = payload ? normalizeBook(payload) : buildBookPayload(title);
    snapshot.title = String(title || snapshot.title || "未命名存档").trim().slice(0, 160) || "未命名存档";
    setSharedSaveBusy(true);
    try {
      setSharedSaveStatus(`正在创建《${snapshot.title}》…`);
      const created = await sharedApi("/api/saves", { method: "POST", body: JSON.stringify(snapshot) });
      const book = await hydrateBook(created);
      await refreshSaveCatalog(book.id);
      setSharedSaveStatus(`已创建并保存《${book.title}》`, "ok");
      return book;
    } catch (error) {
      setSharedSaveStatus(`创建存档失败：${error.message || error}`, "error");
      return null;
    } finally {
      setSharedSaveBusy(false);
    }
  }
  async function saveCurrentAsNew() {
    if (!state.fileBuffer || mutationLocked() || state.sharedSaveBusy) return;
    collectSettings();
    const fallback = state.activeSaveTitle || state.fileName.replace(/\.txt$/i, "") || "未命名存档";
    const value = window.prompt("新存档名称：", state.activeSaveId ? `${fallback} - 副本` : fallback);
    if (value === null || !value.trim()) return;
    await createSharedSave(value.trim());
  }
  async function renameSelectedSave() {
    const saveId = selectedSaveId();
    const item = state.saveCatalog.find(entry => entry.id === saveId);
    if (!saveId || !item || mutationLocked() || state.sharedSaveBusy) return;
    const value = window.prompt("存档新名称：", item.title);
    if (value === null || !value.trim()) return;
    const active = state.activeSaveId === saveId;
    setSharedSaveBusy(true);
    try {
      if (active && await flushSharedSave() !== true) throw new Error("当前存档尚未确认保存成功，已取消重命名。");
      if (active) state.blockedSaveId = saveId;
      const saved = normalizeBook(await sharedApi(`/api/saves/${saveId}`, { method: "PATCH", body: JSON.stringify({ title: value.trim() }) }));
      if (active) {
        state.activeSaveTitle = saved.title;
        state.activeSaveUpdatedAt = saved.updatedAt;
      }
      updateCatalogBook(saved);
      setSharedSaveStatus(`已重命名为《${saved.title}》`, "ok");
    } catch (error) {
      setSharedSaveStatus(`重命名失败：${error.message || error}`, "error");
    } finally {
      if (state.blockedSaveId === saveId) state.blockedSaveId = "";
      setSharedSaveBusy(false);
      if (active && state.activeSaveId === saveId) scheduleSessionSave();
    }
  }
  async function deleteSelectedSave() {
    const saveId = selectedSaveId();
    const item = state.saveCatalog.find(entry => entry.id === saveId);
    if (!saveId || !item || mutationLocked() || state.sharedSaveBusy || !window.confirm(`确定删除本机存档《${item.title}》？\n\n该操作会删除手机 App 内的存档，且无法撤销。`)) return;
    const active = state.activeSaveId === saveId;
    setSharedSaveBusy(true);
    try {
      if (active) {
        state.blockedSaveId = saveId;
        clearTimeout(state.sessionSaveTimer);
        state.sessionSaveTimer = null;
        await state.sessionSaveQueue;
      }
      await sharedApi(`/api/saves/${saveId}`, { method: "DELETE" });
      if (active) {
        state.activeSaveId = "";
        state.activeSaveTitle = "";
        state.activeSaveCreatedAt = 0;
        state.activeSaveUpdatedAt = 0;
        localStorage.removeItem(LAST_SHARED_SAVE_KEY);
        setSharedSaveStatus("本机存档已删除；页面中的当前内容仍可“另存为”。");
        setBatchStatus("当前内容不再有本机存档；请先“当前另存为”再批量处理。","error");
      }
      await refreshSaveCatalog();
      toast(`已删除《${item.title}》`);
    } catch (error) {
      setSharedSaveStatus(`删除失败：${error.message || error}`, "error");
    } finally {
      if (state.blockedSaveId === saveId) state.blockedSaveId = "";
      setSharedSaveBusy(false);
      if (active && state.activeSaveId === saveId) scheduleSessionSave();
    }
  }
  function browserDownload(name,parts,mimeType){const blob=new Blob(parts,{type:mimeType}),link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000);}
  async function shareOrDownloadText(name,parts,mimeType){
    const values=Array.isArray(parts)?parts:[parts],text=values.join("");
    if(await window.NovelMobile?.shareTextFile?.(name,text,mimeType))return true;
    browserDownload(name,values,mimeType);return true;
  }
  async function exportWorkspaceJson() {
    if (!state.fileBuffer || mutationLocked() || state.sharedSaveBusy) return;
    setSharedSaveBusy(true);
    try{
      collectSettings();
      if (state.activeSaveId && await flushSharedSave()!==true)throw new Error("当前本机存档尚未确认保存成功，已取消导出。");
      const payload = buildBookPayload(),name = String(payload.title || "小说存档").replace(/[\\/:*?"<>|]/g, "_");
      await shareOrDownloadText(`${name}_完整存档.json`,JSON.stringify(payload,null,2),"application/json;charset=utf-8");
      toast("完整 JSON 已打开保存/分享面板（不含 API 配置和密钥）");
    }catch(error){setSharedSaveStatus(`导出失败：${error.message||error}`,"error");toast("完整 JSON 导出失败");}
    finally{setSharedSaveBusy(false);}
  }
  function fflateLibrary(){return globalThis.fflate||null;}
  function isZipBytes(bytes){return !!bytes&&bytes.length>4&&bytes[0]===0x50&&bytes[1]===0x4b&&(bytes[2]===0x03||bytes[2]===0x05||bytes[2]===0x07);}
  function safeZipEntryName(value){return String(value||"未命名").replace(/[\\/:*?"<>|\u0000-\u001f]/g,"_").trim().slice(0,120)||"未命名";}
  function bytesToBase64(bytes){let binary="";const chunkSize=0x8000;for(let i=0;i<bytes.length;i+=chunkSize)binary+=String.fromCharCode.apply(null,bytes.subarray(i,i+chunkSize));return btoa(binary);}
  function base64Chunks(bytes,chunkBytes=393216){const chunks=[];for(let i=0;i<bytes.length;i+=chunkBytes)chunks.push(bytesToBase64(bytes.subarray(i,i+chunkBytes)));if(!chunks.length)chunks.push("");return chunks;}
  function renderBatchExportDialog(){
    const list=$("#batch-export-list");if(!list)return;
    list.innerHTML="";
    if(!state.saveCatalog.length){const empty=document.createElement("p");empty.className="muted";empty.textContent="暂无本机存档。";list.appendChild(empty);}
    for(const item of state.saveCatalog){
      const label=document.createElement("label");
      const box=document.createElement("input");box.type="checkbox";box.checked=true;box.dataset.saveId=item.id;
      const name=document.createElement("span");name.textContent=catalogLabel(item);
      const meta=document.createElement("span");meta.className="batch-export-meta";meta.textContent=formatCacheTime(item.updatedAt);
      label.append(box,name,meta);
      list.appendChild(label);
    }
    const all=$("#batch-export-select-all");if(all)all.checked=true;
    updateBatchExportConfirm();
  }
  function updateBatchExportConfirm(){
    const boxes=$("#batch-export-list")?Array.from($("#batch-export-list").querySelectorAll("input[type=checkbox]")):[];
    const checked=boxes.filter(box=>box.checked).length,confirmButton=$("#batch-export-confirm");
    if(confirmButton){confirmButton.disabled=!checked;confirmButton.textContent=checked?`导出 ZIP（${checked} 本）`:"导出 ZIP";}
  }
  function setBatchExportAll(checked){
    $("#batch-export-list")?.querySelectorAll("input[type=checkbox]").forEach(box=>{box.checked=!!checked;});
    updateBatchExportConfirm();
  }
  function openBatchExportDialog(){
    if(mutationLocked()||state.sharedSaveBusy)return;
    if(!fflateLibrary())return toast("打包组件未加载，请重新安装最新版 APK");
    if(!state.saveCatalog.length)return toast("暂无本机存档可导出");
    renderBatchExportDialog();
    const dialog=$("#batch-export-dialog");
    if(dialog&&!dialog.open)dialog.showModal();
  }
  function closeBatchExportDialog(){const dialog=$("#batch-export-dialog");if(dialog?.open)dialog.close();}
  async function confirmBatchExportZip(){
    if(mutationLocked()||state.sharedSaveBusy)return;
    const ids=Array.from($("#batch-export-list")?.querySelectorAll("input[type=checkbox]")||[]).filter(box=>box.checked).map(box=>box.dataset.saveId).filter(Boolean);
    if(!ids.length)return toast("请先勾选要导出的存档");
    const fflate=fflateLibrary();
    if(!fflate)return toast("打包组件未加载，请重新安装最新版 APK");
    setSharedSaveBusy(true);setSharedSaveStatus("正在打包所选存档…");
    try{
      if(state.activeSaveId&&await flushSharedSave()!==true)throw new Error("当前本机存档尚未确认保存成功，已取消导出。");
      const encoder=new TextEncoder(),files={};let total=0;
      for(let i=0;i<ids.length;i++){
        const raw=await sharedApi(`/api/saves/${ids[i]}`);
        const payload=normalizeBook(raw);
        const entryName=`${safeZipEntryName(payload.title)}_${String(payload.id||ids[i]).slice(0,8)}.json`;
        const bytes=encoder.encode(JSON.stringify(payload));
        total+=bytes.length;
        if(total>104857600)throw new Error(`所选存档合计约 ${Math.round(total/1048576)}MB，超过 100MB 上限；请减少勾选数量分批导出`);
        files[entryName]=bytes;
        setSharedSaveStatus(`正在读取所选存档（${i+1}/${ids.length}，约 ${Math.round(total/1048576)}MB）…`);
        await new Promise(resolve=>setTimeout(resolve));
      }
      setSharedSaveStatus(`正在压缩 ${ids.length} 本存档（约 ${Math.round(total/1048576)}MB）…`);
      let zipped;
      try{zipped=await new Promise((resolve,reject)=>fflate.zip(files,{level:3},(err,data)=>err?reject(err):resolve(data)));}
      catch{zipped=fflate.zipSync(files,{level:3});}
      const stamp=new Date(),pad=value=>String(value).padStart(2,"0");
      const zipName=`小说存档备份_${ids.length}本_${stamp.getFullYear()}${pad(stamp.getMonth()+1)}${pad(stamp.getDate())}_${pad(stamp.getHours())}${pad(stamp.getMinutes())}.zip`;
      const shared=await window.NovelMobile?.shareBinaryFileChunked?.(zipName,base64Chunks(zipped),"application/zip");
      if(shared){
        toast(`已打包 ${ids.length} 本存档并打开保存/分享面板`);
        setSharedSaveStatus(`ZIP 已生成（${ids.length} 本；不含 API 配置和密钥）`,"ok");
      }else{
        const blob=new Blob([zipped],{type:"application/zip"}),link=document.createElement("a");
        link.href=URL.createObjectURL(blob);link.download=zipName;document.body.appendChild(link);link.click();link.remove();
        setTimeout(()=>URL.revokeObjectURL(link.href),1000);
        toast(`已打包 ${ids.length} 本存档`);
        setSharedSaveStatus(`ZIP 已下载（${ids.length} 本；不含 API 配置和密钥）`,"ok");
      }
      closeBatchExportDialog();
    }catch(error){
      setSharedSaveStatus(`批量导出失败：${error.message||error}`,"error");
      toast(`批量导出失败：${error.message||error}`);
    }finally{setSharedSaveBusy(false);}
  }
  async function importWorkspaceJson(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || mutationLocked() || state.sharedSaveBusy) return;
    setWorkspaceImporting(true);
    try {
      if (state.activeSaveId && await flushSharedSave() !== true) throw new Error("当前本机存档尚未确认保存成功，请先重试。");
      if(file.size>MAX_LIBRARY_ZIP_BYTES)throw new Error("导入文件超过 100MB 上限，请拆分后重试。");
      const buffer=await file.arrayBuffer(),bytes=new Uint8Array(buffer);
      let payloads=[];
      if(isZipBytes(bytes)){
        const fflate=fflateLibrary();
        if(!fflate)throw new Error("解包组件未加载，请重新安装最新版 APK。");
        const entries=fflate.unzipSync(bytes),decoder=new TextDecoder();let total=0;
        for(const [name,data] of Object.entries(entries)){
          total+=data.length;if(total>MAX_LIBRARY_ZIP_BYTES)throw new Error("ZIP 解压后的数据超过 100MB 上限，请拆分后重试。");
          if(!/\.json$/i.test(name)||name.includes("__MACOSX")||name.split("/").pop().startsWith("."))continue;
          try{payloads.push({name,json:JSON.parse(decoder.decode(data))});}
          catch(error){payloads.push({name,error});}
        }
        if(!payloads.length)throw new Error("ZIP 中没有找到 .json 存档文件。");
      }else payloads=[{name:file.name,json:JSON.parse(new TextDecoder().decode(bytes))}];
      let success=0,failed=0;const failures=[];
      for(const entry of payloads){
        if(entry.error){failed++;failures.push(`${entry.name}：JSON 解析失败`);continue;}
        try{
          const payload=normalizeBook(entry.json);
          payload.id="";
          payload.title=payload.title||entry.name.replace(/\.json$/i,"");
          const created=await createSharedSave(payload.title,payload,{allowImport:true});
          if(created)success++;else{failed++;failures.push(`《${payload.title}》：创建存档失败`);}
        }catch(error){failed++;failures.push(`${entry.name}：${error.message||error}`);}
      }
      if(failed){
        setSharedSaveStatus(`导入完成：成功 ${success} 本，失败 ${failed} 本（${failures.slice(0,3).join("；")}）`,"error");
        toast(`导入完成：成功 ${success} 本、失败 ${failed} 本`);
      }else{
        setSharedSaveStatus(`已导入 ${success} 本存档`,"ok");
        toast(`已导入为新存档（共 ${success} 本）`);
      }
    } catch (error) {
      setSharedSaveStatus(`导入失败：${error.message || error}`, "error");
      toast("存档导入失败");
    } finally {
      setWorkspaceImporting(false);
    }
  }
  async function restoreLegacyCachedSession() {
    state.restoringSession = true;
    try {
      if (typeof indexedDB.databases === "function") {
        const databases = await indexedDB.databases();
        if (!databases.some(item => item.name === SESSION_DB_NAME)) return "none";
      }
      const [novel, session] = await Promise.all([sessionDbGet("novel"), sessionDbGet("session")]);
      if (!novel?.buffer || !session || novel.cacheId !== session.novelCacheId) return "none";
      state.fileBuffer = novel.buffer;
      state.fileName = String(novel.fileName || "已缓存小说.txt");
      const encoding = [...$("#encoding").options].some(option => option.value === novel.encoding) ? novel.encoding : "auto";
      $("#encoding").value = encoding;
      decodeFile();
      state.currentIndex = Math.max(0, Math.min(Number(session.currentIndex) || 0, Math.max(0, state.chapterIndexes.length - 1)));
      state.currentBatch = Math.floor(state.currentIndex / (Number(state.settings.batchSize) || 10));
      refreshChapters(true, true);
      resetBatchRange();
      state.conversationHistory=normalizeConversationHistory(session.conversationHistory,state.chapterIndexes.length);
      state.contextCompression=emptyContextCompression();
      const rawLegacyResults=Array.isArray(session.resultEntries)?session.resultEntries.map(normalizeResultEntry).filter(Boolean):[];
      const selectedLegacy=Number.isInteger(session.viewedResult)?rawLegacyResults[session.viewedResult]||null:null;
      state.resultEntries=normalizeResultEntries(rawLegacyResults,state.chapterIndexes.length);
      state.chapterResults=new Map(state.resultEntries.filter(item=>item.type==="chapter").map(item=>[item.chapterIndex,item]));
      state.viewedResult=canonicalViewedResultIndex(state.resultEntries,selectedLegacy);
      state.previewDirty = false;
      if (session.previewDirty) {
        $("#chapter-preview").value = String(session.previewText || "");
        state.previewDirty = true;
      }
      state.activeSaveId = "";
      state.activeSaveTitle = "";
      restoreResultDisplay();
      updateProgressStatus();
      setSharedSaveStatus(`已读取旧页面缓存《${state.fileName.replace(/\.txt$/i, "")}》；请点“当前另存为”迁移到本机存档。`, "ok");
      refreshSharedControls();
      return "restored";
    } catch (error) {
      setSharedSaveStatus(`旧页面缓存检查失败：${error.message || error}`, "error");
      return "error";
    } finally {
      state.restoringSession = false;
    }
  }
  async function initSharedSaves() {
    setSharedSaveBusy(true);
    setSharedSaveStatus("正在打开手机本地书库…");
    try {
      const catalog = await refreshSaveCatalog();
      const lastId = localStorage.getItem(LAST_SHARED_SAVE_KEY) || "";
      if (lastId && catalog.some(item => item.id === lastId)) {
        setSharedSaveBusy(false);
        await openSharedSave(lastId);
        return;
      }
      if (catalog.length) {
        renderSaveCatalog(catalog[0].id);
        setSharedSaveStatus("请选择一本本机存档并点击“打开”。");
      } else {
        const legacyState = await restoreLegacyCachedSession();
        if (legacyState === "none") setSharedSaveStatus("暂无本机存档；导入 TXT 后会自动创建。", "");
      }
    } catch (error) {
      setSharedSaveStatus(`无法打开手机本地书库：${error.message || error}`, "error");
    } finally {
      setSharedSaveBusy(false);
    }
  }



  function decodeWithEncoding(buffer, encoding, fatal = false) {
    if (encoding === "utf-32le" || encoding === "utf-32be") {
      const bytes = new Uint8Array(buffer), little = encoding === "utf-32le", points = [];
      const start = bytes.length >= 4 && (hasBom(bytes,[255,254,0,0]) || hasBom(bytes,[0,0,254,255])) ? 4 : 0;
      for (let i = start; i + 3 < bytes.length; i += 4) {
        const value = little ? (bytes[i]|bytes[i+1]<<8|bytes[i+2]<<16|bytes[i+3]<<24)>>>0 : (bytes[i]<<24|bytes[i+1]<<16|bytes[i+2]<<8|bytes[i+3])>>>0;
        points.push(value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff) ? value : 0xfffd);
      }
      let output = ""; for (let i = 0; i < points.length; i += 8192) output += String.fromCodePoint(...points.slice(i,i+8192));
      return output;
    }
    return new TextDecoder(encoding, { fatal }).decode(buffer);
  }
  function hasBom(bytes, signature) { return signature.every((value,index) => bytes[index] === value); }
  function scoreDecodedText(text) {
    if (!text) return -Infinity;
    const sample = text.slice(0,300000), length = Math.max(sample.length,1), count = regex => (sample.match(regex)||[]).length;
    const replacement=count(/\ufffd/g), controls=count(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g), cjk=count(/[\u3400-\u9fff]/g);
    const common=count(/[的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题程展五果料象员入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处理世车价]/g);
    const punctuation=count(/[，。！？；：“”‘’、《》【】（）…—]/g), mojibake=count(/[锟斤拷烫屯葺拷鈥嬫湁鏄殑浜嗗湪]/g), latin=count(/[A-Za-z]/g), readable=count(/[\p{L}\p{N}\p{P}\p{Zs}\r\n\t]/gu);
    let score=readable/length*40+Math.min(cjk/length,.8)*80+Math.min(common/length,.35)*180+Math.min(punctuation/length,.08)*120-replacement/length*1000-controls/length*800-mojibake/length*500;
    if (!cjk && latin/length>.6) score+=5; return score;
  }
  function detectAndDecode(buffer, requested="auto") {
    const bytes=new Uint8Array(buffer), boms=[[[255,254,0,0],"utf-32le"],[[0,0,254,255],"utf-32be"],[[239,187,191],"utf-8"],[[255,254],"utf-16le"],[[254,255],"utf-16be"]];
    if (requested!=="auto") return {text:decodeWithEncoding(buffer,requested),encoding:requested,automatic:false};
    const bom=boms.find(([signature])=>hasBom(bytes,signature)); if(bom) return {text:decodeWithEncoding(buffer,bom[1]),encoding:bom[1],automatic:true,bom:true};
    try { return {text:decodeWithEncoding(buffer,"utf-8",true),encoding:"utf-8",automatic:true}; } catch {}
    const sample=buffer.slice(0,Math.min(buffer.byteLength,768*1024)), candidates=["gb18030","big5","utf-16le","utf-16be","shift_jis","euc-jp","euc-kr","windows-1252"], results=[];
    for(const encoding of candidates){try{results.push({encoding,score:scoreDecodedText(decodeWithEncoding(sample,encoding))});}catch{}}
    results.sort((a,b)=>b.score-a.score); const winner=results[0]||{encoding:"gb18030"};
    return {text:decodeWithEncoding(buffer,winner.encoding),encoding:winner.encoding,automatic:true};
  }
  function normalizeText(text){return String(text||"").replace(/^\ufeff/,"").replace(/\r\n?/g,"\n").replace(/\u00a0/g," ");}
  function normalizeTitle(title){return String(title||"").replace(/[\s　]+/g,"").replace(/[：:]+$/,"").toLowerCase();}
  function isChapterTitle(line){const v=String(line||"").trim();return !!v&&v.length<=100&&(/^(?:正文\s*)?第\s*[0-9零〇一二三四五六七八九十百千万两]+\s*[章节回卷集部篇]\s*(?:[：:、.．\-—]\s*)?.*$/i.test(v)||/^(?:序章|楔子|引子|前言|序言|尾声|后记)(?:\s*[：:、.．\-—]\s*.*|\s+.+)?$/i.test(v)||/^chapter\s+[0-9ivxlcdm]+(?:\s*[:.．\-—]\s*.*|\s+.+)?$/i.test(v));}
  function isEndOrNavigation(line){const v=String(line||"").trim().replace(/\s+/g,"");if(!v)return false;const s=state.settings;const configured=[s.endMark,s.navPrevious,s.navBook,s.navNext].map(x=>String(x||"").trim().replace(/\s+/g,"")).filter(Boolean);return configured.includes(v)||/^(?:[（(【\[]?本章完[）)】\]]?|上一章|返回书籍页|书籍页|目录|下一章)$/.test(v);}
  function cleanBody(lines,title){const result=[...lines];while(result.length&&!result[0].trim())result.shift();while(result.length&&!result.at(-1).trim())result.pop();while(result.length&&normalizeTitle(result[0])===normalizeTitle(title)){result.shift();while(result.length&&!result[0].trim())result.shift();}let changed=true;while(changed){changed=false;while(result.length&&!result.at(-1).trim()){result.pop();changed=true;}if(result.length&&isEndOrNavigation(result.at(-1))){result.pop();changed=true;}}return result.join("\n").trim();}
  function indexChapters(rawText){const text=normalizeText(rawText),indexes=[],pattern=/^.+$/gm;let match;while((match=pattern.exec(text))){const title=match[0].trim();if(!isChapterTitle(title))continue;const previous=indexes.at(-1);if(previous&&!text.slice(previous.bodyStart,match.index).trim()){previous.title=title.replace(/^正文\s*/,"");previous.bodyStart=pattern.lastIndex;continue;}indexes.push({title:title.replace(/^正文\s*/,""),start:match.index,bodyStart:pattern.lastIndex,end:text.length});}for(let i=0;i<indexes.length-1;i++)indexes[i].end=indexes[i+1].start;if(!indexes.length&&text.trim()){const first=/\S.*(?:\n|$)/.exec(text),candidate=first&&first[0].trim().length<=100?first[0].trim():"第1章 未命名章节";indexes.push({title:candidate,start:first?.index||0,bodyStart:first&&candidate===first[0].trim()?first.index+first[0].length:0,end:text.length});}return{text,indexes};}
  function getChapter(index){if(index<0||index>=state.chapterIndexes.length)return null;if(state.chapterCache.has(index))return state.chapterCache.get(index);const item=state.chapterIndexes[index],chapter={title:item.title,body:cleanBody(state.sourceText.slice(item.bodyStart,item.end).split("\n"),item.title)};state.chapterCache.set(index,chapter);return chapter;}
  function buildChapter(chapter){if(!chapter)return"";const s=state.settings,title=chapter.title.trim()||`第${state.currentIndex+1}章 未命名章节`,blocks=[];for(let i=0;i<Math.max(0,Number(s.titleRepeat)||0);i++)blocks.push(title);if(chapter.body.trim())blocks.push(chapter.body.trim());if(s.endMark.trim())blocks.push(s.endMark.trim());const nav=[s.navPrevious,s.navBook,s.navNext].map(x=>x.trim()).filter(Boolean).join("\n");if(nav)blocks.push(nav);if(s.tailPrompt.trim())blocks.push(s.tailPrompt.trim());return blocks.join("\n\n");}
  function contextUsesRewrittenOnly(profile=null){return profile?.contextRewrittenOnly??!!state.settings.contextRewrittenOnly;}
  function contextPreludeCompressionEnabled(profile=null){return profile?.contextPreludeCompressionEnabled??state.settings.contextPreludeCompressionEnabled!==false;}
  function contextSummarySettings(profile=null){
    const interval=normalizeContextSummaryInterval(profile?.contextSummaryInterval??state.settings.contextSummaryInterval),retain=normalizeContextSummaryRetain(profile?.contextSummaryRetain??state.settings.contextSummaryRetain,interval),rewrittenOnly=contextUsesRewrittenOnly(profile);
    return{enabled:profile?.contextSummaryEnabled??!!state.settings.contextSummaryEnabled,preludeEnabled:contextPreludeCompressionEnabled(profile),interval,retain,sourceMode:rewrittenOnly?SUMMARY_SOURCE_REWRITTEN:normalizeSummarySourceMode(profile?.contextSummarySourceMode??state.settings.contextSummarySourceMode),prompt:String(profile?.contextSummaryPrompt??state.settings.contextSummaryPrompt??DEFAULT_CONTEXT_SUMMARY_PROMPT).trim()||DEFAULT_CONTEXT_SUMMARY_PROMPT};
  }
  function cloneContextCompression(value=state.contextCompression){const context=normalizeContextCompression(value,state.chapterIndexes.length);return{...context,blocks:context.blocks.map(block=>({...block}))};}
  function hasChapterResultRange(fromIndex,toIndex){if(toIndex<fromIndex)return true;for(let index=fromIndex;index<=toIndex;index++){if(!String(state.chapterResults.get(index)?.content||"").trim())return false;}return true;}
  function createContextForStart(currentIndex,settings=contextSummarySettings()){
    const index=Math.max(0,Math.min(Math.floor(Number(currentIndex)||0),Math.max(0,state.chapterIndexes.length-1)));let startChapterIndex=index;
    while(startChapterIndex>0&&String(state.chapterResults.get(startChapterIndex-1)?.content||"").trim())startChapterIndex--;
    const useOriginalPrelude=settings.preludeEnabled&&startChapterIndex>0,rawCount=useOriginalPrelude?Math.min(settings.retain,startChapterIndex):0,originalPreludeFrom=rawCount?startChapterIndex-rawCount:-1,originalPreludeTo=rawCount?startChapterIndex-1:-1,originalBootstrapThrough=useOriginalPrelude?startChapterIndex-rawCount-1:-1;
    return{...emptyContextCompression(settings.sourceMode),startChapterIndex,summarizedThrough:startChapterIndex-1,nextSummaryAt:startChapterIndex+settings.interval,preludeCompleted:startChapterIndex===0,originalBootstrapThrough,originalPreludeSourceThrough:useOriginalPrelude?startChapterIndex-1:-1,originalPreludeFrom,originalPreludeTo};
  }
  function createPreludeContextForStart(currentIndex,settings=contextSummarySettings(),previous=state.contextCompression){
    const startChapterIndex=Math.max(1,Math.min(Math.floor(Number(currentIndex)||0),Math.max(1,state.chapterIndexes.length-1))),rawCount=Math.min(settings.retain,startChapterIndex),desiredBootstrap=startChapterIndex-rawCount-1;
    const prior=normalizeContextCompression(previous,state.chapterIndexes.length),blocks=normalizeSummaryBlocks(prior.blocks.filter(block=>block.toChapterIndex<=desiredBootstrap),state.chapterIndexes.length),summarizedThrough=blocks.at(-1)?.toChapterIndex??-1,originalBootstrapThrough=Math.max(desiredBootstrap,summarizedThrough),originalPreludeFrom=originalBootstrapThrough+1,originalPreludeTo=startChapterIndex-1;
    return normalizeContextCompression({...emptyContextCompression(settings.sourceMode),startChapterIndex,summarizedThrough,nextSummaryAt:startChapterIndex+settings.interval,sourceMode:settings.sourceMode,preludeCompleted:false,originalBootstrapThrough,originalPreludeSourceThrough:startChapterIndex-1,originalPreludeFrom:originalPreludeFrom<=originalPreludeTo?originalPreludeFrom:-1,originalPreludeTo:originalPreludeFrom<=originalPreludeTo?originalPreludeTo:-1,blocks},state.chapterIndexes.length);
  }
  function contextHasOriginalPreludeSource(context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length)){return context.originalPreludeSourceThrough>=0;}
  function preludeCompressionNeedsInitialization(currentIndex,settings=contextSummarySettings(),context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length)){
    const index=Math.max(0,Math.min(Math.floor(Number(currentIndex)||0),Math.max(0,state.chapterIndexes.length-1)));if(!settings.preludeEnabled||index<=0||[...state.chapterResults.keys()].some(chapter=>chapter>index)||contextHasOriginalPreludeSource(context))return false;
    if(context.startChapterIndex<0)return createContextForStart(index,settings).originalPreludeSourceThrough>=0;
    const from=Math.max(0,context.summarizedThrough+1);return from<index&&!hasChapterResultRange(from,index-1);
  }
  function initializeContextCompression(currentIndex,settings=contextSummarySettings()){
    let context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);
    if(context.startChapterIndex<0)context=createContextForStart(currentIndex,settings);
    if(context.blocks.length&&context.nextSummaryAt<0)context.nextSummaryAt=context.summarizedThrough+settings.retain+settings.interval+1;
    if(!context.blocks.length&&!context.needsRebuild)context.sourceMode=settings.sourceMode;
    state.contextCompression=context;return context;
  }
  function activatePreludeCompression(currentIndex){
    const includeContext=$("#include-context").checked,settings=contextSummarySettings(),current=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),needed=includeContext&&preludeCompressionNeedsInitialization(currentIndex,settings,current);
    if(needed&&!$("#context-summary-enabled").checked){$("#context-summary-enabled").checked=true;state.settings.contextSummaryEnabled=true;saveSettings();syncContextSummaryControls(mutationLocked()||state.modelsLoading||state.loadingApiConfig);}
    if(needed){const activeSettings=contextSummarySettings();state.contextCompression=current.startChapterIndex<0?createContextForStart(currentIndex,activeSettings):createPreludeContextForStart(currentIndex,activeSettings,current);state.conversationHistory=historyAfterSummary(state.contextCompression.summarizedThrough);renderSummaryBlocks();updateContextSummaryStatus();}
    return needed;
  }
  function prepareBatchContextStart(startChapterIndex,profile){
    const settings=contextSummarySettings(profile),start=Math.max(0,startChapterIndex),context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);
    if(context.startChapterIndex<0)state.contextCompression=createContextForStart(start,settings);else initializeContextCompression(start,settings);
    updateContextSummaryStatus();renderSummaryBlocks();
  }
  function originalChapterContext(index){const chapter=getChapter(index);if(!chapter)return"";return`【第 ${index+1} 章原文：${chapter.title}】\n${chapter.title}${chapter.body.trim()?`\n\n${chapter.body.trim()}`:""}`;}
  function summarySourceLabel(mode){return mode===SUMMARY_SOURCE_REQUEST_RESPONSE?"真实请求 + 改写结果":mode===SUMMARY_SOURCE_LEGACY?"v1.3 旧累计摘要":mode===SUMMARY_SOURCE_ORIGINAL?"前置原文":mode===SUMMARY_SOURCE_MIXED?"前置原文 + 改写成果":"仅改写成果";}
  function summaryChapterContext(index,sourceMode,context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length)){
    if(sourceMode===SUMMARY_SOURCE_ORIGINAL||(sourceMode===SUMMARY_SOURCE_MIXED&&index<=context.originalPreludeSourceThrough))return originalChapterContext(index);
    const entry=state.chapterResults.get(index);if(!entry||!String(entry.content||"").trim())return"";const resultMode=sourceMode===SUMMARY_SOURCE_MIXED?context.sourceMode:sourceMode;
    if(resultMode===SUMMARY_SOURCE_REQUEST_RESPONSE){const prompt=String(entry.prompt||"").trim();if(!prompt)return"";return`【第 ${index+1} 章真实请求】\n${prompt}\n\n【第 ${index+1} 章最终回答】\n${String(entry.content).trim()}`;}
    return`【第 ${index+1} 章改写成果：${entry.title||state.chapterIndexes[index]?.title||"未命名章节"}】\n${String(entry.content).trim()}`;
  }
  function summaryBlockMessage(block){return`【增量摘要：第 ${block.fromChapterIndex+1}～${block.toChapterIndex+1} 章】\n${block.content}`;}
  function summaryBlockMessages(blocks=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length).blocks){return blocks.flatMap(block=>[{role:"user",content:summaryBlockMessage(block)},{role:"assistant",content:SUMMARY_CONTEXT_ACK}]);}
  function splitStoredHistory(history=state.conversationHistory){
    const context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),items=conversationHistoryAfterSummary(history,context.summarizedThrough,state.chapterIndexes.length),first=[],chapters=[];
    for(let index=0;index<items.length-1;index++){const user=items[index],assistant=items[index+1];if(user.role!=="user"||assistant.role!=="assistant")continue;(contextKeyChapterIndex(user.contextKey||"")<0?first:chapters).push({...user},{...assistant});index++;}
    return{first,chapters};
  }
  function rewrittenContextPrompt(chapterIndex,entry=null){
    const title=String(entry?.title||state.chapterIndexes[chapterIndex]?.title||`第 ${chapterIndex+1} 章`).trim();
    return`【第 ${chapterIndex+1} 章已确认改写成果：${title}】\n${REWRITTEN_CONTEXT_ACK}`;
  }
  function chapterHistoryMessages(history=state.conversationHistory,profile=null){
    const chapters=splitStoredHistory(history).chapters;if(!contextUsesRewrittenOnly(profile))return chapters.map(item=>({role:item.role,content:item.content}));const messages=[];
    for(let index=0;index<chapters.length-1;index++){const user=chapters[index],assistant=chapters[index+1],chapterIndex=contextKeyChapterIndex(user.contextKey||assistant.contextKey||"");if(chapterIndex<0||user.role!=="user"||assistant.role!=="assistant")continue;const entry=state.chapterResults.get(chapterIndex),content=String(entry?.content||assistant.content||"").trim();if(!content)continue;messages.push({role:"user",content:rewrittenContextPrompt(chapterIndex,entry)},{role:"assistant",content});index++;}
    return messages;
  }
  function rewriteStoredChapterPrompts(rewrittenOnly){
    const items=normalizeConversationHistory(state.conversationHistory,state.chapterIndexes.length),next=[];
    for(let index=0;index<items.length-1;index++){const user=items[index],assistant=items[index+1];if(user.role!=="user"||assistant.role!=="assistant")continue;const chapterIndex=contextKeyChapterIndex(user.contextKey||assistant.contextKey||"");if(chapterIndex<0){next.push({...user},{...assistant});index++;continue;}const entry=state.chapterResults.get(chapterIndex),prompt=rewrittenOnly?rewrittenContextPrompt(chapterIndex,entry):String(entry?.prompt||user.content);next.push({role:"user",content:prompt,contextKey:chapterContextKey(chapterIndex)},{role:"assistant",content:String(entry?.content||assistant.content),contextKey:chapterContextKey(chapterIndex)});index++;}
    state.conversationHistory=normalizeConversationHistory(next,state.chapterIndexes.length);
  }
  function hasOriginalPreludeWindow(context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length)){return context.originalPreludeFrom>=0&&context.originalPreludeTo>=context.originalPreludeFrom;}
  function shouldSendPrelude(currentIndex,profile=null){const context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);if(hasOriginalPreludeWindow(context))return contextPreludeCompressionEnabled(profile)&&currentIndex>=context.startChapterIndex;if(contextUsesRewrittenOnly(profile))return false;return context.startChapterIndex>0&&!context.preludeCompleted&&currentIndex>=context.startChapterIndex;}
  function preludeMessages(currentIndex,profile=null){
    if(!shouldSendPrelude(currentIndex,profile))return[];const context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),persistent=hasOriginalPreludeWindow(context),originals=[];
    const from=persistent?context.originalPreludeFrom:(context.blocks[0]?.fromChapterIndex===0?context.blocks.at(-1).toChapterIndex+1:0),to=persistent?context.originalPreludeTo:context.startChapterIndex-1;
    for(let index=from;index<=to;index++){const text=originalChapterContext(index);if(text)originals.push(text);}
    if(!originals.length)return[];return[{role:"user",content:`【${persistent?"固定":"一次性"}前置原文背景，仅供理解剧情，不要改写这些章节】\n\n${originals.join("\n\n---\n\n")}`},{role:"assistant",content:"已读取此前原文背景；当前只处理接下来单独发送的目标章节。"}];
  }
  function historyAfterSummary(targetIndex){return conversationHistoryAfterSummary(state.conversationHistory,targetIndex,state.chapterIndexes.length);}
  function summaryBlocksNeedRebuild(context,sourceMode,requirePureRewritten=false){const mode=normalizeSummarySourceMode(sourceMode),standard=context.blocks.filter(block=>block.sourceMode===SUMMARY_SOURCE_REWRITTEN||block.sourceMode===SUMMARY_SOURCE_REQUEST_RESPONSE);return !!standard.length&&(context.sourceMode!==mode||standard.some(block=>requirePureRewritten?block.sourceMode!==SUMMARY_SOURCE_REWRITTEN:block.sourceMode!==mode));}
  function updateContextSummaryStatus(){
    const element=$("#context-summary-status");if(!element)return;const settings=contextSummarySettings(),context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),characters=context.blocks.reduce((sum,block)=>sum+block.content.length,0),first=context.blocks[0],last=context.blocks.at(-1),coverage=first&&last?`摘要块覆盖第 ${first.fromChapterIndex+1}～${last.toChapterIndex+1} 章`:"尚无摘要块",warning=characters>SUMMARY_SIZE_WARNING_CHARS?" · 摘要较大，请留意模型上下文上限":"";
    if(context.needsRebuild){element.textContent=`总结来源已改变，现有 ${context.blocks.length} 个摘要块需要按当前方式重建后才能继续。`;element.className="muted cache-status error";return;}
    if(!settings.enabled){element.textContent=`增量摘要未启用 · ${context.blocks.length} 块 · ${characters.toLocaleString()} 字符${warning}。`;element.className="muted cache-status";return;}
    const start=context.startChapterIndex>=0?`上下文起点第 ${context.startChapterIndex+1} 章`:"首次发送章节时建立起点",next=context.nextSummaryAt>=0?`下一边界第 ${context.nextSummaryAt+1} 章前`:"下一请求时计算边界",prelude=hasOriginalPreludeWindow(context)?` · 固定原文第 ${context.originalPreludeFrom+1}～${context.originalPreludeTo+1} 章`:settings.preludeEnabled?" · 中途起章前置原文压缩已开启":"";
    element.textContent=`${coverage} · ${context.blocks.length} 块 / ${characters.toLocaleString()} 字符${warning} · ${start} · ${next} · 保留最近 ${settings.retain} 章${prelude}。`;element.className=`muted cache-status ${context.blocks.length?"ok":""}`;
  }
  function renderSummaryBlocks(){
    const container=$("#context-summary-blocks");if(!container)return;const context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),locked=mutationLocked()||state.modelsLoading||state.loadingApiConfig;container.replaceChildren();
    if(!context.blocks.length){const empty=document.createElement("p");empty.className="muted summary-empty";empty.textContent="尚无摘要块。";container.appendChild(empty);return;}
    context.blocks.forEach((block,index)=>{const card=document.createElement("section");card.className="summary-block";card.dataset.summaryBlockId=block.id;const header=document.createElement("div");header.className="summary-block-header";const info=document.createElement("div"),title=document.createElement("h3"),meta=document.createElement("p");title.className="summary-block-title";title.textContent=`摘要块 ${index+1} · 第 ${block.fromChapterIndex+1}～${block.toChapterIndex+1} 章`;meta.className="summary-block-meta";const timeText=block.createdAt?` · 生成 ${formatCacheTime(block.createdAt)}`:" · 由 v1.3 旧摘要迁移";const editText=block.manuallyEdited?` · 已手动修改${block.updatedAt?` ${formatCacheTime(block.updatedAt)}`:""}`:"";meta.textContent=`${summarySourceLabel(block.sourceMode)} · ${block.content.length.toLocaleString()} 字符${timeText}${editText}`;info.append(title,meta);header.appendChild(info);const area=document.createElement("textarea");area.className="summary-block-editor";area.value=block.content;area.disabled=locked;area.setAttribute("aria-label",`第 ${block.fromChapterIndex+1}～${block.toChapterIndex+1} 章摘要正文`);const actions=document.createElement("div");actions.className="button-row summary-block-actions";const save=document.createElement("button"),copy=document.createElement("button");save.type=copy.type="button";save.textContent="保存修改";copy.textContent="复制";save.disabled=copy.disabled=locked;save.addEventListener("click",()=>saveSummaryBlockEdit(block.id,area.value));copy.addEventListener("click",()=>copyText(area.value));actions.append(save,copy);card.append(header,area,actions);container.appendChild(card);});
  }
  function syncPreludeCompressionControls(value){const checked=value!==false;$("#context-prelude-compression-enabled").checked=checked;$("#batch-prelude-compression-enabled").checked=checked;}
  function syncContextSummaryControls(locked=false){
    const enabled=$("#context-summary-enabled").checked,includeContext=$("#include-context").checked,rewrittenOnly=$("#context-rewritten-only").checked,interval=normalizeContextSummaryInterval($("#context-summary-interval").value),retain=normalizeContextSummaryRetain($("#context-summary-retain").value,interval),context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);
    syncPreludeCompressionControls(state.settings.contextPreludeCompressionEnabled);$("#context-summary-interval").value=String(interval);$("#context-summary-retain").max=String(Math.max(0,interval-1));$("#context-summary-retain").value=String(retain);$("#context-summary-enabled").disabled=locked;$("#context-prelude-compression-enabled").disabled=locked||!includeContext;$("#batch-prelude-compression-enabled").disabled=locked||!includeContext||!state.fileBuffer;
    for(const selector of ["#context-summary-interval","#context-summary-retain","#context-summary-source-rewritten","#context-summary-source-request","#context-summary-prompt","#reset-context-summary-prompt"])$(selector).disabled=locked||!enabled;
    if(rewrittenOnly){$("#context-summary-source-rewritten").checked=true;$("#context-summary-source-request").disabled=true;$("#context-summary-source-request").title="历史上下文仅使用改写成果时，总结来源固定为仅改写成果";}else $("#context-summary-source-request").title="";
    $("#rebuild-context-summaries").disabled=locked||!context.blocks.length||(!enabled&&!context.needsRebuild);containerSummaryEditorsLocked(locked);updateContextSummaryStatus();
  }
  function containerSummaryEditorsLocked(locked){$("#context-summary-blocks")?.querySelectorAll("textarea,button").forEach(element=>element.disabled=locked);}
  async function saveSummaryBlockEdit(blockId,value){
    if(mutationLocked()||!requireActiveSave())return;const text=String(value||"").trim();if(!text)return toast("摘要正文不能为空");const previous=cloneContextCompression(),context=cloneContextCompression(),index=context.blocks.findIndex(block=>block.id===blockId);if(index<0)return toast("摘要块不存在");
    context.blocks[index]={...context.blocks[index],content:text,updatedAt:Date.now(),manuallyEdited:true};state.contextCompression=context;setSharedSaveBusy(true);
    try{const saved=await saveSessionNow();if(saved===false)throw new Error("摘要修改保存失败");if(saved===null){setRequestState("保存待确认","error");toast("摘要修改已保留在页面，保存结果待确认");return;}toast("摘要修改已保存");}
    catch(error){state.contextCompression=previous;setSharedSaveStatus(`摘要保存失败：${error.message||error}`,"error");toast("摘要修改保存失败");}
    finally{setSharedSaveBusy(false);renderSummaryBlocks();updateContextSummaryStatus();}
  }
  function summaryRequestContent(fromIndex,toIndex,sourceMode,context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length)){
    const chapters=[];for(let index=fromIndex;index<=toIndex;index++){const text=summaryChapterContext(index,sourceMode,context);if(text)chapters.push(text);}if(chapters.length!==toIndex-fromIndex+1)throw new Error(`第 ${fromIndex+1}～${toIndex+1} 章存在不可用内容，无法生成摘要块。`);
    return`【本次增量摘要范围：第 ${fromIndex+1}～${toIndex+1} 章】\n请只总结以下范围，不要重复已有摘要块。\n\n${chapters.join("\n\n=====\n\n")}`;
  }
  function summaryRangeReady(fromIndex,toIndex,sourceMode,context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length)){if(toIndex<fromIndex)return true;for(let index=fromIndex;index<=toIndex;index++)if(!summaryChapterContext(index,sourceMode,context))return false;return true;}
  async function waitForContextStep(options={}){const run=options.batch?state.batchRun:null;if(!run)return true;await waitForBatchResume(run);return !run.stopRequested;}
  async function generateSummaryBlock(fromIndex,toIndex,profile=null,options={},priorBlocks=null,blockSourceMode=null){
    if(!await waitForContextStep(options))return null;const settings=contextSummarySettings(profile),sourceMode=blockSourceMode||settings.sourceMode,context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),blocks=priorBlocks||context.blocks,messages=[{role:"system",content:settings.prompt},...summaryBlockMessages(blocks),{role:"user",content:summaryRequestContent(fromIndex,toIndex,sourceMode,context)}],summaryProfile={...(profile||captureRequestProfile()),systemPrompt:settings.prompt,includeContext:false};
    if(state.batchRun)updateBatchProgress(state.batchRun,`正在生成第 ${fromIndex+1}～${toIndex+1} 章${summarySourceLabel(sourceMode)}摘要块`);const result=await requestChatWithEmptyContentRetry(messages,`总结第 ${fromIndex+1}～${toIndex+1} 章`,summaryProfile);if(result===null)return null;const content=String(result.content||"").trim();if(!content){setRequestState("摘要为空","error");toast("摘要没有返回可保存的最终内容");return null;}const now=Date.now();return{id:summaryBlockId("",fromIndex,toIndex,now),fromChapterIndex:fromIndex,toChapterIndex:toIndex,sourceMode,content,createdAt:now,updatedAt:now,manuallyEdited:false};
  }
  async function appendSummaryBlock(fromIndex,toIndex,profile=null,options={},nextSummaryAt=null,blockSourceMode=null){
    const previousContext=cloneContextCompression(),previousHistory=state.conversationHistory.map(item=>({...item}));let block;
    try{block=await generateSummaryBlock(fromIndex,toIndex,profile,options,null,blockSourceMode);if(!block)return false;const context=cloneContextCompression();context.blocks=normalizeSummaryBlocks([...context.blocks,block],state.chapterIndexes.length);context.summarizedThrough=toIndex;context.nextSummaryAt=Number.isInteger(nextSummaryAt)?nextSummaryAt:context.nextSummaryAt;context.sourceMode=contextSummarySettings(profile).sourceMode;context.needsRebuild=false;if(context.originalPreludeTo>=0&&toIndex>=context.originalPreludeTo){context.originalPreludeFrom=-1;context.originalPreludeTo=-1;context.preludeCompleted=true;}state.contextCompression=normalizeContextCompression(context,state.chapterIndexes.length);state.conversationHistory=historyAfterSummary(toIndex);updateProgressStatus();renderSummaryBlocks();const saved=await saveSessionNow();if(saved===false)throw new Error("摘要块保存失败");if(saved===null){setRequestState("保存待确认","error");toast("摘要块已保留在页面，保存结果待确认；批量已停止");return null;}setRequestState("摘要块已保存","ok");return true;}
    catch(error){state.contextCompression=previousContext;state.conversationHistory=previousHistory;updateProgressStatus();renderSummaryBlocks();setRequestState("摘要保存失败","error");toast(error.message||"摘要块生成失败");return false;}
  }
  async function ensureContextReady(currentIndex,profile=null,options={}){
    const includeContext=profile?.includeContext??$("#include-context").checked;if(!includeContext)return true;const settings=contextSummarySettings(profile);let context=initializeContextCompression(currentIndex,settings);updateContextSummaryStatus();
    const incompatible=summaryBlocksNeedRebuild(context,settings.sourceMode,contextUsesRewrittenOnly(profile));
    if(incompatible){context.needsRebuild=true;state.contextCompression=context;updateContextSummaryStatus();scheduleSessionSave();toast("总结来源已改变，请先重建摘要块");return false;}
    if(!settings.enabled)return true;
    if(context.needsRebuild){context.needsRebuild=false;state.contextCompression=context;updateContextSummaryStatus();scheduleSessionSave();}
    if(context.originalBootstrapThrough>=0){let cursor=context.blocks.at(-1)?.toChapterIndex+1||0;while(cursor<=context.originalBootstrapThrough){const to=Math.min(context.originalBootstrapThrough,cursor+settings.interval-1);if(await appendSummaryBlock(cursor,to,profile,options,null,SUMMARY_SOURCE_ORIGINAL)!==true)return false;cursor=to+1;}context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);}
    const initialTarget=currentIndex-settings.retain-1,bootstrapPending=!context.blocks.length||context.nextSummaryAt<=context.summarizedThrough+1;
    if(!hasOriginalPreludeWindow(context)&&bootstrapPending&&currentIndex+1>settings.interval&&initialTarget>=context.summarizedThrough+1&&hasChapterResultRange(context.summarizedThrough+1,initialTarget)){
      let from=context.summarizedThrough+1;while(from<=initialTarget){const to=Math.min(initialTarget,from+settings.interval-1),isLast=to===initialTarget;if(await appendSummaryBlock(from,to,profile,options,isLast?currentIndex+settings.interval:null)!==true)return false;from=to+1;}context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);
    }
    if(context.nextSummaryAt<0){context.nextSummaryAt=context.startChapterIndex+settings.interval;state.contextCompression=context;}
    while(currentIndex>=state.contextCompression.nextSummaryAt){const current=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),next=current.nextSummaryAt,target=next-settings.retain-1,from=current.summarizedThrough+1;if(target>=from){let cursor=from;while(cursor<=target){const to=Math.min(target,cursor+settings.interval-1),isLast=to===target,blockMode=contextHasOriginalPreludeSource(current)&&cursor<=current.originalPreludeSourceThrough?SUMMARY_SOURCE_MIXED:settings.sourceMode;if(!summaryRangeReady(cursor,to,blockMode,current)){setRequestState("摘要范围不完整","error");toast(`第 ${cursor+1}～${to+1} 章存在不可用内容，批量已停在摘要边界`);return false;}if(await appendSummaryBlock(cursor,to,profile,options,isLast?next+settings.interval:null,blockMode)!==true)return false;cursor=to+1;}}else state.contextCompression.nextSummaryAt=next+settings.interval;}
    return waitForContextStep(options);
  }
  async function rebuildContextSummaries(){
    if(mutationLocked())return;collectSettings();const settings=contextSummarySettings(),previousContext=cloneContextCompression(),previousHistory=state.conversationHistory.map(item=>({...item})),specs=previousContext.blocks.map(block=>({from:block.fromChapterIndex,to:block.toChapterIndex,sourceMode:block.sourceMode}));if(!specs.length)return toast("当前没有可重建的摘要块");if(!specs.every(item=>summaryRangeReady(item.from,item.to,item.sourceMode,previousContext)))return toast("部分摘要范围缺少可用原文或改写结果，无法重建");if(!window.confirm(`将按每个摘要块原有来源重建 ${specs.length} 个摘要块。\n\n这会覆盖手动修改过的摘要正文，是否继续？`))return;if(!beginGeneratedOperation())return;
    try{const profile=captureRequestProfile(),rebuilt=[];for(const item of specs){const block=await generateSummaryBlock(item.from,item.to,profile,{},rebuilt,item.sourceMode);if(!block)throw new Error("摘要重建已停止");rebuilt.push(block);}const context=cloneContextCompression(previousContext);context.blocks=normalizeSummaryBlocks(rebuilt,state.chapterIndexes.length);context.summarizedThrough=context.blocks.at(-1)?.toChapterIndex??-1;context.sourceMode=settings.sourceMode;context.needsRebuild=false;state.contextCompression=normalizeContextCompression(context,state.chapterIndexes.length);state.conversationHistory=historyAfterSummary(state.contextCompression.summarizedThrough);renderSummaryBlocks();updateProgressStatus();const saved=await saveSessionNow();if(saved===false)throw new Error("重建结果保存失败");if(saved===null){setRequestState("保存待确认","error");toast("重建结果已保留在页面，保存状态待确认");return;}toast("摘要块已按原来源重建");}
    catch(error){state.contextCompression=previousContext;state.conversationHistory=previousHistory;renderSummaryBlocks();updateProgressStatus();toast(error.message||"摘要重建失败");}
    finally{endGeneratedOperation();}
  }

  function setBatchStatus(message,type=""){const element=$("#batch-status");element.textContent=message;element.className=`muted cache-status ${type}`;}
  function resetBatchRange(){
    const total=state.chapterIndexes.length,start=$("#batch-start-chapter"),end=$("#batch-end-chapter"),value=total?Math.min(state.currentIndex+1,total):1;
    start.min="1";start.max=String(Math.max(1,total));start.value=String(value);end.min="1";end.max=String(Math.max(1,total));end.value=String(Math.max(1,total));
    if(!total)setBatchStatus("导入或打开小说后可设置范围。");
    else if(!state.activeSaveId)setBatchStatus("请先将当前小说保存为本机存档，再开始批量处理。");
    else setBatchStatus(`已就绪：可处理第 ${value}–${total} 章。`);
    $("#batch-send-first").checked=!state.resultEntries.some(item=>item.type==="first");
    refreshBatchControls();
  }
  function refreshBatchControls(){
    const run=state.batchRun,active=batchLocked(),hasBook=!!state.fileBuffer&&state.chapterIndexes.length>0,busy=batchPreflightBusy(),configLocked=mutationLocked()||state.modelsLoading||state.loadingApiConfig;
    for(const selector of ["#batch-start-chapter","#batch-end-chapter","#batch-send-first","#batch-prelude-compression-enabled","#batch-existing-policy","#batch-use-current"]){$(selector).disabled=!hasBook||active||state.workspaceImporting;}
    $("#batch-start").disabled=!hasBook||!state.activeSaveId||active||busy;$("#batch-pause").disabled=!run;$("#batch-stop").disabled=!run;$("#batch-pause").textContent=run?.paused?"继续":"暂停";
    $("#send-first").disabled=!state.activeSaveId||mutationLocked()||state.modelsLoading||state.loadingApiConfig;$("#clear-context").disabled=mutationLocked();$("#chapter-preview").readOnly=mutationLocked();
    for(const selector of ["#base-url","#api-key","#model","#share-api-config","#system-prompt","#first-prompt","#include-context","#context-rewritten-only","#all-failure-retry-enabled","#empty-content-retry-enabled","#empty-content-retry-count","#missing-title-retry-enabled","#short-content-retry-enabled","#short-content-min-chars","#short-content-min-ratio","#auto-advance","#batch-size","#encoding","#title-repeat","#tail-prompt","#end-mark","#nav-prev","#nav-book","#nav-next","#enable-thinking"]){$(selector).disabled=configLocked;}
    syncContextSummaryControls(configLocked);$("#fetch-models").disabled=configLocked||state.loadingApiConfig;$("#empty-content-retry-enabled").disabled=configLocked||$("#all-failure-retry-enabled").checked;$("#short-content-min-chars").disabled=configLocked||!$("#short-content-retry-enabled").checked;$("#short-content-min-ratio").disabled=configLocked||!$("#short-content-retry-enabled").checked;renderPromptPresetControls();
    document.querySelectorAll("[data-param]").forEach(box=>{box.disabled=configLocked;const input=box.closest("label").querySelector("input:last-child");input.disabled=configLocked||!box.checked;});
    $("#enable-reasoning-params").disabled=configLocked;$("#enable-request-override").disabled=configLocked;
    if(configLocked){$("#reasoning-params-json").disabled=true;$("#request-override-fields").querySelectorAll("input, select, textarea").forEach(element=>element.disabled=true);}
    else syncAdvancedControls();
  }
  function setBatchRangeToCurrent(){if(!state.chapterIndexes.length||state.batchRun)return;$("#batch-start-chapter").value=String(state.currentIndex+1);$("#batch-end-chapter").value=String(state.chapterIndexes.length);}
  function updateBatchProgress(run,detail=""){
    const chapterDone=run.completed+run.skipped,firstDone=run.sendFirst&&run.firstCompleted?1:0,totalSteps=run.chapterTotal+(run.sendFirst?1:0),doneSteps=chapterDone+firstDone,characters=state.conversationHistory.reduce((sum,item)=>sum+String(item.content||"").length,0);
    $("#batch-progress").max=String(Math.max(1,totalSteps));$("#batch-progress").value=String(Math.min(doneSteps,totalSteps));
    const prefix=detail?`${detail} · `:"";setBatchStatus(`${prefix}章节 ${chapterDone}/${run.chapterTotal} · 成功 ${run.completed} · 跳过 ${run.skipped} · 上下文约 ${characters.toLocaleString()} 字符`,run.error?"error":run.finished?"ok":"");
  }
  async function waitForBatchResume(run){
    if(!run.paused||run.stopRequested)return;
    updateBatchProgress(run,"已暂停");
    await new Promise(resolve=>{run.resume=resolve;});
    run.resume=null;
  }
  function toggleBatchPause(){
    const run=state.batchRun;if(!run)return;
    run.paused=!run.paused;
    if(!run.paused){window.NovelMobile?.setWorkActive?.("batch",true);run.resume?.();updateBatchProgress(run,"继续处理中");}
    else{window.NovelMobile?.setWorkActive?.("batch",false);updateBatchProgress(run,state.requesting?"将在当前步骤完成后暂停":"已暂停");}
    refreshBatchControls();
  }
  function stopBatchRun(){
    const run=state.batchRun;if(!run)return;
    run.stopRequested=true;run.paused=false;run.resume?.();state.controller?.abort();updateBatchProgress(run,"正在停止");refreshBatchControls();
  }

  function batchInfo(){const size=Number(state.settings.batchSize)||10,total=state.chapterIndexes.length,count=Math.max(1,Math.ceil(total/size));state.currentBatch=Math.max(0,Math.min(state.currentBatch,count-1));return{size,total,count,start:state.currentBatch*size,end:Math.min((state.currentBatch+1)*size,total)};}
  function refreshChapters(forcePreview=true,rebuild=true){
    const info=batchInfo(),has=info.total>0,batch=$("#batch"),chapter=$("#chapter"),locked=mutationLocked()||state.modelsLoading||state.loadingApiConfig;
    if(rebuild){batch.innerHTML="";for(let i=0;i<info.count;i++){const option=new Option(`第 ${i+1}/${info.count} 批（${i*info.size+1}–${Math.min((i+1)*info.size,info.total)}章）`,i);batch.add(option);}}
    batch.disabled=!has||locked;batch.value=state.currentBatch;chapter.innerHTML="";
    for(let i=info.start;i<info.end;i++)chapter.add(new Option(`${i+1}. ${state.chapterIndexes[i].title}`,i));
    if(!has)chapter.add(new Option("请先导入 TXT",""));chapter.disabled=!has||locked;chapter.value=state.currentIndex;
    $("#prev-chapter").disabled=!has||locked||state.currentIndex<=0;$("#next-chapter").disabled=!has||locked||state.currentIndex>=info.total-1;
    $("#preview-prev-chapter").disabled=!has||locked||state.currentIndex<=0;$("#preview-next-chapter").disabled=!has||locked||state.currentIndex>=info.total-1;
    $("#prev-batch").disabled=!has||locked||state.currentBatch<=0;$("#next-batch").disabled=!has||locked||state.currentBatch>=info.count-1;
    $("#regenerate").disabled=!has||locked;$("#copy-prompt").disabled=!has||locked;$("#reroll-chapter").disabled=!has||locked||!state.activeSaveId;$("#send-chapter").disabled=!has||locked||!state.activeSaveId;
    const jumpInput=$("#chapter-jump-number");jumpInput.min="1";jumpInput.max=String(Math.max(1,info.total));if(document.activeElement!==jumpInput)jumpInput.value=String(has?state.currentIndex+1:1);jumpInput.disabled=!has||locked;$("#jump-to-chapter").disabled=!has||locked;$("#rollback-from-chapter").disabled=!has||locked||!state.activeSaveId;
    $("#chapter-position").textContent=has?`第 ${state.currentIndex+1} / ${info.total} 章 · 第 ${state.currentBatch+1} 批`:"未导入";
    if(forcePreview){$("#chapter-preview").value=buildChapter(getChapter(state.currentIndex));state.previewDirty=false;}
    refreshBatchControls();
  }
  function changeChapter(index){if(!state.chapterIndexes.length)return;state.currentIndex=Math.max(0,Math.min(index,state.chapterIndexes.length-1));const target=Math.floor(state.currentIndex/(Number(state.settings.batchSize)||10)),crossed=target!==state.currentBatch;state.currentBatch=target;if(crossed)state.chapterCache.clear();refreshChapters(true,crossed);scheduleSessionSave();}
  function changeBatch(index){const info=batchInfo();state.currentBatch=Math.max(0,Math.min(index,info.count-1));state.currentIndex=state.currentBatch*info.size;state.chapterCache.clear();refreshChapters(true,false);scheduleSessionSave();}
  function chapterJumpTarget(){const total=state.chapterIndexes.length,value=Math.floor(Number($("#chapter-jump-number").value));if(!total||!Number.isFinite(value)||value<1||value>total)return-1;return value-1;}
  function jumpToChapterNumber(){if(mutationLocked())return;const target=chapterJumpTarget();if(target<0)return toast(`请输入 1～${state.chapterIndexes.length||1} 的章节数字`);changeChapter(target);scrollToChapterInput();toast(`已跳转到第 ${target+1} 章`);}
  function firstConversationHistory(){return splitStoredHistory(state.conversationHistory).first.map(item=>({...item}));}
  function retainedChapterHistory(fromIndex,toIndex,rewrittenOnly){const pairs=[];for(let index=Math.max(0,fromIndex);index<=toIndex;index++){const entry=state.chapterResults.get(index),content=String(entry?.content||"").trim();if(!content)continue;const prompt=rewrittenOnly?rewrittenContextPrompt(index,entry):String(entry.prompt||"").trim();if(!prompt)continue;const key=chapterContextKey(index);pairs.push({role:"user",content:prompt,contextKey:key},{role:"assistant",content,contextKey:key});}return pairs;}
  async function rollbackFromChapter(){
    if(mutationLocked()||!state.activeSaveId)return;const target=chapterJumpTarget();if(target<0)return toast(`请输入 1～${state.chapterIndexes.length||1} 的章节数字`);
    const affectedResults=[...state.chapterResults.keys()].filter(index=>index>=target).length,context=cloneContextCompression(),affectedBlocks=context.blocks.filter(block=>block.toChapterIndex>=target).length;
    if(!window.confirm(`确定从第 ${target+1} 章重新开始？\n\n将删除第 ${target+1} 章及之后的 ${affectedResults} 个章节结果、对应连续上下文，并移除 ${affectedBlocks} 个受影响摘要块。首楼和更早章节保留。该操作无法撤销。`))return;
    if(!beginGeneratedOperation())return;const previous={generated:captureGeneratedState(),currentIndex:state.currentIndex,currentBatch:state.currentBatch,previewDirty:state.previewDirty,previewText:$("#chapter-preview").value};
    try{
      const first=firstConversationHistory(),keptResults=state.resultEntries.filter(item=>item.type==="first"||(item.type==="chapter"&&item.chapterIndex<target));state.resultEntries=normalizeResultEntries(keptResults,state.chapterIndexes.length);state.chapterResults=new Map(state.resultEntries.filter(item=>item.type==="chapter").map(item=>[item.chapterIndex,item]));
      const keptBlocks=normalizeSummaryBlocks(context.blocks.filter(block=>block.toChapterIndex<target),state.chapterIndexes.length),completed=[...state.chapterResults.keys()].filter(index=>index<target).sort((a,b)=>a-b),blockStart=keptBlocks[0]?.fromChapterIndex,start=context.startChapterIndex>=0&&(blockStart===0||blockStart===context.startChapterIndex)?context.startChapterIndex:(blockStart??completed[0]??Math.max(0,target)),settings=contextSummarySettings(),keepPrelude=context.originalPreludeTo>=0&&target>context.originalPreludeTo;
      const nextContext=settings.preludeEnabled&&target>0&&context.startChapterIndex>target?createPreludeContextForStart(target,settings,{...context,blocks:keptBlocks}):normalizeContextCompression({...emptyContextCompression(settings.sourceMode),startChapterIndex:start,summarizedThrough:keptBlocks.at(-1)?.toChapterIndex??start-1,nextSummaryAt:-1,sourceMode:settings.sourceMode,needsRebuild:summaryBlocksNeedRebuild({...context,blocks:keptBlocks},settings.sourceMode,contextUsesRewrittenOnly()),preludeCompleted:start===0||completed.length>0,originalBootstrapThrough:context.originalBootstrapThrough,originalPreludeSourceThrough:context.originalPreludeSourceThrough,originalPreludeFrom:keepPrelude?context.originalPreludeFrom:-1,originalPreludeTo:keepPrelude?context.originalPreludeTo:-1,blocks:keptBlocks},state.chapterIndexes.length);
      state.contextCompression=nextContext;state.conversationHistory=normalizeConversationHistory([...first,...retainedChapterHistory(nextContext.summarizedThrough+1,target-1,contextUsesRewrittenOnly())],state.chapterIndexes.length);
      const selected=state.resultEntries.at(-1)||null;state.viewedResult=canonicalViewedResultIndex(state.resultEntries,selected);state.currentIndex=target;state.currentBatch=Math.floor(target/(Number(state.settings.batchSize)||10));state.previewDirty=false;state.chapterCache.clear();closeAllResultsPreview();closeReadingMode();refreshChapters(true,true);restoreResultDisplay();renderSummaryBlocks();updateProgressStatus();
      const saved=await saveSessionNow();if(saved===false)throw new Error("回滚状态保存失败");if(saved===null){setRequestState("保存待确认","error");toast("回滚结果已保留在页面，保存状态待确认；请先导出完整 JSON 备份");return;}toast(`已回滚到第 ${target+1} 章，可从这里重新处理`);
    }catch(error){restoreGeneratedState(previous.generated);state.currentIndex=previous.currentIndex;state.currentBatch=previous.currentBatch;state.previewDirty=previous.previewDirty;refreshChapters(!previous.previewDirty,true);if(previous.previewDirty)$("#chapter-preview").value=previous.previewText;toast(`回滚失败：${error.message||error}`);}
    finally{endGeneratedOperation();}
  }
  function decodeFile(){if(!state.fileBuffer)return;try{const decoded=detectAndDecode(state.fileBuffer,$("#encoding").value),indexed=indexChapters(decoded.text);state.sourceText=indexed.text;state.chapterIndexes=indexed.indexes;state.chapterCache.clear();state.currentIndex=0;state.currentBatch=0;refreshChapters(true,true);resetBatchRange();updateProgressStatus();$("#file-meta").textContent=`${state.fileName} · ${ENCODING_LABELS[decoded.encoding]||decoded.encoding}${decoded.bom?"（BOM）":""} · 共 ${indexed.indexes.length} 章`;toast("小说解析完成");}catch(error){state.sourceText="";state.chapterIndexes=[];refreshChapters(true,true);resetBatchRange();$("#file-meta").textContent=`解码失败：${error.message||error}`;}}

  function isNativeApp(){return !!window.NovelMobile?.isNative?.();}
  function nativeStreamPlugin(){return globalThis.Capacitor?.Plugins?.NativeStream||null;}
  function hasNativeStreamPlugin(){const plugin=nativeStreamPlugin();return isNativeApp()&&!!plugin&&typeof plugin.start==="function"&&typeof plugin.cancel==="function"&&typeof plugin.addListener==="function";}
  function headers(apiKey=$("#api-key").value){const key=String(apiKey||"").trim(),result={"Content-Type":"application/json","Accept":!isNativeApp()||hasNativeStreamPlugin()?"application/json, text/event-stream":"application/json"};if(key)result.Authorization=`Bearer ${key}`;return result;}
  async function responseError(response){let detail="";try{const body=await response.json();detail=body?.error?.message||body?.message||JSON.stringify(body);}catch{try{detail=await response.text();}catch{}}return new Error(`HTTP ${response.status}${detail?`：${detail}`:""}`);}
  function optionalParameters(){const values={temperature:"#temperature",top_p:"#top-p",max_tokens:"#max-tokens",frequency_penalty:"#frequency-penalty",presence_penalty:"#presence-penalty"},result={};document.querySelectorAll("[data-param]").forEach(box=>{if(box.checked){const key=box.dataset.param,value=Number($(values[key]).value);if(Number.isFinite(value))result[key]=value;}});if($("#enable-thinking").checked)result.enable_thinking=true;return result;}
  function captureRequestProfile(){return Object.freeze({
    baseUrl:normalizeBaseUrl($("#base-url").value),apiKey:$("#api-key").value.trim(),model:$("#model").value,
    optional:Object.freeze({...optionalParameters()}),reasoningEnabled:$("#enable-reasoning-params").checked,reasoningJson:$("#reasoning-params-json").value,
    overrideEnabled:$("#enable-request-override").checked,path:$("#chat-request-path").value,method:$("#chat-request-method").value,
    headersJson:$("#request-headers-json").value,bodyJson:$("#request-body-json").value,systemPrompt:$("#system-prompt").value.trim(),includeContext:$("#include-context").checked,contextRewrittenOnly:$("#context-rewritten-only").checked,
    contextSummaryEnabled:$("#context-summary-enabled").checked,contextPreludeCompressionEnabled:$("#context-prelude-compression-enabled").checked,contextSummaryInterval:normalizeContextSummaryInterval($("#context-summary-interval").value),contextSummaryRetain:normalizeContextSummaryRetain($("#context-summary-retain").value,$("#context-summary-interval").value),contextSummarySourceMode:$("#context-rewritten-only").checked?SUMMARY_SOURCE_REWRITTEN:normalizeSummarySourceMode(document.querySelector('[name="context-summary-source"]:checked')?.value),contextSummaryPrompt:$("#context-summary-prompt").value,
    emptyContentRetryEnabled:$("#empty-content-retry-enabled").checked,emptyContentRetryCount:normalizeEmptyContentRetryCount($("#empty-content-retry-count").value),allFailureRetryEnabled:$("#all-failure-retry-enabled").checked,
    missingTitleRetryEnabled:$("#missing-title-retry-enabled").checked,shortContentRetryEnabled:$("#short-content-retry-enabled").checked,shortContentMinChars:normalizeShortContentMinChars($("#short-content-min-chars").value),shortContentMinRatio:normalizeShortContentMinRatio($("#short-content-min-ratio").value),
    webSearchEnabled:$("#web-search-enabled")?.checked===true
  });}
  function buildChatRequest(messages, profile=captureRequestProfile()) {
    const native=isNativeApp(),nativeStreaming=native&&hasNativeStreamPlugin();
    let body = { ...(profile.model ? { model:profile.model } : {}), messages, stream: !native||nativeStreaming, ...profile.optional };
    if (profile.reasoningEnabled) body = { ...body, ...parseJsonObject(profile.reasoningJson, "自定义思考 / 推理参数") };

    let url = endpoint("chat/completions",profile.baseUrl), method = "POST", requestHeaders = headers(profile.apiKey);
    if (profile.overrideEnabled) {
      method = String(profile.method||"").trim().toUpperCase();
      if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) throw new Error(`不支持 HTTP 方法“${method}”。`);
      url = requestEndpoint(profile.path,profile.baseUrl);
      requestHeaders = mergeRequestHeaders(requestHeaders, parseJsonObject(profile.headersJson, "请求头增补 / 覆盖 JSON"));
      body = { ...body, ...parseJsonObject(profile.bodyJson, "请求体最终覆盖 JSON") };
    }
    if(native&&!nativeStreaming)body.stream=false;

    const options = { method, headers: requestHeaders };
    if (method !== "GET") options.body = JSON.stringify(body);
    return { url, options };
  }
  function responsesWebSearchActive(profile){
    const enabled=profile&&profile.webSearchEnabled!==undefined?profile.webSearchEnabled:$("#web-search-enabled")?.checked===true;
    if(!enabled||(profile&&profile.overrideEnabled))return false;
    try{return new URL(normalizeBaseUrl(profile?.baseUrl||$("#base-url").value)).hostname.toLowerCase()==="api.deepseek.com";}
    catch{return false;}
  }
  function injectWebSearchGuidance(content,guidance){
    const text=String(content||""),block=`【联网搜索指引】\n${guidance}`;
    const tail=String(state.settings.tailPrompt||"").trim();
    if(tail){
      const idx=text.lastIndexOf(tail);
      if(idx>0)return `${text.slice(0,idx).trimEnd()}\n\n${block}\n\n${text.slice(idx)}`;
    }
    return `${text}\n\n${block}`;
  }
  function buildResponsesRequest(messages, profile){
    const systemParts=[],input=[];
    for(const item of messages){
      const role=item?.role==="assistant"?"assistant":"user";
      if(item?.role==="system")systemParts.push(String(item.content||""));
      else input.push({role,content:String(item.content||"")});
    }
    let body={ ...(profile.model?{model:profile.model}:{}), ...(systemParts.length?{instructions:systemParts.join("\n\n")}:{}), input, tools:[{type:"web_search"}], stream: !isNativeApp()||hasNativeStreamPlugin() };
    const optional={};for(const key of ["temperature","top_p"])if(profile.optional&&profile.optional[key]!==undefined)optional[key]=profile.optional[key];
    body={...body,...optional};
    if(isNativeApp()&&!hasNativeStreamPlugin())body.stream=false;
    return { url:endpoint("responses",profile.baseUrl), options:{method:"POST",headers:headers(profile.apiKey),body:JSON.stringify(body)} };
  }
  function responsesUsage(value){
    if(!isPlainObject(value))return null;
    const usage={};
    if(typeof value.input_tokens==="number")usage.prompt_tokens=value.input_tokens;
    if(typeof value.output_tokens==="number")usage.completion_tokens=value.output_tokens;
    if(typeof value.total_tokens==="number")usage.total_tokens=value.total_tokens;
    else if(typeof usage.prompt_tokens==="number"&&typeof usage.completion_tokens==="number")usage.total_tokens=usage.prompt_tokens+usage.completion_tokens;
    return Object.keys(usage).length?usage:null;
  }
  function extractResponsesParts(json){
    let content="",reasoning="";
    const output=Array.isArray(json?.output)?json.output:[];
    for(const item of output){
      const parts=Array.isArray(item?.content)?item.content:[];
      for(const part of parts){
        const text=String(part?.text??"");if(!text)continue;
        if(String(part?.type||"")==="reasoning_text"||item?.type==="reasoning")reasoning+=text;else content+=text;
      }
    }
    return{content,reasoning};
  }
  function consumeResponsesSSEEvent(event,sse,onPart){
    const normalized=String(event||"").replace(/\r\n?/g,"\n");
    const data=normalized.split("\n").filter(line=>line.startsWith("data:")).map(line=>line.slice(5).trimStart()).join("\n").trim();
    if(!data)return;
    let json;try{json=JSON.parse(data);}catch(error){throw new Error(`流式响应包含无效 JSON：${error.message||error}`);}
    const type=String(json?.type||"");
    if(type==="response.output_text.delta"){const delta=String(json?.delta??"");if(delta)onPart({content:delta});return;}
    if(type.includes("reasoning")&&type.endsWith(".delta")){const delta=String(json?.delta??"");if(delta)onPart({reasoning:delta});return;}
    if(type==="response.completed"){sse.terminal=true;const usage=responsesUsage(json?.response?.usage);if(usage)sse.usage=usage;return;}
    if(type==="response.incomplete"){
      const detail=json?.response?.incomplete_details?.reason||json?.response?.error?.message||"服务端未完整生成回答";
      throw new Error(`联网搜索响应未完整结束：${detail}`);
    }
    if(type==="response.failed"||type==="error"||type==="response.error"){
      const detail=json?.response?.error?.message||json?.error?.message||json?.message||data;
      throw new Error(`联网搜索请求失败：${detail}`);
    }
  }
  function controlledPromise(promise,controller,timeoutMs,timeoutMessage){
    return new Promise((resolve,reject)=>{
      let settled=false,timer=null;
      const finish=(callback,value)=>{if(settled)return;settled=true;if(timer)clearTimeout(timer);controller.signal.removeEventListener("abort",onAbort);callback(value);};
      const onAbort=()=>finish(reject,new DOMException("请求已取消","AbortError"));
      controller.signal.addEventListener("abort",onAbort,{once:true});
      if(controller.signal.aborted)return onAbort();
      if(timeoutMs>0)timer=setTimeout(()=>{const error=new Error(timeoutMessage||"请求超时。");error.name="TimeoutError";finish(reject,error);controller.abort();},timeoutMs);
      Promise.resolve(promise).then(value=>finish(resolve,value),error=>finish(reject,error));
    });
  }
  function controlledFetch(url,options,controller,timeoutMs,timeoutMessage){
    const request=fetch(url,{...options,...(isNativeApp()?{}:{signal:controller.signal})});
    return controlledPromise(request,controller,timeoutMs,timeoutMessage);
  }
  async function fetchModels(){
    if(state.modelsLoading||mutationLocked())return;
    const baseUrl=normalizeBaseUrl($("#base-url").value),apiKey=$("#api-key").value,wanted=$("#model").value||state.settings.model,controller=new AbortController();
    state.modelsLoading=true;refreshOperationControls();setApiStatus("正在拉取模型…");
    try{
      if(!baseUrl)throw new Error("请填写 Base URL。");
      const response=await controlledFetch(endpoint("models",baseUrl),{headers:headers(apiKey)},controller,30000,"拉取模型超过 30 秒，已停止等待。");if(!response.ok)throw await responseError(response);
      const json=await response.json(),models=Array.isArray(json.data)?json.data:(Array.isArray(json)?json:[]);models.sort((a,b)=>String(a.id||a).localeCompare(String(b.id||b)));if(!models.length)throw new Error("接口没有返回模型列表。");
      const select=$("#model");select.innerHTML="";for(const item of models){const id=String(item.id||item);select.add(new Option(id,id));}if([...select.options].some(option=>option.value===wanted))select.value=wanted;
      state.settings.model=select.value;saveSettings();scheduleSharedApiConfigSave(0);setApiStatus(`已拉取 ${models.length} 个模型。`,"ok");
    }catch(error){setApiStatus(`${error.message||error} 请检查 API 地址、Key、手机网络和服务商兼容性。`,"error");}
    finally{state.modelsLoading=false;refreshOperationControls();}
  }
  function extractParts(json){const choice=json?.choices?.[0],message=choice?.delta??choice?.message??choice??{};return{content:message.content??choice?.text??"",reasoning:message.reasoning_content??message.reasoning??choice?.reasoning_content??choice?.reasoning??""};}
  function consumeSSEEvent(event,state,onPart){
    const normalized=String(event||"").replace(/\r\n?/g,"\n"),data=normalized.split("\n").filter(line=>line.startsWith("data:")).map(line=>line.slice(5).trimStart()).join("\n").trim();if(!data)return;
    if(data==="[DONE]"){state.terminal=true;state.doneMarker=true;return;}
    let json;try{json=JSON.parse(data);}catch(error){throw new Error(`流式响应包含无效 JSON：${error.message||error}`);}
    if(json.usage)state.usage=json.usage;const parts=extractParts(json);if(parts.content||parts.reasoning)onPart(parts);
    if(Array.isArray(json?.choices)&&json.choices.some(choice=>choice?.finish_reason!==null&&choice?.finish_reason!==undefined&&choice?.finish_reason!==""))state.terminal=true;
  }
  function createSSEAccumulator(onPart, format="chat"){
    const state={usage:null,terminal:false,doneMarker:false};let buffer="";
    const consume=format==="responses"?consumeResponsesSSEEvent:consumeSSEEvent;
    const drain=()=>{let match;while((match=/(?:\r\n|\r|\n){2}/.exec(buffer))){const event=buffer.slice(0,match.index);buffer=buffer.slice(match.index+match[0].length);consume(event,state,onPart);}return state.doneMarker;};
    return{
      push(chunk){buffer+=String(chunk||"");return drain();},
      finish(){drain();if(buffer.trim())consume(buffer,state,onPart);buffer="";if(!state.terminal)throw new Error("流式响应在完成标记前中断，未保存本次部分结果。");return state.usage;},
      get doneMarker(){return state.doneMarker;}
    };
  }
  async function consumeSSE(response,onPart,format="chat"){
    const reader=response.body.getReader(),decoder=new TextDecoder(),accumulator=createSSEAccumulator(onPart,format);
    while(true){const{done,value}=await reader.read();if(done)break;if(accumulator.push(decoder.decode(value,{stream:true}))){try{await reader.cancel();}catch{}break;}}
    accumulator.push(decoder.decode());return accumulator.finish();
  }
  const nativeStreamPending=new Map();let nativeStreamListenerReady=null;
  async function ensureNativeStreamListener(){
    if(!hasNativeStreamPlugin())throw new Error("Android 原生流式插件未加载，请重新安装最新版 APK。");
    if(!nativeStreamListenerReady){
      const plugin=nativeStreamPlugin();
      nativeStreamListenerReady=Promise.resolve(plugin.addListener("streamEvent",event=>{const pending=nativeStreamPending.get(String(event?.requestId||""));if(pending)pending(event);})).catch(error=>{nativeStreamListenerReady=null;throw error;});
    }
    await nativeStreamListenerReady;
  }
  function nativeHttpError(event){
    const status=Number(event?.status)||0,raw=String(event?.body||event?.message||"").trim();let detail=raw;
    try{const body=JSON.parse(raw);detail=body?.error?.message||body?.message||raw;}catch{}
    return new Error(`${status?`HTTP ${status}`:"原生流式请求失败"}${detail?`：${detail}`:""}`);
  }
  async function requestNativeStream(request,controller,onPart,format="chat"){
    await ensureNativeStreamListener();
    const plugin=nativeStreamPlugin(),requestId=crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return new Promise((resolve,reject)=>{
      let settled=false,timer=null,mode="",contentType="",raw="";const accumulator=createSSEAccumulator(onPart,format);
      const cancelNative=()=>Promise.resolve(plugin.cancel({requestId})).catch(()=>{});
      const cleanup=()=>{if(timer)clearTimeout(timer);controller.signal.removeEventListener("abort",onAbort);nativeStreamPending.delete(requestId);};
      const finish=(callback,value,cancel=false)=>{if(settled)return;settled=true;cleanup();if(cancel)cancelNative();callback(value);};
      const fail=(error,cancel=true)=>finish(reject,error,cancel);
      const resetIdleTimer=()=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>{const error=new Error("模型连续 5 分钟没有返回新数据，已停止等待；本次结果不会保存。");error.name="TimeoutError";fail(error,true);},MODEL_STREAM_IDLE_TIMEOUT_MS);};
      const finishSSE=()=>{try{finish(resolve,accumulator.finish(),true);}catch(error){fail(error,true);}};
      const feed=chunk=>{
        resetIdleTimer();const text=String(chunk||"");
        if(mode==="sse"){if(accumulator.push(text))finishSSE();return;}
        if(mode==="json"){raw+=text;return;}
        raw+=text;const sample=raw.trimStart();
        if(contentType.includes("text/event-stream")||sample.startsWith("data:")||sample.startsWith(":")){mode="sse";const pending=raw;raw="";if(accumulator.push(pending))finishSSE();}
        else if(contentType.includes("json")||sample.startsWith("{")||sample.startsWith("[")){mode="json";}
      };
      const finishJson=()=>{try{const json=JSON.parse(raw.trim());if(format==="responses"){const parts=extractResponsesParts(json);if(parts.content||parts.reasoning)onPart(parts);finish(resolve,responsesUsage(json?.usage),false);}else{const parts=extractParts(json);if(parts.content||parts.reasoning)onPart(parts);finish(resolve,json.usage||null,false);}}catch(error){fail(new Error(`接口返回的完整 JSON 无效：${error.message||error}`),true);}};
      const onEvent=event=>{
        if(settled)return;
        try{
          if(event?.type==="headers"){resetIdleTimer();contentType=String(event.contentType||"").toLowerCase();if(contentType.includes("text/event-stream"))mode="sse";return;}
          if(event?.type==="chunk"){feed(event.data);return;}
          if(event?.type==="complete"){
            if(mode==="sse"||(!mode&&/^\s*(?:data:|:)/.test(raw))){if(!mode){mode="sse";const pending=raw;raw="";accumulator.push(pending);}finishSSE();}
            else finishJson();
            return;
          }
          if(event?.type==="cancelled"){fail(new DOMException("请求已取消","AbortError"),false);return;}
          if(event?.type==="error"){fail(nativeHttpError(event),false);}
        }catch(error){fail(error,true);}
      };
      const onAbort=()=>fail(new DOMException("请求已取消","AbortError"),true);
      nativeStreamPending.set(requestId,onEvent);controller.signal.addEventListener("abort",onAbort,{once:true});
      if(controller.signal.aborted){onAbort();return;}
      resetIdleTimer();
      Promise.resolve(plugin.start({requestId,url:request.url,method:request.options.method||"POST",headers:request.options.headers||{},body:request.options.body||"",connectTimeout:30000,readTimeout:300000})).catch(error=>fail(error,true));
    });
  }
  function renderResponse(content,reasoning,follow=false){$("#output").textContent=content;$("#reasoning-output").textContent=reasoning;$("#reasoning-box").hidden=!reasoning;$("#reasoning-size").textContent=reasoning?`· ${reasoning.length} 字符`:"";if(follow&&$("#auto-scroll").checked){const container=$("#output").closest(".response-content");container.scrollTop=container.scrollHeight;}}
  let responsesFallbackNoted=false;
  async function requestChat(messages,label,profile=null,options={}){
    state.lastRequestFailure=null;
    if(state.requesting)return null;
    const requestProfile=profile||captureRequestProfile(),baseUrl=requestProfile.baseUrl,overrideEnabled=requestProfile.overrideEnabled;
    const overrideTarget=overrideEnabled?String(requestProfile.path||"").trim():"",hasAbsoluteOverride=/^https?:\/\//i.test(overrideTarget);
    if(!baseUrl&&!hasAbsoluteOverride){state.lastRequestFailure={retryable:false,code:"CONFIG"};renderResponse("发送失败：请填写 Base URL；若使用专家覆盖，也可填写完整的 HTTP(S) 聊天 URL。","");setRequestState("配置不完整","error");toast("请填写 API 地址");return null;}
    if(!requestProfile.model&&!overrideEnabled){state.lastRequestFailure={retryable:false,code:"CONFIG"};renderResponse("发送失败：尚未选择模型。请先点击“拉取模型”，或启用专家请求覆盖并按目标接口配置请求体。","");setRequestState("未选择模型","error");toast("请先选择模型或配置请求覆盖");return null;}
    if(!Array.isArray(messages)||!messages.some(item=>String(item?.content||"").trim())){state.lastRequestFailure={retryable:false,code:"CONFIG"};renderResponse("发送失败：请求消息为空。","");setRequestState("内容为空","error");toast("请求内容为空");return null;}

    const useResponses=!!options.webSearch&&responsesWebSearchActive(requestProfile);
    const liveRead=!!options.ttsLive&&state.settings.ttsLiveEnabled===true&&ttsConfigReady();
    let request,format="chat";
    try { request = useResponses?buildResponsesRequest(messages, requestProfile):buildChatRequest(messages, requestProfile); format=useResponses?"responses":"chat"; }
    catch (error) {
      state.lastRequestFailure={retryable:false,code:"CONFIG"};renderResponse(`请求配置错误：${error.message || error}`, "");
      setRequestState("配置错误", "error");
      toast("请检查高级请求配置");
      return null;
    }

    const controller=new AbortController();state.controller=controller;state.requesting=true;window.NovelMobile?.setWorkActive?.("request",true);refreshOperationControls();$("#stop").disabled=false;stopTtsPlayback();if(liveRead)beginTtsLiveSession();renderResponse("","");$("#copy-output").disabled=true;$("#usage").textContent="";setRequestState(useResponses?`正在${label}（联网搜索）…`:`正在${label}…`,"running");
    let full="",reasoning="";
    try{
      const onPart=parts=>{if(controller.signal.aborted)throw new DOMException("请求已取消","AbortError");full+=String(parts.content||"");reasoning+=String(parts.reasoning||"");renderResponse(full,reasoning,true);if(liveRead)feedTtsLive(String(parts.content||""));};
      const sendOnce=async()=>{
        if(isNativeApp()&&hasNativeStreamPlugin())return await requestNativeStream(request,controller,onPart,format);
        const response=await controlledFetch(request.url,request.options,controller,300000,"模型请求超过 5 分钟，已停止等待；本次结果不会保存。");
        if(controller.signal.aborted)throw new DOMException("请求已取消","AbortError");
        if(!response.ok)throw await responseError(response);
        const contentType=response.headers.get("content-type")||"";
        if(contentType.includes("text/event-stream"))return await consumeSSE(response,onPart,format);
        const json=await response.json();
        if(controller.signal.aborted)throw new DOMException("请求已取消","AbortError");
        const parts=format==="responses"?extractResponsesParts(json):extractParts(json);
        onPart(parts);
        return format==="responses"?(responsesUsage(json?.usage)||json?.usage||null):(json.usage||null);
      };
      let usage=null;
      try{usage=await sendOnce();}
      catch(error){
        if(format==="responses"&&/HTTP 4\d\d/.test(String(error?.message||error))){
          if(!responsesFallbackNoted){responsesFallbackNoted=true;toast("联网搜索端点不可用，已自动按普通请求发送");}
          $("#usage").textContent="当前接口不支持 /responses 联网搜索，本次已退回普通请求。";
          format="chat";request=buildChatRequest(messages,requestProfile);
          usage=await sendOnce();
        }else throw error;
      }
      if(controller.signal.aborted)throw new DOMException("请求已取消","AbortError");
      if(!full)$("#output").textContent=reasoning?"模型只返回了思考内容，没有返回最终回答。":"接口已完成请求，但没有返回文本内容。";
      $("#copy-output").disabled=!full;
      if(usage)$("#usage").textContent=`Token：输入 ${usage.prompt_tokens??"-"} · 输出 ${usage.completion_tokens??"-"} · 合计 ${usage.total_tokens??"-"}${reasoning?` · 思考 ${reasoning.length} 字符`:""}`;
      if(liveRead)finishTtsLive();
      setRequestState("请求完成","ok");return{content:full,reasoning,usage};
    }catch(error){
      stopTtsPlayback();
      if(error.name==="AbortError"){state.lastRequestFailure={retryable:false,code:"ABORT"};setRequestState("已停止","neutral");$("#usage").textContent="生成已由用户停止，本次迟到响应不会保存。";}
      else{state.lastRequestFailure={retryable:true,code:"REQUEST",error};setRequestState("请求失败","error");renderResponse(`请求失败：${error.message||error}\n\n请检查 API 地址、Key、模型、手机网络和接口兼容性。`,"");}
      return null;
    }finally{state.requesting=false;if(state.controller===controller)state.controller=null;$("#stop").disabled=true;window.NovelMobile?.setWorkActive?.("request",false);refreshOperationControls();}
  }
  function qualityOutputParts(content,expectedTitle){
    const tags=DEFAULT_EXPORT_WRAPPER_TAGS.split(/,\s*/).map(escapeRegExp).join("|"),wrapper=new RegExp(`<\\s*\\/?\\s*(?:${tags})\\b[^>]*>`,"gi"),lines=normalizeText(content).replace(wrapper,"").split("\n");while(lines.length&&!lines[0].trim())lines.shift();while(lines.length&&!lines.at(-1).trim())lines.pop();
    const first=exportTitleText(lines[0]||""),hasTitle=!!first&&(normalizeTitle(first)===normalizeTitle(expectedTitle)||isChapterTitle(first));if(hasTitle)lines.shift();const body=lines.join("\n").trim(),bodyChars=body.replace(/[\s　#*_`>~-]+/g,"").length;return{hasTitle,body,bodyChars};
  }
  function chapterQualityFailure(result,chapterIndex,title,profile){
    const content=String(result?.content||"").trim(),parts=qualityOutputParts(content,title),chapter=getChapter(chapterIndex),originalChars=String(chapter?.body||"").replace(/[\s　]+/g,"").length,minChars=normalizeShortContentMinChars(profile?.shortContentMinChars),ratio=normalizeShortContentMinRatio(profile?.shortContentMinRatio),required=Math.max(minChars,Math.ceil(originalChars*ratio/100)),reasons=[],requirements=[];
    if(profile?.missingTitleRetryEnabled!==false&&!parts.hasTitle){reasons.push("缺少章节标题");requirements.push(`第一行必须完整输出章节标题“${title}”`);}
    if(profile?.shortContentRetryEnabled!==false&&parts.bodyChars<required){reasons.push(`正文仅 ${parts.bodyChars} 字，低于最低要求 ${required} 字`);requirements.push(`请完整输出本章正文，正文不得少于 ${required} 字，不要概括、省略或中途截断`);}
    if(!reasons.length)return null;return{message:reasons.join("；"),correction:`【上次输出质量检查未通过】\n${requirements.map((item,index)=>`${index+1}. ${item}`).join("\n")}\n请从头重新生成，只输出章节标题和完整正文，不要解释。`};
  }
  function messagesWithQualityCorrection(messages,failure){const next=messages.map(item=>({...item})),last=next.at(-1);if(last?.role==="user")last.content=`${last.content}\n\n${failure.correction}`;return next;}
  async function requestChatWithEmptyContentRetry(messages,label,profile=null,qualityCheck=null,options={}){
    const requestProfile=profile||captureRequestProfile(),allFailures=requestProfile.allFailureRetryEnabled===true,reasoningOnly=!allFailures&&requestProfile.emptyContentRetryEnabled!==false,maxRetries=normalizeEmptyContentRetryCount(requestProfile.emptyContentRetryCount);let retry=0,attemptMessages=messages;
    while(true){
      if(state.batchRun?.stopRequested)return null;
      const attemptLabel=retry?`${label}（自动重试 ${retry}/${maxRetries}）`:label,result=await requestChat(attemptMessages,attemptLabel,requestProfile,options);
      if(result===null){
        const failure=state.lastRequestFailure;if(!allFailures||!failure?.retryable||retry>=maxRetries)return null;
        retry++;setRequestState(`准备通用失败重试 ${retry}/${maxRetries}`,"running");$("#usage").textContent=`模型请求失败；正在自动重试 ${retry}/${maxRetries}。失败尝试不会保存。`;await new Promise(resolve=>setTimeout(resolve,120));continue;
      }
      const content=String(result.content||"").trim(),reasoning=String(result.reasoning||"").trim(),qualityFailure=typeof qualityCheck==="function"?qualityCheck(result):null;
      if(content&&!qualityFailure)return result;
      if(qualityFailure){
        if(retry>=maxRetries){setRequestState("质量重试已用尽","error");$("#usage").textContent=`质量检查未通过：${qualityFailure.message}。本次结果未保存。`;toast("章节质量重试已用尽，批量已停在当前章");return null;}
        retry++;attemptMessages=messagesWithQualityCorrection(messages,qualityFailure);setRequestState(`准备章节质量重试 ${retry}/${maxRetries}`,"running");$("#usage").textContent=`质量检查未通过：${qualityFailure.message}；正在自动重试 ${retry}/${maxRetries}。失败尝试不会保存。`;await new Promise(resolve=>setTimeout(resolve,120));continue;
      }
      const shouldRetryEmpty=allFailures||(reasoningOnly&&!!reasoning);
      if(!shouldRetryEmpty)return result;
      if(retry>=maxRetries){setRequestState(allFailures?"自动重试已用尽":"空正文重试已用尽","error");toast(allFailures?`模型请求自动重试已用尽：${maxRetries} 次额外重试`:`只有思维链、没有正文；已完成 ${maxRetries} 次额外重试`);return result;}
      retry++;setRequestState(`准备${allFailures?"通用失败":"空正文"}重试 ${retry}/${maxRetries}`,"running");$("#usage").textContent=`${allFailures?"本次没有返回有效正文":"上一次只有思维链、没有正文"}；正在自动重试 ${retry}/${maxRetries}。失败尝试不会保存。`;await new Promise(resolve=>setTimeout(resolve,120));
    }
  }
  function makeMessages(current,history=state.conversationHistory,profile=null,currentChapterIndex=-1,contextView=null){const messages=[],system=profile?profile.systemPrompt:$("#system-prompt").value.trim(),includeContext=profile?profile.includeContext:$("#include-context").checked;if(system)messages.push({role:"system",content:system});if(includeContext){if(contextView){messages.push(...contextView.first);messages.push(...summaryBlockMessages(contextView.blocks));messages.push(...(contextView.prelude||[]));messages.push(...contextView.chapters);}else{const stored=splitStoredHistory(history);messages.push(...stored.first.map(item=>({role:item.role,content:item.content})));messages.push(...summaryBlockMessages());if(currentChapterIndex>=0)messages.push(...preludeMessages(currentChapterIndex,profile));messages.push(...chapterHistoryMessages(history,profile));}}messages.push({role:"user",content:current});return messages;}
  function usageText(usage,reasoning=""){return usage?`Token：输入 ${usage.prompt_tokens??"-"} · 输出 ${usage.completion_tokens??"-"} · 合计 ${usage.total_tokens??"-"}${reasoning?` · 思考 ${reasoning.length} 字符`:""}`:"";}
  function displayedChapterResult(){const item=state.viewedResult>=0?state.resultEntries[state.viewedResult]:null;return item?.type==="chapter"?item:null;}

  function readingModeEntry(){const index=Number.isInteger(state.readingChapterIndex)?state.readingChapterIndex:-1;return index>=0?state.chapterResults.get(index)||null:null;}
  function refreshReadingControls(){
    const dialog=$("#reading-mode-dialog");if(!dialog)return;const total=state.chapterIndexes.length,index=Math.max(0,Math.min(Number(state.readingChapterIndex)||0,Math.max(0,total-1))),entry=state.chapterResults.get(index)||null,locked=mutationLocked();state.readingChapterIndex=total?index:-1;

    $("#reading-mode-title").textContent=entry?.title||state.chapterIndexes[index]?.title||"阅读模式";$("#reading-mode-status").textContent=total?`第 ${index+1}/${total} 章${entry?" · 已保存结果":" · 暂无已保存结果"}`:"暂无章节结果";$("#reading-mode-jump-number").min="1";$("#reading-mode-jump-number").max=String(Math.max(1,total));$("#reading-mode-jump-number").value=String(total?index+1:1);
    $("#reading-mode-content").textContent=entry?.content||"当前章节暂无已保存结果。可以退出阅读模式后处理本章。";const processTarget=entry?index+1:index,saveMissing=!state.activeSaveId;$("#reading-mode-prev-chapter").disabled=locked||!total||index<=0;$("#reading-mode-next-chapter").disabled=locked||!total||index>=total-1;$("#reading-mode-reroll").disabled=locked||saveMissing||!entry;$("#reading-mode-reroll").textContent=entry?`重 roll 第 ${index+1} 章`:"重 roll 当前章节";$("#reading-mode-process-next").disabled=locked||saveMissing||!total||processTarget>=total;$("#reading-mode-process-next").textContent=processTarget<total?`处理第 ${processTarget+1} 章`:"已到最后一章";refreshTtsControls();
  }
  function openReadingMode(){if(mutationLocked()||!state.chapterIndexes.length)return;const item=displayedChapterResult();state.readingChapterIndex=item?.chapterIndex??state.currentIndex;refreshReadingControls();const dialog=$("#reading-mode-dialog");if(!dialog.open)dialog.showModal();}
  function closeReadingMode(){const dialog=$("#reading-mode-dialog");if(dialog?.open)dialog.close();state.readingChapterIndex=-1;stopTtsPlayback();}
  function changeReadingChapter(index){if(mutationLocked()||!state.chapterIndexes.length)return;stopTtsPlayback();state.readingChapterIndex=Math.max(0,Math.min(Math.floor(Number(index)||0),state.chapterIndexes.length-1));refreshReadingControls();$("#reading-mode-content").scrollTop=0;}
  function jumpReadingChapter(){const value=Math.floor(Number($("#reading-mode-jump-number").value));if(!Number.isFinite(value)||value<1||value>state.chapterIndexes.length)return toast(`请输入 1～${state.chapterIndexes.length} 的章节数字`);changeReadingChapter(value-1);}
  async function rerollReadingChapter(){if(mutationLocked())return;const entry=readingModeEntry();if(!entry)return toast("当前章节没有已保存结果，不能重 roll");const index=entry.chapterIndex,prompt=String(entry.prompt||buildChapter(getChapter(index)));await processCurrentChapter(true,{chapterIndex:index,prompt});state.readingChapterIndex=index;refreshReadingControls();}
  async function processReadingNext(){if(mutationLocked()||!state.chapterIndexes.length)return;const index=state.readingChapterIndex,entry=readingModeEntry(),target=entry?entry.chapterIndex+1:index;if(target>=state.chapterIndexes.length)return toast("当前已经是最后一章");await processCurrentChapter(false,{chapterIndex:target});state.readingChapterIndex=target;refreshReadingControls();}

  function refreshBottomChapterActions(){
    const item=displayedChapterResult(),locked=mutationLocked()||!state.activeSaveId,hasNext=!!item&&item.chapterIndex<state.chapterIndexes.length-1,reroll=$("#bottom-reroll-chapter"),next=$("#bottom-process-next"),back=$("#bottom-back-to-input");
    reroll.disabled=locked||!item;next.disabled=locked||!hasNext;back.disabled=state.workspaceImporting;
    reroll.textContent=item?`重 roll 第 ${item.chapterIndex+1} 章`:"重 roll 当前章节";next.textContent=hasNext?`处理第 ${item.chapterIndex+2} 章`:"处理下一章节";
    reroll.title=item?`重新处理第 ${item.chapterIndex+1} 章，并替换该章旧结果`:"请先显示一条章节改写结果";
    next.title=hasNext?`直接处理第 ${item.chapterIndex+2} 章`:item?"当前已经是最后一章":"请先显示一条章节改写结果";
  }
  function refreshResultNavigation(){const count=state.resultEntries.length,locked=mutationLocked();$("#prev-result").disabled=locked||state.viewedResult<=0;$("#next-result").disabled=locked||state.viewedResult<0||state.viewedResult>=count-1;$("#reading-mode").disabled=locked||!state.chapterIndexes.length;updateProgressStatus();refreshBottomChapterActions();refreshReadingControls();refreshTtsControls();}
  function showResult(index){if(state.requesting||!state.resultEntries.length)return;state.viewedResult=Math.max(0,Math.min(index,state.resultEntries.length-1));const item=state.resultEntries[state.viewedResult];if(ttsRuntime.active&&ttsSourceKey(item)!==ttsRuntime.sourceKey)stopTtsPlayback();renderResponse(item.content,item.reasoning||"");const swap=$("#output");if(swap){swap.classList.remove("content-swap");void swap.offsetWidth;swap.classList.add("content-swap");}$("#usage").textContent=usageText(item.usage,item.reasoning);$("#copy-output").disabled=!item.content;setRequestState(item.type==="chapter"?`已保存：${item.title}`:"已保存：首楼回答","ok");refreshResultNavigation();if($("#reading-mode-dialog")?.open&&item.type==="chapter"){state.readingChapterIndex=item.chapterIndex;refreshReadingControls();}scheduleSessionSave();}
  function saveResult(entry){
    const selected=normalizeResultEntry(entry);if(!selected)return;
    const next=selected.type==="chapter"?[...state.resultEntries.filter(item=>item.type!=="chapter"||item.chapterIndex!==selected.chapterIndex),selected]:[...state.resultEntries,selected];
    state.resultEntries=normalizeResultEntries(next,state.chapterIndexes.length);state.chapterResults=new Map(state.resultEntries.filter(item=>item.type==="chapter").map(item=>[item.chapterIndex,item]));state.viewedResult=canonicalViewedResultIndex(state.resultEntries,selected);showResult(state.viewedResult);
  }
  function appendConversation(user,assistant){state.conversationHistory=normalizeConversationHistory([...state.conversationHistory,{role:"user",content:user},{role:"assistant",content:assistant}],state.chapterIndexes.length);updateProgressStatus();}
  function captureGeneratedState(){return{conversationHistory:state.conversationHistory.map(item=>({...item})),contextCompression:cloneContextCompression(),resultEntries:state.resultEntries.map(item=>({...item})),chapterResults:new Map(state.chapterResults),viewedResult:state.viewedResult};}
  function restoreGeneratedState(snapshot){state.conversationHistory=snapshot.conversationHistory;state.contextCompression=cloneContextCompression(snapshot.contextCompression);state.resultEntries=snapshot.resultEntries;state.chapterResults=snapshot.chapterResults;state.viewedResult=snapshot.viewedResult;const restoring=state.restoringSession;state.restoringSession=true;try{restoreResultDisplay();renderSummaryBlocks();updateProgressStatus();}finally{state.restoringSession=restoring;}}
  async function clearContextAndFirstResults(){
    if(mutationLocked())return;const firstCount=state.resultEntries.filter(item=>item.type==="first").length;if(!window.confirm(`确定清空连续上下文和全部摘要块，并删除 ${firstCount} 条已保存首楼结果？\n\n章节改写结果和小说原文会保留。`))return;if(!beginGeneratedOperation())return;const previous=captureGeneratedState();
    try{const settings=contextSummarySettings(),current=Math.max(0,state.currentIndex),selected=state.resultEntries[state.viewedResult]||null;state.conversationHistory=[];state.contextCompression={...emptyContextCompression(settings.sourceMode),startChapterIndex:current,summarizedThrough:current-1,nextSummaryAt:current+settings.interval,preludeCompleted:true};state.resultEntries=normalizeResultEntries(state.resultEntries.filter(item=>item.type!=="first"),state.chapterIndexes.length);state.chapterResults=new Map(state.resultEntries.filter(item=>item.type==="chapter").map(item=>[item.chapterIndex,item]));const nextSelected=selected?.type==="chapter"?selected:state.resultEntries.at(-1)||null;state.viewedResult=canonicalViewedResultIndex(state.resultEntries,nextSelected);const restoring=state.restoringSession;state.restoringSession=true;try{restoreResultDisplay();renderSummaryBlocks();updateProgressStatus();}finally{state.restoringSession=restoring;}$("#batch-send-first").checked=true;const saved=await saveSessionNow();if(saved===false)throw new Error("清空结果保存失败");if(saved===null){setRequestState("保存待确认","error");toast("上下文和首楼已从页面删除，保存状态待确认");return;}toast(firstCount?"上下文、摘要块和已保存首楼已删除":"上下文和摘要块已清空");}
    catch(error){restoreGeneratedState(previous);$("#batch-send-first").checked=!state.resultEntries.some(item=>item.type==="first");toast(`清空失败：${error.message||error}`);}
    finally{endGeneratedOperation();}
  }
  function scrollToChapterInput(){const input=$("#chapter-preview");input?.scrollIntoView({behavior:"smooth",block:"center"});}
  async function rerollDisplayedChapter(){
    if(mutationLocked())return;const item=displayedChapterResult();if(!item)return toast("请先显示一条章节改写结果");const index=item.chapterIndex,prompt=String(item.prompt||buildChapter(getChapter(index)));
    await processCurrentChapter(true,{chapterIndex:index,prompt});
  }
  async function processNextDisplayedChapter(){
    if(mutationLocked())return;const item=displayedChapterResult();if(!item)return toast("请先显示一条章节改写结果");const target=item.chapterIndex+1;
    if(target>=state.chapterIndexes.length)return toast("当前已经是最后一章");await processCurrentChapter(false,{chapterIndex:target});
  }
  function beginGeneratedOperation(options={}){if(state.sharedSaveBusy||state.generatedCommitBusy||state.requesting||state.workspaceImporting||state.modelsLoading||state.loadingApiConfig||state.batchStarting||(!options.batch&&state.batchRun))return false;if(!requireActiveSave())return false;state.generatedCommitBusy=true;refreshOperationControls();return true;}
  function endGeneratedOperation(){state.generatedCommitBusy=false;refreshOperationControls();}
  async function processFirstPrompt(options={}){
    if(!beginGeneratedOperation(options))return false;
    try{
      collectSettings();const user=String(options.userContent??$("#first-prompt").value).trim(),profile=options.requestProfile||null,summarySettings=contextSummarySettings(profile),context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);
      if(!user){renderResponse("发送失败：首楼提示词为空。","");setRequestState("内容为空","error");toast("首楼提示词为空");return false;}
      if((profile?.includeContext??$("#include-context").checked)&&(context.needsRebuild||summaryBlocksNeedRebuild(context,summarySettings.sourceMode,contextUsesRewrittenOnly(profile)))){toast("请先按当前总结来源重建摘要块");return false;}
      const result=await requestChatWithEmptyContentRetry(makeMessages(user,state.conversationHistory,profile),options.batch?"批量发送首楼":"发送首楼",profile);
      if(result===null)return false;
      if(!String(result.content||"").trim()){setRequestState("未返回最终回答","error");toast("首楼没有可保存的最终回答");return false;}
      const previous=captureGeneratedState();
      appendConversation(user,result.content);saveResult({type:"first",title:"首楼回答",content:result.content,reasoning:result.reasoning,usage:result.usage,createdAt:Date.now()});
      const saved=await saveSessionNow();if(saved!==true){if(saved===false)restoreGeneratedState(previous);else{setRequestState("保存待确认","error");toast("保存结果暂时无法确认，本次回答已保留在页面");}return false;}
      $("#batch-send-first").checked=false;
      toast(options.batch?"批量首楼已保存":"首楼已追加到连续上下文");return true;
    }catch(error){renderResponse(`发送首楼失败：${error.message||error}`,"");setRequestState("请求失败","error");return false;}
    finally{endGeneratedOperation();}
  }
  function chapterContextKey(chapterIndex){return `chapter:${Math.max(0,Math.floor(Number(chapterIndex)||0))}`;}
  function chapterConversationPlan(chapterIndex,previousEntry,history=state.conversationHistory){
    const key=chapterContextKey(chapterIndex),target=contextKeyChapterIndex(key),canonical=normalizeConversationHistory(history,state.chapterIndexes.length),starts=[];
    for(let i=0;i<canonical.length-1;i++){
      const user=canonical[i],assistant=canonical[i+1];
      if(user?.role!=="user"||assistant?.role!=="assistant")continue;
      if(user.contextKey===key||assistant.contextKey===key){starts.push(i);i++;}
    }
    if(!starts.length){
      const answer=String(previousEntry?.content||""),prompt=String(previousEntry?.prompt||"");
      if(answer){
        for(let i=canonical.length-2;i>=0;i--){
          const user=canonical[i],assistant=canonical[i+1];
          if(user?.role!=="user"||assistant?.role!=="assistant")continue;
          if(assistant.content===answer&&(!prompt||user.content===prompt)){starts.push(i);break;}
        }
      }
    }
    const removedIndexes=new Set(starts.flatMap(index=>[index,index+1])),remaining=canonical.filter((_,index)=>!removedIndexes.has(index));
    let insertionIndex=remaining.length;for(let i=0;i<remaining.length;i++){const other=contextKeyChapterIndex(remaining[i]?.contextKey);if(other>target){insertionIndex=i;break;}}
    return {key,remaining,insertionIndex};
  }
  function historyWithoutChapter(chapterIndex,previousEntry){return chapterConversationPlan(chapterIndex,previousEntry).remaining;}
  function isHistoricalReplacement(chapterIndex){const context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);return [...state.chapterResults.keys()].some(index=>index>chapterIndex)||context.blocks.some(block=>block.toChapterIndex>=chapterIndex);}
  function historicalContextView(chapterIndex,profile){
    const context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),blocks=context.blocks.filter(block=>block.toChapterIndex<chapterIndex),summarizedThrough=blocks.at(-1)?.toChapterIndex??Math.max(-1,context.startChapterIndex-1),chapters=retainedChapterHistory(summarizedThrough+1,chapterIndex-1,contextUsesRewrittenOnly(profile));
    return{first:firstConversationHistory().map(item=>({role:item.role,content:item.content})),blocks,prelude:preludeMessages(chapterIndex,profile),chapters:chapters.map(item=>({role:item.role,content:item.content}))};
  }
  function reconcileHistoricalReplacement(chapterIndex,profile){
    const previous=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),blocks=previous.blocks.filter(block=>block.toChapterIndex<chapterIndex),completed=[...state.chapterResults.keys()].sort((a,b)=>a-b),firstCompleted=completed[0]??Math.max(0,chapterIndex),blockStart=blocks[0]?.fromChapterIndex,start=previous.startChapterIndex>=0&&(blockStart===0||blockStart===previous.startChapterIndex)?previous.startChapterIndex:(blockStart??firstCompleted),summarizedThrough=blocks.at(-1)?.toChapterIndex??start-1,latest=completed.at(-1)??chapterIndex,settings=contextSummarySettings(profile),context={...previous,startChapterIndex:start,summarizedThrough,nextSummaryAt:-1,sourceMode:blocks.length?previous.sourceMode:settings.sourceMode,blocks};
    context.needsRebuild=summaryBlocksNeedRebuild(context,settings.sourceMode,contextUsesRewrittenOnly(profile));const normalized=normalizeContextCompression(context,state.chapterIndexes.length);state.contextCompression=normalized;state.conversationHistory=normalizeConversationHistory([...firstConversationHistory(),...retainedChapterHistory(normalized.summarizedThrough+1,latest,contextUsesRewrittenOnly(profile))],state.chapterIndexes.length);renderSummaryBlocks();updateProgressStatus();
  }
  function replaceChapterConversation(chapterIndex,userContent,assistantContent,previousEntry){
    const plan=chapterConversationPlan(chapterIndex,previousEntry);
    const pair=[{role:"user",content:userContent,contextKey:plan.key},{role:"assistant",content:assistantContent,contextKey:plan.key}];
    state.conversationHistory=normalizeConversationHistory([...plan.remaining.slice(0,plan.insertionIndex),...pair,...plan.remaining.slice(plan.insertionIndex)],state.chapterIndexes.length);
    updateProgressStatus();
  }
  async function processCurrentChapter(reroll=false,options={}){
    if(!beginGeneratedOperation(options))return false;
    try{
      collectSettings();
      const requested=Number.isInteger(options.chapterIndex)?options.chapterIndex:state.currentIndex,index=Math.max(0,Math.min(requested,state.chapterIndexes.length-1));
      if(index!==state.currentIndex)changeChapter(index);if(typeof options.prompt==="string"){$("#chapter-preview").value=options.prompt;state.previewDirty=true;}
      const content=(typeof options.prompt==="string"?options.prompt:$("#chapter-preview").value).trim(),profile=options.requestProfile||null;
      if(!content){renderResponse("发送失败：当前章节内容为空。","");setRequestState("内容为空","error");toast("当前章节内容为空");return false;}
      if(!profile)activatePreludeCompression(index);const title=state.chapterIndexes[index]?.title||`第${index+1}章`,previousEntry=state.chapterResults.get(index)||null,requestProfile=profile||captureRequestProfile(),historicalReplacement=isHistoricalReplacement(index),summarySettings=contextSummarySettings(requestProfile),context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length);
      if(historicalReplacement){if(requestProfile.includeContext&&(context.needsRebuild||summaryBlocksNeedRebuild(context,summarySettings.sourceMode,contextUsesRewrittenOnly(requestProfile)))){toast("请先按当前总结来源重建摘要块");return false;}}else if(!await ensureContextReady(index,requestProfile,options))return false;
      const requestHistory=historyWithoutChapter(index,previousEntry),usedPrelude=!historicalReplacement&&shouldSendPrelude(index,requestProfile),contextView=historicalReplacement?historicalContextView(index,requestProfile):null;
      const chapterMessages=makeMessages(content,requestHistory,requestProfile,index,contextView);
      if(responsesWebSearchActive(requestProfile)){
        const guidance=String(state.settings.webSearchPrompt||"").trim();
        const last=chapterMessages.at(-1);
        if(guidance&&last?.role==="user")last.content=injectWebSearchGuidance(last.content,guidance);
      }
      const result=await requestChatWithEmptyContentRetry(chapterMessages,reroll?`重 roll 第 ${index+1} 章`:`处理第 ${index+1} 章`,requestProfile,value=>chapterQualityFailure(value,index,title,requestProfile),{webSearch:true,ttsLive:true});
      if(result===null)return false;
      if(!String(result.content||"").trim()){setRequestState("未返回最终回答","error");toast("本章没有可保存的最终回答");return false;}
      const previous=captureGeneratedState();
      const historyUserContent=contextUsesRewrittenOnly(requestProfile)?rewrittenContextPrompt(index,{title}):content;
      if(!historicalReplacement)replaceChapterConversation(index,historyUserContent,result.content,previousEntry);
      if(usedPrelude)state.contextCompression={...cloneContextCompression(),preludeCompleted:true};
      saveResult({type:"chapter",chapterIndex:index,title,prompt:content,content:result.content,reasoning:result.reasoning,usage:result.usage,createdAt:Date.now(),rerolled:!!reroll});
      if(historicalReplacement)reconcileHistoricalReplacement(index,requestProfile);
      const saved=await saveSessionNow();if(saved!==true){if(saved===false)restoreGeneratedState(previous);else{setRequestState("保存待确认","error");toast("保存结果暂时无法确认，本章结果已保留在页面");}return false;}
      if(!reroll&&!options.batch&&$("#auto-advance").checked&&index<state.chapterIndexes.length-1)changeChapter(index+1);
      if(historicalReplacement&&!options.batch)toast(`已替换第 ${index+1} 章；后续结果已保留，受影响摘要将在后续处理时重建`);else if(reroll)toast("已替换本章旧结果与上下文");
      return true;
    }catch(error){renderResponse(`${reroll?"重 roll":"处理章节"}失败：${error.message||error}`,"");setRequestState("请求失败","error");return false;}
    finally{endGeneratedOperation();}
  }
  async function startBatchRun(){
    if(batchPreflightBusy()||!state.chapterIndexes.length)return;
    if(!state.activeSaveId){setBatchStatus("请先把当前小说保存为本机存档，再开始批量处理。","error");toast("请先点击“当前另存为”");return;}
    syncPreludeCompressionControls($("#batch-prelude-compression-enabled").checked);collectSettings();
    const total=state.chapterIndexes.length,start=Math.max(1,Math.min(total,Math.floor(Number($("#batch-start-chapter").value)||1))),end=Math.max(1,Math.min(total,Math.floor(Number($("#batch-end-chapter").value)||total)));
    $("#batch-start-chapter").value=String(start);$("#batch-end-chapter").value=String(end);
    if(end<start){setBatchStatus("结束章节不能小于起始章节。","error");toast("请检查批量章节范围");return;}
    const sendFirst=$("#batch-send-first").checked,policy=$("#batch-existing-policy").value==="overwrite"?"overwrite":"skip",chapterTotal=end-start+1,draftProfile=captureRequestProfile(),firstPrompt=$("#first-prompt").value.trim(),context=normalizeContextCompression(state.contextCompression,state.chapterIndexes.length),preludePlanned=draftProfile.includeContext&&preludeCompressionNeedsInitialization(start-1,contextSummarySettings(draftProfile),context);
    if(draftProfile.includeContext&&(context.needsRebuild||summaryBlocksNeedRebuild(context,contextSummarySettings(draftProfile).sourceMode,contextUsesRewrittenOnly(draftProfile)))){setBatchStatus("总结来源已改变，请先在“上下文总结”中重建摘要块。","error");toast("请先重建摘要块");return;}
    const historyLabel=draftProfile.contextRewrittenOnly?"仅改写成果":"真实请求/回答",preludeNotice=preludePlanned?`；首次将按 ${draftProfile.contextSummaryInterval}/${draftProfile.contextSummaryRetain} 压缩前置原文并自动滚动总结`:"",summaryNotice=!preludePlanned&&draftProfile.includeContext&&draftProfile.contextSummaryEnabled?`；上下文将每 ${draftProfile.contextSummaryInterval} 章追加摘要块，并保留最近 ${draftProfile.contextSummaryRetain} 章${historyLabel}`:draftProfile.includeContext&&!draftProfile.contextRewrittenOnly&&start>1?"；首次请求会补入起始章之前的原文背景":"";
    const overwriteNotice=policy==="overwrite"&&[...state.chapterResults.keys()].some(index=>index>=start-1)?"；覆盖历史章节时只读取该章之前的上下文，后续结果保留，受影响摘要会移除并在后续边界重建":"";
    const confirmed=window.confirm(`将按顺序处理第 ${start}–${end} 章（共 ${chapterTotal} 章）${sendFirst?"，并在开始前发送一次首楼":""}${preludeNotice}${summaryNotice}${overwriteNotice}。已有结果将${policy==="skip"?"跳过":"重新处理并覆盖"}。\n\n每章都会产生一次 API 请求并在成功后保存，是否开始？`);
    if(!confirmed)return;activatePreludeCompression(start-1);collectSettings();const requestProfile=captureRequestProfile();if(matchMedia("(max-width: 900px)").matches)setMobileView("write");prepareBatchContextStart(start-1,requestProfile);
    state.batchStarting=true;refreshOperationControls();
    let flushed=false;try{setSharedSaveBusy(true);flushed=await flushSharedSave();}catch(error){setBatchStatus(`批量预保存失败：${error.message||error}`,"error");}finally{setSharedSaveBusy(false);}
    if(flushed!==true){state.batchStarting=false;refreshOperationControls();setBatchStatus("当前存档尚未确认保存成功，批量未开始。","error");toast("请先解决本机存档保存问题");return;}
    const run={start:start-1,end:end-1,sendFirst,policy,chapterTotal,requestProfile,firstPrompt,completed:0,skipped:0,firstCompleted:false,paused:false,stopRequested:false,resume:null,error:false,errorMessage:"",finished:false};
    state.batchRun=run;state.batchStarting=false;window.NovelMobile?.setWorkActive?.("batch",true);$("#batch-progress").max=String(chapterTotal+(sendFirst?1:0));$("#batch-progress").value="0";refreshOperationControls();updateBatchProgress(run,"准备开始");
    try{
      if(run.sendFirst){
        await waitForBatchResume(run);if(run.stopRequested)return;
        updateBatchProgress(run,"正在发送首楼");
        const ok=await processFirstPrompt({batch:true,requestProfile:run.requestProfile,userContent:run.firstPrompt});
        if(!ok){if(!run.stopRequested){run.error=true;run.errorMessage="首楼发送或保存失败";}return;}
        run.firstCompleted=true;updateBatchProgress(run,"首楼已保存");
      }
      for(let index=run.start;index<=run.end;index++){
        await waitForBatchResume(run);if(run.stopRequested)break;
        if(run.policy==="skip"&&state.chapterResults.has(index)){run.skipped++;updateBatchProgress(run,`已跳过第 ${index+1} 章`);continue;}
        changeChapter(index);updateBatchProgress(run,`正在处理第 ${index+1}/${total} 章`);
        const ok=await processCurrentChapter(false,{batch:true,requestProfile:run.requestProfile,chapterIndex:index});
        if(!ok){if(!run.stopRequested){run.error=true;run.errorMessage=`第 ${index+1} 章请求或保存失败`;}break;}
        run.completed++;updateBatchProgress(run,`第 ${index+1} 章已保存`);
      }
      if(!run.error&&!run.stopRequested)run.finished=true;
    }catch(error){run.error=true;run.errorMessage=error.message||String(error);}
    finally{
      const detail=run.error?`${run.errorMessage}，批量已停止`:run.stopRequested?"批量已停止，已完成内容均已保存":"批量处理完成";
      state.batchRun=null;state.batchStarting=false;window.NovelMobile?.setWorkActive?.("batch",false);refreshOperationControls();run.finished=!run.error&&!run.stopRequested;updateBatchProgress(run,detail);
    }
  }
  function sortedChapterResults(){return[...state.chapterResults.values()].filter(item=>String(item.content||"").trim()).sort((a,b)=>a.chapterIndex-b.chapterIndex);}
  function chapterResultContent(item){return String(item?.content||"").trim();}
  function chapterResultBlock(item,content=chapterResultContent(item)){return`${item.title}\n\n${content}`;}
  function chapterResultsCharacterCount(entries){return entries.reduce((sum,item,index)=>sum+String(item.title||"").length+2+chapterResultContent(item).length+(index?3:0),0);}
  function chapterResultsText(entries=sortedChapterResults()){return entries.map(item=>chapterResultBlock(item)).join("\n\n\n");}
  function escapeRegExp(value){return String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
  function exportTitleText(value){let text=String(value||"").trim();text=text.replace(/^#{1,6}\s*/,"").replace(/^>\s*/,"").replace(/^`{1,3}|`{1,3}$/g,"").trim();for(const marker of ["**","__","*","_"]){if(text.startsWith(marker)&&text.endsWith(marker)&&text.length>marker.length*2)text=text.slice(marker.length,-marker.length).trim();}return text;}
  function isDuplicateExportTitle(line,title){const candidate=exportTitleText(line),expected=exportTitleText(title);return !!candidate&&(normalizeTitle(candidate)===normalizeTitle(expected)||isChapterTitle(candidate));}
  function stripExportWrapperTags(text){if(!state.settings.exportStripWrapperTags)return text;const tags=normalizeExportWrapperTags(state.settings.exportWrapperTags).split(/,\s*/).filter(Boolean);if(!tags.length)return text;const pattern=new RegExp(`<\\s*\\/?\\s*(?:${tags.map(escapeRegExp).join("|")})\\b[^>]*>`,"gi");return text.replace(pattern,"");}
  function exportChapterContent(item){
    let text=normalizeText(chapterResultContent(item));text=stripExportWrapperTags(text);
    if(state.settings.exportRemoveDuplicateTitles){const lines=text.split("\n");while(lines.length&&!lines[0].trim())lines.shift();while(lines.length&&isDuplicateExportTitle(lines[0],item.title)){lines.shift();while(lines.length&&!lines[0].trim())lines.shift();}text=lines.join("\n");}
    if(state.settings.exportNormalizeWhitespace)text=text.split("\n").map(line=>line.replace(/[ \t　]+$/g,"")).join("\n").replace(/\n{3,}/g,"\n\n");
    return text.trim();
  }
  function chapterResultBlobParts(entries){const parts=["\ufeff"];entries.forEach((item,index)=>{if(index)parts.push("\n\n\n");parts.push(String(item.title||"未命名章节").trim(),"\n\n",exportChapterContent(item));});return parts;}
  async function exportResults(){if(mutationLocked())return;collectSettings();const entries=sortedChapterResults();if(!entries.length)return toast("还没有可导出的改写章节");const base=(state.fileName||"小说").replace(/\.txt$/i,"");try{await shareOrDownloadText(`${base}_改写版.txt`,chapterResultBlobParts(entries),"text/plain;charset=utf-8");toast(`已导出 ${entries.length}/${state.chapterIndexes.length} 章；未包含思维链`);}catch(error){toast(`导出失败：${error.message||error}`);}}

  const ttsRuntime={active:false,sourceKey:"",segments:[],index:0,audio:null,objectUrl:"",cache:new Map(),playing:false,live:null,token:0};
  function ttsConfigReady(){const s=state.settings;return !!s.ttsEnabled&&!!String(s.ttsApiKey||"").trim();}
  function ttsSourceKey(item){return item?.type==="chapter"?`chapter:${item.chapterIndex}`:(item?.type==="first"?"first":"");}
  function splitTtsSegments(text,max=TTS_SEGMENT_CHARS){
    const clean=String(text||"").trim();
    if(!clean)return[];
    const sentences=clean.match(/[^。！？!?…\n]*[。！？!?…\n]+|[^。！？!?…\n]+$/g)||[clean];
    const segments=[];let current="";
    for(let sentence of sentences){
      sentence=sentence.trim();
      if(!sentence)continue;
      if(sentence.length>max){
        if(current.trim()){segments.push(current.trim());current="";}
        while(sentence.length>max){segments.push(sentence.slice(0,max).trim());sentence=sentence.slice(max);}
        current=sentence;
        continue;
      }
      if(current&&current.length+sentence.length>max){segments.push(current.trim());current=sentence;}
      else current=current?current+sentence:sentence;
    }
    if(current.trim())segments.push(current.trim());
    return segments.filter(Boolean);
  }
  async function synthesizeTtsSegment(text){
    const s=state.settings,base=normalizeBaseUrl(s.ttsBaseUrl)||DEFAULT_TTS_BASE_URL,key=String(s.ttsApiKey||"").trim();
    const instruction=String(s.ttsInstruction||"").trim(),messages=[];
    if(instruction)messages.push({role:"user",content:instruction});
    messages.push({role:"assistant",content:text});
    const body={model:String(s.ttsModel||"").trim()||DEFAULT_TTS_MODEL,messages,audio:{format:"mp3",voice:String(s.ttsVoice||"").trim()||"mimo_default"}};
    const response=await fetch(`${base}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json","api-key":key},body:JSON.stringify(body)});
    if(!response.ok){
      let detail="";
      try{const data=await response.json();detail=data?.base_resp?.status_msg||data?.error?.message||data?.message||"";}catch{}
      throw new Error(`TTS HTTP ${response.status}${detail?`：${detail}`:""}`);
    }
    const json=await response.json();
    const data=String(json?.choices?.[0]?.message?.audio?.data||"");
    if(!data)throw new Error(json?.base_resp?.status_msg||"TTS 接口没有返回音频数据");
    const binary=atob(data),bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return bytes;
  }
  function synthesizeTtsCached(index){
    if(ttsRuntime.cache.has(index))return ttsRuntime.cache.get(index);
    const promise=Promise.resolve().then(()=>synthesizeTtsSegment(ttsRuntime.segments[index]));
    ttsRuntime.cache.set(index,promise);
    promise.catch(()=>ttsRuntime.cache.delete(index));
    return promise;
  }
  function stopTtsPlayback(){
    const wasActive=ttsRuntime.active,wasLive=!!ttsRuntime.live;
    ttsRuntime.token++;
    ttsRuntime.active=false;ttsRuntime.sourceKey="";ttsRuntime.segments=[];ttsRuntime.index=0;ttsRuntime.playing=false;ttsRuntime.live=null;
    if(ttsRuntime.audio){const audio=ttsRuntime.audio;ttsRuntime.audio=null;audio.onended=null;audio.onerror=null;try{audio.pause();}catch{}}
    if(ttsRuntime.objectUrl){URL.revokeObjectURL(ttsRuntime.objectUrl);ttsRuntime.objectUrl="";}
    ttsRuntime.cache.clear();
    if(wasActive||wasLive)refreshTtsControls();
  }
  function pauseTtsPlayback(){
    ttsRuntime.token++;
    ttsRuntime.active=false;ttsRuntime.playing=false;
    if(ttsRuntime.audio){const audio=ttsRuntime.audio;ttsRuntime.audio=null;audio.onended=null;audio.onerror=null;try{audio.pause();}catch{}}
    if(ttsRuntime.objectUrl){URL.revokeObjectURL(ttsRuntime.objectUrl);ttsRuntime.objectUrl="";}
    refreshTtsControls();
  }
  function beginTtsLiveSession(){
    stopTtsPlayback();
    ttsRuntime.active=true;ttsRuntime.sourceKey="live";ttsRuntime.segments=[];ttsRuntime.index=0;ttsRuntime.playing=false;
    ttsRuntime.live={pending:"",threshold:normalizeTtsLiveChars(state.settings.ttsLiveFirstChars,DEFAULT_TTS_LIVE_FIRST_CHARS),nextThreshold:normalizeTtsLiveChars(state.settings.ttsLiveNextChars,DEFAULT_TTS_LIVE_NEXT_CHARS),ended:false};
    refreshTtsControls();
  }
  function findTtsLiveCut(text,minChars,maxChars=Infinity){
    let best=0;
    for(const match of String(text||"").matchAll(/[。！？!?…\n]+/g)){
      const cut=match.index+match[0].length;
      if(cut>maxChars)break;
      if(cut>=minChars)best=cut;
    }
    if(best)return best;
    return maxChars<Infinity&&String(text||"").length>=maxChars?maxChars:0;
  }
  function feedTtsLive(delta){
    const live=ttsRuntime.live;
    const text=String(delta||"");
    if(!live||live.ended||!text)return;
    const nextThreshold=live.nextThreshold||DEFAULT_TTS_LIVE_NEXT_CHARS;
    live.pending+=text;
    while(live.pending.length>=TTS_SEGMENT_CHARS){
      const cut=findTtsLiveCut(live.pending,60,TTS_SEGMENT_CHARS);
      if(cut<=0)break;
      pushTtsLiveSegment(live.pending.slice(0,cut));
      live.pending=live.pending.slice(cut);
      live.threshold=nextThreshold;
    }
    if(live.pending.length>=live.threshold){
      const cut=findTtsLiveCut(live.pending,60);
      if(cut>0){
        pushTtsLiveSegment(live.pending.slice(0,cut));
        live.pending=live.pending.slice(cut);
        live.threshold=nextThreshold;
      }
    }
  }
  function pushTtsLiveSegment(segment){
    if(!ttsRuntime.live)return;
    const clean=stripExportWrapperTags(String(segment||"")).trim();
    if(!clean)return;
    ttsRuntime.segments.push(clean);
    if(ttsRuntime.active&&!ttsRuntime.playing){ttsRuntime.playing=true;playTtsSegment(ttsRuntime.segments.length-1).catch(()=>{});}
  }
  function finishTtsLive(){
    const live=ttsRuntime.live;
    if(!live)return;
    live.ended=true;
    const rest=live.pending.trim();
    live.pending="";
    if(rest)pushTtsLiveSegment(rest);
    if(!ttsRuntime.segments.length)stopTtsPlayback();
  }
  async function playTtsSegment(index){
    if(!ttsRuntime.active)return;
    if(index>=ttsRuntime.segments.length){
      const live=ttsRuntime.live;
      if(live&&!live.ended){ttsRuntime.playing=false;return;}
      const wasLive=!!live;
      stopTtsPlayback();
      if(!wasLive)toast("朗读已结束");
      return;
    }
    const myToken=ttsRuntime.token;
    ttsRuntime.playing=true;
    ttsRuntime.index=index;
    if(!state.requesting)setRequestState(`正在朗读第 ${index+1}/${ttsRuntime.segments.length} 段…`,"running");
    try{
      const bytes=await synthesizeTtsCached(index);
      if(!ttsRuntime.active||ttsRuntime.token!==myToken)return;
      if(ttsRuntime.objectUrl)URL.revokeObjectURL(ttsRuntime.objectUrl);
      const url=URL.createObjectURL(new Blob([bytes],{type:"audio/mpeg"}));
      ttsRuntime.objectUrl=url;
      const audio=new Audio(url);
      ttsRuntime.audio=audio;
      audio.onended=()=>{if(ttsRuntime.active)playTtsSegment(index+1);};
      audio.onerror=()=>{if(ttsRuntime.active){toast("音频播放失败，朗读已停止");stopTtsPlayback();}};
      await audio.play();
      if(ttsRuntime.active&&index+1<ttsRuntime.segments.length)synthesizeTtsCached(index+1).catch(()=>{});
    }catch(error){
      if(ttsRuntime.active){toast(`朗读失败：${error.message||error}`);stopTtsPlayback();}
    }
  }
  async function startTtsPlayback(item){
    const text=exportChapterContent(item);
    const segments=splitTtsSegments(text);
    if(!segments.length)return toast("当前结果没有可朗读的正文");
    stopTtsPlayback();
    ttsRuntime.active=true;ttsRuntime.sourceKey=ttsSourceKey(item);ttsRuntime.segments=segments;ttsRuntime.index=0;
    refreshTtsControls();
    toast(`开始朗读，共 ${segments.length} 段`);
    await playTtsSegment(0);
  }
  function toggleTtsPlayback(){
    if(ttsRuntime.active){
      if(ttsRuntime.live)pauseTtsPlayback();
      else stopTtsPlayback();
      return;
    }
    if(ttsRuntime.live){
      if(!ttsConfigReady())return toast("请先在设置中开启语音朗读并填写 MiMo API Key");
      ttsRuntime.token++;ttsRuntime.active=true;refreshTtsControls();
      if(ttsRuntime.index<ttsRuntime.segments.length)playTtsSegment(ttsRuntime.index).catch(()=>{});
      return;
    }
    if(!ttsConfigReady())return toast("请先在设置中开启语音朗读并填写 MiMo API Key");
    const item=$("#reading-mode-dialog")?.open?readingModeEntry():displayedChapterResult();
    if(!item||item.type!=="chapter")return toast("请先显示一条章节改写结果");
    startTtsPlayback(item);
  }
  function refreshTtsControls(){
    const ready=ttsConfigReady(),item=displayedChapterResult(),entry=readingModeEntry(),livePaused=!!ttsRuntime.live&&!ttsRuntime.active;
    const outputButton=$("#tts-read"),readingButton=$("#reading-mode-tts");
    if(outputButton){
      outputButton.textContent=ttsRuntime.active?"停止朗读":livePaused?"继续朗读":"朗读";
      outputButton.disabled=ttsRuntime.active||livePaused?false:!ready||!item;
    }
    if(readingButton){
      readingButton.textContent=ttsRuntime.active?"停止朗读":livePaused?"继续朗读":"朗读本章";
      readingButton.disabled=ttsRuntime.active||livePaused?false:!ready||!entry;
    }
  }
  function buildAllResultsPages(entries){
    const pages=[];let parts=[],characters=0;
    const flush=()=>{if(parts.length){pages.push(parts);parts=[];characters=0;}};
    for(const item of entries){const content=chapterResultContent(item),title=String(item.title||"未命名章节"),overhead=title.length+2;
      if(content.length+overhead>INLINE_PREVIEW_CHARS){flush();const chunkSize=Math.max(10000,INLINE_PREVIEW_CHARS-overhead-16);for(let start=0;start<content.length;start+=chunkSize)pages.push([{item,start,end:Math.min(content.length,start+chunkSize),continued:start>0}]);continue;}
      const blockLength=overhead+content.length+(parts.length?3:0);if(parts.length&&characters+blockLength>INLINE_PREVIEW_CHARS)flush();parts.push({item,start:0,end:content.length,continued:false});characters+=overhead+content.length+(parts.length>1?3:0);
    }
    flush();return pages;
  }
  function renderAllResultsPage(){const preview=state.allResultsPreview;if(!preview)return;const page=preview.pages[preview.page]||[],blocks=page.map(part=>{const content=chapterResultContent(part.item).slice(part.start,part.end),title=part.continued?`${part.item.title}（续）`:part.item.title;return`${title}\n\n${content}`;});$("#all-results-content").textContent=blocks.join("\n\n\n");$("#all-results-summary").textContent=`已完成 ${preview.entries.length}/${state.chapterIndexes.length} 章 · ${preview.totalChars.toLocaleString()} 字符 · 第 ${preview.page+1}/${preview.pages.length} 页`;$("#prev-all-results-page").disabled=preview.page<=0;$("#next-all-results-page").disabled=preview.page>=preview.pages.length-1;}
  function changeAllResultsPage(offset){const preview=state.allResultsPreview;if(!preview)return;preview.page=Math.max(0,Math.min(preview.page+offset,preview.pages.length-1));renderAllResultsPage();$("#all-results-content").scrollTop=0;}
  function openAllResultsPreview(){if(mutationLocked())return;const entries=sortedChapterResults();if(!entries.length)return toast("还没有可预览的改写章节");state.allResultsPreview={entries,pages:buildAllResultsPages(entries),page:0,totalChars:chapterResultsCharacterCount(entries)};renderAllResultsPage();const dialog=$("#all-results-dialog");if(!dialog.open)dialog.showModal();}
  function copyAllResults(){const entries=sortedChapterResults();if(!entries.length)return toast("还没有可复制的改写章节");const characters=chapterResultsCharacterCount(entries);if(characters>COPY_ALL_CHAR_LIMIT)return toast("全部正文过大，请使用“导出 TXT”避免手机卡顿");copyText(chapterResultsText(entries));}
  function closeAllResultsPreview(){const dialog=$("#all-results-dialog");if(dialog.open)dialog.close();$("#all-results-content").textContent="";$("#all-results-summary").textContent="暂无结果";$("#prev-all-results-page").disabled=true;$("#next-all-results-page").disabled=true;state.allResultsPreview=null;}

  function setPromptPresetStatus(message,type=""){const element=$("#prompt-preset-status");if(element){element.textContent=message;element.className=`muted compact-note ${type}`;}}
  function renderPromptPresetControls(){const select=$("#prompt-preset-select");if(!select)return;const presets=normalizePromptPresets(state.settings.promptPresets),selected=presets.some(item=>item.id===state.settings.selectedPromptPresetId)?state.settings.selectedPromptPresetId:"";select.innerHTML="";if(!presets.length)select.add(new Option("暂无预设",""));else{for(const preset of presets)select.add(new Option(preset.name,preset.id));select.value=selected;}state.settings.promptPresets=presets;state.settings.selectedPromptPresetId=selected;const has=!!selected,locked=mutationLocked();$("#apply-prompt-preset").disabled=locked||!has;$("#save-prompt-preset").disabled=locked||!has;$("#rename-prompt-preset").disabled=locked||!has;$("#delete-prompt-preset").disabled=locked||!has;}
  function promptPresetValues(){return{systemPrompt:$("#system-prompt").value,firstPrompt:$("#first-prompt").value,tailPrompt:$("#tail-prompt").value,contextSummaryPrompt:$("#context-summary-prompt").value||DEFAULT_CONTEXT_SUMMARY_PROMPT};}
  function applyPromptPreset(){const id=$("#prompt-preset-select").value,preset=state.settings.promptPresets.find(item=>item.id===id);if(!preset||mutationLocked())return;if(!window.confirm(`应用 Prompt 预设“${preset.name}”？\n\n只会改变后续请求使用的提示词，不会改动历史结果。`))return;Object.assign(state.settings,{systemPrompt:preset.systemPrompt,firstPrompt:preset.firstPrompt,tailPrompt:preset.tailPrompt,contextSummaryPrompt:preset.contextSummaryPrompt});state.settings.selectedPromptPresetId=preset.id;applySettings();state.chapterCache.clear();if(!state.previewDirty)refreshChapters(true,false);scheduleSessionSave();saveSettings();setPromptPresetStatus(`已应用“${preset.name}”，后续请求将使用新提示词`,"ok");toast(`已应用 Prompt 预设“${preset.name}”`);}
  function newPromptPreset(){if(mutationLocked())return;collectSettings();const name=window.prompt("新预设名称：",`预设 ${state.settings.promptPresets.length+1}`);if(name===null||!name.trim())return;const clean=name.trim().slice(0,80);if(state.settings.promptPresets.some(item=>item.name===clean))return toast("已有同名预设，请换一个名称");const now=Date.now(),preset={id:createPromptPresetId(),name:clean,...promptPresetValues(),createdAt:now,updatedAt:now};state.settings.promptPresets=normalizePromptPresets([...state.settings.promptPresets,preset]);state.settings.selectedPromptPresetId=preset.id;saveSettings();renderPromptPresetControls();setPromptPresetStatus(`已保存“${clean}”`,"ok");toast("Prompt 预设已保存");}
  function savePromptPreset(){if(mutationLocked())return;const id=$("#prompt-preset-select").value,preset=state.settings.promptPresets.find(item=>item.id===id);if(!preset)return;collectSettings();if(!window.confirm(`覆盖保存 Prompt 预设“${preset.name}”？`))return;Object.assign(preset,promptPresetValues(),{updatedAt:Date.now()});state.settings.selectedPromptPresetId=id;saveSettings();renderPromptPresetControls();setPromptPresetStatus(`已覆盖保存“${preset.name}”`,"ok");toast("Prompt 预设已更新");}
  function renamePromptPreset(){if(mutationLocked())return;const id=$("#prompt-preset-select").value,preset=state.settings.promptPresets.find(item=>item.id===id);if(!preset)return;const name=window.prompt("预设新名称：",preset.name);if(name===null||!name.trim())return;const clean=name.trim().slice(0,80);if(state.settings.promptPresets.some(item=>item.id!==id&&item.name===clean))return toast("已有同名预设，请换一个名称");preset.name=clean;preset.updatedAt=Date.now();saveSettings();renderPromptPresetControls();setPromptPresetStatus(`已重命名为“${clean}”`,"ok");}
  function deletePromptPreset(){if(mutationLocked())return;const id=$("#prompt-preset-select").value,preset=state.settings.promptPresets.find(item=>item.id===id);if(!preset||!window.confirm(`确定删除 Prompt 预设“${preset.name}”？`))return;state.settings.promptPresets=state.settings.promptPresets.filter(item=>item.id!==id);state.settings.selectedPromptPresetId="";saveSettings();renderPromptPresetControls();setPromptPresetStatus("预设已删除");toast("Prompt 预设已删除");}
  function syncAdvancedControls() {
    $("#reasoning-params-json").disabled = !$("#enable-reasoning-params").checked;
    const overrideDisabled = !$("#enable-request-override").checked;
    $("#request-override-fields").querySelectorAll("input, select, textarea").forEach(element => element.disabled = overrideDisabled);
  }
  function applySettings(){
    const s=state.settings,a=s.advancedRequest||DEFAULT_ADVANCED_REQUEST;
    const map={
      "#base-url":s.baseUrl,"#api-key":s.apiKey||"","#system-prompt":s.systemPrompt,"#first-prompt":s.firstPrompt,
      "#context-summary-interval":String(normalizeContextSummaryInterval(s.contextSummaryInterval)),"#context-summary-retain":String(normalizeContextSummaryRetain(s.contextSummaryRetain,s.contextSummaryInterval)),"#context-summary-prompt":s.contextSummaryPrompt||DEFAULT_CONTEXT_SUMMARY_PROMPT,
      "#batch-size":String(s.batchSize),"#title-repeat":s.titleRepeat,"#tail-prompt":s.tailPrompt,"#end-mark":s.endMark,
      "#nav-prev":s.navPrevious,"#nav-book":s.navBook,"#nav-next":s.navNext,
      "#reasoning-params-json":a.reasoningJson??DEFAULT_ADVANCED_REQUEST.reasoningJson,
      "#chat-request-path":a.path??DEFAULT_ADVANCED_REQUEST.path,
      "#request-headers-json":a.headersJson??DEFAULT_ADVANCED_REQUEST.headersJson,
      "#request-body-json":a.bodyJson??DEFAULT_ADVANCED_REQUEST.bodyJson,
      "#content-font-size":String(normalizeContentFontSize(s.contentFontSize)),
      "#content-font-size-number":String(normalizeContentFontSize(s.contentFontSize)),
      "#custom-font-css":s.customFontCss??DEFAULT_FONT_CSS,
      "#empty-content-retry-count":String(normalizeEmptyContentRetryCount(s.emptyContentRetryCount)),
      "#short-content-min-chars":String(normalizeShortContentMinChars(s.shortContentMinChars)),
      "#short-content-min-ratio":String(normalizeShortContentMinRatio(s.shortContentMinRatio)),
      "#export-wrapper-tags":normalizeExportWrapperTags(s.exportWrapperTags),
      "#tts-api-key":s.ttsApiKey||"","#tts-base-url":s.ttsBaseUrl||DEFAULT_TTS_BASE_URL,"#tts-model":s.ttsModel||DEFAULT_TTS_MODEL,"#tts-voice-custom":s.ttsVoiceCustom||"","#tts-instruction":s.ttsInstruction||"","#web-search-prompt":s.webSearchPrompt||"",
      "#tts-live-first-chars":String(normalizeTtsLiveChars(s.ttsLiveFirstChars,DEFAULT_TTS_LIVE_FIRST_CHARS)),
      "#tts-live-next-chars":String(normalizeTtsLiveChars(s.ttsLiveNextChars,DEFAULT_TTS_LIVE_NEXT_CHARS))
    };
    for(const[id,value]of Object.entries(map))$(id).value=value;
    const ttsVoice=String(s.ttsVoice||"mimo_default"),voiceSelect=$("#tts-voice");
    if(voiceSelect){if(![...voiceSelect.options].some(option=>option.value===ttsVoice))voiceSelect.add(new Option(ttsVoice,ttsVoice));voiceSelect.value=ttsVoice;}
    $("#tts-enabled").checked=!!s.ttsEnabled;$("#tts-live-enabled").checked=!!s.ttsLiveEnabled;$("#web-search-enabled").checked=!!s.webSearchEnabled;
    if(s.model){const select=$("#model");if(![...select.options].some(option=>option.value===s.model))select.add(new Option(s.model,s.model));select.value=s.model;}
    $("#share-api-config").checked=s.shareApiConfig!==false;$("#include-context").checked=!!s.includeContext;$("#context-rewritten-only").checked=!!s.contextRewrittenOnly;$("#context-summary-enabled").checked=!!s.contextSummaryEnabled;syncPreludeCompressionControls(s.contextPreludeCompressionEnabled);const summaryMode=s.contextRewrittenOnly?SUMMARY_SOURCE_REWRITTEN:normalizeSummarySourceMode(s.contextSummarySourceMode);s.contextSummarySourceMode=summaryMode;$("#context-summary-source-rewritten").checked=summaryMode===SUMMARY_SOURCE_REWRITTEN;$("#context-summary-source-request").checked=summaryMode===SUMMARY_SOURCE_REQUEST_RESPONSE;$("#all-failure-retry-enabled").checked=!!s.allFailureRetryEnabled;$("#empty-content-retry-enabled").checked=!s.allFailureRetryEnabled&&s.emptyContentRetryEnabled!==false;$("#missing-title-retry-enabled").checked=s.missingTitleRetryEnabled!==false;$("#short-content-retry-enabled").checked=s.shortContentRetryEnabled!==false;$("#export-remove-duplicate-titles").checked=s.exportRemoveDuplicateTitles!==false;$("#export-strip-wrapper-tags").checked=s.exportStripWrapperTags!==false;$("#export-normalize-whitespace").checked=s.exportNormalizeWhitespace!==false;$("#auto-advance").checked=!!s.autoAdvance;$("#auto-scroll").checked=!!s.autoScroll;$("#enable-thinking").checked=!!s.enableThinking;
    $("#enable-reasoning-params").checked=!!a.reasoningEnabled;$("#enable-request-override").checked=!!a.overrideEnabled;
    const wantedMethod=String(a.method||DEFAULT_ADVANCED_REQUEST.method).toUpperCase(),methodSelect=$("#chat-request-method");
    methodSelect.value=[...methodSelect.options].some(option=>option.value===wantedMethod)?wantedMethod:DEFAULT_ADVANCED_REQUEST.method;
    document.querySelectorAll("[data-param]").forEach(box=>{const saved=s.optional?.[box.dataset.param],value=isPlainObject(saved)?saved:{};box.checked=!!value.enabled;const input=box.closest("label").querySelector("input:last-child");input.disabled=!box.checked;if(value.value!==undefined&&value.value!==null)input.value=value.value;});
    syncAdvancedControls();renderSummaryBlocks();renderPromptPresetControls();syncContextSummaryControls(mutationLocked()||state.modelsLoading||state.loadingApiConfig);applyTheme();applyCustomFontCss();applyContentFontSize(s.contentFontSize);
  }
  function collectSettings(){
    const s=state.settings;
    s.settingsVersion=SETTINGS_VERSION;s.baseUrl=$("#base-url").value.trim();s.model=$("#model").value;s.apiKey=$("#api-key").value;s.shareApiConfig=$("#share-api-config").checked;s.systemPrompt=$("#system-prompt").value;s.firstPrompt=$("#first-prompt").value;s.includeContext=$("#include-context").checked;s.contextRewrittenOnly=$("#context-rewritten-only").checked;s.contextSummaryEnabled=$("#context-summary-enabled").checked;s.contextPreludeCompressionEnabled=$("#context-prelude-compression-enabled").checked;s.contextSummaryInterval=normalizeContextSummaryInterval($("#context-summary-interval").value);s.contextSummaryRetain=normalizeContextSummaryRetain($("#context-summary-retain").value,s.contextSummaryInterval);s.contextSummarySourceMode=s.contextRewrittenOnly?SUMMARY_SOURCE_REWRITTEN:normalizeSummarySourceMode(document.querySelector('[name="context-summary-source"]:checked')?.value);s.contextSummaryPrompt=$("#context-summary-prompt").value||DEFAULT_CONTEXT_SUMMARY_PROMPT;s.allFailureRetryEnabled=$("#all-failure-retry-enabled").checked;s.emptyContentRetryEnabled=!s.allFailureRetryEnabled&&$("#empty-content-retry-enabled").checked;s.emptyContentRetryCount=normalizeEmptyContentRetryCount($("#empty-content-retry-count").value);s.missingTitleRetryEnabled=$("#missing-title-retry-enabled").checked;s.shortContentRetryEnabled=$("#short-content-retry-enabled").checked;s.shortContentMinChars=normalizeShortContentMinChars($("#short-content-min-chars").value);s.shortContentMinRatio=normalizeShortContentMinRatio($("#short-content-min-ratio").value);s.exportRemoveDuplicateTitles=$("#export-remove-duplicate-titles").checked;s.exportStripWrapperTags=$("#export-strip-wrapper-tags").checked;s.exportNormalizeWhitespace=$("#export-normalize-whitespace").checked;s.exportWrapperTags=normalizeExportWrapperTags($("#export-wrapper-tags").value);s.batchSize=Number($("#batch-size").value)||10;s.titleRepeat=Number($("#title-repeat").value)||0;s.tailPrompt=$("#tail-prompt").value;s.endMark=$("#end-mark").value;s.navPrevious=$("#nav-prev").value;s.navBook=$("#nav-book").value;s.navNext=$("#nav-next").value;s.autoAdvance=$("#auto-advance").checked;s.autoScroll=$("#auto-scroll").checked;s.enableThinking=$("#enable-thinking").checked;s.contentFontSize=normalizeContentFontSize($("#content-font-size").value);s.customFontCss=$("#custom-font-css").value;
    s.optional={};document.querySelectorAll("[data-param]").forEach(box=>s.optional[box.dataset.param]={enabled:box.checked,value:box.closest("label").querySelector("input:last-child").value});
    s.ttsEnabled=$("#tts-enabled").checked;s.ttsLiveEnabled=$("#tts-live-enabled").checked;s.ttsLiveFirstChars=normalizeTtsLiveChars($("#tts-live-first-chars").value,DEFAULT_TTS_LIVE_FIRST_CHARS);s.ttsLiveNextChars=normalizeTtsLiveChars($("#tts-live-next-chars").value,DEFAULT_TTS_LIVE_NEXT_CHARS);s.ttsApiKey=$("#tts-api-key").value;s.ttsBaseUrl=normalizeBaseUrl($("#tts-base-url").value)||DEFAULT_TTS_BASE_URL;s.ttsModel=$("#tts-model").value.trim()||DEFAULT_TTS_MODEL;s.ttsVoiceCustom=$("#tts-voice-custom").value.trim();s.ttsVoice=s.ttsVoiceCustom||$("#tts-voice").value||"mimo_default";s.ttsInstruction=$("#tts-instruction").value;s.webSearchEnabled=$("#web-search-enabled").checked;s.webSearchPrompt=$("#web-search-prompt").value;
    s.advancedRequest={reasoningEnabled:$("#enable-reasoning-params").checked,reasoningJson:$("#reasoning-params-json").value,overrideEnabled:$("#enable-request-override").checked,path:$("#chat-request-path").value,method:$("#chat-request-method").value,headersJson:$("#request-headers-json").value,bodyJson:$("#request-body-json").value};
    saveSettings();
  }
  function applyTheme(){const dark=state.settings.theme==="dark"||(state.settings.theme==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=dark?"dark":"light";}
  function applyContentFontSize(value, persist = false) {
    const size = normalizeContentFontSize(value);
    state.settings.contentFontSize = size;
    document.documentElement.style.setProperty("--content-font-size", `${size}px`);
    $("#content-font-size").value = String(size);
    $("#content-font-size-number").value = String(size);
    if (persist) saveSettings();
    return size;
  }
  async function copyText(text){
    const value=String(text??"");
    try{
      if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);toast("已复制到剪贴板");return true;}
      throw new Error("Clipboard API unavailable");
    }catch{
      const area=document.createElement("textarea");area.value=value;area.setAttribute("readonly","");area.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";document.body.appendChild(area);area.select();
      try{if(!document.execCommand("copy"))throw new Error("copy failed");toast("已复制到剪贴板");return true;}catch{toast("复制失败，请手动复制");return false;}finally{area.remove();}
    }
  }
  function customFontValue(css, property, fallback) {
    const match = String(css || "").match(new RegExp(`${property}\\s*:\\s*([^;{}]+)`, "i"));
    return match ? match[1].trim() : fallback;
  }
  function splitFontImports(css) {
    const urls = [];
    const rules = String(css || "").replace(/@import\s+(?:url\(\s*(["']?)(.*?)\1\s*\)|(["'])(.*?)\3)[^;]*;/gi, (_, _quote1, url1, _quote2, url2) => {
      const url = (url1 || url2 || "").trim();
      if (url) urls.push(url);
      return "";
    }).trim();
    return { urls, rules };
  }
  function updateFontStylesheetLinks(urls, family) {
    document.querySelectorAll("link[data-custom-font-link]").forEach(link => link.remove());
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    if (/LXGW\s+WenKai/i.test(family) && !uniqueUrls.some(url => /lxgw-wenkai/i.test(url))) uniqueUrls.push(LXGW_WENKAI_FALLBACK_CSS_URL);
    uniqueUrls.forEach(url => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.dataset.customFontLink = "1";
      document.head.appendChild(link);
    });
  }
  function commitCustomFontCss(css){
    const source=String(css||DEFAULT_FONT_CSS),{urls,rules}=splitFontImports(source);
    let style=$("#custom-font-style");
    if(!style){style=document.createElement("style");style.id="custom-font-style";document.head.appendChild(style);}
    const family=customFontValue(source,"font-family",DEFAULT_FONT_FAMILY),weight=customFontValue(source,"font-weight","normal");
    updateFontStylesheetLinks(urls, family);
    style.textContent=`${rules}\n\n:root{--font-main:${family};--font-weight-main:${weight};}\nhtml,body,button,input,select,textarea,pre,.editor,.output,.reasoning-output,.json-editor,.answer-box,.response-content{font-family:${family}!important;font-weight:${weight}!important;}`;
  }
  function applyCustomFontCss(){
    const css=String(state.settings.customFontCss??DEFAULT_FONT_CSS).trim()||DEFAULT_FONT_CSS;
    commitCustomFontCss(css);
  }
  function initOutputResize(){
    const workspace=$(".workspace"),handle=$("#output-resize-handle"),preview=$(".preview-panel");
    if(!workspace||!handle||!preview)return;
    const minPreview=170,minOutput=360;
    function clampPreviewHeight(height){
      const rect=workspace.getBoundingClientRect(),handleHeight=handle.offsetHeight||10,gap=parseFloat(getComputedStyle(workspace).rowGap)||0;
      const maxPreview=Math.max(minPreview,rect.height-minOutput-handleHeight-gap*2);
      return Math.max(minPreview,Math.min(height,maxPreview));
    }
    function applyHeight(height,persist=true){
      if(!workspace.getBoundingClientRect().height)return;
      const handleHeight=handle.offsetHeight||10,clamped=clampPreviewHeight(height);
      workspace.style.gridTemplateRows=`${clamped}px ${handleHeight}px minmax(${minOutput}px,1fr)`;
      if(persist)localStorage.setItem(OUTPUT_LAYOUT_STORAGE_KEY,String(Math.round(clamped)));
    }
    const saved=Number(localStorage.getItem(OUTPUT_LAYOUT_STORAGE_KEY));
    if(Number.isFinite(saved)&&saved>0)requestAnimationFrame(()=>applyHeight(saved,false));
    handle.addEventListener("pointerdown",event=>{
      if(event.button!==undefined&&event.button!==0)return;
      event.preventDefault();
      const startY=event.clientY,startHeight=preview.getBoundingClientRect().height;
      handle.setPointerCapture?.(event.pointerId);
      document.body.classList.add("resizing-output");
      const move=moveEvent=>applyHeight(startHeight+moveEvent.clientY-startY);
      const stop=()=>{document.body.classList.remove("resizing-output");handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",stop);handle.removeEventListener("pointercancel",stop);};
      handle.addEventListener("pointermove",move);
      handle.addEventListener("pointerup",stop);
      handle.addEventListener("pointercancel",stop);
    });
    handle.addEventListener("dblclick",()=>{localStorage.removeItem(OUTPUT_LAYOUT_STORAGE_KEY);workspace.style.gridTemplateRows="";toast("已恢复默认输出高度");});
    window.addEventListener("resize",()=>{if(workspace.style.gridTemplateRows)applyHeight(preview.getBoundingClientRect().height,false);});
  }

  applySettings();updateProgressStatus();refreshResultNavigation();initOutputResize();
  setSharedSaveStatus("正在打开手机本地书库…");

  $("#toggle-key").addEventListener("click",()=>{const input=$("#api-key");input.type=input.type==="password"?"text":"password";$("#toggle-key").textContent=input.type==="password"?"显示":"隐藏";});
  $("#fetch-models").addEventListener("click",fetchModels);
  $("#model").addEventListener("change",()=>{collectSettings();scheduleSharedApiConfigSave(0);});
  $("#content-font-size").addEventListener("input",event=>applyContentFontSize(event.target.value,true));
  $("#content-font-size-number").addEventListener("input",event=>{const value=Number(event.target.value);if(Number.isFinite(value)&&value>=MIN_CONTENT_FONT_SIZE&&value<=MAX_CONTENT_FONT_SIZE)applyContentFontSize(value,true);});
  $("#content-font-size-number").addEventListener("change",event=>applyContentFontSize(event.target.value,true));
  $("#reset-content-font-size").addEventListener("click",()=>{applyContentFontSize(DEFAULT_CONTENT_FONT_SIZE,true);toast("已恢复默认内容字号");});
  $("#apply-font-css").addEventListener("click",()=>{state.settings.customFontCss=$("#custom-font-css").value;applyCustomFontCss();saveSettings();toast("字体设置已应用");});
  $("#reset-font-css").addEventListener("click",()=>{$("#custom-font-css").value=DEFAULT_FONT_CSS;state.settings.customFontCss=DEFAULT_FONT_CSS;applyCustomFontCss();saveSettings();toast("已恢复默认字体");});
  $("#custom-font-css").addEventListener("change",()=>{state.settings.customFontCss=$("#custom-font-css").value;applyCustomFontCss();saveSettings();});
  $("#theme-toggle").addEventListener("click",()=>{const current=document.documentElement.dataset.theme;state.settings.theme=current==="dark"?"light":"dark";applyTheme();saveSettings();});

  $("#shared-save-select").addEventListener("change",refreshSharedControls);
  $("#open-shared-save").addEventListener("click",()=>openSharedSave());
  $("#save-as-shared").addEventListener("click",saveCurrentAsNew);
  $("#rename-shared-save").addEventListener("click",renameSelectedSave);
  $("#delete-shared-save").addEventListener("click",deleteSelectedSave);
  $("#export-workspace").addEventListener("click",exportWorkspaceJson);
  $("#import-workspace").addEventListener("click",()=>$("#workspace-import-file").click());
  $("#workspace-import-file").addEventListener("change",importWorkspaceJson);
  $("#batch-export-zip").addEventListener("click",openBatchExportDialog);
  $("#batch-export-cancel").addEventListener("click",closeBatchExportDialog);
  $("#batch-export-confirm").addEventListener("click",confirmBatchExportZip);
  $("#batch-export-select-all").addEventListener("change",event=>setBatchExportAll(event.target.checked));
  $("#batch-export-list").addEventListener("change",()=>{
    const boxes=Array.from($("#batch-export-list").querySelectorAll("input[type=checkbox]"));
    const all=$("#batch-export-select-all");
    if(all)all.checked=boxes.length>0&&boxes.every(box=>box.checked);
    updateBatchExportConfirm();
  });
  $("#batch-export-dialog").addEventListener("cancel",event=>{event.preventDefault();closeBatchExportDialog();});
  $("#tts-read").addEventListener("click",toggleTtsPlayback);
  $("#reading-mode-tts").addEventListener("click",toggleTtsPlayback);
  ["#tts-enabled","#tts-live-enabled","#web-search-enabled"].forEach(id=>$(id).addEventListener("change",()=>{collectSettings();refreshTtsControls();}));
  ["#tts-model","#tts-voice","#tts-voice-custom","#tts-instruction","#web-search-prompt","#tts-live-first-chars","#tts-live-next-chars"].forEach(id=>$(id).addEventListener("change",collectSettings));
  ["#tts-base-url","#tts-api-key"].forEach(id=>$(id).addEventListener("input",()=>{collectSettings();scheduleSharedApiConfigSave();}));
  $("#refresh-shared-saves").addEventListener("click",async()=>{
    if(mutationLocked()||state.sharedSaveBusy)return;
    setSharedSaveBusy(true);
    try {
      await refreshSaveCatalog(state.activeSaveId);
      setSharedSaveStatus(state.activeSaveId ? `当前：《${state.activeSaveTitle}》 · 已保存 ${formatCacheTime(state.activeSaveUpdatedAt)}` : "本机存档列表已刷新。", "ok");
    } catch (error) {
      setSharedSaveStatus(`刷新失败：${error.message || error}`, "error");
    } finally {
      setSharedSaveBusy(false);
    }
  });

  document.querySelectorAll("[data-param]").forEach(box=>box.addEventListener("change",()=>{box.closest("label").querySelector("input:last-child").disabled=!box.checked;collectSettings();}));
  ["#enable-reasoning-params","#enable-request-override"].forEach(id=>$(id).addEventListener("change",()=>{syncAdvancedControls();collectSettings();}));
  ["#reasoning-params-json","#chat-request-path","#chat-request-method","#request-headers-json","#request-body-json"].forEach(id=>$(id).addEventListener("change",collectSettings));
  ["#auto-scroll","#enable-thinking","#all-failure-retry-enabled","#empty-content-retry-enabled","#empty-content-retry-count","#missing-title-retry-enabled","#short-content-retry-enabled","#short-content-min-chars","#short-content-min-ratio","#export-remove-duplicate-titles","#export-strip-wrapper-tags","#export-normalize-whitespace","#export-wrapper-tags"].forEach(id=>$(id).addEventListener("change",collectSettings));
  $("#all-failure-retry-enabled").addEventListener("change",()=>{if($("#all-failure-retry-enabled").checked)$("#empty-content-retry-enabled").checked=false;collectSettings();refreshOperationControls();});
  $("#empty-content-retry-enabled").addEventListener("change",()=>{if($("#empty-content-retry-enabled").checked)$("#all-failure-retry-enabled").checked=false;collectSettings();refreshOperationControls();});
  $("#short-content-retry-enabled").addEventListener("change",()=>{collectSettings();refreshOperationControls();});
  ["#prompt-preset-select"].forEach(id=>$(id).addEventListener("change",event=>{state.settings.selectedPromptPresetId=event.target.value;saveSettings();renderPromptPresetControls();}));$("#apply-prompt-preset").addEventListener("click",applyPromptPreset);$("#new-prompt-preset").addEventListener("click",newPromptPreset);$("#save-prompt-preset").addEventListener("click",savePromptPreset);$("#rename-prompt-preset").addEventListener("click",renamePromptPreset);$("#delete-prompt-preset").addEventListener("click",deletePromptPreset);
  ["#base-url","#api-key"].forEach(id=>$(id).addEventListener("input",()=>{collectSettings();scheduleSharedApiConfigSave();}));
  $("#share-api-config").addEventListener("change",async()=>{
    collectSettings();
    clearTimeout(state.apiConfigSaveTimer);
    if(state.settings.shareApiConfig) await initSharedApiConfig();
    else setSharedApiStatus("本机 API 配置保存已关闭；当前设置只在本次运行中使用。");
  });
  ["#system-prompt","#first-prompt","#auto-advance"].forEach(id=>$(id).addEventListener("change",()=>{collectSettings();updateContextSummaryStatus();scheduleSessionSave();}));$("#include-context").addEventListener("change",()=>{collectSettings();syncContextSummaryControls(mutationLocked()||state.modelsLoading||state.loadingApiConfig);updateContextSummaryStatus();scheduleSessionSave();});
  $("#context-rewritten-only").addEventListener("change",()=>{const rewrittenOnly=$("#context-rewritten-only").checked;if(rewrittenOnly)$("#context-summary-source-rewritten").checked=true;collectSettings();rewriteStoredChapterPrompts(rewrittenOnly);const settings=contextSummarySettings(),context=cloneContextCompression();context.needsRebuild=summaryBlocksNeedRebuild(context,settings.sourceMode,rewrittenOnly);if(!context.blocks.length)context.sourceMode=settings.sourceMode;state.contextCompression=context;renderSummaryBlocks();updateProgressStatus();syncContextSummaryControls(mutationLocked()||state.modelsLoading||state.loadingApiConfig);scheduleSessionSave();toast(rewrittenOnly?"后续历史上下文将只发送改写成果":"已恢复真实请求 + 改写结果的历史上下文模式");});
  const commitPreludeCompression=value=>{syncPreludeCompressionControls(value);state.settings.contextPreludeCompressionEnabled=!!value;const context=cloneContextCompression();if(!value&&hasOriginalPreludeWindow(context)){context.originalPreludeFrom=-1;context.originalPreludeTo=-1;context.preludeCompleted=true;state.contextCompression=normalizeContextCompression(context,state.chapterIndexes.length);renderSummaryBlocks();}else if(value&&contextHasOriginalPreludeSource(context)&&context.summarizedThrough<context.originalPreludeSourceThrough&&!hasOriginalPreludeWindow(context)){const from=Math.max(context.originalBootstrapThrough+1,context.summarizedThrough+1),to=context.originalPreludeSourceThrough;if(from<=to){context.originalPreludeFrom=from;context.originalPreludeTo=to;context.preludeCompleted=false;state.contextCompression=normalizeContextCompression(context,state.chapterIndexes.length);renderSummaryBlocks();}}collectSettings();syncContextSummaryControls(mutationLocked()||state.modelsLoading||state.loadingApiConfig);updateContextSummaryStatus();scheduleSessionSave();};
  $("#context-prelude-compression-enabled").addEventListener("change",event=>commitPreludeCompression(event.target.checked));$("#batch-prelude-compression-enabled").addEventListener("change",event=>commitPreludeCompression(event.target.checked));
  const commitContextSummarySettings=kind=>{collectSettings();const settings=contextSummarySettings(),context=cloneContextCompression();if(kind==="source"){context.needsRebuild=summaryBlocksNeedRebuild(context,settings.sourceMode);if(!context.blocks.length)context.sourceMode=settings.sourceMode;}else if(kind==="range"){context.nextSummaryAt=context.blocks.length?context.summarizedThrough+settings.retain+settings.interval+1:-1;}else if(kind==="enabled"&&settings.enabled&&!context.blocks.length)context.nextSummaryAt=-1;state.contextCompression=context;renderSummaryBlocks();syncContextSummaryControls(mutationLocked()||state.modelsLoading||state.loadingApiConfig);scheduleSessionSave();};
  $("#context-summary-enabled").addEventListener("change",()=>commitContextSummarySettings("enabled"));$("#context-summary-interval").addEventListener("change",()=>commitContextSummarySettings("range"));$("#context-summary-retain").addEventListener("change",()=>commitContextSummarySettings("range"));$("#context-summary-source-rewritten").addEventListener("change",()=>commitContextSummarySettings("source"));$("#context-summary-source-request").addEventListener("change",()=>commitContextSummarySettings("source"));$("#context-summary-prompt").addEventListener("change",()=>commitContextSummarySettings("prompt"));$("#reset-context-summary-prompt").addEventListener("click",()=>{$("#context-summary-prompt").value=DEFAULT_CONTEXT_SUMMARY_PROMPT;commitContextSummarySettings("prompt");toast("已恢复默认总结提示词");});$("#rebuild-context-summaries").addEventListener("click",rebuildContextSummaries);
  ["#title-repeat","#tail-prompt","#end-mark","#nav-prev","#nav-book","#nav-next"].forEach(id=>$(id).addEventListener("input",()=>{collectSettings();state.chapterCache.clear();if(!state.previewDirty)refreshChapters(true,false);scheduleSessionSave();}));
  $("#batch-size").addEventListener("change",()=>{collectSettings();state.currentBatch=Math.floor(state.currentIndex/state.settings.batchSize);state.chapterCache.clear();refreshChapters(true,true);scheduleSessionSave();});

  $("#novel-file").addEventListener("change",async event=>{
    const file=event.target.files?.[0];
    event.target.value="";
    if(!file||mutationLocked()||state.sharedSaveBusy)return;
    $("#file-meta").textContent="正在读取文件…";setWorkspaceImporting(true);
    try{
      if(state.activeSaveId&&await flushSharedSave()!==true)throw new Error("当前本机存档尚未确认保存成功，请先重试。");
      const buffer=await file.arrayBuffer();
      clearTimeout(state.sessionSaveTimer);state.sessionSaveTimer=null;
      state.conversationHistory=[];state.contextCompression=emptyContextCompression(state.settings.contextSummarySourceMode);state.chapterResults.clear();state.resultEntries=[];state.viewedResult=-1;state.previewDirty=false;renderSummaryBlocks();
      state.activeSaveId="";state.activeSaveTitle="";state.activeSaveCreatedAt=0;state.activeSaveUpdatedAt=0;localStorage.removeItem(LAST_SHARED_SAVE_KEY);
      closeAllResultsPreview();closeReadingMode();renderResponse("输出将在这里显示。","");$("#usage").textContent="";$("#copy-output").disabled=true;setRequestState("等待请求","neutral");
      state.fileBuffer=buffer;state.fileName=file.name;$("#encoding").value="auto";decodeFile();refreshResultNavigation();collectSettings();
      const title=file.name.replace(/\.txt$/i,"")||"未命名存档",created=await createSharedSave(title,null,{allowImport:true});
      if(!created)setSharedSaveStatus("小说已载入页面，但尚未保存到手机；可点击“当前另存为”重试。","error");
    }catch(error){
      $("#file-meta").textContent=`读取失败：${error.message||error}`;
      setSharedSaveStatus(`导入小说失败：${error.message||error}`,"error");
    }finally{setWorkspaceImporting(false);}
  });
  $("#encoding").addEventListener("change",()=>runWhenMutable(()=>{decodeFile();scheduleSessionSave();}));$("#batch").addEventListener("change",e=>runWhenMutable(()=>changeBatch(Number(e.target.value))));$("#chapter").addEventListener("change",e=>runWhenMutable(()=>changeChapter(Number(e.target.value))));$("#jump-to-chapter").addEventListener("click",jumpToChapterNumber);$("#rollback-from-chapter").addEventListener("click",rollbackFromChapter);$("#chapter-jump-number").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();jumpToChapterNumber();}});
  $("#prev-batch").addEventListener("click",()=>runWhenMutable(()=>changeBatch(state.currentBatch-1)));$("#next-batch").addEventListener("click",()=>runWhenMutable(()=>changeBatch(state.currentBatch+1)));$("#prev-chapter").addEventListener("click",()=>runWhenMutable(()=>changeChapter(state.currentIndex-1)));$("#next-chapter").addEventListener("click",()=>runWhenMutable(()=>changeChapter(state.currentIndex+1)));$("#preview-prev-chapter").addEventListener("click",()=>runWhenMutable(()=>changeChapter(state.currentIndex-1)));$("#preview-next-chapter").addEventListener("click",()=>runWhenMutable(()=>changeChapter(state.currentIndex+1)));
  $("#chapter-preview").addEventListener("input",()=>runWhenMutable(()=>{state.previewDirty=true;scheduleSessionSave();}));$("#regenerate").addEventListener("click",()=>runWhenMutable(()=>{refreshChapters(true,false);scheduleSessionSave();toast("已重新生成请求内容");}));
  $("#copy-prompt").addEventListener("click",()=>copyText($("#chapter-preview").value));$("#copy-output").addEventListener("click",()=>copyText($("#output").textContent));$("#clear-output").addEventListener("click",()=>{renderResponse("输出将在这里显示。","");$("#usage").textContent="";$("#copy-output").disabled=true;setRequestState("等待请求","neutral");});
  $("#prev-result").addEventListener("click",()=>runWhenMutable(()=>showResult(state.viewedResult-1)));$("#next-result").addEventListener("click",()=>runWhenMutable(()=>showResult(state.viewedResult+1)));$("#reading-mode").addEventListener("click",openReadingMode);$("#export-results").addEventListener("click",exportResults);
  $("#preview-all-results").addEventListener("click",openAllResultsPreview);$("#prev-all-results-page").addEventListener("click",()=>changeAllResultsPage(-1));$("#next-all-results-page").addEventListener("click",()=>changeAllResultsPage(1));$("#copy-all-results").addEventListener("click",copyAllResults);$("#export-all-results").addEventListener("click",exportResults);$("#close-all-results").addEventListener("click",closeAllResultsPreview);$("#all-results-dialog").addEventListener("click",event=>{if(event.target===$("#all-results-dialog"))closeAllResultsPreview();});$("#all-results-dialog").addEventListener("cancel",event=>{event.preventDefault();closeAllResultsPreview();});$("#reading-mode-close").addEventListener("click",closeReadingMode);$("#reading-mode-prev-chapter").addEventListener("click",()=>changeReadingChapter(state.readingChapterIndex-1));$("#reading-mode-next-chapter").addEventListener("click",()=>changeReadingChapter(state.readingChapterIndex+1));$("#reading-mode-jump").addEventListener("click",jumpReadingChapter);$("#reading-mode-jump-number").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();jumpReadingChapter();}});$("#reading-mode-reroll").addEventListener("click",rerollReadingChapter);$("#reading-mode-process-next").addEventListener("click",processReadingNext);$("#reading-mode-dialog").addEventListener("cancel",event=>{event.preventDefault();closeReadingMode();});
  $("#batch-use-current").addEventListener("click",setBatchRangeToCurrent);$("#batch-start").addEventListener("click",startBatchRun);$("#batch-pause").addEventListener("click",toggleBatchPause);$("#batch-stop").addEventListener("click",stopBatchRun);
  $("#clear-context").addEventListener("click",clearContextAndFirstResults);$("#stop").addEventListener("click",()=>{if(state.batchRun)stopBatchRun();else state.controller?.abort();});
  $("#send-first").addEventListener("click",()=>processFirstPrompt());
  $("#reroll-chapter").addEventListener("click",()=>processCurrentChapter(true));
  $("#send-chapter").addEventListener("click",()=>processCurrentChapter(false));
  $("#bottom-reroll-chapter").addEventListener("click",rerollDisplayedChapter);
  $("#bottom-process-next").addEventListener("click",processNextDisplayedChapter);
  $("#bottom-back-to-input").addEventListener("click",scrollToChapterInput);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){if(state.batchRun&&!state.batchRun.paused)toggleBatchPause();if(!state.generatedCommitBusy&&!batchLocked())saveSessionNow();if(state.apiConfigSaveTimer)saveSharedApiConfigNow();}});
  window.addEventListener("pagehide",()=>{if(!state.generatedCommitBusy&&!batchLocked())saveSessionNow();if(state.apiConfigSaveTimer)saveSharedApiConfigNow();});
  setupMobileViewNav();
  initSharedSaves();
  initSharedApiConfig();

})();
