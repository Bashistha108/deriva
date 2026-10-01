package com.deriva.api.learning;

import com.deriva.application.learning.CourseService;
import com.deriva.domain.learning.Course;
import com.deriva.domain.learning.CourseSection;
import com.deriva.domain.learning.Lesson;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/learning/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourseById(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody CourseRequestDTO request) {
        Course course = courseService.createCourse(
                request.getTitle(),
                request.getSlug(),
                request.getDescription(),
                request.getCreatedBy()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<Course> updateCourse(
            @PathVariable UUID courseId,
            @RequestBody CourseRequestDTO request) {
        Course course = courseService.updateCourse(
                courseId,
                request.getTitle(),
                request.getSlug(),
                request.getDescription(),
                request.getStatus()
        );
        return ResponseEntity.ok(course);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    // --- Sections ---

    @PostMapping("/{courseId}/sections")
    public ResponseEntity<CourseSection> addCourseSection(
            @PathVariable UUID courseId,
            @RequestBody CourseSectionRequestDTO request) {
        CourseSection section = courseService.addCourseSection(
                courseId,
                request.getTitle(),
                request.getDescription(),
                request.getSortOrder()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(section);
    }

    @PutMapping("/sections/{sectionId}")
    public ResponseEntity<CourseSection> updateCourseSection(
            @PathVariable UUID sectionId,
            @RequestBody CourseSectionRequestDTO request) {
        CourseSection section = courseService.updateCourseSection(
                sectionId,
                request.getTitle(),
                request.getDescription(),
                request.getSortOrder()
        );
        return ResponseEntity.ok(section);
    }

    @DeleteMapping("/sections/{sectionId}")
    public ResponseEntity<Void> deleteCourseSection(@PathVariable UUID sectionId) {
        courseService.deleteCourseSection(sectionId);
        return ResponseEntity.noContent().build();
    }

    // --- Lessons ---

    @PostMapping("/sections/{sectionId}/lessons")
    public ResponseEntity<Lesson> addLesson(
            @PathVariable UUID sectionId,
            @RequestBody LessonRequestDTO request) {
        Lesson lesson = courseService.addLesson(
                sectionId,
                request.getTitle(),
                request.getSlug(),
                request.getContent(),
                request.getSortOrder()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(lesson);
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<Lesson> updateLesson(
            @PathVariable UUID lessonId,
            @RequestBody LessonRequestDTO request) {
        Lesson lesson = courseService.updateLesson(
                lessonId,
                request.getTitle(),
                request.getSlug(),
                request.getContent(),
                request.getSortOrder()
        );
        return ResponseEntity.ok(lesson);
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable UUID lessonId) {
        courseService.deleteLesson(lessonId);
        return ResponseEntity.noContent().build();
    }
}
