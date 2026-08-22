package com.limcode.novelaimobile;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.io.Reader;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

@CapacitorPlugin(name = "NativeStream")
public class NativeStreamPlugin extends Plugin {

    private static final Set<String> METHODS = Collections.unmodifiableSet(new HashSet<>(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE")));
    private static final int MAX_ERROR_CHARS = 1_000_000;
    private final Map<String, Call> activeCalls = new ConcurrentHashMap<>();
    private final OkHttpClient baseClient = new OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.MINUTES)
        .build();

    @PluginMethod
    public void start(PluginCall pluginCall) {
        String requestId = clean(pluginCall.getString("requestId"));
        String url = clean(pluginCall.getString("url"));
        String method = clean(pluginCall.getString("method", "POST")).toUpperCase(Locale.ROOT);
        String body = pluginCall.getString("body", "");
        JSObject headers = pluginCall.getObject("headers", new JSObject());
        Integer connectTimeout = pluginCall.getInt("connectTimeout", 30_000);
        Integer readTimeout = pluginCall.getInt("readTimeout", 300_000);

        if (requestId.isEmpty()) {
            pluginCall.reject("requestId 不能为空");
            return;
        }
        if (activeCalls.containsKey(requestId)) {
            pluginCall.reject("requestId 正在使用");
            return;
        }
        if (!(url.startsWith("https://") || url.startsWith("http://"))) {
            pluginCall.reject("只支持 HTTP 或 HTTPS URL");
            return;
        }
        if (!METHODS.contains(method)) {
            pluginCall.reject("不支持 HTTP 方法：" + method);
            return;
        }

        try {
            Request.Builder builder = new Request.Builder().url(url);
            String contentType = "application/json; charset=utf-8";
            Iterator<String> names = headers.keys();
            while (names.hasNext()) {
                String name = names.next();
                Object rawValue = headers.opt(name);
                if (rawValue == null || rawValue == JSObject.NULL) continue;
                String value = String.valueOf(rawValue);
                builder.header(name, value);
                if ("content-type".equalsIgnoreCase(name)) contentType = value;
            }

            RequestBody requestBody = null;
            if (!"GET".equals(method)) {
                MediaType mediaType = MediaType.parse(contentType);
                requestBody = RequestBody.create(body == null ? "" : body, mediaType);
            }
            builder.method(method, requestBody);

            OkHttpClient client = baseClient.newBuilder()
                .connectTimeout(clampTimeout(connectTimeout, 1_000, 120_000), TimeUnit.MILLISECONDS)
                .readTimeout(clampTimeout(readTimeout, 5_000, 900_000), TimeUnit.MILLISECONDS)
                .build();
            Call call = client.newCall(builder.build());
            activeCalls.put(requestId, call);
            call.enqueue(new Callback() {
                @Override
                public void onFailure(Call failedCall, IOException error) {
                    activeCalls.remove(requestId, failedCall);
                    if (failedCall.isCanceled()) {
                        emit(requestId, "cancelled", null);
                    } else {
                        JSObject event = baseEvent(requestId, "error");
                        event.put("message", safeMessage(error));
                        notifyListeners("streamEvent", event);
                    }
                }

                @Override
                public void onResponse(Call completedCall, Response response) {
                    try (response) {
                        JSObject headerEvent = baseEvent(requestId, "headers");
                        headerEvent.put("status", response.code());
                        headerEvent.put("contentType", response.header("Content-Type", ""));
                        notifyListeners("streamEvent", headerEvent);

                        ResponseBody responseBody = response.body();
                        if (!response.isSuccessful()) {
                            JSObject errorEvent = baseEvent(requestId, "error");
                            errorEvent.put("status", response.code());
                            errorEvent.put("message", "HTTP " + response.code());
                            errorEvent.put("body", responseBody == null ? "" : readLimited(responseBody.charStream(), MAX_ERROR_CHARS));
                            notifyListeners("streamEvent", errorEvent);
                            return;
                        }
                        if (responseBody == null) {
                            JSObject errorEvent = baseEvent(requestId, "error");
                            errorEvent.put("message", "接口没有返回响应体");
                            notifyListeners("streamEvent", errorEvent);
                            return;
                        }

                        try (Reader reader = responseBody.charStream()) {
                            char[] buffer = new char[4096];
                            int count;
                            while ((count = reader.read(buffer)) != -1) {
                                if (completedCall.isCanceled()) return;
                                if (count == 0) continue;
                                JSObject chunkEvent = baseEvent(requestId, "chunk");
                                chunkEvent.put("data", new String(buffer, 0, count));
                                notifyListeners("streamEvent", chunkEvent);
                            }
                        }
                        if (!completedCall.isCanceled()) emit(requestId, "complete", null);
                    } catch (Exception error) {
                        if (!completedCall.isCanceled()) {
                            JSObject errorEvent = baseEvent(requestId, "error");
                            errorEvent.put("message", safeMessage(error));
                            notifyListeners("streamEvent", errorEvent);
                        }
                    } finally {
                        activeCalls.remove(requestId, completedCall);
                    }
                }
            });

            JSObject accepted = new JSObject();
            accepted.put("requestId", requestId);
            pluginCall.resolve(accepted);
        } catch (Exception error) {
            activeCalls.remove(requestId);
            pluginCall.reject(safeMessage(error));
        }
    }

    @PluginMethod
    public void cancel(PluginCall pluginCall) {
        String requestId = clean(pluginCall.getString("requestId"));
        Call call = activeCalls.remove(requestId);
        if (call != null) call.cancel();
        JSObject result = new JSObject();
        result.put("requestId", requestId);
        result.put("cancelled", call != null);
        pluginCall.resolve(result);
    }

    @Override
    protected void handleOnDestroy() {
        for (Call call : activeCalls.values()) call.cancel();
        activeCalls.clear();
        super.handleOnDestroy();
    }

    private void emit(String requestId, String type, JSObject extra) {
        JSObject event = baseEvent(requestId, type);
        if (extra != null) {
            Iterator<String> keys = extra.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                event.put(key, extra.opt(key));
            }
        }
        notifyListeners("streamEvent", event);
    }

    private static JSObject baseEvent(String requestId, String type) {
        JSObject event = new JSObject();
        event.put("requestId", requestId);
        event.put("type", type);
        return event;
    }

    private static int clampTimeout(Integer value, int minimum, int maximum) {
        int selected = value == null ? minimum : value;
        return Math.max(minimum, Math.min(maximum, selected));
    }

    private static String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private static String safeMessage(Throwable error) {
        if (error == null) return "原生流式请求失败";
        String message = error.getMessage();
        return message == null || message.trim().isEmpty() ? error.getClass().getSimpleName() : message;
    }

    private static String readLimited(Reader reader, int maximum) throws IOException {
        StringBuilder result = new StringBuilder(Math.min(maximum, 8192));
        char[] buffer = new char[4096];
        while (result.length() < maximum) {
            int wanted = Math.min(buffer.length, maximum - result.length());
            int count = reader.read(buffer, 0, wanted);
            if (count == -1) break;
            result.append(buffer, 0, count);
        }
        return result.toString();
    }
}
