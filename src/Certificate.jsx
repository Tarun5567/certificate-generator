import Logo from './Logo.jsx'
import { MAX_MARKS } from './grading.js'

function valueOrDash(value) {
  return value?.trim() || '—'
}

export default function Certificate({ data, issueDateLabel }) {
  const { result } = data
  const recordComplete =
    Boolean(data.studentName.trim() && data.rollNo.trim()) &&
    data.subjects.every((subject) => {
      const marks = Number(subject.marks)
      return subject.name.trim() &&
        subject.marks !== '' &&
        Number.isFinite(marks) &&
        marks >= 0 &&
        marks <= MAX_MARKS
    })

  return (
    <article className="certificate-wrap" id="certificate" aria-label="Academic marksheet preview">
      <div className="certificate">
        <div className="cert-inner">
          <header className="cert-head">
            <div className="certificate-emblem">
              <Logo className="seal" size={82} />
            </div>
            <div className="cert-title-block">
              <p className="board">{valueOrDash(data.boardName)}</p>
              <h2>STATEMENT OF MARKS</h2>
              <p className="exam">
                {valueOrDash(data.semester)} · Academic Year {valueOrDash(data.examYear)}
              </p>
            </div>
          </header>

          <section className="student-record" aria-label="Student and examination information">
            <div><span>Student name</span><strong>{valueOrDash(data.studentName)}</strong></div>
            {data.fatherName?.trim() && <div><span>Parent / guardian</span><strong>{data.fatherName}</strong></div>}
            <div><span>Institution</span><strong>{valueOrDash(data.schoolName)}</strong></div>
            <div><span>Examination</span><strong>{valueOrDash(data.examTitle)}</strong></div>
            <div><span>Academic year</span><strong>{valueOrDash(data.examYear)}</strong></div>
            <div><span>Serial number</span><strong>{valueOrDash(data.serial === 'Pending' ? '' : data.serial)}</strong></div>
            <div><span>Roll number</span><strong>{valueOrDash(data.rollNo)}</strong></div>
            <div><span>Date of issue</span><strong>{issueDateLabel || '—'}</strong></div>
          </section>

          <p className="certify">
            This statement records the academic performance of the above-named student in the
            examination indicated. The marks and grades awarded are detailed below.
          </p>

          <table className="marks-table">
            <thead>
              <tr>
                <th scope="col">S. No.</th>
                <th scope="col">Subject</th>
                <th scope="col">Maximum Marks</th>
                <th scope="col">Marks Obtained</th>
                <th scope="col">Grade</th>
                <th scope="col">Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={`${row.name}-${i}`}>
                  <td>{i + 1}</td>
                  <td className="subject-cell">{row.name}</td>
                  <td className="numeric-cell">{row.max}</td>
                  <td className="numeric-cell">{data.subjects[i].marks === '' ? '—' : row.marks}</td>
                  <td>{data.subjects[i].marks === '' ? '—' : row.grade}</td>
                  <td>{data.subjects[i].marks === '' ? '—' : row.gp}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={2} scope="row">Grand total</th>
                <td className="numeric-cell">{result.maxTotal}</td>
                <td className="numeric-cell">{recordComplete ? result.total : '—'}</td>
                <td colSpan={2}>
                  {recordComplete
                    ? `${result.percentage.toFixed(2)}% · Grade ${result.overallGrade}`
                    : 'Complete the record'}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="outcome">
            <p>
              <span>Result</span>
              <strong className={recordComplete ? (result.result === 'PASS' ? 'pass' : 'fail') : 'pending'}>
                {recordComplete ? result.result : 'PENDING'}
              </strong>
            </p>
            <p><span>Division / Remark</span><strong>{recordComplete ? result.division : '—'}</strong></p>
            <p><span>CGPA</span><strong>{recordComplete ? result.cgpa : '—'}</strong></p>
          </div>

          <p className="note">
            Grade scale: A1 (91–100), A2 (81–90), B1 (71–80), B2 (61–70), C1
            (51–60), C2 (41–50), D (33–40). Minimum passing marks in each subject:{' '}
            {33}. This document is generated for demonstration and is not an
            official board certificate.
          </p>

          {data.fingerprint && (
            <p className="fingerprint-note">
              SHA-256 RECORD FINGERPRINT <code>{data.fingerprint}</code>
            </p>
          )}

          <footer className="signs">
            <div><span className="sign-line" /><em>Checked by</em></div>
            <div><span className="sign-line" /><em>Principal</em></div>
            <div><span className="sign-line" /><em>Controller of Examinations</em></div>
          </footer>
        </div>
      </div>
    </article>
  )
}
