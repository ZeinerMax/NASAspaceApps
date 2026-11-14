import { useState } from 'react';
import { EXPLANATIONS } from '../../data/explanations';
import HowToModal from '../checkin/HowToModal';

// Keep this library driven by the same source as the check-in help buttons so every available guide appears here.
const TUTORIALS = Object.values(EXPLANATIONS);

export default function TutorialsTab() {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);

  return (
    <section className="tutorials-page" aria-labelledby="tutorials-title">
      <header className="tutorials-heading">
        <div>
          <div className="section-title">Measurement guide</div>
          <h2 id="tutorials-title">Tutorials</h2>
          <p className="dim">Choose a guide to see the complete instructions for recording a health measurement.</p>
        </div>
        <span className="tutorials-count">{TUTORIALS.length} guides</span>
      </header>

      <div className="tutorials-grid">
        {TUTORIALS.map((tutorial) => (
          <button
            type="button"
            className="panel tutorial-card"
            key={tutorial.id}
            onClick={() => setSelectedTutorial(tutorial.id)}
            aria-label={`Open ${tutorial.title} tutorial`}
          >
            <span className="tutorial-card-copy">
              <strong>{tutorial.title}</strong>
              <span className="dim">{tutorial.howTo.what}</span>
              <span className="tutorial-card-link">Open tutorial <span aria-hidden="true">→</span></span>
            </span>
          </button>
        ))}
      </div>

      {selectedTutorial && (
        <HowToModal id={selectedTutorial} onClose={() => setSelectedTutorial(null)} />
      )}
    </section>
  );
}
