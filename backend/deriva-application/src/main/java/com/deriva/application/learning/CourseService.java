package com.deriva.application.learning;

import com.deriva.domain.learning.Course;
import com.deriva.domain.learning.ContentStatus;
import com.deriva.persistence.learning.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getPublishedCourses() {
        return courseRepository.findByStatus(ContentStatus.PUBLISHED);
    }
    
    // Additional logic for creating/updating courses, validating Markdown content, etc.
}
