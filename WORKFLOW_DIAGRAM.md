# Real-time Workflow Diagram

## 1. Incident Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: NewIncident.tsx                                   │
│ User fills form & clicks "Submit Investigation"            │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ API: POST /api/incidents                                    │
│ Sends: device name, severity, description, facility, etc   │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: incidentController.createIncident()               │
│ → incidentService.createIncident()                         │
│   - Saves incident to DB                                   │
│   - Returns incident ID                                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE: 201 Created                                       │
│ {                                                           │
│   id: "incident-123",                                       │
│   incidentNumber: "MDR-2024-0843",                          │
│   ...                                                       │
│ }                                                           │
│                                                             │
│ Frontend redirects to:                                      │
│ /investigations/incident-123                               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ ASYNC (background): runInvestigationWorkflow()             │
│ Supervisor Agent begins investigation                       │
│ (doesn't block user response)                              │
└─────────────────────────────────────────────────────────────┘
```

## 2. Investigation Workspace + Real-time Updates

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: InvestigationWorkspace.tsx                        │
│ - useInvestigationSocket hook connects to server            │
│ - Joins Socket.io room: "investigation-incident-123"       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ SOCKET.IO: Browser ←→ Server connection established        │
│ Listen for:                                                 │
│  - "agent-activity" (real-time agent logs)                │
│  - "workflow-update" (phase/status changes)                │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ UI: Live Agent Activity Panel                              │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Supervisor Agent 10:23:14           [Info]           │  │
│ │ Investigation MDR-2024-0843 initialized. Analyzing   │  │
│ │ incident severity and device profile.                │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Supervisor Agent 10:23:15           [Dispatch]       │  │
│ │ Dispatching Regulatory Agent for FDA 21 CFR Part    │  │
│ │ 803 mandatory reporting assessment.                  │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Regulatory Agent 10:23:19           [Result]         │  │
│ │ Device confirmed as Class III implantable cardiac   │  │
│ │ device — activating critical investigation protocol.│  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ [Messages stream in as agents complete work]               │
└─────────────────────────────────────────────────────────────┘
```

## 3. Agent Orchestration (Backend)

```
┌──────────────────────────────────────────────────────────────┐
│ SUPERVISOR AGENT (Claude Opus 4.1)                           │
│                                                              │
│ System Prompt: You are the Supervisor Agent...             │
│ Tools: [dispatch_agent, complete_investigation]            │
│                                                              │
│ Input: Incident data (device, severity, description)       │
│                                                              │
│ Decision Logic:                                             │
│ ├─ Analyze incident → Determine which agents needed        │
│ ├─ Dispatch → Use tool calls to send to specialized agents│
│ ├─ Coordinate → Collect results                            │
│ └─ Synthesize → Combine findings                           │
└──────────────┬───────────────────────────────────────────────┘
               │
        ┌──────┴──────┬──────────┬─────────────┐
        │             │          │             │
        ▼             ▼          ▼             ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │Regulatory│ │Technical│ │Clinical │ │  Risk   │
    │ Agent    │ │ Agent   │ │ Agent   │ │ Agent   │
    └────┬─────┘ └────┬────┘ └────┬────┘ └────┬────┘
         │             │           │           │
         ▼             ▼           ▼           ▼
    FDA rules    Root cause   Patient     Risk scores
    Compliance   Failure mode  Safety      Market
    MDR status   Technical     Evidence    Impact
                 specs


Each Agent:
├─ Receives: Incident data + specific task
├─ Runs: Claude analysis (specific system prompt)
├─ Produces: Analysis/findings
├─ Broadcasts: via broadcastAndLogActivity()
│  └─ Logs to DB: AgentActivity table
│  └─ Sends via Socket.io: "agent-activity" event
└─ Returns: Results to Supervisor for synthesis
```

## 4. Socket.io Event Flow

```
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: agentOrchestrator.ts                               │
│                                                              │
│ broadcastAndLogActivity(incidentId, agentName, status, msg) │
│ ├─ Save to AgentActivity table                              │
│ │  (for audit log / history)                                │
│ └─ Broadcast via Socket.io:                                 │
│    io.to(`investigation-${incidentId}`).emit(               │
│      "agent-activity",                                      │
│      {                                                       │
│        agentName: "Regulatory Agent",                        │
│        agentType: "Regulatory",                              │
│        timestamp: "2024-06-15T10:23:14Z",                    │
│        status: "Result|Alert|Info",                          │
│        message: "Analysis findings..."                       │
│      }                                                       │
│    )                                                         │
│                                                              │
└────────────┬───────────────────────────────────────────────┘
             │
             │ (Socket.io WebSocket)
             ▼
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: InvestigationWorkspace.tsx                         │
│                                                              │
│ useInvestigationSocket hook listens:                        │
│ socket.on("agent-activity", (activity) => {                 │
│   // Convert to AgentActivityMessage                        │
│   setVisibleMsgs(prev => [...prev, newMessage])             │
│   // Auto-scroll to latest                                  │
│   feedRef.current.scrollTop = feedRef.current.scrollHeight  │
│ })                                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 5. Database Integration

```
┌──────────────────────────────────────────────────────────────┐
│ When Agent Activity is Logged:                              │
│                                                              │
│ await prisma.agentActivity.create({                         │
│   incidentId: "incident-123",                               │
│   agentName: "Regulatory Agent",                            │
│   agentType: "Regulatory",                                  │
│   timestamp: new Date(),                                    │
│   status: "Result",                                         │
│   message: "Analysis findings...",                          │
│   resultData: JSON.stringify({ /* structured */ })         │
│ })                                                          │
│                                                              │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│ TABLE: AgentActivity                                         │
│                                                              │
│ id              | incidentId | agentType    | status        │
│ ────────────────┼────────────┼──────────────┼──────────     │
│ act_001         | inc_123    | Regulatory   | Result        │
│ act_002         | inc_123    | Technical    | Result        │
│ act_003         | inc_123    | Clinical     | Alert         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 6. Complete Timeline (Example)

```
T=0s     User creates incident "CardioSync ICD Failed"
         │
T=50ms   Incident saved to DB (id: inc_123)
         Response sent: redirect to /investigations/inc_123
         │
T=100ms  Browser navigates to Investigation Workspace
         │
T=150ms  Frontend Socket.io connects
         Joins room: "investigation-inc_123"
         │
T=200ms  BACKEND: supervisorAgent starts with Claude
         │
T=500ms  Supervisor: "Let me dispatch agents..."
         │
         ┌─→ emit: agent-activity
         │   "Investigation initialized. Analyzing incident..."
         │
T=1.2s   Supervisor dispatches Regulatory Agent via tool use
         │
         ┌─→ emit: agent-activity
         │   "Dispatching Regulatory Agent..."
         │
T=1.8s   Regulatory Agent runs Claude analysis
         │
T=2.3s   Regulatory Agent completes
         │
         ┌─→ emit: agent-activity
         │   "Device confirmed as Class III implantable..."
         │
T=2.4s   Supervisor dispatches Technical Agent
         │
T=3.1s   Technical Agent analysis
         │
T=3.8s   Technical Agent completes
         │
         ┌─→ emit: agent-activity
         │   "Root cause analysis: Firmware defect..."
         │
T=4.2s   Supervisor dispatches Clinical Agent
         │
T=5.1s   Clinical Agent analysis
         │
T=5.9s   Clinical Agent completes
         │
         ┌─→ emit: agent-activity
         │   "Patient safety assessment: Serious adverse event..."
         │
T=6.3s   Supervisor dispatches Risk Agent
         │
T=7.2s   Risk Agent analysis
         │
T=8.1s   Risk Agent completes
         │
         ┌─→ emit: agent-activity
         │   "Risk score: 9.2/10. Market impact: HIGH..."
         │
T=8.5s   Supervisor marks investigation complete
         │
         ┌─→ emit: workflow-update
         │   { phase: "Complete", status: "done" }
         │
T=8.6s   Investigation status updated to "Review" in DB

Frontend sees all updates in real-time → Live Agent Activity panel
```

## Data Flow Summary

```
┌──────────────┐
│  Incident    │
│  Form Data   │
└───────┬──────┘
        │
        ▼
   POST /api/incidents
        │
        ├──→ Save to Incident table
        │
        ├──→ Async: runInvestigationWorkflow()
        │    │
        │    ├──→ Create Investigation record
        │    │
        │    ├──→ Supervisor Agent (Claude)
        │    │    │
        │    │    ├──→ Dispatch Agents (via tool use)
        │    │    │    │
        │    │    │    ├──→ Regulatory Agent
        │    │    │    ├──→ Technical Agent
        │    │    │    ├──→ Clinical Agent
        │    │    │    └──→ Risk Agent
        │    │    │         │
        │    │    │         ├─→ Save to AgentActivity
        │    │    │         └─→ Broadcast via Socket.io
        │    │    │
        │    │    └──→ Synthesize findings
        │    │
        │    └──→ Update Investigation to "Review"
        │
        └──→ Return to client immediately
             (User navigates to workspace)
             │
             ├──→ Socket.io connects
             │
             └──→ Listens for events
                  (agent-activity, workflow-update)
                  │
                  └──→ UI updates in real-time
```

## Key Points

✅ **Async** - Workflow runs in background, doesn't block response
✅ **Real-time** - Socket.io pushes updates as agents work
✅ **Orchestrated** - Supervisor decides which agents run
✅ **Multi-agent** - 4+ specialized agents collaborate
✅ **Persistent** - All activities logged to database
✅ **User Feedback** - Live status visible immediately after incident creation
