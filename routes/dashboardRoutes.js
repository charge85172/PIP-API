import express from 'express';

import { getUserDashboard } from "../controllers/dashboardController.js";
import {getCourses} from "../controllers/courseController.js";

const router = express.Router();

router.get('/:userId', getUserDashboard);

export default router;