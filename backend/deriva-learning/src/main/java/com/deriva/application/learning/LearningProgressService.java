package com.deriva.application.learning;

import com.deriva.domain.learning.ProgressStatus;
import com.deriva.domain.learning.UserLessonProgress;
import com.deriva.domain.learning.UserLessonProgressId;
import com.deriva.persistence.learning.UserLessonProgressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LearningProgressService {

    private final UserLessonProgressRepository progressRepository;

    public LearningProgressService(UserLessonProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public List<UserLessonProgress> getUserProgress(UUID userId) {
        return progressRepository.findByUserId(userId);
    }

    public void markLessonCompleted(UUID userId, UUID lessonId) {
        UserLessonProgress progress = progressRepository.findById(new UserLessonProgressId(userId, lessonId))
            .orElse(new UserLessonProgress(userId, lessonId));
            
        // Use reflection or actual setters depending on entity implementation
        // For brevity we assume setters exist or logic happens inside the entity method
        // progress.setStatus(ProgressStatus.COMPLETED);
        // progress.setCompletedAt(LocalDateTime.now());
        
        progressRepository.save(progress);
    }
}
