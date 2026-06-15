import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import * as agentController from '../controllers/agentController'
import { authMiddleware } from '../middleware/auth'

const router: ExpressRouter = Router()

// All agent routes are protected
router.use(authMiddleware)

router.post('/classify', agentController.classifyIncident)
router.post('/report', agentController.generateReport)

export default router
