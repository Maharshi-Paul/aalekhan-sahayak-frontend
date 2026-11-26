import { problemStatement, stats, valuePoints } from '../config/impact.js'

export default function Welcome({ onNewFile, onTrySample, onOpenFiles }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <span className="welcome-icon" aria-hidden="true">▤</span>
        <p className="eyebrow">आलेखन सहायक / Aalekhan Sahayak</p>
        <h2>शासकीय पत्र-लेखन, अब और सहज</h2>
        <p className="welcome-copy">{problemStatement}</p>
        <div className="welcome-steps">
          <span><b>1</b> पत्र संलग्न करें</span>
          <span aria-hidden="true">→</span>
          <span><b>2</b> निर्देश लिखें</span>
          <span aria-hidden="true">→</span>
          <span><b>3</b> मसौदा पाएं</span>
        </div>
        <div className="welcome-actions">
          <button className="button button-primary welcome-new-button" onClick={onTrySample}>
            नमूना पत्र से आज़माएँ / Try with a sample letter
          </button>
          <button className="button button-outline" onClick={onNewFile}>＋ नई पत्रावली बनाएं</button>
          <button className="button button-outline mobile-open-files" onClick={onOpenFiles}>मौजूदा पत्रावलियाँ देखें</button>
        </div>
        <ul className="welcome-values">
          {valuePoints.map((point) => <li key={point}>{point}</li>)}
        </ul>
        {stats.length > 0 && (
          <div className="welcome-stats">
            {stats.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
          </div>
        )}
      </div>
    </div>
  )
}
