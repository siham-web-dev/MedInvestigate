import { Request, Response, NextFunction } from 'express'
import * as jose from 'jose'

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string }
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

const secret = new TextEncoder().encode(JWT_SECRET)

export const generateToken = async (userId: string): Promise<string> => {
  return await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export const verifyToken = async (token: string): Promise<string | null> => {
  try {
    const verified = await jose.jwtVerify(token, secret)
    return verified.payload.userId as string
  } catch {
    return null
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = header.slice(7)
  const userId = await verifyToken(token)

  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = { userId }
  next()
}
