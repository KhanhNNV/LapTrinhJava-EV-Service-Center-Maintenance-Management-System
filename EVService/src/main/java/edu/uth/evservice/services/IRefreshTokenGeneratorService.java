package edu.uth.evservice.services;

import java.io.IOException;

public interface IRefreshTokenGeneratorService {
    void initializeRefreshToken() throws IOException;
    String readRefreshTokenFromFile() throws IOException;
    boolean isRefreshTokenExists();
}
