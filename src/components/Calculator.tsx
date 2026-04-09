import { useState } from 'react'
import type { SeveranceInput, SeveranceResult } from '../utils/severance'
import { calculateSeverance, formatKoreanWon, formatWorkPeriod } from '../utils/severance'

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
  { label: '월 기본급', key: 'monthlyBasePay', type: 'number', unit: '원', hint: '세전 기준' },
  { label: '성과급 월 환산액', key: 'bonusMonthly', type: 'number', unit: '원', hint: '없으면 비워두세요' },
  { label: '연차수당', key: 'annualLeaveAllowance', type: 'number', unit: '원', hint: '미사용 연차수당 총액, 없으면 비워두세요' },
]

const initialForm: SeveranceInput = {
  startDate: '',
  endDate: '',
  monthlyBasePay: 0,
  bonusMonthly: 0,
  annualLeaveAllowance: 0,
}

const Calculator = () => {
  const [form, setForm] = useState<SeveranceInput>(initialForm)
  const [result, setResult] = useState<SeveranceResult | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleChange = (key: keyof SeveranceInput, value: string) => {
    const field = FORM_FIELDS.find(f => f.key === key)
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
    <div style={{ minHeight: '100vh', backgroundColor: '#E0E7FF', display: 'flex', flexDirection: 'column' }}>

      {/* 헤더 */}
      <div style={{ backgroundColor: '#3B82F6', paddingTop: 56, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, color: '#fff' }}>
        <p style={{ fontSize: 13, color: '#BFDBFE', marginBottom: 4 }}>근로기준법 기준</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>내 퇴직금 얼마?</h1>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, marginTop: -20, borderRadius: '24px 24px 0 0', backgroundColor: '#E0E7FF', paddingTop: 24, paddingBottom: 48 }}>

        {/* 입력 카드 */}
        <div style={{ margin: '0 16px 12px', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {FORM_FIELDS.map((field, idx) => (
            <div
              key={field.key}
              style={{
                padding: '16px 20px',
                borderBottom: idx < FORM_FIELDS.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
            >
              <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 8, fontWeight: 500 }}>
                {field.label}
              </label>
              {field.type === 'date' ? (
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={form[field.key] as string}
                    onChange={e => handleChange(field.key, e.target.value)}
                    aria-label={field.label}
                    style={{
                      width: '100%',
                      fontSize: 15,
                      color: '#111827',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      padding: 0,
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={(form[field.key] as number) === 0 ? '' : (form[field.key] as number).toLocaleString()}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder="0"
                    aria-label={field.label}
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: '#111827',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      padding: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>{field.unit}</span>
                </div>
              )}
              {field.hint && (
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* 계산 버튼 */}
        <div style={{ margin: '0 16px 12px' }}>
          <button
            onClick={handleCalculate}
            disabled={!isFormValid}
            aria-label="퇴직금 계산하기"
            style={{
              width: '100%',
              backgroundColor: isFormValid ? '#3B82F6' : '#93C5FD',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              padding: '16px 0',
              borderRadius: 20,
              border: 'none',
              cursor: isFormValid ? 'pointer' : 'default',
            }}
          >
            퇴직금 계산하기
          </button>
        </div>

        {/* 결과 */}
        {hasCalculated && result && (
          <div style={{ margin: '0 16px' }}>
            {!result.isEligible ? (
              <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '32px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>😢</p>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#111827' }}>퇴직금 대상이 아니에요</p>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                  재직기간 <strong style={{ color: '#374151' }}>{formatWorkPeriod(result.workDays)}</strong> —<br />
                  퇴직금은 <strong style={{ color: '#374151' }}>1년 이상</strong> 근무해야 받을 수 있어요
                </p>
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: '#3B82F6', borderRadius: 20, padding: '24px 20px', textAlign: 'center', color: '#fff', marginBottom: 12 }}>
                  <p style={{ fontSize: 13, color: '#BFDBFE', marginBottom: 8 }}>예상 퇴직금 (세전)</p>
                  <p style={{ fontSize: 36, fontWeight: 700 }}>{formatKoreanWon(result.severancePay)}</p>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 }}>
                  <DetailRow label="재직기간" value={formatWorkPeriod(result.workDays)} />
                  <DetailRow label="재직일수" value={`${result.workDays.toLocaleString()}일`} border />
                  <DetailRow label="1일 평균임금" value={`${result.averageDailyWage.toLocaleString()}원`} border />
                </div>

                <div style={{ backgroundColor: '#C7D2FE', borderRadius: 20, padding: '14px 20px', textAlign: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: '#6366F1', lineHeight: 1.7 }}>
                    1일 평균임금 × 30 × (재직일수 ÷ 365)
                  </p>
                </div>
              </>
            )}

            <button
              onClick={handleReset}
              aria-label="다시 계산하기"
              style={{ width: '100%', fontSize: 14, color: '#9CA3AF', padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              다시 계산하기
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 32, lineHeight: 1.7, padding: '0 24px' }}>
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
    borderTop: border ? '1px solid #F3F4F6' : 'none',
  }}>
    <span style={{ fontSize: 14, color: '#6B7280' }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{value}</span>
  </div>
)

export default Calculator
