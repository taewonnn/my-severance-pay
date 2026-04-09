export type SeveranceInput = {
  startDate: string        // YYYY-MM-DD
  endDate: string          // YYYY-MM-DD
  monthlyBasePay: number   // 기본급
  bonusMonthly: number     // 성과급 월 환산액
  annualLeaveAllowance: number // 연차수당
}

export type SeveranceResult = {
  workDays: number          // 재직일수
  averageDailyWage: number  // 1일 평균임금
  severancePay: number      // 퇴직금
  isEligible: boolean       // 1년 이상 여부
}

// 최근 3개월 총 일수 계산 (퇴사일 기준 역산)
const getLastThreeMonthsDays = (endDate: Date): number => {
  const threeMonthsAgo = new Date(endDate)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const diffMs = endDate.getTime() - threeMonthsAgo.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export const calculateSeverance = (input: SeveranceInput): SeveranceResult => {
  const start = new Date(input.startDate)
  const end = new Date(input.endDate)

  const workDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const isEligible = workDays >= 365

  if (!isEligible) {
    return { workDays, averageDailyWage: 0, severancePay: 0, isEligible }
  }

  const lastThreeMonthsDays = getLastThreeMonthsDays(end)

  // 최근 3개월 급여 합계 (기본급 3개월 + 성과급 3개월분 + 연차수당)
  const threeMonthsTotalPay =
    input.monthlyBasePay * 3 +
    input.bonusMonthly * 3 +
    input.annualLeaveAllowance

  // 1일 평균임금
  const averageDailyWage = threeMonthsTotalPay / lastThreeMonthsDays

  // 퇴직금 = 1일 평균임금 × 30 × (재직일수 / 365)
  const severancePay = averageDailyWage * 30 * (workDays / 365)

  return {
    workDays,
    averageDailyWage: Math.round(averageDailyWage),
    severancePay: Math.round(severancePay),
    isEligible,
  }
}

export const formatKoreanWon = (amount: number): string => {
  if (amount >= 100_000_000) {
    const eok = Math.floor(amount / 100_000_000)
    const remainder = amount % 100_000_000
    if (remainder === 0) return `${eok}억원`
    const man = Math.floor(remainder / 10_000)
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  }
  if (amount >= 10_000) {
    const man = Math.floor(amount / 10_000)
    const remainder = amount % 10_000
    return remainder > 0
      ? `${man.toLocaleString()}만 ${remainder.toLocaleString()}원`
      : `${man.toLocaleString()}만원`
  }
  return `${amount.toLocaleString()}원`
}

export const formatWorkPeriod = (workDays: number): string => {
  const years = Math.floor(workDays / 365)
  const remaining = workDays % 365
  const months = Math.floor(remaining / 30)
  const days = remaining % 30

  const parts: string[] = []
  if (years > 0) parts.push(`${years}년`)
  if (months > 0) parts.push(`${months}개월`)
  if (days > 0) parts.push(`${days}일`)
  return parts.join(' ')
}
