import express from 'express';
import { getCourses, getCourse } from '../controllers/courseController.js';
import { getModules, getModule } from '../controllers/moduleController.js';
import { getLessons, getLesson } from '../controllers/lessonController.js';
import { getQuestions } from '../controllers/questionController.js';



const router = express.Router();

router.get('/', getCourses);
router.get('/:courseId', getCourse);

router.get('/:courseId/modules', getModules);
router.get('/:courseId/modules/:moduleId', getModule);

router.get('/:courseId/modules/:moduleId/lessons', getLessons);
router.get('/:courseId/modules/:moduleId/lessons/:lessonId', getLesson);

router.get('/:courseId/modules/:moduleId/lessons/:lessonId/questions',getQuestions);
// router.get('/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId',getQuestion);


export default router;