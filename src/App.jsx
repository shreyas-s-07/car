import React from 'react';
import { projects } from './projects.js';
import CarViewer from './CarViewer.jsx';

function Header() {
  return <header className="site-header"><a className="brand" href="#home" aria-label="Alex Morgan home"><span className="brand-mark">A<span>.</span></span><span className="brand-caption">INDEPENDENT<br />DEVELOPER</span></a><nav aria-label="Main navigation"><a href="#work">Selected work <span>03</span></a><a href="#about">About</a><a className="nav-contact" href="#contact">Let’s talk <span>↗</span></a></nav></header>;
}

function Hero() {
  return <section className="hero" id="home"><div className="hero-grid" aria-hidden="true" />
    <div className="hero-copy"><div className="eyebrow"><span className="status-pulse" /> AVAILABLE FOR SELECT PROJECTS <span className="eyebrow-line" /></div><h1>Thoughtful<br /><em>by design.</em><br />Fast by nature.</h1><p className="hero-intro">I’m Alex — a developer building digital experiences with clarity, character, and a little bit of velocity.</p><a className="button button-light" href="#work">Explore my work <span>↓</span></a></div>
    <div className="scene-wrap" role="group" aria-label="Interactive McLaren Formula 1 car viewer"><div className="scene-topline"><span>FIG. 01 / FORMULA STUDY</span><span>DRAG TO EXPLORE <b>↗</b></span></div><div className="scene-vignette" /><CarViewer /><div className="model-caption"><span className="caption-index">01</span><span><strong>MCLAREN FORMULA 1</strong><small>INTERACTIVE 3D MODEL</small></span></div></div>
    <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><div className="scroll-line" /><span className="hero-location">PORTFOLIO / 2025—26</span></div><div className="hero-side-label" aria-hidden="true">DESIGN ENGINEERING — FRONTEND DEVELOPMENT</div>
  </section>;
}

function ProjectCard({ project }) {
  return <a className={`project-card ${project.tone}`} href="#contact"><div className="project-art"><span className="project-number">{project.number} / 03</span><span className="project-mark">{project.mark}</span><span className="project-art-label">CONCEPT / 20{project.number === '01' ? '25' : '24'}</span><span className="project-arrow">↗</span></div><div className="project-info"><div><span className="project-type">{project.type}</span><h3>{project.name}</h3></div><p>{project.description}</p><div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></a>;
}

function Work() {
  return <section className="work-section section-pad" id="work"><div className="section-heading"><div><span className="section-kicker">01 — SELECTED WORK</span><h2>Built with<br /><em>intent.</em></h2></div><p>These sample case studies show how your work can look here. Replace them with your own projects and links when you’re ready.</p></div><div className="projects-grid">{projects.map((project) => <ProjectCard project={project} key={project.number} />)}</div><div className="work-footnote"><span>MORE GOOD THINGS IN THE WORKSHOP</span><span>↓</span></div></section>;
}

function About() {
  const skills = ['React & TypeScript', 'Interaction design', 'Creative development', 'Design systems', 'Web performance', 'Accessible UI'];
  return <section className="about-section section-pad" id="about"><div className="about-stamp"><span>DRIVER<br />PROFILE</span><strong>AM</strong><span>EST. MMXX</span></div><div className="about-copy"><span className="section-kicker">02 — A LITTLE ABOUT ME</span><h2>Good work takes<br /><em>good thinking.</em></h2><p>I’m a developer who cares as much about how something feels as how it works. I bring design and engineering together to make the web more useful, more human, and more memorable.</p><p>My favorite projects have a clear purpose, a curious team, and enough room to push the details until they feel right.</p><a className="text-link" href="#contact">A bit more about me <span>↗</span></a></div><div className="skills-panel"><span className="section-kicker">IN THE TOOLBOX</span><div className="skills-list">{skills.map((skill, index) => <div key={skill}><span>0{index + 1}</span>{skill}<b>↗</b></div>)}</div></div></section>;
}

function Contact() {
  return <section className="contact-section section-pad" id="contact"><div className="contact-meta"><span className="section-kicker">03 — NEXT UP</span><span>OPEN TO THE RIGHT RACE</span></div><h2>Have a good<br />one in <em>mind?</em></h2><a className="contact-button" href="mailto:hello@alexmorgan.dev"><span>Tell me about it</span><b>↗</b></a><div className="contact-footer"><span>GOOD IDEAS DON’T WAIT ON THE GRID.</span><a href="mailto:hello@alexmorgan.dev">HELLO@ALEXMORGAN.DEV</a></div></section>;
}

export default function App() {
  return <><Header /><main><Hero /><Work /><About /><Contact /></main><footer className="site-footer"><a className="footer-logo" href="#home">A<span>.</span></a><span>DESIGNED & BUILT WITH CARE</span><span>© 2025–26 ALEX MORGAN</span><a href="#home">BACK TO TOP ↑</a></footer></>;
}
