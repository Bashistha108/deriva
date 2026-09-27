package com.deriva.persistence.learning;

import com.deriva.domain.learning.UserLessonProgress;
import com.deriva.domain.learning.UserLessonProgressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, UserLessonProgressId> {
    List<UserLessonProgress> findByUserId(UUID userId);
}
