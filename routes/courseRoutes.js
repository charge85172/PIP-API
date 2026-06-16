import express from 'express';
import {getCourses, getCourse, createCourse, updateCourse, deleteCourse,} from '../controllers/courseController.js';
import {getModules, getModule, createModule, updateModule, deleteModule,} from '../controllers/moduleController.js';
import {getLessons, getLesson, createLesson, updateLesson, deleteLesson,} from '../controllers/lessonController.js';
import { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { validateId } from "../middleware/validateId.js";

const router = express.Router();

router.get('/', getCourses);
router.post('/', createCourse);
router.get('/:courseId', validateId('courseId'), getCourse);
router.put('/:courseId',validateId('courseId'), updateCourse);
router.delete('/:courseId',validateId('courseId'), deleteCourse);

router.get('/:courseId/modules', getModules);
router.post('/:courseId/modules', createModule);
router.get('/:courseId/modules/:moduleId',validateId('moduleId'), getModule);
router.put('/:courseId/modules/:moduleId',validateId('moduleId'), updateModule);
router.delete('/:courseId/modules/:moduleId',validateId('moduleId'), deleteModule);

router.get('/:courseId/modules/:moduleId/lessons', getLessons);
router.post('/:courseId/modules/:moduleId/lessons', createLesson);
router.get('/:courseId/modules/:moduleId/lessons/:lessonId',validateId('lessonId'), getLesson);
router.put('/:courseId/modules/:moduleId/lessons/:lessonId',validateId('lessonId'), updateLesson);
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId',validateId('lessonId'), deleteLesson);

router.get('/:courseId/modules/:moduleId/lessons/:lessonId/questions', getQuestions);
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/questions', createQuestion);
router.get('/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId', validateId('questionId'),getQuestion);
router.put('/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId', validateId('questionId'),updateQuestion);
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId', validateId('questionId'), deleteQuestion);

export default router;