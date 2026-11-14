// Always-visible disclaimer (PLAN.md §9, built from Excel Rules!B3).
export default function DisclaimerBar() {
  return (
    <footer className="disclaimer" role="note">
      <span style={{ color: '#ffd54f' }}>⚠</span>
      <span>
        <strong>Prototype for decision support only.</strong> Not a diagnostic or predictive tool and not a replacement for flight surgeon
        judgement. Colours mark the priority of a check, not a diagnosis. Thresholds are a prototype working table, not a validated NASA alarm
        protocol.
      </span>
    </footer>
  );
}
