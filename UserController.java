package com.project.lecats.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.lecats.entity.User;
import com.project.lecats.repository.UserRepository;
import com.project.lecats.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;



    @Value("${file.upload-dir}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_FILE_TYPES = {"image/jpeg", "image/png"};

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestPart("user") String userJson,
            @RequestPart(value = "picture", required = false) MultipartFile picture
    ) {
        try {
            // Validate picture file
            if (picture != null && !picture.isEmpty()) {
                if (picture.getSize() > MAX_FILE_SIZE) {
                    return ResponseEntity.badRequest().body(
                            Map.of("message", "File size exceeds 5MB limit")
                    );
                }
                if (!Arrays.asList(ALLOWED_FILE_TYPES).contains(picture.getContentType())) {
                    return ResponseEntity.badRequest().body(
                            Map.of("message", "Only JPEG/PNG images are allowed")
                    );
                }
            }
            // Convert JSON to User object
            ObjectMapper objectMapper = new ObjectMapper();
            User user = objectMapper.readValue(userJson, User.class);

            // Validate user data
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Email already in use")
                );
            }

            // Process file upload
            if (picture != null && !picture.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" +
                        StringUtils.cleanPath(picture.getOriginalFilename());
                Path uploadPath = Paths.get(uploadDir);

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(
                        picture.getInputStream(),
                        uploadPath.resolve(fileName)
                );
                user.setPicturePath(fileName);

            }

            // Encrypt password
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // Save user
            userRepository.save(user);

            // Generate JWT token
            String token = jwtService.generateToken(user.getEmail());

            // Return response with token and role
            return ResponseEntity.ok(
                    Map.of(
                            "message", "User registered successfully",
                            "userId", user.getId(),
                            "token", token,
                            "role", user.getRole()
                    )
            );

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Registration failed: " + e.getMessage())
            );
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> getLoggedUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractUsername(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(user);
    }
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(
            @RequestBody Map<String, String> updatedUser,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userEmail = jwtService.extractUsername(token); // tumia JWT kusoma email
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update name and email
            if (updatedUser.containsKey("name")) {
                user.setName(updatedUser.get("name"));
            }
            if (updatedUser.containsKey("email")) {
                user.setEmail(updatedUser.get("email"));
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "User updated successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "Failed to update user: " + e.getMessage()));
        }
    }


}
