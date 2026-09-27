package com.deriva.persistence.learning;

import com.deriva.domain.learning.Course;
import com.deriva.domain.learning.ContentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    Optional<Course> findBySlug(String slug);
    List<Course> findByStatus(ContentStatus status);
}
