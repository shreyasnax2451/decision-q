'use client';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Subtle grid background */}
      <div className={styles.gridBg} />

      {/* Floating orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>Q</span>
          <span className={styles.logoText}>Decision</span>
        </div>
      </nav>

      <div className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Structured thinking, simplified
        </div>

        <h1 className={styles.headline}>
          Make better decisions.<br />
          <span className={styles.headlineAccent}>In under 5 minutes.</span>
        </h1>

        <p className={styles.sub}>
          Stop overthinking. Add your options, define what matters,<br />
          and get a clear, weighted answer — instantly.
        </p>

        <div className={styles.ctaRow}>
          <Link href="/decide" className={styles.ctaPrimary}>
            Start Deciding
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className={styles.ctaSub}>Free for 5 decisions · Signup required</span>
        </div>
      </div>

      {/* Preview cards floating below hero */}
      <div className={styles.previewRow}>
        <div className={`${styles.previewCard} ${styles.previewCard1}`}>
          <div className={styles.previewLabel}>01 · The Hook</div>
          <div className={styles.previewContent}>Should I take the fintech offer?</div>
        </div>
        <div className={`${styles.previewCard} ${styles.previewCard2}`}>
          <div className={styles.previewLabel}>03 · The Values</div>
          <div className={styles.previewSliderMock}>
            <div className={styles.mockSliderRow}><span>Salary</span><div className={styles.mockBar}><div className={styles.mockFill} style={{ width: '80%' }} /></div><span>4</span></div>
            <div className={styles.mockSliderRow}><span>Growth</span><div className={styles.mockBar}><div className={styles.mockFill} style={{ width: '100%' }} /></div><span>5</span></div>
            <div className={styles.mockSliderRow}><span>Balance</span><div className={styles.mockBar}><div className={styles.mockFill} style={{ width: '60%' }} /></div><span>3</span></div>
          </div>
        </div>
        <div className={`${styles.previewCard} ${styles.previewCard3}`}>
          <div className={styles.previewLabel}>The Reveal</div>
          <div className={styles.winnerPreview}>
            <div className={styles.winnerIcon}>✦</div>
            <div className={styles.winnerText}>Fintech Offer</div>
            <div className={styles.winnerScore}>Score 4.2 / 5</div>
          </div>
        </div>
      </div>

      {/* Why Decision Q Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>The Problem</span>
          <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            Why
            <span className={styles.logo} style={{ display: 'inline-flex', gap: '12px' }}>
              <span className={styles.logoMark} style={{ width: '64px', height: '64px', borderRadius: '14px', fontSize: '1.8rem' }}>Q</span>
              <span className={styles.logoText} style={{ fontSize: '2.5rem' }}>Decision</span>
            </span>
          </h2>
        </div>

        <div className={styles.whyGrid}>
          <div className={styles.whyCard}>
            <div className={styles.whyIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <h3>Eliminate Bias</h3>
            <p>Our brains are wired for shortcuts. Decision Q forces you to quantify your values, stripping away emotional impulsive choices.</p>
          </div>

          <div className={styles.whyCard}>
            <div className={styles.whyIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <h3>Stop the Loop</h3>
            <p>Analysis paralysis is real. By using a structured weighting system, you arrive at a definitive answer in minutes, not days.</p>
          </div>

          <div className={styles.whyCard}>
            <div className={styles.whyIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <h3>Total Clarity</h3>
            <p>See exactly why one option won. The weighted score gives you the confidence to commit to your path without regret.</p>
          </div>
        </div>
      </section>

      {/* Learn the Science Section */}
      <section className={styles.section} style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Deep Dive</span>
          <h2 className={styles.sectionTitle}>Learn the Science</h2>
        </div>

        <div className={styles.scienceGrid}>
          <Link href="https://www.youtube.com/watch?v=VO6XEQIsCoM" target="_blank" className={styles.scienceCard}>
            <div className={styles.scienceThumb} style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1000&auto=format&fit=crop)' }}>
              <div className={styles.playOverlay}>
                <div className={styles.playBtn}>▶</div>
              </div>
            </div>
            <div className={styles.scienceContent}>
              <h4>The Paradox of Choice</h4>
              <p>Psychologist Barry Schwartz explains why having more options can actually make us less happy and more stressed.</p>
              <div className={styles.scienceMeta}>TED TALK · 20 min</div>
            </div>
          </Link>

          <Link href="https://www.ted.com/talks/ruth_chang_how_to_make_hard_choices" target="_blank" className={styles.scienceCard}>
            <div className={styles.scienceThumb} style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=1000&auto=format&fit=crop)' }}>
              <div className={styles.playOverlay}>
                <div className={styles.playBtn}>▶</div>
              </div>
            </div>
            <div className={styles.scienceContent}>
              <h4>How to Make Hard Choices</h4>
              <p>Philosopher Ruth Chang offers a powerful new framework for decisions that define who we are.</p>
              <div className={styles.scienceMeta}>TED Talk · 14 mins</div>
            </div>
          </Link>

          <Link href="https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow" target="_blank" className={styles.scienceCard}>
            <div className={styles.scienceThumb} style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1000&auto=format&fit=crop)' }}>
            </div>
            <div className={styles.scienceContent}>
              <h4>System 1 vs. System 2</h4>
              <p>Understanding Daniel Kahneman's foundational work on the two systems that drive our decision-making.</p>
              <div className={styles.scienceMeta}>Deep Dive · 8 min read</div>
            </div>
          </Link>

          <Link href="https://fs.blog/decision-matrix/" target="_blank" className={styles.scienceCard}>
            <div className={styles.scienceThumb} style={{ backgroundImage: 'url(https://fs.blog/wp-content/uploads/2018/09/Decision-Matrix.png)', backgroundColor: '#fff', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}>
              <div className={styles.playOverlay}>
                <div className={styles.playBtn}>▶</div>
              </div>
            </div>
            <div className={styles.scienceContent}>
              <h4>The Decision Matrix</h4>
              <p>The Decision Matrix is a tool that breaks down complex choices by scoring multiple options against a set of prioritized, weighted criteria. </p>
              <div className={styles.scienceMeta}>Article · 8 min read</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.logo} style={{ marginBottom: '12px' }}>
          <span className={styles.logoMark}>Q</span>
          <span className={styles.logoText}>Decision</span>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/decide">New Decision</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/invite">Invite Friends</Link>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} Decision-Q. The smarter way to choose.
        </div>
      </footer>
    </main>
  );
}
