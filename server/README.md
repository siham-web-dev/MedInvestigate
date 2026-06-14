# Server

Express.js backend for Medical Device Incident Investigator.

## Setup

```bash
# From root directory
pnpm install

# Generate Prisma client
pnpm --filter server prisma generate

# Create database and run migrations
pnpm --filter server prisma migrate dev --name init
```

## Development

```bash
# Start dev server (port 3000)
pnpm --filter server dev

# Or from server directory
cd server
pnpm dev
```

## Architecture

- **controllers/** — HTTP request handlers
- **routes/** — Route definitions (calls controllers)
- **services/** — Business logic (calls Prisma)
- **db/** — Database client and schema
- **middleware/** — Auth, error handling

## API Endpoints

### Incidents
- `POST /api/incidents` — Create incident
- `GET /api/incidents` — List incidents (filters: ?severity=X&status=Y)
- `GET /api/incidents/:id` — Get incident
- `PATCH /api/incidents/:id/status` — Update incident status

### Investigations
- `POST /api/investigations` — Create investigation
- `GET /api/investigations` — List investigations (filters: ?phase=X&assignedTo=Y)
- `GET /api/investigations/:id` — Get investigation
- `PATCH /api/investigations/:id` — Update investigation
- `GET /api/investigations/:id/audit` — Get audit trail

### Agents
- `POST /api/agents/classify` — AI classification
- `POST /api/agents/report` — Generate AI report
