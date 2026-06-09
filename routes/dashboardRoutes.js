import express from 'express';

import { getUserDashboard } from "../controllers/dashboardController.js";
import {getCourses} from "../controllers/courseController.js";
import isUser from "../middleware/isUser.js";

const router = express.Router();

router.get('/:userId', isUser, getUserDashboard);

export default router;