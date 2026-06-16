import { Request, Response, NextFunction } from 'express'
import * as investigationService from '../services/investigationService'
import * as dashboardService from '../services/dashboardService'

export const createInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const investigation = await investigationService.createInvestigation(req.body)
    // Broadcast updated KPIs to all connected clients
    await dashboardService.getDashboardStatsAndBroadcast()
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
    // Broadcast updated KPIs to all connected clients
    await dashboardService.getDashboardStatsAndBroadcast()
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

export const getAgentActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await investigationService.getAgentActivityLogs(req.params.id)
    res.json(logs)
  } catch (error) {
    next(error)
  }
}

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const investigation = await investigationService.updateInvestigationReview(req.params.id, req.body)
    // Broadcast updated KPIs to all connected clients
    await dashboardService.getDashboardStatsAndBroadcast()
    res.json(investigation)
  } catch (error) {
    next(error)
  }
}

export const getInvestigationReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await investigationService.getInvestigationReport(req.params.id)
    res.json(report)
  } catch (error) {
    next(error)
  }
}

export const rerunWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await investigationService.rerunInvestigationWorkflow(req.params.id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
