import prisma from '../db/client'
import { broadcastDashboardStatsUpdate } from './socketIOService'

export interface DashboardStats {
  totalIncidents: number
  activeInvestigations: number
  criticalCases: number
  pendingReviews: number
}

const calculateStats = (investigations: any[]): DashboardStats => {
  const totalIncidents = investigations.length
  const activeInvestigations = investigations.filter(
    (inv) => inv.phase === 'Analysis' || inv.phase === 'Intake'
  ).length
  const criticalCases = investigations.filter(
    (inv) => inv.incident?.severity?.toLowerCase() === 'critical'
  ).length
  const pendingReviews = investigations.filter((inv) => inv.phase === 'Review').length

  return {
    totalIncidents,
    activeInvestigations,
    criticalCases,
    pendingReviews,
  }
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Fetch all investigations with related incident data
  const investigations = await prisma.investigation.findMany({
    include: {
      incident: true,
    },
  })

  return calculateStats(investigations)
}

export const getDashboardStatsAndBroadcast = async (): Promise<DashboardStats> => {
  const investigations = await prisma.investigation.findMany({
    include: {
      incident: true,
    },
  })

  const stats = calculateStats(investigations)

  // Broadcast the updated stats to all connected clients
  broadcastDashboardStatsUpdate(stats)

  return stats
}
