import { useMemo, useState } from 'react';
import { EXPLANATIONS } from '../../data/explanations';
import { MASCOT_IMAGES } from '../../data/mascot';
import HowToModal from '../checkin/HowToModal';

// Keep the tutorial library in sync with the guides used by the check-in and measurement charts.
const TUTORIALS = Object.values(EXPLANATIONS);

export default function TutorialsTab() {
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const filteredTutorials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return TUTORIALS;
    return TUTORIALS.filter((tutorial) =>
      [tutorial.title, tutorial.meaning, tutorial.howTo.what, tutorial.howTo.equipment]
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query]);

  return (
    <section className="tutorials-page" aria-labelledby="tutorials-title">
      <header className="tutorials-heading panel">
        <div className="tutorials-heading-copy">
          <span className="section-title">CREW HEALTH · MEASUREMENT GUIDES</span>
          <h2 id="tutorials-title">Tutorials</h2>
          <p className="dim">Practical, step-by-step guides for recording and understanding each check-in measurement.</p>
        </div>
        <div className="tutorials-heading-meta">
          <span className="tutorials-count">{TUTORIALS.length} guides</span>
          <label className="tutorials-search-wrap">
            <span className="tutorials-search-icon" aria-hidden="true">⌕</span>
            <input
              className="input tutorials-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a measurement…"
              aria-label="Search tutorials"
            />
          </label>
        </div>
      </header>

      {filteredTutorials.length === 0 ? (
        <div className="panel tutorials-empty">
          <span aria-hidden="true">⌕</span>
          <p>No tutorials match “{query}”. Try another measurement or equipment name.</p>
        </div>
      ) : (
        <div className="tutorials-grid">
          {filteredTutorials.map((tutorial, index) => (
            <article className="panel tutorial-card" key={tutorial.id}>
              <div className="tutorial-card-topline">
                <span className="tutorial-number">{String(index + 1).padStart(2, '0')}</span>
                <img className="tutorial-mascot" src={MASCOT_IMAGES[tutorial.mascot]} alt="" />
              </div>
              <div className="tutorial-card-content">
                <h3>{tutorial.title}</h3>
                <p className="tutorial-summary">{tutorial.howTo.what}</p>
                <div className="tutorial-equipment">
                  <span className="tutorial-equipment-icon" aria-hidden="true">✦</span>
                  <span>{tutorial.howTo.equipment}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost tutorial-open"
                onClick={() => setSelectedTutorial(tutorial.id)}
                aria-label={`Open ${tutorial.title} tutorial`}
              >
                View tutorial <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      )}

      <p className="tutorials-note"><span aria-hidden="true">ⓘ</span> These prototype guides should be checked against the mission’s approved medical procedures.</p>
      {selectedTutorial && <HowToModal id={selectedTutorial} onClose={() => setSelectedTutorial(null)} />}
    </section>
  );
}
