package com.example;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

/**
 * Simple Java web application using the built-in HTTP server.
 */
public class JavaWebApp {
    public static void main(String[] args) throws Exception {
        int port = 8080;
        // Allow configuring the port via command line argument or PORT env var
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                System.err.println("Invalid port argument, falling back to default 8080");
            }
        } else {
            String portEnv = System.getenv("PORT");
            if (portEnv != null) {
                try {
                    port = Integer.parseInt(portEnv);
                } catch (NumberFormatException e) {
                    System.err.println("Invalid PORT environment variable, using default 8080");
                }
            }
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new RootHandler());
        server.setExecutor(null); // use default executor
        System.out.println("Server started on http://localhost:" + port);
        server.start();
    }

    static class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "<html><body><h1>Hello from Java Web!</h1></body></html>";
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, response.getBytes().length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }
}
