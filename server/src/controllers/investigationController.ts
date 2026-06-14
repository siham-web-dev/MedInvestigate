import { Request, Response, NextFunction } from 'express'
import * as investigationService from '../services/investigationService'

export const createInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const investigation = await investigationService.createInvestigation(req.body)
    res.status(201).json(investigation)
  } catch (error) {
    next(error)
  }
}

export const getInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const investigation = await investigationService.getInvestigation(req.params.id)
    res.json(investigation)
  } catch (error) {
    next(error)
  }
}

export const listInvestigations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const investigations = await investigationService.listInvestigations({
      phase: req.query.phase as string,
      assignedTo: req.query.assignedTo as string,
    })
    res.json(investigations)
  } catch (error) {
    next(error)
  }
}

export const updateInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const investigation = await investigationService.updateInvestigation(req.params.id, req.body)
    res.json(investigation)
  } catch (error) {
    next(error)
  }
}

export const getAuditTrail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auditTrail = await investigationService.getAuditTrail(req.params.id)
    res.json(auditTrail)
  } catch (error) {
    next(error)
  }
}
