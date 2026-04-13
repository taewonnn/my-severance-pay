import { useState, lazy, Suspense } from 'react'
import type { SeveranceInput, SeveranceResult } from '../utils/severance'
import { calculateSeverance, formatKoreanWon, formatWorkPeriod } from '../utils/severance'

const isAIT = import.meta.env.VITE_BUILD_TARGET !== 'web'

const TDSButton = isAIT ? lazy(() => import('@toss/tds-mobile').then(m => ({ default: m.Button }))) : null

type ButtonProps = {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'fill' | 'weak'
  size?: 'xlarge' | 'medium'
  'aria-label'?: string
}

const AppButton = ({ onClick, disabled, children, variant = 'fill', size = 'xlarge', 'aria-label': ariaLabel }: ButtonProps) => {
  if (isAIT && TDSButton) {
    return (
      <Suspense fallback={null}>
        <TDSButton
          size={size}
          variant={variant}
          color="primary"
          display="full"
          disabled={disabled}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {children}
        </TDSButton>
      </Suspense>
    )
  }

  const isPrimary = variant === 'fill'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        width: '100%',
        backgroundColor: isPrimary ? (disabled ? '#93C5FD' : '#3182F6') : 'transparent',
        color: isPrimary ? '#fff' : '#3182F6',
        fontWeight: 700,
        fontSize: size === 'xlarge' ? 15 : 14,
        padding: size === 'xlarge' ? '16px 0' : '10px 0',
        borderRadius: 16,
        border: isPrimary ? 'none' : 'none',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}

type FormField = {
  label: string
  key: keyof SeveranceInput
  type: 'date' | 'number'
  unit?: string
  hint?: string
}

const FORM_FIELDS: FormField[] = [
  { label: '입사일', key: 'startDate', type: 'date' },
  { label: '퇴사일', key: 'endDate', type: 'date' },
  { label: '최근 3개월 기본급 합계', key: 'threeMonthBasePay', type: 'number', unit: '원', hint: '세전 기준 · 네이버 계산기와 동일한 입력 방식' },
  { label: '최근 3개월 성과급 합계', key: 'threeMonthBonus', type: 'number', unit: '원', hint: '없으면 비워두세요' },
  { label: '연차수당', key: 'annualLeaveAllowance', type: 'number', unit: '원', hint: '미사용 연차수당 총액, 없으면 비워두세요' },
]

const today = new Date().toISOString().split('T')[0]

const initialForm: SeveranceInput = {
  startDate: '',
  endDate: today,
  threeMonthBasePay: 0,
  threeMonthBonus: 0,
  annualLeaveAllowance: 0,
}

const Calculator = () => {
  const [form, setForm] = useState<SeveranceInput>(initialForm)
  const [result, setResult] = useState<SeveranceResult | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleChange = (key: keyof SeveranceInput, value: string) => {
    const field = FORM_FIELDS.find(f => f.key === key)

    if (field?.type === 'date' && value) {
      const [year] = value.split('-')
      if (year && year.length > 4) return
      setForm(prev => ({ ...prev, [key]: value }))
      setHasCalculated(false)
      return
    }

    setForm(prev => ({
      ...prev,
      [key]: field?.type === 'number' ? Number(value.replace(/[^0-9]/g, '')) : value,
    }))
    setHasCalculated(false)
  }

  const isFormValid = Boolean(form.startDate && form.endDate && form.endDate > form.startDate)

  const handleCalculate = () => {
    if (!isFormValid) return
    setResult(calculateSeverance(form))
    setHasCalculated(true)
  }

  const handleReset = () => {
    setForm(initialForm)
    setResult(null)
    setHasCalculated(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F4F6', display: 'flex', flexDirection: 'column' }}>

      {/* 헤더 */}
      <div style={{ backgroundColor: '#3182F6', paddingTop: 56, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, color: '#fff' }}>
        <p style={{ fontSize: 13, color: '#C9E0FF', marginBottom: 4 }}>근로기준법 기준</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>내 퇴직금 얼마?</h1>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, marginTop: -20, borderRadius: '20px 20px 0 0', backgroundColor: '#F2F4F6', paddingTop: 24, paddingBottom: 40 }}>

        {/* 입력 카드 */}
        <div style={{ margin: '0 16px 12px', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          {FORM_FIELDS.map((field, idx) => (
            <div
              key={field.key}
              style={{
                padding: '16px 20px',
                borderBottom: idx < FORM_FIELDS.length - 1 ? '1px solid #F2F4F6' : 'none',
              }}
            >
              <label style={{ display: 'block', fontSize: 12, color: '#8B95A1', marginBottom: 8, fontWeight: 500 }}>
                {field.label}
              </label>
              {field.type === 'date' ? (
                <input
                  type="date"
                  value={form[field.key] as string}
                  onChange={e => handleChange(field.key, e.target.value)}
                  max="9999-12-31"
                  aria-label={field.label}
                  style={{ width: '100%', fontSize: 16, color: '#191F28', border: 'none', outline: 'none', background: 'transparent', padding: 0 }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={(form[field.key] as number) === 0 ? '' : (form[field.key] as number).toLocaleString()}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder="0"
                    aria-label={field.label}
                    style={{ flex: 1, fontSize: 16, color: '#191F28', border: 'none', outline: 'none', background: 'transparent', padding: 0 }}
                  />
                  <span style={{ fontSize: 14, color: '#8B95A1' }}>{field.unit}</span>
                </div>
              )}
              {field.hint && (
                <p style={{ fontSize: 12, color: '#B0B8C1', marginTop: 6 }}>{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* 계산 버튼 — TDS Button */}
        <div style={{ margin: '0 16px 12px' }}>
          <AppButton
            size="xlarge"
            variant="fill"
            disabled={!isFormValid}
            onClick={handleCalculate}
            aria-label="퇴직금 계산하기"
          >
            퇴직금 계산하기
          </AppButton>
        </div>

        {/* 결과 */}
        {hasCalculated && result && (
          <div style={{ margin: '0 16px' }}>
            {!result.isEligible ? (
              <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>😢</p>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#191F28' }}>퇴직금 대상이 아니에요</p>
                <p style={{ fontSize: 14, color: '#8B95A1', lineHeight: 1.6 }}>
                  재직기간 <strong style={{ color: '#191F28' }}>{formatWorkPeriod(result.workDays)}</strong> —<br />
                  퇴직금은 <strong style={{ color: '#191F28' }}>1년 이상</strong> 근무해야 받을 수 있어요
                </p>
              </div>
            ) : (
              <>
                {/* 금액 */}
                <div style={{ backgroundColor: '#3182F6', borderRadius: 16, padding: '24px 20px', textAlign: 'center', color: '#fff', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, color: '#C9E0FF', marginBottom: 8 }}>예상 퇴직금 (세전)</p>
                  <p style={{ fontSize: 36, fontWeight: 700 }}>{formatKoreanWon(result.severancePay)}</p>
                </div>

                {/* 상세 */}
                <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
                  <DetailRow label="재직기간" value={formatWorkPeriod(result.workDays)} />
                  <DetailRow label="재직일수" value={`${result.workDays.toLocaleString()}일`} border />
                  <DetailRow label="1일 평균임금" value={`${result.averageDailyWage.toLocaleString()}원`} border />
                </div>

                {/* 계산식 */}
                <div style={{ backgroundColor: '#EBF3FF', borderRadius: 16, padding: '14px 20px', textAlign: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: '#3182F6', lineHeight: 1.7 }}>
                    1일 평균임금 × 30 × (재직일수 ÷ 365)
                  </p>
                </div>
              </>
            )}

            {/* 다시 계산 */}
            <AppButton
              size="medium"
              variant="weak"
              onClick={handleReset}
              aria-label="다시 계산하기"
            >
              다시 계산하기
            </AppButton>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#B0B8C1', marginTop: 32, lineHeight: 1.7, padding: '0 24px' }}>
          본 계산기는 참고용이에요.<br />
          정확한 금액은 고용노동부 또는 전문가에게 확인하세요.
        </p>
      </div>
    </div>
  )
}

type DetailRowProps = { label: string; value: string; border?: boolean }
const DetailRow = ({ label, value, border }: DetailRowProps) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderTop: border ? '1px solid #F2F4F6' : 'none',
  }}>
    <span style={{ fontSize: 14, color: '#8B95A1' }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28' }}>{value}</span>
  </div>
)

export default Calculator
