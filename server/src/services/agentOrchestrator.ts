import Anthropic from "@anthropic-ai/sdk";
import prisma from "../db/client";
import { broadcastAgentActivity, broadcastWorkflowUpdate } from "./socketIOService";

const client = new Anthropic();

interface IncidentData {
  id: string;
  incidentNumber: string;
  severity: string;
  description: string;
  facility: string;
  deviceName: string;
  manufacturer: string;
  incidentDate: string;
  investigationId?: string;
}

export const runInvestigationWorkflow = async (incident: IncidentData) => {
  let investigation: any = null;
  try {
    console.log(`[WORKFLOW] Starting investigation for incident ${incident.incidentNumber}`);

    // Use existing investigation if provided, otherwise create one
    if (incident.investigationId) {
      investigation = await prisma.investigation.findUnique({
        where: { id: incident.investigationId },
      });
      console.log(`[WORKFLOW] Using existing investigation with ID: ${investigation.id}`);
    } else {
      investigation = await prisma.investigation.create({
        data: {
          incidentId: incident.id,
          phase: "Analysis",
        },
      });
      console.log(`[WORKFLOW] Investigation created with ID: ${investigation.id}`);
    }

    await prisma.auditLog.create({
      data: {
        investigationId: investigation.id,
        action: 'workflow_started',
        details: JSON.stringify({ phase: 'Intake' }),
      },
    });

    broadcastWorkflowUpdate(investigation.id, {
      phase: "Intake",
      status: "running",
    });

    await prisma.auditLog.create({
      data: {
        investigationId: investigation.id,
        action: 'supervisor_agent_dispatched',
        details: JSON.stringify({ task: 'incident_investigation' }),
      },
    });

    // Dispatch supervisor agent
    await supervisorAgent(incident, investigation.id);

    await prisma.auditLog.create({
      data: {
        investigationId: investigation.id,
        action: 'supervisor_agent_completed',
        details: JSON.stringify({ incidentNumber: incident.incidentNumber }),
      },
    });

    console.log(`[WORKFLOW] Investigation ${incident.incidentNumber} completed`);

    // Update investigation to completed
    await prisma.investigation.update({
      where: { id: investigation.id },
      data: { phase: "Review" },
    });

    await prisma.auditLog.create({
      data: {
        investigationId: investigation.id,
        action: 'workflow_completed',
        details: JSON.stringify({ phase: 'Review' }),
      },
    });
    console.log(`[WORKFLOW] Investigation status changed to Review`);

    broadcastWorkflowUpdate(investigation.id, {
      phase: "Complete",
      status: "done",
    });
  } catch (error) {
    console.error(`[WORKFLOW] Investigation workflow failed for ${incident.incidentNumber}:`, error);
    if (investigation) {
      await prisma.auditLog.create({
        data: {
          investigationId: investigation?.id,
          action: 'workflow_failed',
          details: JSON.stringify({ error: String(error) }),
        },
      });
      broadcastWorkflowUpdate(investigation.id, {
        phase: "Error",
        status: "failed",
      });
    }
  }
};

const supervisorAgent = async (incident: IncidentData, investigationId: string) => {
  console.log(`[SUPERVISOR] Starting supervisor agent for incident ${incident.incidentNumber}`);
  const systemPrompt = `You are the Supervisor Agent for medical device incident investigations.
Your role is to orchestrate specialized agents to investigate the incident comprehensively.

You have access to the following specialized agents that you can dispatch:
1. Regulatory Agent - checks regulatory compliance and FDA requirements
2. Technical Agent - analyzes device technical issues and failure modes
3. Clinical Agent - assesses patient safety and clinical impact
4. Risk Agent - evaluates risk levels and impact

For each incident, you should:
1. Analyze the incident description and severity
2. Determine which agents need to be dispatched
3. Coordinate their investigations
4. Synthesize findings into actionable insights

Always use the dispatch_agent tool to request work from specialized agents.`;

  const tools: Anthropic.Tool[] = [
    {
      name: "dispatch_agent",
      description:
        "Dispatch a specialized agent to investigate a specific aspect of the incident",
      input_schema: {
        type: "object" as const,
        properties: {
          agent_type: {
            type: "string",
            enum: ["Regulatory", "Technical", "Clinical", "Risk"],
            description: "Type of agent to dispatch",
          },
          task: {
            type: "string",
            description: "Specific task for the agent to complete",
          },
        },
        required: ["agent_type", "task"],
      },
    },
    {
      name: "complete_investigation",
      description: "Mark the investigation as complete",
      input_schema: {
        type: "object" as const,
        properties: {
          summary: {
            type: "string",
            description: "Summary of investigation findings",
          },
        },
        required: ["summary"],
      },
    },
  ];

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Investigate this medical device incident:

Incident Number: ${incident.incidentNumber}
Device: ${incident.deviceName} by ${incident.manufacturer}
Facility: ${incident.facility}
Severity: ${incident.severity}
Date: ${incident.incidentDate}

Description:
${incident.description}

Please dispatch appropriate agents to investigate this incident thoroughly.`,
    },
  ];

  // Agentic loop
  let continueLoop = true;
  const dispatchedAgents: string[] = [];

  while (continueLoop) {
    console.log(`[SUPERVISOR] Calling Claude API (iteration ${messages.length})`);
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: systemPrompt,
      tools: tools,
      messages: messages,
    });

    console.log(`[SUPERVISOR] API response - stop_reason: ${response.stop_reason}`);
    messages.push({
      role: "assistant",
      content: response.content,
    });

    // Broadcast supervisor thinking
    const textBlocks = response.content.filter((block) => block.type === "text");
    if (textBlocks.length > 0) {
      await broadcastAndLogActivity(
        incident.id,
        "Supervisor Agent",
        "Info",
        (textBlocks[0] as any).text,
        investigationId
      );
    }

    if (response.stop_reason === "end_turn") {
      continueLoop = false;
      break;
    }

    const toolUseBlocks = response.content.filter((block) => block.type === "tool_use");

    if (toolUseBlocks.length === 0) {
      continueLoop = false;
      break;
    }

    const toolResults: Anthropic.MessageParam["content"] = [];

    for (const toolBlock of toolUseBlocks) {
      if (toolBlock.type !== "tool_use") continue;

      const toolName = toolBlock.name;
      let toolResult = "";

      if (toolName === "dispatch_agent") {
        const { agent_type, task } = toolBlock.input as {
          agent_type: string;
          task: string;
        };

        console.log(`[SUPERVISOR] Dispatching ${agent_type} agent for: ${task}`);
        dispatchedAgents.push(agent_type);

        await prisma.auditLog.create({
          data: {
            investigationId,
            action: `agent_dispatched`,
            details: JSON.stringify({ agentType: agent_type, task }),
          },
        });

        toolResult = await dispatchSpecializedAgent(
          agent_type,
          task,
          incident,
          incident.id,
          investigationId
        );
      } else if (toolName === "complete_investigation") {
        console.log(`[SUPERVISOR] Investigation marked as complete`);
        const { summary } = toolBlock.input as { summary: string };
        toolResult = "Investigation marked as complete.";

        await prisma.auditLog.create({
          data: {
            investigationId,
            action: `investigation_completed`,
            details: JSON.stringify({ summary }),
          },
        });
        continueLoop = false;
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolBlock.id,
        content: toolResult,
      });
    }

    if (toolResults.length > 0) {
      messages.push({
        role: "user",
        content: toolResults,
      });
    }
  }
};

const dispatchSpecializedAgent = async (
  agentType: string,
  task: string,
  incident: IncidentData,
  incidentId: string,
  investigationId: string
): Promise<string> => {
  const agentName = `${agentType} Agent`;
  console.log(`[${agentType.toUpperCase()}] Starting agent - Task: ${task}`);

  await broadcastAndLogActivity(
    incidentId,
    agentName,
    "Info",
    `Dispatched to ${task}`,
    investigationId
  );

  // Simulate agent work with Claude
  const systemPrompts: Record<string, string> = {
    Regulatory: `You are a Regulatory Compliance Agent for medical device incidents.
Analyze the incident for FDA compliance, MDR reporting requirements, and applicable regulations.
Provide specific regulatory concerns and required actions.`,

    Technical: `You are a Technical Analysis Agent for medical device incidents.
Analyze the device technical specifications, failure modes, and potential root causes.
Provide technical findings and recommendations.`,

    Clinical: `You are a Clinical Safety Agent for medical device incidents.
Assess patient safety impacts, adverse event classification, and clinical implications.
Provide clinical evidence and safety assessments.`,

    Risk: `You are a Risk Assessment Agent for medical device incidents.
Evaluate risk levels, market impact, and population-level implications.
Provide risk scores and mitigation recommendations.`,
  };

  try {
    console.log(`[${agentType.toUpperCase()}] Calling Claude API`);
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      system:
        systemPrompts[agentType] ||
        "You are a specialized medical device incident analysis agent.",
      messages: [
        {
          role: "user",
          content: `Incident: ${incident.incidentNumber}
Device: ${incident.deviceName} (${incident.manufacturer})
Severity: ${incident.severity}

Description:
${incident.description}

Task: ${task}

Provide detailed analysis and findings.`,
        },
      ],
    });

    const analysis =
      response.content[0].type === "text" ? response.content[0].text : "";

    console.log(`[${agentType.toUpperCase()}] Analysis complete - ${analysis.length} characters`);
    await broadcastAndLogActivity(incidentId, agentName, "Result", analysis, investigationId);

    await prisma.auditLog.create({
      data: {
        investigationId,
        action: `agent_completed`,
        details: JSON.stringify({ agentType, task, analysisLength: analysis.length }),
      },
    });

    return analysis;
  } catch (error) {
    console.error(`[${agentType.toUpperCase()}] Agent failed:`, error);
    const errorMsg = `Failed to complete analysis`;
    await broadcastAndLogActivity(incidentId, agentName, "Alert", errorMsg, investigationId);

    await prisma.auditLog.create({
      data: {
        investigationId,
        action: `agent_failed`,
        details: JSON.stringify({ agentType, task, error: String(error) }),
      },
    });

    return errorMsg;
  }
};

const broadcastAndLogActivity = async (
  incidentId: string,
  agentName: string,
  status: string,
  message: string,
  investigationId?: string
) => {
  const activity = {
    agentName,
    agentType: agentName.split(" ")[0],
    timestamp: new Date().toISOString(),
    status,
    message,
  };

  // Log to database
  await prisma.agentActivity.create({
    data: {
      incidentId,
      agentName,
      agentType: agentName.split(" ")[0],
      timestamp: new Date(),
      status,
      message,
    },
  });

  // Broadcast to connected clients using investigationId
  if (investigationId) {
    broadcastAgentActivity(investigationId, activity);
  }
};
