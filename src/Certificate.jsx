import Logo from './Logo.jsx'

export default function Certificate({ data, issueDateLabel }) {
  const { result } = data

  return (
    <article className="certificate-wrap" id="certificate">
      <div className="certificate">
        <div className="cert-inner">
          <header className="cert-head">
            <Logo className="seal" size={96} />
            <div>
              <p className="board">{data.boardName}</p>
              <h2>Statement of Marks</h2>
              <p className="exam">
                {data.examTitle} — {data.examYear}
              </p>
            </div>
          </header>

          <dl className="meta">
            <div>
              <dt>Serial No.</dt>
              <dd>{data.serial}</dd>
            </div>
            <div>
              <dt>Roll No.</dt>
              <dd>{data.rollNo}</dd>
            </div>
            <div>
              <dt>Date of issue</dt>
              <dd>{issueDateLabel}</dd>
            </div>
          </dl>

          <p className="certify">
            This is to certify that <strong>{data.studentName}</strong>
            {data.fatherName ? (
              <>
                , son/daughter of <strong>{data.fatherName}</strong>,
              </>
            ) : (
              ','
            )}{' '}
            a candidate of{' '}
            <strong>{data.schoolName || 'the affiliated institution'}</strong>,
            appeared at the {data.examTitle} held in {data.examYear} and obtained
            the following marks:
          </p>

          <table>
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Subject</th>
                <th>Max. Marks</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Grade Point</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="left">{row.name}</td>
                  <td>{row.max}</td>
                  <td>{row.marks}</td>
                  <td>{row.grade}</td>
                  <td>{row.gp}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="left">
                  Grand Total
                </td>
                <td>{result.maxTotal}</td>
                <td>{result.total}</td>
                <td colSpan={2}>
                  {result.percentage.toFixed(2)}% · Grade {result.overallGrade}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="outcome">
            <p>
              <span>Result</span>
              <strong className={result.result === 'PASS' ? 'pass' : 'fail'}>
                {result.result}
              </strong>
            </p>
            <p>
              <span>Division / Remark</span>
              <strong>{result.division}</strong>
            </p>
            <p>
              <span>CGPA</span>
              <strong>{result.cgpa}</strong>
            </p>
          </div>

          <p className="note">
            Grade scale: A1 (91–100), A2 (81–90), B1 (71–80), B2 (61–70), C1
            (51–60), C2 (41–50), D (33–40). Minimum pass marks in each subject:{' '}
            {33}. This document is generated for demonstration and is not an
            official board certificate.
          </p>

          <footer className="signs">
            <div>
              <span className="sign-line" />
              <em>Checked by</em>
            </div>
            <div>
              <span className="sign-line" />
              <em>Principal</em>
            </div>
            <div>
              <span className="sign-line" />
              <em>Controller of Examinations</em>
            </div>
          </footer>
        </div>
      </div>
    </article>
  )
}
