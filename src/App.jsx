import React, { useEffect, useRef, useState } from 'react';
import { projects } from './projects.js';
import CarViewer from './CarViewer.jsx';
import Playground from './Playground.jsx';

const EMAIL = 'shreyas07604@gmail.com';
const GITHUB = 'https://github.com/S-Shreyas07';
const LINKEDIN = 'https://www.linkedin.com/in/shreyas-s-3104b631a';

function Header() {
  return <header className="site-header"><a className="brand" href="#home" aria-label="Shreyas S home"><span className="brand-mark">S<span>.</span></span><span className="brand-caption">SOFTWARE<br />DEVELOPER</span></a><nav aria-label="Main navigation"><a href="#work">Selected work <span>01</span></a><a href="#playground">Playground</a><a href="#about">About</a><a className="nav-contact" href="#contact">Let’s talk <span>↗</span></a></nav><details className="mobile-menu"><summary aria-label="Open navigation">Menu <span>☰</span></summary><div className="mobile-menu-links">{[['#work','Selected work'],['#playground','Playground'],['#about','About'],['#experience','Experience'],['#contact','Let’s talk']].map(([href,label]) => <a key={href} href={href} onClick={(event) => event.currentTarget.closest('details').removeAttribute('open')}>{label}<span>↗</span></a>)}</div></details></header>;
}

function Hero({ playgroundActive }) {
  const [sceneReady, setSceneReady] = useState(true);
  const [visible, setVisible] = useState(true);
  const heroRef = useRef(null);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (playgroundActive) { setSceneReady(false); return undefined; }
    const timer = window.setTimeout(() => setSceneReady(true), 800);
    return () => window.clearTimeout(timer);
  }, [playgroundActive]);
  return <section className="hero" id="home" ref={heroRef}><div className="hero-grid" aria-hidden="true" />
    <div className="hero-copy"><div className="eyebrow"><span className="status-pulse" /> SOFTWARE DEVELOPMENT ENGINEER <span className="eyebrow-line" /></div><h1>Thoughtful<br /><em>by design.</em><br />Fast by nature.</h1><p className="hero-intro">I’m Shreyas — a software engineer building backend systems and full-stack applications, from idea to cloud deployment.</p><a className="button button-light" href="#work">Explore my work <span>↓</span></a></div>
    <div className="scene-wrap" role="group" aria-label="Interactive McLaren Formula 1 car viewer"><div className="scene-topline"><span>FIG. 01 / FORMULA STUDY</span><span>DRAG TO EXPLORE <b>↗</b></span></div><div className="scene-vignette" />{!playgroundActive && sceneReady && <CarViewer visible={visible} />}<div className="model-caption"><span className="caption-index">01</span><span><strong>MCLAREN FORMULA 1</strong><small>INTERACTIVE 3D MODEL</small></span></div></div>
    <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><div className="scroll-line" /><span className="hero-location">BENGALURU, INDIA</span></div><div className="hero-side-label" aria-hidden="true">BACKEND SYSTEMS — FULL-STACK DEVELOPMENT</div>
  </section>;
}

function ProjectCard({ project }) {
  return <article className={`project-card featured-project ${project.tone}`}><div className="project-art"><span className="project-number">{project.number} / 01</span><span className="project-mark">{project.mark}</span><span className="project-art-label">INVOICE AUTOMATION</span></div><div className="project-info"><div><span className="project-type">{project.type}</span><h3>{project.name}</h3><span className="project-subtitle">{project.subtitle}</span></div><p>{project.description}</p><p>{project.details}</p><div className="project-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></article>;
}

function Work() {
  return <section className="work-section section-pad" id="work"><div className="section-heading"><div><span className="section-kicker">01 — SELECTED WORK</span><h2>Built with<br /><em>intent.</em></h2></div><p>A closer look at a platform built to make a complex business process easier to manage.</p></div><div className="projects-grid single-project">{projects.map((project) => <ProjectCard project={project} key={project.number} />)}</div><div className="work-footnote"><span>FROM BACKEND SYSTEMS TO CLOUD DELIVERY</span><span>↓</span></div></section>;
}

function About() {
  const skills = ['Python & JavaScript', 'Django & FastAPI', 'React & TypeScript', 'PostgreSQL & MySQL', 'AWS & Google Cloud', 'Docker & Jenkins'];
  return <section className="about-section section-pad" id="about"><figure className="about-portrait"><div className="about-portrait-frame"><img src={`${import.meta.env.BASE_URL}Passport%20Size%20Photo.jpg`} alt="Portrait of Shreyas S" width="1168" height="1600" loading="lazy" decoding="async" /></div><figcaption><span>SHREYAS S</span><span>BENGALURU, INDIA</span></figcaption></figure><div className="about-copy"><span className="section-kicker">02 — A LITTLE ABOUT ME</span><h2>From idea to<br /><em>production.</em></h2><p>I’m a software development engineer based in Bengaluru. I build and maintain applications with Python, Django, FastAPI, and React, and work across APIs, integrations, and cloud deployments.</p><p>I collaborate directly with clients to understand their requirements and turn business needs into working software.</p><a className="text-link" href={LINKEDIN} target="_blank" rel="noreferrer">Connect on LinkedIn <span>↗</span></a></div><div className="skills-panel"><span className="section-kicker">IN THE TOOLBOX</span><div className="skills-list">{skills.map((skill, index) => <div key={skill}><span>0{index + 1}</span>{skill}<b>↗</b></div>)}</div></div></section>;
}

function Experience() {
  return <section className="experience-section section-pad" id="experience"><div className="experience-intro"><span className="section-kicker">03 — EXPERIENCE & EDUCATION</span><h2>The work<br /><em>behind the work.</em></h2></div><div className="experience-list"><article><div className="experience-meta"><span>JUL 2026 — PRESENT</span><span>BENGALURU</span></div><h3>Software Development Engineer</h3><h4>StackPro Technologies Private Limited</h4><p>Build and maintain applications, develop backend APIs and integrations, deploy to AWS and Google Cloud, and work with clients on requirements and delivery.</p></article><article><div className="experience-meta"><span>JAN 2026 — JUN 2026</span><span>BENGALURU</span></div><h3>Software Development Engineer Intern</h3><h4>StackPro Technologies Private Limited</h4><p>Contributed to web applications through backend development, API integrations, debugging, and feature improvements.</p></article><article><div className="experience-meta"><span>EDUCATION</span><span>CGPA 9.3 / 10</span></div><h3>B.E. in Information Science and Engineering</h3><h4>Sai Vidya Institute of Technology · Visvesvaraya Technological University</h4></article></div></section>;
}

function Contact() {
  return <section className="contact-section section-pad" id="contact"><div className="contact-meta"><span className="section-kicker">04 — GET IN TOUCH</span><span>BENGALURU, INDIA</span></div><h2>Let’s build<br /><em>something.</em></h2><a className="contact-button" href={`mailto:${EMAIL}`}><span>{EMAIL}</span><b>↗</b></a><div className="contact-footer"><span>SHREYAS S / SOFTWARE DEVELOPMENT ENGINEER</span><div className="social-links"><a href={GITHUB} target="_blank" rel="noreferrer">GITHUB ↗</a><a href={LINKEDIN} target="_blank" rel="noreferrer">LINKEDIN ↗</a></div></div></section>;
}

export default function App() {
  const [playgroundActive, setPlaygroundActive] = useState(false);
  return <><Header /><main><Hero playgroundActive={playgroundActive} /><Playground onActiveChange={setPlaygroundActive} /><Work /><About /><Experience /><Contact /></main><footer className="site-footer"><a className="footer-logo" href="#home">S<span>.</span></a><span>SHREYAS S / BENGALURU</span><span>© {new Date().getFullYear()} SHREYAS S</span><a href="#home">BACK TO TOP ↑</a></footer></>;
}
