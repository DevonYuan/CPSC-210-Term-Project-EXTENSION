package com.speedcubing.backend.controller;

import com.speedcubing.backend.model.PracticeSession;
import com.speedcubing.backend.model.Scrambler;
import com.speedcubing.backend.model.Solve;
import com.speedcubing.backend.model.User;
import com.speedcubing.backend.service.DataStore;
import org.springframework.web.bind.annotation.*;
import com.speedcubing.backend.service.GeminiService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final DataStore dataStore;
    private final Scrambler scrambler = new Scrambler();
    private final GeminiService geminiService;

    public UserController(DataStore dataStore, GeminiService geminiService) {
        this.dataStore = dataStore;
        this.geminiService = geminiService;
    }

    // --- AUTH ---

    @PostMapping("/auth/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String username = body.get("username");
        String password = body.get("password");

        if (dataStore.getUserBase().containsUsername(username)) {
            return Map.of("success", false, "message", "Username already taken");
        }

        User newUser = new User(name, username, password);
        dataStore.getUserBase().addUser(newUser);
        dataStore.save();
        return Map.of("success", true, "message", "Account created successfully");
    }

    @PostMapping("/auth/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null || !user.verifyPassword(password)) {
            return Map.of("success", false, "message", "Invalid username or password");
        }

        return Map.of("success", true, "name", user.getName(), "username", user.getUserName());
    }

    // --- SCRAMBLE ---

    @GetMapping("/scramble")
    public Map<String, String> getScramble() {
        return Map.of("scramble", scrambler.generateScramble());
    }

    // --- SESSIONS ---

    @GetMapping("/sessions/{username}")
    public List<Map<String, Object>> getSessions(@PathVariable String username) {
        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null) return List.of();

        List<Map<String, Object>> result = new ArrayList<>();
        for (PracticeSession session : user.getPracticeSessions()) {
            result.add(Map.of(
                    "name", session.getSessionName(),
                    "numSolves", session.getNumSolves()
            ));
        }
        return result;
    }

    @PostMapping("/sessions/{username}")
    public Map<String, Object> createSession(@PathVariable String username,
                                             @RequestBody Map<String, String> body) {
        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null) return Map.of("success", false, "message", "User not found");

        String sessionName = body.get("sessionName");
        String mode = body.getOrDefault("mode", "new");

        if (user.containsPracticeSessionName(sessionName)) {
            if (mode.equals("overwrite")) {
                user.deleteSession(sessionName);
                user.addPracticeSession(new PracticeSession(sessionName));
            }
            // if mode is "resume", do nothing - session already exists
        } else {
            user.addPracticeSession(new PracticeSession(sessionName));
        }

        dataStore.save();
        return Map.of("success", true);
    }

    // --- SOLVES ---

    @GetMapping("/sessions/{username}/{sessionName}/solves")
    public Map<String, Object> getSolves(@PathVariable String username,
                                         @PathVariable String sessionName) {
        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null) return Map.of("success", false);

        PracticeSession session = getSession(user, sessionName);
        if (session == null) return Map.of("success", false);

        List<Map<String, Object>> solves = new ArrayList<>();
        for (Solve s : session.getSolves()) {
            solves.add(Map.of("time", s.getTime(), "scramble", s.getScramble()));
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("success", true);
        result.put("solves", solves);
        result.put("numSolves", session.getNumSolves());
        if (session.getNumSolves() >= 5) result.put("ao5", round(session.averageOf5()));
        if (session.getNumSolves() >= 12) result.put("ao12", round(session.averageOf12()));
        if (session.getNumSolves() >= 100) result.put("ao100", round(session.averageOf100()));
        return result;
    }

    @PostMapping("/sessions/{username}/{sessionName}/solves")
    public Map<String, Object> addSolve(@PathVariable String username,
                                        @PathVariable String sessionName,
                                        @RequestBody Map<String, Object> body) {
        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null) return Map.of("success", false, "message", "User not found");

        PracticeSession session = getSession(user, sessionName);
        if (session == null) return Map.of("success", false, "message", "Session not found");

        double time = ((Number) body.get("time")).doubleValue();
        String scramble = (String) body.get("scramble");
        session.addSolve(new Solve(time, scramble));
        dataStore.save();

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("success", true);
        result.put("numSolves", session.getNumSolves());
        if (session.getNumSolves() >= 5) result.put("ao5", round(session.averageOf5()));
        if (session.getNumSolves() >= 12) result.put("ao12", round(session.averageOf12()));
        if (session.getNumSolves() >= 100) result.put("ao100", round(session.averageOf100()));
        return result;
    }

    // --- SPLIT DIAGNOSIS ---

    @PostMapping("/diagnose")
    public Map<String, Object> diagnoseSplits(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        String sessionName = (String) body.get("sessionName");
        List<Number> splitsRaw = (List<Number>) body.get("splits");
        List<Double> splitsList = splitsRaw.stream()
                .map(Number::doubleValue)
                .collect(java.util.stream.Collectors.toList());

        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null) return Map.of("success", false, "message", "User not found");

        PracticeSession session = getSession(user, sessionName);
        if (session == null) return Map.of("success", false, "message", "Session not found");

        double[] splits = splitsList.stream().mapToDouble(Double::doubleValue).toArray();
        ArrayList<String> areas = session.diagnoseSplits(splits);
        return Map.of("success", true, "areasForImprovement", areas);
    }

    // --- PRACTICE SCHEDULE ---

    @PostMapping("/schedule")
    public Map<String, Object> getSchedule(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        List<Integer> timesList = (List<Integer>) body.get("practiceTimes");
        List<String> skillsList = (List<String>) body.get("skills");
        ArrayList<String> skills = new ArrayList<>(skillsList);

        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null) return Map.of("success", false, "message", "User not found");

        int[] practiceTimes = timesList.stream().mapToInt(Integer::intValue).toArray();
        ArrayList<String> schedule = user.customPracticeSchedule(practiceTimes, skills);
        return Map.of("success", true, "schedule", schedule);
    }

    // --- AI SCHEDULE ---

    @PostMapping("/schedule/ai")
    public Map<String, Object> getAiSchedule(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        List<Map<String, String>> timeWindows = (List<Map<String, String>>) body.get("timeWindows");
        List<String> skills = (List<String>) body.get("skills");

        User user = dataStore.getUserBase().getUserByUsername(username);
        if (user == null) return Map.of("success", false, "message", "User not found");

        // Shortened prompt — same info, ~40% fewer tokens
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a speedcubing coach. Create a concise weekly practice schedule.\n");
        prompt.append("Skills: standard");
        if (skills != null && !skills.isEmpty()) {
            skills.forEach(s -> prompt.append(", ").append(s));
        }
        prompt.append("\nAvailability:\n");
        for (Map<String, String> window : timeWindows) {
            String windows = window.get("windows");
            if (windows != null && !windows.isBlank()) {
                prompt.append(window.get("day"), 0, 3)  // "Mon", "Tue" etc.
                        .append(": ").append(windows).append("\n");
            }
        }
        prompt.append("Assign time blocks per skill for each available day. Be brief.");

        String aiResponse = geminiService.generateSchedule(prompt.toString());

        if ("__RATE_LIMITED__".equals(aiResponse)) {
            return Map.of("success", false, "message", "Please wait a moment before generating again.");
        }
        if (aiResponse == null) {
            return Map.of("success", false, "message", "AI schedule generation failed");
        }

        return Map.of("success", true, "schedule", aiResponse);
    }

    // --- HELPERS ---

    private PracticeSession getSession(User user, String sessionName) {
        for (PracticeSession s : user.getPracticeSessions()) {
            if (s.getSessionName().equals(sessionName)) return s;
        }
        return null;
    }

    private double round(double value) {
        return Math.round(value * 1000.0) / 1000.0;
    }
}
