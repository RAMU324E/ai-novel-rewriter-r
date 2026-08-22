(() => {
  "use strict";

  const DB_NAME = "novelAiMobileLibrary";
  const DB_VERSION = 1;
  const SAVE_STORE = "saves";
  const CONFIG_STORE = "config";
  const CONFIG_KEY = "api-config";
  const SAVE_ID_PATTERN = /^[a-f0-9]{32}$/;
  const CONFIG_LIMITS = { baseUrl: 2048, apiKey: 16384, model: 512, ttsApiKey: 16384 };
  let dbPromise = null;
  let bookNormalizer = value => clone(value);
  let wakeLock = null;
  const activeWork = new Set();

  function isNative() {
    return !!globalThis.Capacitor?.isNativePlatform?.();
  }

  function plugin(name) {
    return globalThis.Capacitor?.Plugins?.[name] || null;
  }

  function clone(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function apiError(status, message) {
    const error = new Error(message);
    error.code = "SHARED_API_HTTP";
    error.status = status;
    return error;
  }

  function openDatabase() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(SAVE_STORE)) database.createObjectStore(SAVE_STORE, { keyPath: "id" });
        if (!database.objectStoreNames.contains(CONFIG_STORE)) database.createObjectStore(CONFIG_STORE, { keyPath: "key" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("无法打开手机本地书库。"));
      request.onblocked = () => reject(new Error("手机本地书库正被另一个页面占用。"));
    });
    return dbPromise;
  }

  async function storeGet(storeName, key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result ? clone(request.result) : null);
      request.onerror = () => reject(request.error || new Error("读取手机本地数据失败。"));
      transaction.onabort = () => reject(transaction.error || new Error("读取手机本地数据已中止。"));
    });
  }

  async function storeGetAll(storeName) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve((request.result || []).map(clone));
      request.onerror = () => reject(request.error || new Error("读取手机本地列表失败。"));
      transaction.onabort = () => reject(transaction.error || new Error("读取手机本地列表已中止。"));
    });
  }

  async function storePut(storeName, value) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(clone(value));
      transaction.oncomplete = () => resolve(clone(value));
      transaction.onerror = () => reject(transaction.error || new Error("写入手机本地数据失败。"));
      transaction.onabort = () => reject(transaction.error || new Error("写入手机本地数据已中止。"));
    });
  }

  async function storeDelete(storeName, key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).delete(key);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error("删除手机本地数据失败。"));
      transaction.onabort = () => reject(transaction.error || new Error("删除手机本地数据已中止。"));
    });
  }

  function parseBody(options) {
    if (options?.body === undefined || options.body === null || options.body === "") return {};
    if (typeof options.body === "string") {
      try { return JSON.parse(options.body); }
      catch (error) { throw apiError(400, `请求不是有效 JSON：${error.message || error}`); }
    }
    if (typeof options.body === "object") return clone(options.body);
    throw apiError(400, "请求体格式无效。");
  }

  function createSaveId() {
    if (crypto.randomUUID) return crypto.randomUUID().replaceAll("-", "").toLowerCase();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
  }

  function cleanTitle(value, fallback = "未命名存档") {
    const title = String(value || "").trim().slice(0, 160);
    return title || fallback;
  }

  function normalizeConfig(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw apiError(400, "API 配置顶层必须是 JSON 对象。");
    const result = {};
    for (const [key, limit] of Object.entries(CONFIG_LIMITS)) {
      const item = value[key] ?? "";
      if (typeof item !== "string") throw apiError(400, `API 配置字段 ${key} 必须是字符串。`);
      const text = item.trim();
      if (text.length > limit) throw apiError(400, `API 配置字段 ${key} 过长。`);
      result[key] = text;
    }
    return result;
  }

  function bookMetadata(book) {
    const results = Array.isArray(book?.progress?.results) ? book.progress.results : [];
    const completed = new Set(results.filter(item => item?.type === "chapter" && Number.isInteger(item.chapterIndex) && String(item.content || "").trim()).map(item => item.chapterIndex)).size;
    return {
      id: String(book?.id || ""),
      title: cleanTitle(book?.title),
      fileName: String(book?.source?.fileName || ""),
      createdAt: Number(book?.createdAt) || 0,
      updatedAt: Number(book?.updatedAt) || 0,
      chapterCount: Math.max(0, Number(book?.summary?.chapterCount) || 0),
      completedCount: completed
    };
  }

  async function localApi(rawPath, options = {}) {
    const path = new URL(String(rawPath || ""), "https://localhost").pathname;
    const method = String(options.method || "GET").toUpperCase();

    if (path === "/api/health" && method === "GET") return { ok: true, service: "novel-ai-mobile", schemaVersion: 1 };

    if (path === "/api/api-config") {
      if (method === "GET") {
        const stored = await storeGet(CONFIG_STORE, CONFIG_KEY);
        if (!stored) return { configured: false, config: { baseUrl: "", apiKey: "", model: "", updatedAt: 0 } };
        const config = normalizeConfig(stored);
        config.updatedAt = Number(stored.updatedAt) || 0;
        return { configured: true, config };
      }
      if (method === "PUT") {
        const config = normalizeConfig(parseBody(options));
        config.key = CONFIG_KEY;
        config.updatedAt = Date.now();
        await storePut(CONFIG_STORE, config);
        const result = { ...config };
        delete result.key;
        return { configured: true, config: result };
      }
      throw apiError(405, "该 API 不支持此方法。");
    }

    if (path === "/api/saves") {
      if (method === "GET") {
        const books = await storeGetAll(SAVE_STORE);
        const saves = books.map(bookMetadata).sort((a, b) => b.updatedAt - a.updatedAt);
        return { saves };
      }
      if (method === "POST") {
        const payload = parseBody(options);
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw apiError(400, "存档顶层必须是 JSON 对象。");
        const now = Date.now();
        const book = bookNormalizer(clone(payload));
        book.id = createSaveId();
        book.title = cleanTitle(book.title, String(book?.source?.fileName || "未命名存档").replace(/\.txt$/i, ""));
        book.createdAt = now;
        book.updatedAt = now;
        await storePut(SAVE_STORE, book);
        return clone(book);
      }
      throw apiError(405, "该 API 不支持此方法。");
    }

    const match = path.match(/^\/api\/saves\/([a-f0-9]{32})$/);
    if (!match) throw apiError(404, "本机存档 API 不存在。");
    const saveId = match[1];
    if (!SAVE_ID_PATTERN.test(saveId)) throw apiError(404, "存档不存在。");
    const old = await storeGet(SAVE_STORE, saveId);
    if (!old) throw apiError(404, "存档不存在。");

    if (method === "GET") return clone(old);
    if (method === "PUT") {
      const payload = parseBody(options);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw apiError(400, "存档顶层必须是 JSON 对象。");
      const book = bookNormalizer(clone(payload));
      book.id = saveId;
      book.title = cleanTitle(book.title, old.title);
      book.createdAt = Number(old.createdAt) || Date.now();
      book.updatedAt = Date.now();
      await storePut(SAVE_STORE, book);
      return clone(book);
    }
    if (method === "PATCH") {
      const body = parseBody(options);
      const book = clone(old);
      book.title = cleanTitle(body.title, old.title);
      book.updatedAt = Date.now();
      await storePut(SAVE_STORE, book);
      return clone(book);
    }
    if (method === "DELETE") {
      await storeDelete(SAVE_STORE, saveId);
      return { ok: true, id: saveId };
    }
    throw apiError(405, "该 API 不支持此方法。");
  }

  function safeFileName(value, fallback) {
    const result = String(value || fallback).replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim();
    return (result || fallback).slice(0, 180);
  }

  async function shareTextFile(name, text, mimeType = "text/plain") {
    if (!isNative()) return false;
    const Filesystem = plugin("Filesystem");
    const Share = plugin("Share");
    if (!Filesystem || !Share) throw new Error("当前 APK 缺少文件导出插件。");
    const fileName = safeFileName(name, "导出.txt");
    const path = `exports/${Date.now()}-${fileName}`;
    const written = await Filesystem.writeFile({ path, data: String(text ?? ""), directory: "CACHE", encoding: "utf8", recursive: true });
    const uri = written?.uri || (await Filesystem.getUri({ path, directory: "CACHE" })).uri;
    await Share.share({ title: fileName, dialogTitle: "保存或分享文件", url: uri });
    return true;
  }

  async function shareBinaryFile(name, base64, mimeType = "application/octet-stream") {
    if (!isNative()) return false;
    const Filesystem = plugin("Filesystem");
    const Share = plugin("Share");
    if (!Filesystem || !Share) throw new Error("当前 APK 缺少文件导出插件。");
    const fileName = safeFileName(name, "导出.zip");
    const path = `exports/${Date.now()}-${fileName}`;
    const written = await Filesystem.writeFile({ path, data: String(base64 ?? ""), directory: "CACHE", recursive: true });
    const uri = written?.uri || (await Filesystem.getUri({ path, directory: "CACHE" })).uri;
    await Share.share({ title: fileName, dialogTitle: "保存或分享文件", url: uri });
    return true;
  }

  async function shareBinaryFileChunked(name, chunks, mimeType = "application/zip") {
    if (!isNative()) return false;
    const Filesystem = plugin("Filesystem");
    const Share = plugin("Share");
    if (!Filesystem || !Share) throw new Error("当前 APK 缺少文件导出插件。");
    const fileName = safeFileName(name, "导出.zip");
    const path = `exports/${Date.now()}-${fileName}`;
    const parts = Array.isArray(chunks) ? chunks.map(chunk => String(chunk || "")) : [String(chunks ?? "")];
    if (!parts.length || !parts[0]) throw new Error("没有可写入的导出数据。");
    await Filesystem.writeFile({ path, data: parts[0], directory: "CACHE", recursive: true });
    for (let i = 1; i < parts.length; i++) {
      if (!parts[i]) continue;
      await Filesystem.appendFile({ path, data: parts[i], directory: "CACHE" });
    }
    const uri = (await Filesystem.getUri({ path, directory: "CACHE" })).uri;
    await Share.share({ title: fileName, dialogTitle: "保存或分享文件", url: uri });
    return true;
  }

  async function requestWakeLock() {
    if (!activeWork.size || document.visibilityState !== "visible" || wakeLock || !navigator.wakeLock?.request) return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => { wakeLock = null; });
    } catch {}
  }

  async function releaseWakeLock() {
    const current = wakeLock;
    wakeLock = null;
    try { await current?.release(); } catch {}
  }

  async function setWorkActive(kind, active) {
    const key = String(kind || "work");
    if (active) activeWork.add(key); else activeWork.delete(key);
    if (activeWork.size) await requestWakeLock(); else await releaseWakeLock();
  }

  function setupBackButton() {
    if (!isNative()) return;
    const App = plugin("App");
    if (!App?.addListener) return;
    App.addListener("backButton", async () => {
      const reading = document.querySelector("#reading-mode-dialog");
      if (reading?.open) {
        document.querySelector("#reading-mode-close")?.click();
        return;
      }
      const dialog = document.querySelector("#all-results-dialog");
      if (dialog?.open) {
        document.querySelector("#close-all-results")?.click();
        return;
      }
      const main = document.querySelector(".app-shell");
      if (main?.dataset.mobileView && main.dataset.mobileView !== "write" && window.matchMedia("(max-width: 900px)").matches) {
        document.querySelector("#mobile-nav-write")?.click();
        return;
      }
      const batchStop = document.querySelector("#batch-stop");
      if (batchStop && !batchStop.disabled) {
        if (confirm("批量处理仍在运行，是否停止当前批量？")) batchStop.click();
        return;
      }
      const stop = document.querySelector("#stop");
      if (stop && !stop.disabled) {
        stop.click();
        return;
      }
      if (globalThis.NovelMobileUiState?.isExitBlocked?.()) {
        alert("正在保存当前结果，请稍候再退出。");
        return;
      }
      await App.exitApp();
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestWakeLock();
    else releaseWakeLock();
  });
  window.addEventListener("DOMContentLoaded", setupBackButton, { once: true });
  navigator.storage?.persist?.().catch(() => {});

  globalThis.NovelMobile = Object.freeze({
    isNative,
    localApi,
    setBookNormalizer(normalizer) { if (typeof normalizer === "function") bookNormalizer = normalizer; },
    shareTextFile,
    shareBinaryFile,
    shareBinaryFileChunked,
    setWorkActive,
    async resetLocalDataForTests() {
      if (isNative()) throw new Error("正式 APK 不允许清空测试数据。");
      if (dbPromise) {
        const database = await dbPromise;
        database.close();
        dbPromise = null;
      }
      await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error("清空测试书库失败。"));
        request.onblocked = () => reject(new Error("测试书库仍被占用。"));
      });
    }
  });
})();
