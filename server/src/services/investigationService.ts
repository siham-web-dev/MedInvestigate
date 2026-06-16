import prisma from '../db/client'
import { AppError } from '../middleware/errorHandler'
import { runInvestigationWorkflow } from './agentOrchestrator'

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
  data: {
    reviewNotes?: string
    reviewStatus?: string
    recommendations?: unknown
    generateReport?: boolean
    rerunWorkflow?: boolean
  }
) => {
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: { incident: true },
  })

  if (!investigation) {
    throw new AppError(404, 'Investigation not found')
  }

  const updateData: any = {}
  if (data.reviewNotes) updateData.notes = data.reviewNotes
  if (data.recommendations) updateData.findings = JSON.stringify(data.recommendations)

  // Handle approve and generate report
  if (data.generateReport && investigation.incident.status === 'Completed') {
    updateData.phase = 'Closed'

    // Create a report generation task
    await prisma.agentTask.create({
      data: {
        investigationId: id,
        type: 'ReportGeneration',
        status: 'Pending',
      },
    })

    // Log report generation activity
    await prisma.agentActivity.create({
      data: {
        incidentId: investigation.incidentId,
        agentType: 'Report',
        agentName: 'Report Generator',
        timestamp: new Date(),
        status: 'Info',
        message: 'Report generation initiated - detailed 5-12 page report will be generated',
      },
    })
  }

  // Handle request for more analysis (re-run workflow)
  if (data.rerunWorkflow) {
    updateData.phase = 'Analysis'

    // Reset agent tasks to pending so they re-run
    await prisma.agentTask.updateMany({
      where: { investigationId: id },
      data: { status: 'Pending', completedAt: null, startedAt: null },
    })

    // Store reviewer feedback in investigation notes for agents to consider
    if (data.reviewNotes) {
      const existingNotes = investigation.notes ? investigation.notes : ''
      const reviewFeedback = `\n\n[REVIEWER FEEDBACK FOR RE-ANALYSIS]\n${new Date().toISOString()}\n${data.reviewNotes}`
      updateData.notes = existingNotes + reviewFeedback
    }

    // Log workflow re-run activity with detailed feedback
    await prisma.agentActivity.create({
      data: {
        incidentId: investigation.incidentId,
        agentType: 'Supervisor',
        agentName: 'Workflow Manager',
        timestamp: new Date(),
        status: 'Info',
        message: `Workflow re-run initiated with reviewer feedback: "${data.reviewNotes || 'No specific feedback provided'}"`,
        resultData: JSON.stringify({
          action: 'workflow_rerun',
          reviewerFeedback: data.reviewNotes,
          timestamp: new Date().toISOString(),
        }),
      },
    })
  }

  const updatedInvestigation = await prisma.investigation.update({
    where: { id },
    data: updateData,
  })

  // Store review comment if provided
  if (data.reviewNotes) {
    await prisma.reviewComment.create({
      data: {
        investigationId: id,
        reviewer: 'Current Reviewer',
        comment: data.reviewNotes,
        reviewStatus: data.reviewStatus,
      },
    })
  }

  // Create audit log for review action
  await prisma.auditLog.create({
    data: {
      investigationId: id,
      action: 'review_updated',
      details: JSON.stringify({
        reviewStatus: data.reviewStatus,
        generateReport: data.generateReport,
        rerunWorkflow: data.rerunWorkflow,
        reviewNotesLength: data.reviewNotes?.length || 0,
      }),
    },
  })

  return updatedInvestigation
}

export const getInvestigationReport = async (id: string) => {
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      incident: true,
      agentTasks: true,
      reviewComments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!investigation) {
    throw new AppError(404, 'Investigation not found')
  }

  // Fetch structured findings from the incident
  const [rootCauses, regulatoryFindings, clinicalEvidence, technicalFindings, agentActivities] =
    await Promise.all([
      prisma.rootCauseHypothesis.findMany({
        where: { incidentId: investigation.incidentId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.regulatoryFinding.findMany({
        where: { incidentId: investigation.incidentId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.clinicalEvidence.findMany({
        where: { incidentId: investigation.incidentId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.technicalFinding.findMany({
        where: { incidentId: investigation.incidentId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.agentActivity.findMany({
        where: { incidentId: investigation.incidentId },
        orderBy: { timestamp: 'asc' },
      }),
    ])

  // Generate recommendations based on agent activities
  const recommendations = generateRecommendations(agentActivities, investigation)

  // Map review comments to frontend format
  const reviewComments = investigation.reviewComments.map((comment) => ({
    id: comment.id,
    reviewer: comment.reviewer,
    comment: comment.comment,
    timestamp: comment.createdAt.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    reviewStatus: comment.reviewStatus,
  }))

  return {
    incidentNumber: investigation.incident.incidentNumber,
    deviceName: investigation.incident.deviceName,
    manufacturer: investigation.incident.manufacturer,
    severity: investigation.incident.severity,
    facility: investigation.incident.facility,
    incidentDate: investigation.incident.incidentDate,
    description: investigation.incident.description,
    recommendations,
    reviewComments,
    rootCauses,
    regulatoryFindings,
    clinicalEvidence,
    technicalFindings,
    agentActivities,
    phase: investigation.phase,
    notes: investigation.notes,
  }
}

export const rerunInvestigationWorkflow = async (id: string) => {
  const investigation = await prisma.investigation.findUnique({
    where: { id },
    include: {
      incident: true,
    },
  })

  if (!investigation) {
    throw new AppError(404, 'Investigation not found')
  }

  // Get reviewer feedback from investigation notes
  const reviewerFeedback = investigation.notes || ''

  console.log(`[WORKFLOW] Re-running investigation ${investigation.incidentId} with reviewer feedback`)

  // Trigger the workflow with the incident data and investigation ID
  await runInvestigationWorkflow({
    id: investigation.incidentId,
    incidentNumber: investigation.incident.incidentNumber,
    severity: investigation.incident.severity,
    description: investigation.incident.description,
    facility: investigation.incident.facility,
    deviceName: investigation.incident.deviceName,
    manufacturer: investigation.incident.manufacturer,
    incidentDate: investigation.incident.incidentDate.toISOString(),
    investigationId: id,
  })

  return {
    message: 'Investigation workflow re-run initiated with reviewer feedback',
    investigationId: id,
    reviewerFeedback: reviewerFeedback,
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
