export const DEFAULT_SUBJECTS = [
  'English Language & Literature',
  'Hindi Course A',
  'Mathematics',
  'Science',
  'Social Science',
  'Computer Applications',
]

export const MAX_MARKS = 100
export const PASS_MARKS = 33

export function subjectGrade(marks) {
  const m = Number(marks)
  if (!Number.isFinite(m)) return { grade: '—', gp: '—' }
  if (m >= 91) return { grade: 'A1', gp: 10 }
  if (m >= 81) return { grade: 'A2', gp: 9 }
  if (m >= 71) return { grade: 'B1', gp: 8 }
  if (m >= 61) return { grade: 'B2', gp: 7 }
  if (m >= 51) return { grade: 'C1', gp: 6 }
  if (m >= 41) return { grade: 'C2', gp: 5 }
  if (m >= 33) return { grade: 'D', gp: 4 }
  if (m >= 21) return { grade: 'E1', gp: 0 }
  return { grade: 'E2', gp: 0 }
}

export function overallFromPercentage(pct) {
  if (pct >= 91) return { grade: 'A1', division: 'Outstanding' }
  if (pct >= 81) return { grade: 'A2', division: 'Excellent' }
  if (pct >= 71) return { grade: 'B1', division: 'Very Good' }
  if (pct >= 61) return { grade: 'B2', division: 'Good' }
  if (pct >= 51) return { grade: 'C1', division: 'Satisfactory' }
  if (pct >= 41) return { grade: 'C2', division: 'Fair' }
  if (pct >= 33) return { grade: 'D', division: 'Pass' }
  return { grade: 'E', division: 'Needs Improvement' }
}

export function computeResult(subjects) {
  const rows = subjects.map((s) => {
    const marks = Math.min(MAX_MARKS, Math.max(0, Number(s.marks) || 0))
    const { grade, gp } = subjectGrade(marks)
    return {
      name: s.name.trim() || 'Subject',
      marks,
      max: MAX_MARKS,
      grade,
      gp,
      passed: marks >= PASS_MARKS,
    }
  })

  const total = rows.reduce((sum, r) => sum + r.marks, 0)
  const maxTotal = rows.length * MAX_MARKS
  const percentage = maxTotal ? (total / maxTotal) * 100 : 0
  const allPassed = rows.every((r) => r.passed)
  const result = allPassed ? 'PASS' : 'FAIL'
  const overall = overallFromPercentage(percentage)
  const cgpa = allPassed
    ? (rows.reduce((sum, r) => sum + Number(r.gp), 0) / rows.length).toFixed(1)
    : '—'

  return {
    rows,
    total,
    maxTotal,
    percentage,
    result,
    overallGrade: allPassed ? overall.grade : 'E',
    division: allPassed ? overall.division : 'Unsuccessful',
    cgpa,
  }
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function serialNumber(roll) {
  const year = new Date().getFullYear()
  const seed = String(roll || '00000').replace(/\D/g, '').padStart(7, '0').slice(-7)
  return `${year}${seed}`
}
