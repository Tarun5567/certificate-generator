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
  semester: 'Annual Examination',
  examYear: String(new Date().getFullYear()),
  issueDate: new Date().toISOString().slice(0, 10),
  subjects: DEFAULT_SUBJECTS.map((name) => ({ name, marks: '' })),
}

const demoForm = {
  ...emptyForm,
  studentName: 'Ananya Sharma',
  fatherName: 'Rajesh Sharma',
  rollNo: '2412345',
  schoolName: 'Sunrise Public School',
  subjects: DEFAULT_SUBJECTS.map((name, index) => ({
    name,
    marks: ['94', '87', '78', '91', '83', '88'][index],
  })),
}

const gradeBands = [
  ['A1', '91–100', 'Outstanding'],
  ['A2', '81–90', 'Excellent'],
  ['B1', '71–80', 'Very good'],
  ['B2', '61–70', 'Good'],
  ['C1', '51–60', 'Above average'],
  ['C2', '41–50', 'Average'],
  ['D', '33–40', 'Pass'],
  ['E1 / E2', 'Below 33', 'Needs improvement'],
]

async function createFingerprint(data) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure SHA-256 is unavailable in this browser. Open the site over HTTPS or localhost.')
  }

  const canonicalData = JSON.stringify({
    serial: data.serial,
    boardName: data.boardName,
    examTitle: data.examTitle,
    semester: data.semester,
    examYear: data.examYear,
    issueDate: data.issueDate,
    studentName: data.studentName,
    fatherName: data.fatherName,
    rollNo: data.rollNo,
    schoolName: data.schoolName,
    rows: data.result.rows,
    total: data.result.total,
    percentage: data.result.percentage,
    overallGrade: data.result.overallGrade,
    result: data.result.result,
  })
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalData),
  )

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('').toUpperCase()
}

export default function App() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [issued, setIssued] = useState(null)
  const [activePage, setActivePage] = useState('studio')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const preview = useMemo(() => computeResult(form.subjects), [form.subjects])
  const completion = useMemo(() => {
    const completedMarks = form.subjects.filter(
      (subject) => subject.name.trim() && subject.marks !== '',
    ).length
    const completedDetails = Number(Boolean(form.studentName.trim())) +
      Number(Boolean(form.rollNo.trim()))
    return Math.round(((completedDetails + completedMarks) / 8) * 100)
  }, [form])
  const previewData = useMemo(() => ({
    ...form,
    result: preview,
    serial: form.rollNo.trim() ? serialNumber(form.rollNo) : 'Pending',
    fingerprint: issued?.fingerprint,
  }), [form, issued, preview])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setIssued(null)
  }

  function updateSubject(index, key, value) {
    setForm((prev) => {
      const subjects = prev.subjects.map((subject, i) =>
        i === index ? { ...subject, [key]: value } : subject,
      )
      return { ...prev, subjects }
    })
    setIssued(null)
  }

  async function handleSubmit(event) {
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

    setGenerating(true)
    try {
      const data = {
        ...form,
        result: computeResult(form.subjects),
        serial: serialNumber(form.rollNo),
      }
      const fingerprint = await createFingerprint(data)
      setIssued({ ...data, fingerprint })
    } catch (generationError) {
      setError(generationError.message)
    } finally {
      setGenerating(false)
    }
  }

  function resetAll() {
    setForm(emptyForm)
    setIssued(null)
    setError('')
  }

  function loadDemo() {
    setForm(demoForm)
    setIssued(null)
    setError('')
  }

  async function copyFingerprint() {
    if (!issued?.fingerprint) return
    try {
      await navigator.clipboard.writeText(issued.fingerprint)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy the fingerprint. Select and copy it manually.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <a className="brand" href="#studio" onClick={() => setActivePage('studio')}>
          <span className="brand-mark"><Logo className="brand-logo" size={42} /></span>
          <span className="brand-copy">
            <strong>BOARD CERTIFICATE</strong>
            <small>ACADEMIC RECORDS</small>
          </span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={activePage === 'studio' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('studio')}>
            <span className="nav-icon">01</span> Certificate studio
          </button>
          <button className={activePage === 'grades' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('grades')}>
            <span className="nav-icon">02</span> Grade index
          </button>
          <button className={activePage === 'security' ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage('security')}>
            <span className="nav-icon">03</span> Trust & security
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status"><span className="status-dot" /> SYSTEM OPERATIONAL</div>
          <p>Designed for clarity.<br />Built for confidence.</p>
          <span className="version">CERTIFICATE ENGINE / 1.0</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar no-print">
          <div className="breadcrumb">ACADEMIC RECORDS <span>/</span> {activePage.toUpperCase()}</div>
          <div className="topbar-right"><span className="secure-label"><span /> LOCAL &amp; PRIVATE</span><span className="topbar-year">{new Date().getFullYear()}</span></div>
        </header>

        {activePage === 'studio' && (
          <>
            <section className="page-heading">
              <div>
                <p className="eyebrow"><span className="eyebrow-line" /> ACADEMIC RECORDS · CERTIFICATE STUDIO</p>
                <h1>Academic marksheet<br /><span>generator</span></h1>
                <p className="lede">Enter a student’s details and results to prepare a formal, print-ready statement of marks.</p>
              </div>
              <div className="heading-stamp">
                <span className="stamp-ring">A</span>
                <span>ACADEMIC<br />RECORDS</span>
              </div>
            </section>

            <div className="workspace-grid">
              <form className="panel form-panel" onSubmit={handleSubmit}>
                <div className="panel-heading">
                  <div><span className="section-index">01 / DETAILS</span><h2>Candidate record</h2></div>
                  <span className="required-note"><i /> REQUIRED FIELDS</span>
                </div>

                <div className="form-section">
                  <p className="section-caption">IDENTITY &amp; INSTITUTION</p>
                  <div className="grid">
                    <label>Student name <span className="required">*</span>
                      <input required value={form.studentName} onChange={(e) => updateField('studentName', e.target.value)} placeholder="e.g. Ananya Sharma" autoComplete="name" />
                    </label>
                    <label>Father&apos;s / Guardian&apos;s name
                      <input value={form.fatherName} onChange={(e) => updateField('fatherName', e.target.value)} placeholder="e.g. Rajesh Sharma" />
                    </label>
                    <label>Roll number <span className="required">*</span>
                      <input required value={form.rollNo} onChange={(e) => updateField('rollNo', e.target.value)} placeholder="e.g. 2412345" />
                    </label>
                    <label>School / institution
                      <input value={form.schoolName} onChange={(e) => updateField('schoolName', e.target.value)} placeholder="Institution name" />
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <p className="section-caption">EXAMINATION DETAILS</p>
                  <div className="grid">
                    <label>Board name
                      <input value={form.boardName} onChange={(e) => updateField('boardName', e.target.value)} />
                    </label>
                    <label>Examination
                      <input value={form.examTitle} onChange={(e) => updateField('examTitle', e.target.value)} />
                    </label>
                    <label>Semester / session
                      <input value={form.semester} onChange={(e) => updateField('semester', e.target.value)} placeholder="e.g. Semester I" />
                    </label>
                    <label>Year
                      <input value={form.examYear} onChange={(e) => updateField('examYear', e.target.value)} />
                    </label>
                    <label>Date of issue
                      <input type="date" value={form.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} />
                    </label>
                  </div>
                </div>

                <div className="panel-heading subjects-heading">
                  <div><span className="section-index">02 / RESULTS</span><h2>Subject marks</h2></div>
                  <span className="max-marks">MAXIMUM {MAX_MARKS} / SUBJECT</span>
                </div>
                <div className="subjects">
                  {form.subjects.map((subject, index) => (
                    <div className="subject-row" key={index}>
                      <span className="sub-no">{String(index + 1).padStart(2, '0')}</span>
                      <input className="sub-name" required value={subject.name} onChange={(e) => updateSubject(index, 'name', e.target.value)} aria-label={`Subject ${index + 1} name`} />
                      <input className="sub-marks" required type="number" min="0" max={MAX_MARKS} step="1" value={subject.marks} onChange={(e) => updateSubject(index, 'marks', e.target.value)} placeholder="—" aria-label={`${subject.name || `Subject ${index + 1}`} marks`} />
                      <span className="out-of">/ {MAX_MARKS}</span>
                    </div>
                  ))}
                </div>

                <div className="completion-block">
                  <div className="completion-caption"><span>RECORD COMPLETION</span><strong>{completion}%</strong></div>
                  <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>
                </div>

                <div className="live-summary">
                  <div><span>TOTAL MARKS</span><strong>{preview.total}<small> / {preview.maxTotal}</small></strong></div>
                  <div><span>PERCENTAGE</span><strong>{preview.percentage.toFixed(1)}<small>%</small></strong></div>
                  <div><span>GRADE</span><strong>{preview.overallGrade}</strong></div>
                  <div><span>RESULT</span><strong className={preview.result === 'PASS' ? 'pass' : 'fail'}>{preview.result}</strong></div>
                </div>

                {error && <p className="error" role="alert" aria-live="assertive">{error}</p>}
                <div className="actions">
                  <button type="submit" disabled={generating}>{generating ? 'Securing record…' : 'Generate certificate'} <span aria-hidden="true">↗</span></button>
                  <button type="button" className="ghost" onClick={resetAll}>Clear form</button>
                  <button type="button" className="text-button" onClick={loadDemo}>Load sample data</button>
                </div>
              </form>

              <aside className="preview-column">
                <div className="preview-toolbar no-print">
                  <div><span className="section-index">LIVE PREVIEW</span><strong>{issued ? 'Certificate generated' : 'Updates as you type'}</strong></div>
                  {issued && <span className="issued-badge">READY TO PRINT</span>}
                </div>
                <Certificate data={previewData} issueDateLabel={formatDate(previewData.issueDate)} />
                <div className="preview-actions no-print">
                  <button type="button" className="primary-button" disabled={!issued} onClick={() => window.print()}>Download PDF</button>
                  <button type="button" className="secondary-button" disabled={!issued} onClick={() => window.print()}>Print certificate</button>
                </div>
                {issued && (
                  <div className="fingerprint-bar no-print">
                    <div><span>SHA-256 DOCUMENT FINGERPRINT</span><code>{issued.fingerprint}</code></div>
                    <button type="button" className="ghost" onClick={copyFingerprint}>{copied ? 'Copied ✓' : 'Copy'}</button>
                  </div>
                )}
                <p className="preview-disclaimer no-print">Use “Download PDF” and choose “Save as PDF” in your browser’s print dialog. This demonstration document is not an official board certificate.</p>
              </aside>
            </div>
          </>
        )}

        {activePage === 'grades' && (
          <section className="secondary-page no-print">
            <p className="eyebrow"><span className="eyebrow-line" /> REFERENCE / ASSESSMENT</p>
            <h1>A clear measure<br /><span>of progress.</span></h1>
            <p className="lede">A quick guide to the grading scale used by the certificate engine.</p>
            <div className="grade-page-grid">
              <div className="panel grade-panel">
                <div className="panel-heading"><div><span className="section-index">01 / GRADE BANDS</span><h2>Assessment scale</h2></div><span className="max-marks">100 POINT SCALE</span></div>
                <div className="grade-table">
                  <div className="grade-table-head"><span>GRADE</span><span>MARKS</span><span>PERFORMANCE</span></div>
                  {gradeBands.map(([grade, marks, description]) => (
                    <div className="grade-table-row" key={grade}><strong>{grade}</strong><span>{marks}</span><span>{description}</span></div>
                  ))}
                </div>
              </div>
              <aside className="insight-card grade-aside">
                <span className="section-index">THE RULES</span>
                <div className="rule-stat"><strong>{PASS_MARKS}</strong><span>minimum marks<br />to pass a subject</span></div>
                <div className="rule-stat"><strong>06</strong><span>subjects included<br />in each record</span></div>
                <p>Students must meet the minimum passing marks in every subject to receive a passing result. Grades and the overall result update as marks are entered.</p>
                <button type="button" onClick={() => setActivePage('studio')}>Open certificate studio <span aria-hidden="true">↗</span></button>
              </aside>
            </div>
          </section>
        )}

        {activePage === 'security' && (
          <section className="secondary-page no-print">
            <p className="eyebrow"><span className="eyebrow-line" /> REFERENCE / INTEGRITY</p>
            <h1>Trust, by design.</h1>
            <p className="lede">A transparent look at how this workspace handles your academic record.</p>
            <div className="security-grid">
              <article className="panel security-panel">
                <span className="security-symbol">⌘</span><span className="section-index">01 / PRIVACY FIRST</span>
                <h2>Local by default.</h2>
                <p>Your form data is processed in your browser. This app does not send student details to a backend or store records after you leave the page.</p>
              </article>
              <article className="panel security-panel">
                <span className="security-symbol">#</span><span className="section-index">02 / SHA-256</span>
                <h2>Integrity fingerprint.</h2>
                <p>Each generated certificate includes a SHA-256 digest of its record. The digest changes if the underlying record changes, helping identify accidental edits.</p>
              </article>
              <article className="panel security-panel">
                <span className="security-symbol">!</span><span className="section-index">03 / IMPORTANT</span>
                <h2>Not a digital signature.</h2>
                <p>A fingerprint is not proof of who issued a document and cannot establish official authenticity. This is a demonstration tool, not an official board service.</p>
              </article>
            </div>
            <div className="security-callout"><span>↗</span><div><strong>Ready to create a record?</strong><p>Generate a certificate to see its SHA-256 fingerprint and print-ready preview.</p></div><button type="button" onClick={() => setActivePage('studio')}>Go to studio</button></div>
          </section>
        )}

        <footer className="page-footer no-print"><span>BOARD CERTIFICATE GENERATOR</span><span>DEMONSTRATION TOOL · NOT AN OFFICIAL BOARD SERVICE</span></footer>
      </main>
    </div>
  )
}
