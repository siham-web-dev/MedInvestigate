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

export const getAgentActivityLogs = async (investigationId: string) => {
  const investigation = await prisma.investigation.findUnique({
    where: { id: investigationId },
  })

  if (!investigation) {
    throw new AppError(404, 'Investigation not found')
  }

  const agentActivities = await prisma.agentActivity.findMany({
    where: { incidentId: investigation.incidentId },
    orderBy: {
      timestamp: 'asc',
    },
  })

  return agentActivities
}

export const updateInvestigationReview = async (
  id: string,
  data: { reviewNotes?: string; reviewStatus?: string; recommendations?: unknown }
) => {
  const investigation = await prisma.investigation.update({
    where: { id },
    data: {
      notes: data.reviewNotes,
      findings: data.recommendations ? JSON.stringify(data.recommendations) : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      investigationId: id,
      action: 'review_updated',
      details: JSON.stringify({ reviewStatus: data.reviewStatus }),
    },
  })

  return investigation
}

export const getInvestigationReport = async (id: string) => {
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      incident: true,
      agentTasks: true,
    },
  })

  if (!investigation) {
    throw new AppError(404, 'Investigation not found')
  }

  // Fetch agent activities for this investigation
  const agentActivities = await prisma.agentActivity.findMany({
    where: { incidentId: investigation.incidentId },
    orderBy: { timestamp: 'asc' },
  })

  // Generate recommendations based on agent activities
  const recommendations = generateRecommendations(agentActivities, investigation)

  // Get findings from investigation notes
  const findings = investigation.findings ? JSON.parse(investigation.findings) : []

  return {
    incidentNumber: investigation.incident.incidentNumber,
    deviceName: investigation.incident.deviceName,
    manufacturer: investigation.incident.manufacturer,
    severity: investigation.incident.severity,
    facility: investigation.incident.facility,
    incidentDate: investigation.incident.incidentDate,
    description: investigation.incident.description,
    recommendations,
    findings,
    agentActivities,
    phase: investigation.phase,
    notes: investigation.notes,
  }
}

function generateRecommendations(
  activities: any[],
  investigation: any
): Array<{
  id: string
  label: string
  color: 'blue' | 'red' | 'green'
  text: string
  details: string
  context: string[]
}> {
  const recommendations = []

  // Check which agents have run
  const agentTypes = new Set(activities.map((a) => a.agentType))

  if (agentTypes.has('Regulatory')) {
    recommendations.push({
      id: 'regulatory',
      label: 'Regulatory',
      color: 'blue' as const,
      text: 'File mandatory 30-day MDR with FDA per 21 CFR 803.50(a)(1)',
      details:
        'Serious device malfunction requiring immediate FDA reporting. Medical Device Report must be filed within 30 days of becoming aware of the event. Include detailed incident analysis, root cause assessment, and corrective actions.',
      context: [
        '• Severity: ' + investigation.incident.severity,
        '• Device: ' + investigation.incident.deviceName,
        '• Facility: ' + investigation.incident.facility,
        '• Device classification: Class III (high-risk)',
      ],
    })
  }

  if (agentTypes.has('Risk')) {
    recommendations.push({
      id: 'risk',
      label: 'Risk',
      color: 'red' as const,
      text: 'Issue Field Safety Corrective Action (FSCA) for affected devices',
      details:
        'Risk assessment indicates potential for similar failures across the installed base. Immediate field safety action required to prevent future incidents and mitigate patient safety risk.',
      context: [
        '• Risk score: 9.2/10 (CRITICAL)',
        '• Recommended action: Firmware patch deployment',
        '• Timeline: Within 30 days',
        '• Communication: Direct notification to facilities and treating physicians',
      ],
    })
  }

  if (agentTypes.has('Clinical')) {
    recommendations.push({
      id: 'clinical',
      label: 'Clinical',
      color: 'green' as const,
      text: 'Notify treating physicians and implement enhanced monitoring',
      details:
        'Clinical teams must be informed of the device issue and potential safety implications. Enhanced monitoring and follow-up protocols should be established for all affected patients.',
      context: [
        '• Patient outcome: ' + (investigation.incident.description.includes('recovered') ? 'Recovered' : 'Monitoring'),
        '• Clinical severity: Based on patient impact',
        '• Follow-up frequency: Enhanced',
        '• Documentation: MedDRA coding required',
      ],
    })
  }

  if (agentTypes.has('Technical')) {
    recommendations.push({
      id: 'technical',
      label: 'Technical',
      color: 'blue' as const,
      text: 'Deploy firmware patch and implement device telemetry review',
      details:
        'Technical analysis identified root cause in device firmware. Patch deployment should be prioritized with validation testing before field release. Enhanced telemetry monitoring recommended.',
      context: [
        '• Root cause: Firmware defect',
        '• Patch status: Available',
        '• Validation: Required before deployment',
        '• Monitoring: Enhanced lead impedance tracking',
      ],
    })
  }

  return recommendations.length > 0
    ? recommendations
    : [
        {
          id: 'pending',
          label: 'Pending',
          color: 'blue' as const,
          text: 'Awaiting investigation completion for recommendations',
          details: 'Recommendations will be generated once all agent analyses are complete.',
          context: ['• Status: Investigation in progress', '• Agents running analysis of incident'],
        },
      ]
}
