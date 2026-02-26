package com.speedcubing.backend.service;

import com.speedcubing.backend.model.UserBase;
import com.speedcubing.backend.persistence.JsonReader;
import com.speedcubing.backend.persistence.JsonWriter;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.IOException;

@Service
public class DataStore {

    private static final String DATA_PATH = "./data/UsersData.json";
    private UserBase userBase;

    @PostConstruct
    public void load() {
        try {
            JsonReader reader = new JsonReader(DATA_PATH);
            userBase = reader.read();
        } catch (IOException e) {
            userBase = new UserBase();
        }
    }

    public void save() {
        try {
            JsonWriter writer = new JsonWriter(DATA_PATH);
            writer.open();
            writer.write(userBase);
            writer.close();
        } catch (FileNotFoundException e) {
            System.out.println("Could not save data: " + e.getMessage());
        }
    }

    public UserBase getUserBase() {
        return userBase;
    }
}