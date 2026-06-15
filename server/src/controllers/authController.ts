import { Request, Response } from 'express'
import prisma from '../db/client'
import { hashPassword, comparePassword, generateResetToken, sendResetEmail } from '../services/authService'
import { generateToken, generateRefreshToken, verifyToken } from '../middleware/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8

interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  organization?: string
}

interface LoginRequest {
  email: string
  password: string
}

interface ForgotPasswordRequest {
  email: string
}

interface VerifyResetCodeRequest {
  email: string
  code: string
}

interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, organization } = req.body as RegisterRequest

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, firstName, lastName',
      })
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        organization: organization || null,
      },
    })

    // Generate tokens
    const token = await generateToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)

    // Save refresh token to database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpires: expiresAt,
      },
    })

    return res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password',
      })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate tokens
    const token = await generateToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)

    // Save refresh token to database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpires: expiresAt,
      },
    })

    return res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as ForgotPasswordRequest

    // Validation
    if (!email) {
      return res.status(400).json({ error: 'Missing required field: email' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // For security, don't reveal if email exists
      return res.json({ message: 'If this email exists, a reset code has been sent' })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      },
    })

    // Send email
    await sendResetEmail(email, resetToken)

    return res.json({ message: 'If this email exists, a reset code has been sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body as VerifyResetCodeRequest

    // Validation
    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing required fields: email, code',
      })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or reset code' })
    }

    // Check reset token
    if (!user.passwordResetToken || user.passwordResetToken !== code) {
      return res.status(400).json({ error: 'Invalid email or reset code' })
    }

    // Check expiration
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired' })
    }

    return res.json({ message: 'Reset code is valid' })
  } catch (error) {
    console.error('Verify reset code error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body as ResetPasswordRequest

    // Validation
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields: email, code, newPassword',
      })
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or reset code' })
    }

    // Check reset token
    if (!user.passwordResetToken || user.passwordResetToken !== code) {
      return res.status(400).json({ error: 'Invalid email or reset code' })
    }

    // Check expiration
    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired' })
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })

    return res.json({ message: 'Password has been reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

interface RefreshTokenRequest {
  refreshToken: string
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as RefreshTokenRequest

    if (!refreshToken) {
      return res.status(400).json({ error: 'Missing refresh token' })
    }

    // Verify refresh token
    const userId = await verifyToken(refreshToken)

    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    // Check refresh token expiration
    if (!user.refreshTokenExpires || user.refreshTokenExpires < new Date()) {
      return res.status(401).json({ error: 'Refresh token has expired' })
    }

    // Generate new tokens
    const newToken = await generateToken(user.id)
    const newRefreshToken = await generateRefreshToken(user.id)

    // Save new refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpires: expiresAt,
      },
    })

    return res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
      },
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const verify = async (req: Request, res: Response) => {
  try {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = header.slice(7)
    const userId = await verifyToken(token)

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
      },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
