'use client'

import { useEffect, useState } from 'react'
import TournamentHub from '@/components/TournamentHub'

function MojuMark() {
  return <div className="mark" aria-label="moju logo"><span className="mark-eye eye-one" /><span className="mark-eye eye-two" /><span className="mark-mouth" /></div>
}

const projects = [
  { num: '01', type: 'BRAND / STRATEGY', title: 'The Big Idea™', copy: 'A brand strategy so compelling, you’ll almost start it.', color: 'orange', sticker: 'ALMOST READY' },
  { num: '02', type: 'DIGITAL / MAYBE', title: 'Website (coming soon)', copy: 'A digital home for people who love a good loading screen.', color: 'blue', sticker: 'IN PROGRESS' },
  { num: '03', type: 'EXPERIMENT / DELIGHT', title: 'Project Side Quest', copy: 'We can’t tell you what it is yet. We’re still figuring that out.', color: 'pink', sticker: 'CLASSIFIED' },
]

const excuses = ['The idea is still marinating.', 'Our internized AI has unionized.', 'We are waiting for the vibes to align.', 'The deadline looked at us first.', 'It works perfectly in our imagination.', 'We put it in a very important folder.']
const quests = ['Rename a folder dramatically.', 'Drink water like it is a product launch.', 'Send someone a thumbs-up with conviction.', 'Open a tab and immediately forget why.', 'Compliment a suspiciously good font.', 'Take a strategic snack break.']
export default function Home() {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [excuse, setExcuse] = useState(excuses[0])
  const [quest, setQuest] = useState(quests[0])
  const [roast, setRoast] = useState('Choose a teammate. We have notes.')
  const [deliveryProgress, setDeliveryProgress] = useState(99)
  const [arcadeScore, setArcadeScore] = useState(0)
  const [guestName, setGuestName] = useState('')
  const [guestbook, setGuestbook] = useState('No messages yet. Be the first brave soul.')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText('hello@moju.cool') } catch { /* clipboard can be unavailable */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const roll = (items: string[], current: string, setter: (value: string) => void) => {
    const options = items.filter((item) => item !== current)
    setter(options[Math.floor(Math.random() * options.length)])
  }

  const roastTeam = (name: string) => {
    const roasts: Record<string, string> = {
      Aditya: 'Can fix a bug in 4 minutes, but needs 4 business days to name the button.',
      Sakshi: 'Has researched this roast and would like to cite 12 sources.',
      Vedika: 'Has already made a framework for deciding whether this roast is strategic.',
    }
    setRoast(roasts[name])
  }

  const submitGuestbook = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!guestName.trim()) return
    setGuestbook(`${guestName.trim()} says: Moju is suspiciously fun.`)
    setGuestName('')
  }

  return <>
    {isLoading && <div className="loader" role="status" aria-label="Loading Moju">
      <div className="loader-inner"><div className="loader-mark"><MojuMark /></div><p className="loader-title">moju<span className="dot">.</span></p><p className="loader-copy">preparing absolutely nothing<span className="loading-dots">...</span></p><div className="loader-bar"><span /></div><p className="loader-percent">99% committed · 0% delivered</p></div>
    </div>}
    <main>
    <nav className="nav shell">
      <a href="#top" className="wordmark"><MojuMark /><span>moju<span className="dot">.</span></span></a>
      <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
        <a href="/tournaments" onClick={() => setMenuOpen(false)}>all tournaments</a><a href="/sandbox" onClick={() => setMenuOpen(false)}>live sandbox</a><a href="#tournaments" onClick={() => setMenuOpen(false)}>meme wars</a><a href="#work" onClick={() => setMenuOpen(false)}>our work</a><a href="#about" onClick={() => setMenuOpen(false)}>about us</a><a href="#contact" onClick={() => setMenuOpen(false)}>say hi</a>
      </div>
      <button className="menu-btn" onClick={() => setMenuOpen(!isMenuOpen)} aria-label="Toggle menu">{isMenuOpen ? '×' : '☰'}</button>
    </nav>

    <section className="hero shell" id="top">
      <div className="hero-copy">
        <p className="eyebrow reveal">A tiny company with big <span className="wavy">feelings</span></p>
        <h1 className="reveal delay-one">Full<br /><em>commitment,</em><br /><span>with zero</span><br />delivery<span className="hero-dot">.</span></h1>
        <p className="hero-note reveal delay-two">We’re Moju. A three-person creative studio making things, breaking things, and occasionally finishing things.</p>
        <a className="pill-button reveal delay-three" href="#work">see what we don’t do <span>↘</span></a>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="scribble s-one">✳</div><div className="scribble s-two">✦</div>
        <div className="sun"><div className="sun-face"><i /><i /><b /></div></div>
        <div className="blob blob-yellow" /><div className="blob blob-purple" />
        <div className="floating-note note-top">currently<br /><strong>thinking</strong></div>
        <div className="floating-note note-bottom">100%<br /><strong>serious-ish</strong></div>
        <div className="arrow-line">↗</div>
      </div>
    </section>

    <div className="ticker"><div className="ticker-track"><span>NO RUSH</span><b>✳</b><span>GOOD VIBES ONLY</span><b>✳</b><span>NO RUSH</span><b>✳</b><span>GOOD VIBES ONLY</span><b>✳</b><span>NO RUSH</span><b>✳</b><span>GOOD VIBES ONLY</span><b>✳</b></div></div>

    <TournamentHub />

    <section className="work shell" id="work">
      <div className="section-heading"><p className="eyebrow">Selected non-achievements</p><h2>Stuff we <span>never ship</span><span className="hero-dot">!</span></h2><div className="tiny-arrow">↘</div></div>
      <div className="project-list">{projects.map((project) => <article className={`project-card ${project.color}`} key={project.num}><div className="project-top"><span>{project.num}</span><span>{project.type}</span></div><div><h3>{project.title}</h3><p>{project.copy}</p></div><span className="sticker">{project.sticker}</span><span className="card-arrow">↗</span></article>)}</div>
    </section>

    <section className="about shell" id="about">
      <div className="about-heading"><p className="eyebrow">Three brains. One shared calendar.</p><h2>Meet the<br /><em>almost</em> team<span className="hero-dot">.</span></h2><p className="team-intro">Aditya ships bugs with confidence, Sakshi researches problems nobody asked about, and Vedika turns every simple idea into a 47-slide strategy deck.</p></div>
      <div className="people">
        <article className="person aditya"><div className="avatar photo-avatar aditya-photo"><img src="/team/aditya.png" alt="Aditya outdoors in a red shirt" /></div><div className="person-info"><h3>Aditya</h3><p>Software Developer</p><span className="person-status">turns coffee into features</span></div></article>
        <article className="person sakshi"><div className="avatar photo-avatar"><img src="/team/sakshi.png" alt="Sakshi in a fluffy white hat" /></div><div className="person-info"><h3>Sakshi</h3><p>Research Analyst</p><span className="person-status">has sources for everything</span></div></article>
        <article className="person vedika"><div className="avatar photo-avatar vedika-photo"><img src="/team/vedika.png" alt="Vedika wearing a suit and glasses" /></div><div className="person-info"><h3>Vedika</h3><p>Deloitte Consultant</p><span className="person-status">makes decks look intentional</span></div></article>
      </div>
    </section>

    <section className="playground shell" id="playground">
      <div className="playground-heading"><p className="eyebrow">The Moju playground</p><h2>Things to do while<br /><em>we get ready.</em></h2><p>Warning: none of these activities will improve our delivery time.</p></div>
      <div className="activity-grid">
        <article className="activity-card excuse-card"><span className="activity-label">01 / EXCUSE GENERATOR</span><div className="activity-big">“{excuse}”</div><button className="mini-button" onClick={() => roll(excuses, excuse, setExcuse)}>another excuse ↻</button></article>
        <article className="activity-card roast-card"><span className="activity-label">04 / ROAST THE TEAM</span><div className="roast-message">{roast}</div><div className="roast-buttons">{['Aditya', 'Sakshi', 'Vedika'].map((name) => <button key={name} className="mini-button" onClick={() => roastTeam(name)}>{name}</button>)}</div></article>
        <article className="activity-card quest-card"><span className="activity-label">05 / SIDE QUEST</span><div className="activity-big">{quest}</div><button className="mini-button" onClick={() => roll(quests, quest, setQuest)}>new quest ↗</button></article>
        <article className="activity-card loading-card"><span className="activity-label">06 / FAKE LOADING</span><div className="fake-loader"><span /></div><p>loading something important...</p><div className="fake-loader-note">still loading since 2024</div></article>
        <article className="activity-card arcade-card"><span className="activity-label">08 / DEADLINE DODGER</span><p>Catch the deadline before it catches you.</p><button className="deadline" onClick={() => setArcadeScore((score) => score + 1)}>DEADLINE</button><div className="score">dodged: {arcadeScore}</div></article>
        <article className="activity-card guest-card"><span className="activity-label">09 / GUESTBOOK</span><p className="guest-message">{guestbook}</p><form onSubmit={submitGuestbook}><input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="your name" aria-label="Your name" /><button className="mini-button" type="submit">sign it</button></form></article>
        <article className="activity-card delivery-card"><span className="activity-label">10 / DELIVERY SIMULATOR</span><div className="delivery-percent">{deliveryProgress}%</div><p>{deliveryProgress === 99 ? 'Perfect. We are almost there.' : 'Oops. You made progress.'}</p><button className="mini-button" onClick={() => setDeliveryProgress((progress) => progress >= 99 ? 0 : Math.min(progress + 11, 99))}>push to production ↗</button></article>
      </div>
    </section>

    <section className="contact shell" id="contact"><div><p className="eyebrow">Have a non-urgent thing?</p><h2>Let’s make<br /><span>something weird.</span></h2></div><div className="contact-action"><p>No forms. No funnels.<br />Just a little hello.</p><button className="pill-button dark" onClick={copyEmail}>{copied ? 'email copied ✓' : 'hello@moju.cool ↗'}</button></div></section>

    <footer className="footer shell"><a href="#top" className="wordmark"><MojuMark /><span>moju<span className="dot">.</span></span></a><p>© 2021 Moju<br />Made with snacks in India</p><span className="footer-note">still loading...</span></footer>
    </main>
  </>
}
