import express from 'express';

import { getUserDashboard } from "../controllers/dashboardController.js";
import isUser from "../middleware/isUser.js";
import {validateId} from "../middleware/validateId.js";

const router = express.Router();

router.get('/:userId', validateId('userId'),isUser,  getUserDashboard);

export default router;