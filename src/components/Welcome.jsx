export default function Welcome({ onNewFile }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <span className="welcome-icon" aria-hidden="true">▤</span>
        <p className="eyebrow">आलेखन सहायक / Aalekhan Sahayak</p>
        <h2>शासकीय पत्र-लेखन, अब और सहज</h2>
        <p className="welcome-copy">
          आवक पत्र के आधार पर औपचारिक मसौदा तैयार करें। अपने मामलों को पत्रावली के रूप में व्यवस्थित रखें।
        </p>
        <div className="welcome-steps">
          <span><b>1</b> पत्र संलग्न करें</span>
          <span aria-hidden="true">→</span>
          <span><b>2</b> निर्देश लिखें</span>
          <span aria-hidden="true">→</span>
          <span><b>3</b> मसौदा पाएं</span>
        </div>
        <button className="button button-primary welcome-new-button" onClick={onNewFile}>
          ＋ नई पत्रावली बनाएं
        </button>
      </div>
    </div>
  )
}
