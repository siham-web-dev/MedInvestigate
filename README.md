# Medical Device Incident Investigator (MedInvestigate)

A comprehensive React-based web application for investigating and managing medical device incidents. Leverages AI-powered agents to orchestrate thorough investigations with real-time updates and regulatory compliance tracking.

## Overview

MedInvestigate streamlines the incident investigation process by automating analysis across multiple specialized domains:

- **Regulatory Compliance** - FDA requirements, MDR reporting, and regulatory obligations
- **Technical Analysis** - Device failure modes, root cause identification, and firmware issues
- **Clinical Safety** - Patient safety impact, adverse event classification, and medical implications
- **Risk Assessment** - Risk scoring, market impact, and mitigation strategies

## Features

- 📊 **Incident Dashboard** - Overview of all incidents with filtering and search
- 🔍 **Investigation Workspace** - Detailed analysis interface with real-time agent activity
- 🤖 **AI-Powered Agents** - Automated investigation through specialized Claude-based agents
- 📡 **Real-Time Updates** - Socket.IO-powered live status and activity streaming
- 📋 **Status Tracking** - Dynamic incident severity and status badges
- 📝 **Audit Logging** - Complete traceability of all actions and changes
- 👤 **Authentication** - Secure user authentication with JWT tokens
- 📊 **Report Generation** - Automated investigation reports with findings and recommendations

## Tech Stack

### Frontend

- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 6.3.5** - Build tool and dev server
- **Tailwind CSS 4.1.12** - Utility-first styling
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Recharts** - Data visualization
- **Radix UI** - Accessible component primitives

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - ORM with SQLite
- **Socket.IO** - Real-time bidirectional communication
- **Claude API** - AI-powered agent orchestration
- **JWT** - Authentication tokens

## Project Structure

```
Medical Device Incident Investigator/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx             # Root component
│   │   │   ├── Shell.tsx           # Main layout
│   │   │   ├── routes.tsx          # Route configuration
│   │   │   ├── pages/              # Page components
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── InvestigationWorkspace.tsx
│   │   │   │   └── ...
│   │   │   └── components/         # Reusable components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── store/                  # Redux store configuration
│   │   └── api/                    # API configuration
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── controllers/            # Route handlers
│   │   ├── services/               # Business logic
│   │   │   ├── agentOrchestrator.ts
│   │   │   ├── investigationService.ts
│   │   │   └── ...
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Express middleware
│   │   ├── db/                     # Database client
│   │   └── index.ts                # Entry point
│   ├── schema.prisma               # Database schema
│   └── package.json
│
├── package.json                     # Root workspace config
└── README.md                        # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- SQLite (included with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Medical Device Incident Investigator"
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` file in server directory:

   ```env
   DATABASE_URL="file:./dev.db"
   VITE_API_URL="http://localhost:3000"
   ANTHROPIC_API_KEY=your_api_key_here
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Initialize database**
   ```bash
   cd server
   npx prisma migrate dev
   cd ..
   ```

### Development

Start both client and server:

```bash
pnpm run dev
```

Or run separately:

```bash
# Terminal 1 - Frontend (port 5173)
pnpm run dev:client

# Terminal 2 - Backend (port 3000)
pnpm run dev:server
```

### Build

Build for production:

```bash
pnpm run build
```

## API Endpoints

### Investigations

- `GET /api/investigations` - List all investigations
- `GET /api/investigations/:id` - Get investigation details
- `POST /api/investigations` - Create new investigation
- `PUT /api/investigations/:id` - Update investigation
- `GET /api/investigations/:id/agent-logs` - Get agent activity logs
- `GET /api/investigations/:id/report` - Generate investigation report

### Incidents

- `GET /api/incidents` - List all incidents
- `GET /api/incidents/:id` - Get incident details
- `POST /api/incidents` - Create new incident

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

## Database Schema

### Key Models

- **User** - User accounts and authentication
- **Incident** - Medical device incidents (severity, status, description)
- **Investigation** - Investigation records linked to incidents
- **AgentActivity** - Real-time log of agent actions
- **AgentTask** - Scheduled and completed agent tasks
- **AuditLog** - Complete audit trail of all changes

See `server/schema.prisma` for full schema definition.

## Real-Time Features

The application uses Socket.IO for real-time communication:

- **Agent Activity** - Live updates as agents analyze incidents
- **Workflow Updates** - Investigation phase and status changes
- **Status Badges** - Dynamic incident severity and status display

Status updates flow through the system:

1. Backend agents complete analysis
2. Investigation workflow marks as complete
3. Incident status updated to "InReview"
4. Socket.IO broadcasts status change
5. Frontend receives and displays updated badges in real-time

## Investigation Workflow

1. **Incident Creation** - New medical device incident reported
2. **Investigation Start** - Investigation initiated from dashboard
3. **Agent Dispatch** - Supervisor agent orchestrates specialized agents
4. **Analysis Phase** - Regulatory, Technical, Clinical, and Risk agents analyze
5. **Completion** - Investigation moves to Review phase
6. **Status Update** - Incident status automatically updated to "InReview"
7. **Report Generation** - Comprehensive findings and recommendations compiled

## Key Features Deep Dive

### Dynamic Status Badges

- Severity levels: Critical (red), High (orange), Medium (yellow), Low (green)
- Status types: InReview (teal), InProgress (blue), Resolved (green), Closed (gray), Open (red)
- Fetched from backend and updated via Socket.IO in real-time

### Agent Orchestration

- Supervisor Agent coordinates specialized agents
- Claude API powers intelligent analysis
- Tool use enables agent-to-agent communication
- Async processing with real-time streaming

### Security

- JWT-based authentication
- Role-based access control ready
- Input validation and sanitization
- Audit logging for compliance

## Configuration

### Vite Configuration

- Custom Figma asset resolver for design integration
- Path alias: `@` resolves to `./src`
- SVG and CSV files configured as raw assets

### Tailwind CSS

- Custom CSS variables for theming
- Dark mode support ready
- Responsive design utilities

## Troubleshooting

### Server not starting

```bash
# Check if port 3000 is in use
lsof -i :3000

# Initialize database
cd server && npx prisma migrate dev
```

### Frontend not connecting to backend

- Verify `VITE_API_URL` in `.env`
- Check server is running on port 3000
- Clear browser cache and restart dev server

### Socket.IO connection issues

- Check browser WebSocket support
- Verify CORS configuration in server
- Check network tab in browser DevTools

## Contributing

1. Create a feature branch
2. Make changes and test thoroughly
3. Commit with clear messages
4. Push and create a pull request

## License

[Add your license here]

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for medical device safety and regulatory compliance**
