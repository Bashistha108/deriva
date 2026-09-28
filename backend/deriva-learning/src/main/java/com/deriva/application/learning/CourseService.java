package com.deriva.application.learning;

import com.deriva.domain.learning.Course;
import com.deriva.domain.learning.CourseSection;
import com.deriva.domain.learning.Lesson;
import com.deriva.domain.learning.ContentStatus;
import com.deriva.persistence.learning.CourseRepository;
import com.deriva.persistence.learning.CourseSectionRepository;
import com.deriva.persistence.learning.LessonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseSectionRepository sectionRepository;
    private final LessonRepository lessonRepository;

    public CourseService(CourseRepository courseRepository, 
                         CourseSectionRepository sectionRepository,
                         LessonRepository lessonRepository) {
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.lessonRepository = lessonRepository;
    }

    public List<Course> getPublishedCourses() {
        return courseRepository.findByStatus(ContentStatus.PUBLISHED);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course createCourse(String title, String slug, String description, UUID createdBy) {
        Course course = new Course();
        course.setTitle(title);
        course.setSlug(slug);
        course.setDescription(description);
        course.setCreatedBy(createdBy);
        course.setStatus(ContentStatus.DRAFT);
        return courseRepository.save(course);
    }

    public Course getCourseById(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course updateCourse(UUID courseId, String title, String slug, String description, String statusStr) {
        Course course = getCourseById(courseId);
        course.setTitle(title);
        course.setSlug(slug);
        course.setDescription(description);
        course.setUpdatedAt(LocalDateTime.now());
        
        if (statusStr != null) {
            ContentStatus status = ContentStatus.valueOf(statusStr);
            course.setStatus(status);
            if (status == ContentStatus.PUBLISHED && course.getPublishedAt() == null) {
                course.setPublishedAt(LocalDateTime.now());
            }
        }
        return courseRepository.save(course);
    }

    public void deleteCourse(UUID courseId) {
        Course course = getCourseById(courseId);
        courseRepository.delete(course);
    }

    // --- Sections ---

    public CourseSection addCourseSection(UUID courseId, String title, String description, Integer sortOrder) {
        Course course = getCourseById(courseId);
        CourseSection section = new CourseSection();
        section.setCourse(course);
        section.setTitle(title);
        section.setDescription(description);
        section.setSortOrder(sortOrder);
        
        course.getSections().add(section);
        courseRepository.save(course);
        return section;
    }

    public CourseSection updateCourseSection(UUID sectionId, String title, String description, Integer sortOrder) {
        CourseSection section = sectionRepository.findById(sectionId)
            .orElseThrow(() -> new RuntimeException("Section not found"));
        section.setTitle(title);
        section.setDescription(description);
        section.setSortOrder(sortOrder);
        return sectionRepository.save(section);
    }

    public void deleteCourseSection(UUID sectionId) {
        sectionRepository.deleteById(sectionId);
    }

    // --- Lessons ---

    public Lesson addLesson(UUID sectionId, String title, String slug, String content, Integer sortOrder) {
        CourseSection section = sectionRepository.findById(sectionId)
            .orElseThrow(() -> new RuntimeException("Section not found"));
        
        Lesson lesson = new Lesson();
        lesson.setSection(section);
        lesson.setTitle(title);
        lesson.setSlug(slug);
        lesson.setContent(content);
        lesson.setSortOrder(sortOrder);
        lesson.setStatus(ContentStatus.PUBLISHED);
        
        return lessonRepository.save(lesson);
    }

    public Lesson updateLesson(UUID lessonId, String title, String slug, String content, Integer sortOrder) {
        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        lesson.setTitle(title);
        lesson.setSlug(slug);
        lesson.setContent(content);
        lesson.setSortOrder(sortOrder);
        lesson.setUpdatedAt(LocalDateTime.now());
        return lessonRepository.save(lesson);
    }

    public void deleteLesson(UUID lessonId) {
        lessonRepository.deleteById(lessonId);
    }
}
