import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import * as incidentController from '../controllers/incidentController'

const router: ExpressRouter = Router()

router.post('/', incidentController.createIncident)
router.get('/', incidentController.listIncidents)
router.get('/:id', incidentController.getIncident)
router.patch('/:id/status', incidentController.updateIncidentStatus)

export default router
