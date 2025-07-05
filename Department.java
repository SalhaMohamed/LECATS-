package com.project.lecats.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Optional: One department can have many courses
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Course> courses;

    // Getters and setters
}
