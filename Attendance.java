package com.project.lecats.model;

import com.project.lecats.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status; // e.g. Present, Absent, Late

    private LocalDateTime timestamp;

    @ManyToOne
    private User lecturer;

    @ManyToOne
    private Course course;

    // Getters and setters
}
