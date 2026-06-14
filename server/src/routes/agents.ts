import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import * as agentController from '../controllers/agentController'

const router: ExpressRouter = Router()

router.post('/classify', agentController.classifyIncident)
router.post('/report', agentController.generateReport)

export default router
