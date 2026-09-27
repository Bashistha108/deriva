package com.deriva.domain.learning;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_lesson_progress")
@IdClass(UserLessonProgressId.class)
public class UserLessonProgress {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Id
    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status = ProgressStatus.NOT_STARTED;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "last_viewed_at", nullable = false)
    private LocalDateTime lastViewedAt = LocalDateTime.now();

    public UserLessonProgress() {}

    public UserLessonProgress(UUID userId, UUID lessonId) {
        this.userId = userId;
        this.lessonId = lessonId;
    }

    // Getters and setters omitted for brevity...
}
