import express from 'express';
import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courseController.js';
import {
    getModules,
    getModule,
    createModule,
    updateModule,
    deleteModule
} from '../controllers/moduleController.js';
import {
    getLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson
} from '../controllers/lessonController.js';
import {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion
} from '../controllers/questionController.js';

const router = express.Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.get('/:courseId', getCourse);
router.put('/:courseId', updateCourse);
router.delete('/:courseId', deleteCourse);

router.get('/:courseId/modules', getModules);
router.post('/:courseId/modules', createModule);
router.get('/:courseId/modules/:moduleId', getModule);
router.put('/:courseId/modules/:moduleId', updateModule);
router.delete('/:courseId/modules/:moduleId', deleteModule);

router.get('/:courseId/modules/:moduleId/lessons', getLessons);
router.post('/:courseId/modules/:moduleId/lessons', createLesson);
router.get('/:courseId/modules/:moduleId/lessons/:lessonId', getLesson);
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', updateLesson);
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', deleteLesson);

router.get('/:courseId/modules/:moduleId/lessons/:lessonId/questions', getQuestions);
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/questions', createQuestion);
router.get('/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId', getQuestion);
router.put('/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId', updateQuestion);
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId', deleteQuestion);

export default router;