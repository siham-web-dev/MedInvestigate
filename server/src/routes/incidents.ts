import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import * as incidentController from '../controllers/incidentController'
import { authMiddleware } from '../middleware/auth'

const router: ExpressRouter = Router()

// All incident routes are protected
router.use(authMiddleware)

router.post('/', incidentController.createIncident)
router.get('/', incidentController.listIncidents)
router.get('/:id', incidentController.getIncident)
router.patch('/:id/status', incidentController.updateIncidentStatus)

export default router
