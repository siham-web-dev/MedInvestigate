import prisma from '../db/client'
import { AppError } from '../middleware/errorHandler'
import { runInvestigationWorkflow } from './agentOrchestrator'

export interface CreateIncidentInput {
  incidentNumber: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  description: string
  incidentDate: Date
  facility: string
  reportedBy: string
  deviceName: string
  manufacturer: string
}

export const createIncident = async (input: CreateIncidentInput) => {
  const incidentDate = typeof input.incidentDate === 'string'
    ? new Date(input.incidentDate)
    : input.incidentDate

  const incident = await prisma.incident.create({
    data: {
      incidentNumber: input.incidentNumber,
      severity: input.severity,
      status: 'Open',
      description: input.description,
      incidentDate,
      facility: input.facility,
      reportedBy: input.reportedBy,
      deviceName: input.deviceName,
      manufacturer: input.manufacturer,
    },
  })

  // Create investigation immediately to get its ID
  const investigation = await prisma.investigation.create({
    data: {
      incidentId: incident.id,
      phase: 'Intake',
    },
  })

  // Trigger investigation workflow asynchronously
  runInvestigationWorkflow({
    id: incident.id,
    incidentNumber: incident.incidentNumber,
    severity: incident.severity,
    description: incident.description,
    facility: incident.facility,
    deviceName: incident.deviceName,
    manufacturer: incident.manufacturer,
    incidentDate: incident.incidentDate.toISOString(),
    investigationId: investigation.id,
  }).catch((error) => {
    console.error('Failed to start investigation workflow:', error)
  })

  return { ...incident, investigationId: investigation.id }
}

export const getIncident = async (id: string) => {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      investigation: true,
      auditLogs: true,
    },
  })

  if (!incident) {
    throw new AppError(404, 'Incident not found')
  }

  return incident
}

export const listIncidents = async (filters?: { severity?: string; status?: string }) => {
  const incidents = await prisma.incident.findMany({
    where: {
      ...(filters?.severity && { severity: filters.severity }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      investigation: true,
    },
    orderBy: {
      reportedAt: 'desc',
    },
  })

  return incidents
}

export const updateIncidentStatus = async (id: string, status: string) => {
  const incident = await prisma.incident.update({
    where: { id },
    data: { status },
  })

  await prisma.auditLog.create({
    data: {
      incidentId: id,
      action: 'status_updated',
      details: JSON.stringify({ status }),
    },
  })

  return incident
}
