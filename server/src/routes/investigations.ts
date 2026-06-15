import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'
import * as investigationController from '../controllers/investigationController'
import { authMiddleware } from '../middleware/auth'

const router: ExpressRouter = Router()

// All investigation routes are protected
router.use(authMiddleware)

router.post('/', investigationController.createInvestigation)
router.get('/', investigationController.listInvestigations)
router.get('/:id', investigationController.getInvestigation)
router.patch('/:id', investigationController.updateInvestigation)
router.get('/:id/audit', investigationController.getAuditTrail)

export default router
