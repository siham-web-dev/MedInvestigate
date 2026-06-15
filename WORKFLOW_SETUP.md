# LangGraph-style Workflow Setup

## Overview
I've set up a real-time agent orchestration system that triggers when an incident is created. The system uses Claude to orchestrate multiple specialized agents that investigate medical device incidents collaboratively.

## Architecture

### Backend (Node.js + Express)
```
User creates incident
    ↓
POST /api/incidents
    ↓
Incident saved to DB
    ↓
runInvestigationWorkflow() triggered asynchronously
    ↓
Supervisor Agent (Claude) orchestrates workflow
    ├→ Dispatches Regulatory Agent
    ├→ Dispatches Technical Agent  
    ├→ Dispatches Clinical Agent
    └→ Dispatches Risk Agent
    ↓
Each agent runs analysis → broadcasts via Socket.io
    ↓
Activities stored in AgentActivity table
```

### Frontend (React + Socket.io)
```
User navigates to Investigation Workspace
    ↓
useInvestigationSocket hook connects to server
    ↓
Listens for real-time agent-activity events
    ↓
Updates UI in real-time as agents work
    ↓
Shows Live Agent Activity feed
```

## Key Files Created

### Backend
- **src/services/socketIOService.ts** - Socket.io setup & broadcasting
- **src/services/agentOrchestrator.ts** - Claude-powered agent orchestration
  - Supervisor Agent coordinates investigation
  - Dispatches specialized agents (Regulatory, Technical, Clinical, Risk)
  - Agents run analysis and broadcast results

### Frontend
- **src/hooks/useInvestigationSocket.ts** - Socket.io connection & listeners
- Updated **src/app/pages/InvestigationWorkspace.tsx** - Real-time UI updates

## How It Works

### 1. Incident Creation
```typescript
// NewIncident.tsx → incidentService.createIncident()
// → Backend creates incident in DB
// → Triggers async workflow
// → Returns immediately to user
```

### 2. Workflow Execution
The Supervisor Agent:
1. Receives incident details (device, severity, description, facility)
2. Uses Claude to decide which agents to dispatch
3. Dispatches agents via tool use (`dispatch_agent` tool)
4. Each agent analyzes their specialty
5. Results broadcasted to connected clients in real-time
6. Investigation updated to "Review" phase when complete

### 3. Real-time Updates via Socket.io
```
Server broadcasts:
  - agent-activity: Live updates from agents (timestamp, message, status)
  - workflow-update: Phase/status changes (Intake → Analysis → Review)

Frontend receives:
  - Adds to Live Agent Activity feed
  - Scrolls to latest
  - Updates workflow status
```

## Database Schema
- **AgentActivity** - Stores all agent activities/logs
  - agentName, agentType, timestamp, status, message
  - Indexed by incidentId for quick lookups
  
- **Investigation** - Created when workflow starts
  - Links to incident
  - phase: Intake → Analysis → Review → Closed
  - status: running/done/failed

## Environment Setup

### Backend (.env)
```
DATABASE_URL=file:./dev.db
PORT=3000
```

### Frontend
- Socket.io defaults to `http://localhost:3000`
- Change in `src/hooks/useInvestigationSocket.ts` if needed

## Running the System

### Terminal 1 - Backend
```bash
cd server
pnpm dev
```

### Terminal 2 - Frontend
```bash
cd client
pnpm dev
```

### Testing Flow
1. Open http://localhost:5173
2. Navigate to "New Incident"
3. Fill form and submit
4. Redirects to Investigation Workspace
5. Watch "Live Agent Activity" section
6. See real-time agent logs as workflow runs

## Agents

### Supervisor Agent
- Orchestrates the investigation
- Decides which agents to dispatch based on incident details
- Uses Claude Opus 4.1 for intelligent decision-making

### Specialized Agents
Each uses Claude to analyze their domain:

1. **Regulatory Agent**
   - FDA compliance analysis
   - MDR reporting requirements
   - Applicable regulations

2. **Technical Agent**
   - Device failure mode analysis
   - Root cause investigation
   - Technical specifications

3. **Clinical Agent**
   - Patient safety impact
   - Adverse event classification
   - Clinical evidence assessment

4. **Risk Agent**
   - Risk level evaluation
   - Market/population impact
   - Mitigation recommendations

## Customization

### Adding New Agents
1. Add to `supervisorAgent()` tools enum
2. Create handler in `dispatchSpecializedAgent()`
3. Define system prompt for new agent type
4. Agent will auto-broadcast activities

### Changing Claude Model
Edit in `agentOrchestrator.ts`:
```typescript
model: "claude-opus-4-1-20250805" // Change this
```

### Adjusting Workflow Behavior
- Modify `supervisorAgent()` system prompt for different dispatch logic
- Change agent system prompts for different analysis styles
- Adjust timing by modifying delays in workflow execution

## Live Updates UI Integration

The `useInvestigationSocket` hook:
- Auto-connects when investigation ID is available
- Listens for activity & workflow updates
- Converts to UI-friendly format
- Stops streaming when workflow completes
- Handles reconnection gracefully

Update format in Investigation Workspace:
```typescript
{
  agentName: "Regulatory Agent",
  agentType: "Regulatory",
  timestamp: "2024-06-15T10:23:14Z",
  status: "Result" | "Alert" | "Info",
  message: "Analysis findings..."
}
```

## Next Steps

1. **Parse Agent Outputs** - Structure agent responses into findings:
   - Regulatory findings → RegulatoryFinding table
   - Clinical evidence → ClinicalEvidence table
   - Technical findings → TechnicalFinding table
   - Root causes → RootCauseHypothesis table

2. **Review Phase** - Create review UI for validation:
   - Human review of agent findings
   - Approval/rejection workflow
   - Final report generation

3. **Advanced Features**:
   - Multi-turn agent conversations
   - Agent memory/context across incidents
   - Confidence scoring
   - Evidence citation and linking

## Debugging

### Check Socket.io Connection
Browser DevTools → Application → Socket.io
- Look for "agent-activity" and "workflow-update" events

### Check Agent Logs
Database: `SELECT * FROM AgentActivity WHERE incidentId = ?`

### Server Logs
```
Socket connected: <socket-id>
Supervisor Agent analyzing incident MDR-2024-...
Dispatching Regulatory Agent...
```

## Known Considerations

1. **Agent Timing** - Agents run sequentially. For parallel execution, would need queue system (BullMQ + Redis as discussed).

2. **State Persistence** - Currently stores logs but not structured findings. Next phase will parse agent outputs into domain tables.

3. **Error Handling** - Basic error handling in place. Production would need:
   - Retry logic
   - Timeout management
   - Fallback agents

4. **Scaling** - Single-server. For scale add:
   - Redis for distributed state
   - BullMQ for job queue
   - Multiple worker processes
