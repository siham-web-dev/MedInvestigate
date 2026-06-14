import Anthropic from '@anthropic-ai/sdk'
import prisma from '../db/client'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const classifyIncident = async (description: string) => {
  const task = await prisma.agentTask.create({
    data: {
      investigationId: '',
      type: 'Classification',
      status: 'Running',
    },
  })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a medical device incident classifier. Classify the following incident description into one of these categories: Critical, High, Medium, Low. Return ONLY a JSON object with these fields: {"severity": "...", "category": "...", "summary": "..."}

Incident: ${description}`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''
    const result = JSON.parse(responseText)

    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        status: 'Done',
        result: JSON.stringify(result),
        completedAt: new Date(),
      },
    })

    return result
  } catch (error) {
    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        status: 'Failed',
        result: JSON.stringify({ error: String(error) }),
        completedAt: new Date(),
      },
    })

    throw error
  }
}

export const generateReport = async (investigationId: string) => {
  const investigation = await prisma.investigation.findUnique({
    where: { id: investigationId },
    include: {
      incident: true,
      agentTasks: true,
    },
  })

  if (!investigation) {
    throw new Error('Investigation not found')
  }

  const task = await prisma.agentTask.create({
    data: {
      investigationId,
      type: 'ReportGeneration',
      status: 'Running',
    },
  })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate a medical device incident investigation report based on:

Incident: ${investigation.incident.description}
Severity: ${investigation.incident.severity}
Phase: ${investigation.phase}
Findings: ${investigation.findings || 'No findings recorded yet'}

Return a comprehensive markdown report with sections for: Executive Summary, Incident Details, Investigation Timeline, Root Cause Analysis, and Recommendations.`,
        },
      ],
    })

    const reportContent =
      message.content[0].type === 'text' ? message.content[0].text : ''

    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        status: 'Done',
        result: JSON.stringify({ report: reportContent }),
        completedAt: new Date(),
      },
    })

    return reportContent
  } catch (error) {
    await prisma.agentTask.update({
      where: { id: task.id },
      data: {
        status: 'Failed',
        result: JSON.stringify({ error: String(error) }),
        completedAt: new Date(),
      },
    })

    throw error
  }
}
