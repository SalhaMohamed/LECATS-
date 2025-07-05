package com.project.lecats.service;

import com.project.lecats.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User saveUser(User user);
    User getUserByEmail(String email);

    User registerUserWithPicture(User user, MultipartFile picture);
}
