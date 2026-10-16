# Board Certificate Generator

A React + Vite certificate generator for entering student details and six subject marks, previewing grade calculations, and printing a formal academic marksheet.

## Run locally

```sh
npm install
npm run dev
```

## Workspace pages

- **Certificate studio** — enter candidate and examination details, review live totals and grades, generate a certificate, and print or save it as a PDF.
- **Grade index** — review the grade bands and passing requirements.
- **Trust & security** — learn how local processing and certificate fingerprints work.

Generated records include a SHA-256 fingerprint calculated in the browser with the Web Crypto API. This digest can help detect changes to the record, but it is not a digital signature and does not verify who issued a certificate. The app does not upload or persist student records. Generated documents are demonstrations and are not official board certificates.

Use **Download PDF** to open the browser print dialog and select **Save as PDF**. The Print button opens the same dialog for printing on paper.

## Production build

```sh
npm run build
npm run preview
```
