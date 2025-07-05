package com.project.lecats.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    public WebConfig() {
        System.out.println("WebConfig loaded!");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Absolute path to uploads folder on your machine
        String uploadPath = "C:/Users/Unstoppable/Desktop/lecats/uploads/";

        System.out.println("Serving uploads from: file:" + uploadPath);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath);
    }
}
