import { Request, Response, NextFunction } from 'express'
import * as agentService from '../services/agentService'

export const classifyIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await agentService.classifyIncident(req.body.description)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await agentService.generateReport(req.body.investigationId)
    res.json({ report })
  } catch (error) {
    next(error)
  }
}
