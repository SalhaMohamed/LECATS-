package com.project.lecats.service;

import com.project.lecats.entity.User;
import com.project.lecats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository repository;

    @Override
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    @Override
    public User saveUser(User user) {
        return repository.save(user);
    }

    @Override
    public User getUserByEmail(String email) {
        Optional<User> optionalUser = repository.findByEmail(email);
        return optionalUser.orElse(null);  // or throw exception if preferred
    }

    @Override
    public User registerUserWithPicture(User user, MultipartFile picture) {
        try {
            if (picture != null && !picture.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + picture.getOriginalFilename();
                Path path = Paths.get("uploads/" + fileName);
                Files.createDirectories(path.getParent());
                Files.write(path, picture.getBytes());

                // Badilisha hapa kulingana na jina la property kwenye User entity yako
                user.setPicturePath(fileName);
                ;  // assuming your entity has setPicture()
            }
            return repository.save(user);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save picture", e);
        }
    }
}
