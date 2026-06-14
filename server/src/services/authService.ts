import bcryptjs from 'bcryptjs'
import { randomBytes } from 'crypto'

const SALT_ROUNDS = 10

export const hashPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcryptjs.compare(password, hash)
}

export const generateResetToken = (): string => {
  // Generate a random 6-digit code
  const code = randomBytes(3).readUIntBE(0, 3) % 1000000
  return String(code).padStart(6, '0')
}

export const sendResetEmail = async (email: string, resetToken: string): Promise<void> => {
  // For now, just log to console
  console.log(`\n[EMAIL] Password reset code sent to ${email}: ${resetToken}\n`)
}
