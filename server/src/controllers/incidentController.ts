import { Request, Response, NextFunction } from 'express'
import * as incidentService from '../services/incidentService'

export const createIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentService.createIncident(req.body)
    res.status(201).json(incident)
  } catch (error) {
    next(error)
  }
}

export const getIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentService.getIncident(req.params.id)
    res.json(incident)
  } catch (error) {
    next(error)
  }
}

export const listIncidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incidents = await incidentService.listIncidents({
      severity: req.query.severity as string,
      status: req.query.status as string,
    })
    res.json(incidents)
  } catch (error) {
    next(error)
  }
}

export const updateIncidentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incident = await incidentService.updateIncidentStatus(req.params.id, req.body.status)
    res.json(incident)
  } catch (error) {
    next(error)
  }
}
