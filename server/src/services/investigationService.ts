import prisma from '../db/client'
import { AppError } from '../middleware/errorHandler'

export interface CreateInvestigationInput {
  incidentId: string
  assignedTo?: string
}

export const createInvestigation = async (input: CreateInvestigationInput) => {
  const incident = await prisma.incident.findUnique({
    where: { id: input.incidentId },
  })

  if (!incident) {
    throw new AppError(404, 'Incident not found')
  }

  const investigation = await prisma.investigation.create({
    data: {
      incidentId: input.incidentId,
      phase: 'Intake',
      assignedTo: input.assignedTo,
    },
  })

  await prisma.auditLog.create({
    data: {
      investigationId: investigation.id,
      action: 'created',
    },
  })

  return investigation
}

export const getInvestigation = async (id: string) => {
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      incident: true,
      agentTasks: true,
      auditLogs: true,
    },
  })

  if (!investigation) {
    throw new AppError(404, 'Investigation not found')
  }

  return investigation
}

export const listInvestigations = async (filters?: { phase?: string; assignedTo?: string }) => {
  const investigations = await prisma.investigation.findMany({
    where: {
      ...(filters?.phase && { phase: filters.phase }),
      ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
    },
    include: {
      incident: true,
      agentTasks: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return investigations
}

export const updateInvestigation = async (
  id: string,
  data: { phase?: string; notes?: string; findings?: unknown }
) => {
  const updateData: any = {}
  if (data.phase) updateData.phase = data.phase
  if (data.notes) updateData.notes = data.notes
  if (data.findings) updateData.findings = JSON.stringify(data.findings)

  const investigation = await prisma.investigation.update({
    where: { id },
    data: updateData,
  })

  await prisma.auditLog.create({
    data: {
      investigationId: id,
      action: 'updated',
      details: JSON.stringify(data),
    },
  })

  return investigation
}

export const getAuditTrail = async (investigationId: string) => {
  const auditLogs = await prisma.auditLog.findMany({
    where: { investigationId },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return auditLogs
}
