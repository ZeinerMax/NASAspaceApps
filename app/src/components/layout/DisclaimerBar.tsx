// Always-visible disclaimer (built from Excel Rules!B3): the key sentence is always shown, the rest is one click away.
import { useState } from 'react';

export default function DisclaimerBar() {
  const [more, setMore] = useState(false);
  return (
    <footer className="disclaimer" role="note">
      <span style={{ color: '#ffd54f' }}>⚠</span>
      <span style={{ flex: 1 }}>
        <strong>Decision support only.</strong> Not a diagnostic or predictive tool, not a replacement for flight surgeon judgement.
        {more && <> Colours mark the priority of a check, not a diagnosis. Thresholds are a prototype working table, not a validated NASA alarm protocol.</>}
      </span>
      <button className="link" onClick={() => setMore((m) => !m)}>{more ? 'Less' : 'More'}</button>
    </footer>
  );
}
