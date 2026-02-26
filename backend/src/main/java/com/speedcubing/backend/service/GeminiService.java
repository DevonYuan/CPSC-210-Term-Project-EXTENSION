package com.speedcubing.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String MODEL = "gemini-2.5-flash";
    private static final long COOLDOWN_MS = 15_000; // 15s between calls
    private static final int CACHE_MAX = 20;

    private long lastCallTime = 0;

    // Simple LRU-style cache: evicts oldest when full
    private final Map<String, String> cache = new LinkedHashMap<>(CACHE_MAX, 0.75f, true) {
        protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
            return size() > CACHE_MAX;
        }
    };

    private final HttpClient httpClient = HttpClient.newHttpClient(); // reuse one client

    public String generateSchedule(String prompt) {
        // Check cache first
        String cached = cache.get(prompt);
        if (cached != null) {
            System.out.println("Gemini cache hit");
            return cached;
        }

        // Enforce cooldown
        long now = System.currentTimeMillis();
        long elapsed = now - lastCallTime;
        if (elapsed < COOLDOWN_MS) {
            long wait = COOLDOWN_MS - elapsed;
            System.out.println("Gemini rate limit: waiting " + wait + "ms");
            return "__RATE_LIMITED__";
        }
        lastCallTime = now;

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + MODEL + ":generateContent?key=" + apiKey;

            String requestBody = """
                {
                    "contents": [{
                        "parts": [{
                            "text": "%s"
                        }]
                    }]
                }
                """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            System.out.println("Gemini status: " + response.statusCode());

            if (response.statusCode() == 200) {
                String body = response.body();
                int textStart = body.indexOf("\"text\": \"") + 9;
                int textEnd = body.indexOf("\"", textStart);
                while (textEnd != -1 && body.charAt(textEnd - 1) == '\\') {
                    textEnd = body.indexOf("\"", textEnd + 1);
                }
                if (textStart > 9 && textEnd > textStart) {
                    String result = body.substring(textStart, textEnd)
                            .replace("\\n", "\n")
                            .replace("\\\"", "\"");
                    cache.put(prompt, result); // store in cache
                    return result;
                }
            }
            return null;
        } catch (Exception e) {
            System.out.println("Gemini error: " + e.getMessage());
            return null;
        }
    }
}