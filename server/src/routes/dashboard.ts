import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import * as dashboardController from '../controllers/dashboardController'
import { authMiddleware } from '../middleware/auth'

const router: ExpressRouter = Router()

// All dashboard routes are protected
router.use(authMiddleware)

router.get('/stats', dashboardController.getDashboardStats)

export default router
