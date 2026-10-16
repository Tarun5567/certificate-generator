import { useMemo, useState } from 'react'
import {
  DEFAULT_SUBJECTS,
  MAX_MARKS,
  PASS_MARKS,
  computeResult,
  formatDate,
  serialNumber,
} from './grading.js'
import Certificate from './Certificate.jsx'
import Logo from './Logo.jsx'

const emptyForm = {
  studentName: '',
  fatherName: '',
  rollNo: '',
  schoolName: '',
  boardName: 'National Academic Examination Board',
  examTitle: 'Secondary School Examination',
  examYear: String(new Date().getFullYear()),
  issueDate: new Date().toISOString().slice(0, 10),
  subjects: DEFAULT_SUBJECTS.map((name) => ({ name, marks: '' })),
}

export default function App() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [issued, setIssued] = useState(null)

  const preview = useMemo(() => computeResult(form.subjects), [form.subjects])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateSubject(index, key, value) {
    setForm((prev) => {
      const subjects = prev.subjects.map((s, i) =>
        i === index ? { ...s, [key]: value } : s,
      )
      return { ...prev, subjects }
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.studentName.trim()) {
      setError('Please enter the student name.')
      return
    }
    if (!form.rollNo.trim()) {
      setError('Please enter the roll number.')
      return
    }

    for (const subject of form.subjects) {
      if (!subject.name.trim()) {
        setError('Each of the six subjects needs a name.')
        return
      }
      const marks = Number(subject.marks)
      if (!Number.isFinite(marks) || subject.marks === '') {
        setError('Enter marks for all six subjects.')
        return
      }
      if (marks < 0 || marks > MAX_MARKS) {
        setError(`Marks must be between 0 and ${MAX_MARKS}.`)
        return
      }
    }

    const result = computeResult(form.subjects)
    setIssued({
      ...form,
      result,
      serial: serialNumber(form.rollNo),
    })
  }

  function resetAll() {
    setForm(emptyForm)
    setIssued(null)
    setError('')
  }

  return (
    <div className="app">
      <header className="hero no-print">
        <div className="brand">
          <Logo className="brand-logo" size={88} />
          <div>
            <p className="eyebrow">National Academic Examination Board</p>
            <p className="brand-sub">Board results desk</p>
          </div>
        </div>
        <h1>Enter six subject marks and issue a certificate</h1>
        <p className="lede">
          Fill in student details and marks out of {MAX_MARKS}. Grades follow a
          board-style scale (A1–E2). The pass mark is {PASS_MARKS} in every
          subject.
        </p>
      </header>

      <form className="panel no-print" onSubmit={handleSubmit}>
        <h2>Candidate particulars</h2>
        <div className="grid">
          <label>
            Student name
            <input
              value={form.studentName}
              onChange={(e) => updateField('studentName', e.target.value)}
              placeholder="e.g. Ananya Sharma"
              autoComplete="name"
            />
          </label>
          <label>
            Father&apos;s / Guardian&apos;s name
            <input
              value={form.fatherName}
              onChange={(e) => updateField('fatherName', e.target.value)}
              placeholder="e.g. Rajesh Sharma"
            />
          </label>
          <label>
            Roll number
            <input
              value={form.rollNo}
              onChange={(e) => updateField('rollNo', e.target.value)}
              placeholder="e.g. 2412345"
            />
          </label>
          <label>
            School / Institution
            <input
              value={form.schoolName}
              onChange={(e) => updateField('schoolName', e.target.value)}
              placeholder="e.g. Sunrise Public School, Delhi"
            />
          </label>
          <label>
            Board name
            <input
              value={form.boardName}
              onChange={(e) => updateField('boardName', e.target.value)}
            />
          </label>
          <label>
            Examination
            <input
              value={form.examTitle}
              onChange={(e) => updateField('examTitle', e.target.value)}
            />
          </label>
          <label>
            Year
            <input
              value={form.examYear}
              onChange={(e) => updateField('examYear', e.target.value)}
            />
          </label>
          <label>
            Date of issue
            <input
              type="date"
              value={form.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
            />
          </label>
        </div>

        <h2>Six subjects</h2>
        <div className="subjects">
          {form.subjects.map((subject, index) => (
            <div className="subject-row" key={index}>
              <span className="sub-no">{index + 1}</span>
              <input
                className="sub-name"
                value={subject.name}
                onChange={(e) => updateSubject(index, 'name', e.target.value)}
                aria-label={`Subject ${index + 1} name`}
              />
              <input
                className="sub-marks"
                type="number"
                min="0"
                max={MAX_MARKS}
                step="1"
                value={subject.marks}
                onChange={(e) => updateSubject(index, 'marks', e.target.value)}
                placeholder="Marks"
                aria-label={`${subject.name || `Subject ${index + 1}`} marks`}
              />
              <span className="out-of">/ {MAX_MARKS}</span>
            </div>
          ))}
        </div>

        <div className="live-summary">
          <div>
            <span>Total</span>
            <strong>
              {preview.total} / {preview.maxTotal}
            </strong>
          </div>
          <div>
            <span>Percentage</span>
            <strong>{preview.percentage.toFixed(1)}%</strong>
          </div>
          <div>
            <span>Overall grade</span>
            <strong>{preview.overallGrade}</strong>
          </div>
          <div>
            <span>Result</span>
            <strong className={preview.result === 'PASS' ? 'pass' : 'fail'}>
              {preview.result}
            </strong>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div className="actions">
          <button type="submit">Generate certificate</button>
          <button type="button" className="ghost" onClick={resetAll}>
            Reset
          </button>
          {issued ? (
            <button type="button" className="ghost" onClick={() => window.print()}>
              Print / Save as PDF
            </button>
          ) : null}
        </div>
      </form>

      {issued ? (
        <Certificate data={issued} issueDateLabel={formatDate(issued.issueDate)} />
      ) : (
        <p className="hint no-print">
          After you generate the certificate, use Print / Save as PDF for a
          board-style printout.
        </p>
      )}
    </div>
  )
}
