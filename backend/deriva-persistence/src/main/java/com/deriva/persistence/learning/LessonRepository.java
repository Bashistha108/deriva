package com.deriva.persistence.learning;

import com.deriva.domain.learning.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    Optional<Lesson> findBySlug(String slug);
}
