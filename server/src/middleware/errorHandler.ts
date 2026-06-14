import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public code: number,
    public message: string
  ) {
    super(message)
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.code).json({ error: err.message })
  }

  console.error(err)
  return res.status(500).json({ error: 'Internal server error' })
}
