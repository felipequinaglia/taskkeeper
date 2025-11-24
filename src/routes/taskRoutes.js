import express from 'express';
import * as taskController from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes will be protected by the 'protect' middleware
router.use(protect);

router.route('/')
  .post(taskController.createTask)
  .get(taskController.getAllTasks);

router.route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

export default router;
