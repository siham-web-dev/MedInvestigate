# Backend Architecture & Design Patterns

This document outlines the backend architecture, design patterns, and implementation guidelines for the Medical Device Incident Investigator backend.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Prisma ORM (PostgreSQL)
- **Job Queue**: Bull/BullMQ + Redis (for long-running tasks)
- **Language**: TypeScript

---

## Design Patterns

### 1. Repository Pattern

Abstract database queries behind a repository layer for easier testing and maintainability.

```typescript
// server/src/repositories/UserRepository.ts
export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  async create(data: CreateUserData) {
    return prisma.user.create({ data })
  }

  async update(id: string, data: UpdateUserData) {
    return prisma.user.update({ where: { id }, data })
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  }
}
```

**Benefits:**
- Easy to test (mock the repository instead of Prisma)
- Decouple from database layer
- Reusable across services
- Easy to swap database implementation

---

### 2. DTO (Data Transfer Object) Pattern

Separate API request/response shapes from domain models. Critical for regulated medical devices.

```typescript
// server/src/dto/incident.dto.ts

// Request DTO
export interface CreateIncidentDTO {
  deviceModel: string
  incidentType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  date: string
}

// Response DTO
export interface IncidentResponseDTO {
  id: string
  deviceModel: string
  incidentType: string
  severity: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

// Internal domain model (can have more fields)
export interface Incident extends IncidentResponseDTO {
  userId: string
  internal_notes?: string
}
```

**Benefits:**
- API contracts are explicit
- Can expose/hide fields based on user role
- Easy to change API without touching domain
- Compliance: clear audit trail of what data is sent

---

### 3. Validator Pattern

Extract validation logic into reusable validators.

```typescript
// server/src/validators/incidentValidator.ts
export const validateCreateIncident = (data: any): CreateIncidentDTO => {
  if (!data.deviceModel?.trim()) {
    throw new Error('deviceModel is required')
  }

  if (!['low', 'medium', 'high', 'critical'].includes(data.severity)) {
    throw new Error('severity must be one of: low, medium, high, critical')
  }

  if (data.description && data.description.length > 5000) {
    throw new Error('description cannot exceed 5000 characters')
  }

  return {
    deviceModel: data.deviceModel.trim(),
    incidentType: data.incidentType,
    severity: data.severity,
    description: data.description || '',
    date: data.date,
  }
}

// Usage in controller:
export const createIncident = async (req: Request, res: Response) => {
  try {
    const validated = validateCreateIncident(req.body)
    const incident = await incidentService.create(validated)
    res.status(201).json(incident)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
```

**Benefits:**
- Reusable across controllers
- Easy to test
- Consistent validation rules
- Clear error messages

---

### 4. Dependency Injection

Use a lightweight DI container to reduce coupling.

```typescript
// server/src/container.ts
import { createContainer, asClass, asValue } from 'tsyringe'

const container = createContainer()

// Register repositories
container.registerSingleton('UserRepository', asClass(UserRepository))
container.registerSingleton('IncidentRepository', asClass(IncidentRepository))

// Register services
container.registerSingleton('AuthService', asClass(AuthService))
container.registerSingleton('IncidentService', asClass(IncidentService))

// Register external dependencies
container.registerSingleton('EmailService', asClass(EmailService))

export default container
```

```typescript
// server/src/routes/incidents.ts
import { Router } from 'express'
import { container } from 'tsyringe'
import { IncidentController } from '../controllers/IncidentController'

const router = Router()
const incidentController = container.resolve(IncidentController)

router.post('/', (req, res) => incidentController.create(req, res))
router.get('/', (req, res) => incidentController.list(req, res))
router.get('/:id', (req, res) => incidentController.getById(req, res))

export default router
```

**Benefits:**
- Reduces tight coupling
- Easy to test (inject mocks)
- Centralized dependency configuration
- Follows SOLID principles

---

### 5. Strategy Pattern

For different behaviors based on context.

```typescript
// server/src/strategies/notification/NotificationStrategy.ts
export interface NotificationStrategy {
  send(recipient: string, message: string): Promise<void>
}

export class EmailNotificationStrategy implements NotificationStrategy {
  async send(email: string, message: string) {
    // Send email via email service
  }
}

export class SMSNotificationStrategy implements NotificationStrategy {
  async send(phone: string, message: string) {
    // Send SMS via SMS service
  }
}

// Usage:
const strategy = user.preferredContact === 'email'
  ? new EmailNotificationStrategy()
  : new SMSNotificationStrategy()

await strategy.send(user.contact, message)
```

**Benefits:**
- Easy to add new notification types
- Follow Open/Closed Principle
- Runtime strategy selection

---

### 6. Event-Driven / Observer Pattern

For audit trails and cross-cutting concerns.

```typescript
// server/src/events/EventBus.ts
export class EventBus {
  private listeners: Map<string, Function[]> = new Map()

  on(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(handler)
  }

  async emit(event: string, data: any) {
    const handlers = this.listeners.get(event) || []
    await Promise.all(handlers.map(h => h(data)))
  }
}

export const eventBus = new EventBus()
```

```typescript
// server/src/services/IncidentService.ts
export class IncidentService {
  constructor(
    private incidentRepo: IncidentRepository,
    private eventBus: EventBus
  ) {}

  async create(data: CreateIncidentDTO) {
    const incident = await this.incidentRepo.create(data)
    
    // Emit event for audit logging, notifications, etc
    await this.eventBus.emit('incident.created', {
      incident,
      timestamp: new Date(),
    })
    
    return incident
  }
}
```

```typescript
// server/src/listeners/AuditListener.ts
export const setupAuditListener = (eventBus: EventBus, auditService: AuditService) => {
  eventBus.on('incident.created', async (data) => {
    await auditService.log({
      action: 'incident_created',
      entityId: data.incident.id,
      timestamp: data.timestamp,
    })
  })

  eventBus.on('investigation.updated', async (data) => {
    await auditService.log({
      action: 'investigation_updated',
      entityId: data.investigation.id,
      timestamp: data.timestamp,
    })
  })
}
```

**Benefits:**
- Decoupled event producers from consumers
- Easy to add audit logging
- Real-time notifications
- Compliance tracking

---

### 7. Error Handling Pattern

Use custom error classes for consistent error handling.

```typescript
// server/src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public code: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data?: any) {
    super(400, message, data)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message)
    this.name = 'UnauthorizedError'
  }
}
```

```typescript
// server/src/middleware/errorHandler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.code).json({
      error: err.message,
      data: err.data,
    })
  }

  console.error('Unexpected error:', err)
  return res.status(500).json({
    error: 'Internal server error',
  })
}
```

---

### 8. Middleware for Cross-Cutting Concerns

Add middleware for validation, logging, rate limiting.

```typescript
// server/src/middleware/validateRequest.ts
import { z } from 'zod'

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        })
      }
      res.status(400).json({ error: 'Invalid request' })
    }
  }
}
```

```typescript
// server/src/middleware/logging.ts
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    console.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  })

  next()
}
```

---

## Agent Execution with Job Queue

For long-running agent tasks, use Bull/BullMQ + Redis.

### Setup

```bash
# Install dependencies
npm install bull redis dotenv
# or
pnpm add bull redis dotenv
```

```env
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Agent Queue

```typescript
// server/src/queues/agentQueue.ts
import Queue from 'bull'

export interface AgentJobData {
  incidentId: string
  investigationId: string
  agentType: 'analyzer' | 'classifier' | 'reporter' // Add your agent types
  payload: Record<string, any>
  userId: string // For audit trail
}

export const agentQueue = new Queue<AgentJobData>('agent-execution', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    attempts: 3, // Retry failed agents 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2s delay, exponential growth
    },
    removeOnComplete: true,
  },
})

// Process agent jobs
agentQueue.process(async (job) => {
  const { incidentId, investigationId, agentType, payload, userId } = job.data

  job.progress(10)

  try {
    // Execute the agent
    const result = await executeAgentLogic(agentType, payload)

    job.progress(50)

    // Save results to investigation
    await investigationRepo.addAgentResult(investigationId, {
      agentType,
      result,
      executedBy: userId,
      executedAt: new Date(),
      status: 'completed',
    })

    job.progress(100)
    return result
  } catch (error) {
    throw new Error(`Agent execution failed: ${error.message}`)
  }
})

// Listen for job completion
agentQueue.on('completed', async (job) => {
  console.log(`✓ Agent job ${job.id} completed`)
  // Optionally: send notification, webhook, etc
})

// Listen for job failure
agentQueue.on('failed', async (job, err) => {
  console.error(`✗ Agent job ${job.id} failed:`, err.message)

  // Update investigation with failure status
  await investigationRepo.addAgentResult(job.data.investigationId, {
    agentType: job.data.agentType,
    status: 'failed',
    error: err.message,
    executedAt: new Date(),
  })
})

// Listen for job retry
agentQueue.on('failed', async (job, err) => {
  console.warn(`⟳ Agent job ${job.id} failed, retrying... (attempt ${job.attemptsMade + 1}/3)`)
})
```

### Agent Controller

```typescript
// server/src/controllers/agentController.ts
import { Request, Response } from 'express'
import { agentQueue } from '../queues/agentQueue'

export const executeAgent = async (req: Request, res: Response) => {
  try {
    const { investigationId, agentType, payload } = req.body
    const userId = (req as any).user.id // from auth middleware

    // Validate agent type
    const validAgentTypes = ['analyzer', 'classifier', 'reporter']
    if (!validAgentTypes.includes(agentType)) {
      return res.status(400).json({
        error: `Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}`,
      })
    }

    // Queue the job (returns immediately - non-blocking)
    const job = await agentQueue.add(
      {
        investigationId,
        agentType,
        payload,
        userId,
      },
      {
        jobId: `agent-${investigationId}-${Date.now()}`,
      }
    )

    // Return job ID to client immediately (HTTP 202 Accepted)
    return res.status(202).json({
      message: 'Agent execution started',
      jobId: job.id,
      status: 'queued',
    })
  } catch (error) {
    console.error('Agent execution error:', error)
    return res.status(500).json({
      error: 'Failed to queue agent',
    })
  }
}

export const getAgentStatus = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params

    const job = await agentQueue.getJob(jobId)

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      })
    }

    const state = await job.getState()
    const progress = job.progress()

    return res.json({
      jobId,
      state, // 'active', 'completed', 'failed', 'delayed', 'waiting'
      progress,
      attemptsMade: job.attemptsMade,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get job status',
    })
  }
}

export const cancelAgent = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params

    const job = await agentQueue.getJob(jobId)

    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
      })
    }

    await job.remove()

    return res.json({
      message: 'Agent job cancelled',
      jobId,
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to cancel job',
    })
  }
}
```

### Routes

```typescript
// server/src/routes/agents.ts
import { Router } from 'express'
import {
  executeAgent,
  getAgentStatus,
  cancelAgent,
} from '../controllers/agentController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Protect all agent routes
router.use(authMiddleware)

// Start agent execution (returns immediately)
router.post('/:investigationId/execute', executeAgent)

// Get agent execution status
router.get('/jobs/:jobId/status', getAgentStatus)

// Cancel agent execution
router.delete('/jobs/:jobId', cancelAgent)

export default router
```

### Usage in Service

```typescript
// server/src/services/InvestigationService.ts
import { agentQueue } from '../queues/agentQueue'

export class InvestigationService {
  async runAnalysisAgent(investigationId: string, userId: string) {
    // Queue the agent job
    const job = await agentQueue.add({
      investigationId,
      agentType: 'analyzer',
      payload: {
        // Agent-specific payload
      },
      userId,
    })

    return {
      jobId: job.id,
      status: 'queued',
    }
  }
}
```

### Running Redis Locally

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Using Homebrew (macOS)
brew install redis
redis-server

# Using apt (Ubuntu/Debian)
sudo apt-get install redis-server
redis-server
```

### Benefits of Job Queue for Agent Execution

✅ **Non-blocking**: HTTP responses return immediately (202 Accepted)  
✅ **Retries**: Failed agents retry automatically with exponential backoff  
✅ **Progress tracking**: Monitor agent execution progress  
✅ **Scalability**: Move agents to separate worker processes  
✅ **Reliability**: Jobs persist in Redis; survive server restarts  
✅ **Audit trail**: Track which user ran which agent and when  
✅ **Concurrent limits**: Control how many agents run simultaneously  

---

## Project Structure

```
server/
├── src/
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── repositories/        # Data access layer
│   ├── routes/              # Express route definitions
│   ├── middleware/          # Express middleware
│   ├── queues/              # Bull job queues
│   ├── dto/                 # Data transfer objects
│   ├── validators/          # Input validators
│   ├── errors/              # Custom error classes
│   ├── events/              # Event emitters and listeners
│   ├── db/                  # Database client
│   ├── container.ts         # Dependency injection setup
│   └── index.ts             # Express app setup
├── prisma/
│   └── schema.prisma        # Database schema
├── .env                     # Environment variables
└── package.json
```

---

## Best Practices

1. **Separate concerns**: Controllers handle HTTP, services handle business logic, repositories handle data
2. **Use DTOs**: Keep API contracts separate from domain models
3. **Validate early**: Validate at route entry points
4. **Handle errors consistently**: Use custom error classes
5. **Log everything**: Request logging, error logging, audit trails
6. **Async/await**: Use modern async patterns, avoid callbacks
7. **Type safety**: Use TypeScript interfaces for all data
8. **Immutability**: Prefer immutable operations; track state changes via events
9. **Testability**: Design for easy unit testing with dependency injection
10. **Documentation**: Maintain clear endpoint documentation

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medical_device_db

# Redis (for job queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for password reset, notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Agents
AGENT_TIMEOUT=60000  # 60 seconds
MAX_CONCURRENT_AGENTS=5
```

---

## Running the Backend

```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma migrate dev

# Start Redis
docker run -d -p 6379:6379 redis:latest

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```
