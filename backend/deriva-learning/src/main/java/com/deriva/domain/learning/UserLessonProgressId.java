package com.deriva.domain.learning;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class UserLessonProgressId implements Serializable {

    private UUID userId;
    private UUID lessonId;

    public UserLessonProgressId() {}

    public UserLessonProgressId(UUID userId, UUID lessonId) {
        this.userId = userId;
        this.lessonId = lessonId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserLessonProgressId that = (UserLessonProgressId) o;
        return Objects.equals(userId, that.userId) &&
               Objects.equals(lessonId, that.lessonId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, lessonId);
    }
}
