import React, { Component, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL = `${import.meta.env.BASE_URL}f1-car-optimized.glb`;
const START = { x: 0, z: 10, heading: Math.PI / 2 };
const MONZA_START = { x: -20, z: 18, heading: Math.PI / 2 };
// A compact, hand-drawn circuit inspired by Monza's straights and chicanes.
const MONZA_POINTS = [[-30,18],[-20,18],[-8,18],[10,18],[25,18],[34,17],[40,12],[42,7],[39,2],[34,-1],[25,-4],[15,-8],[9,-11],[6,-10],[3,-13],[-4,-15],[-12,-17],[-18,-20],[-20,-24],[-24,-27],[-28,-27],[-31,-23],[-33,-18],[-35,-14],[-37,-10],[-40,-9],[-41,-5],[-40,1],[-39,7],[-38,12],[-35,16]];
const MONZA_CURVE = new THREE.CatmullRomCurve3(MONZA_POINTS.map(([x,z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
const MONZA_SAMPLES = MONZA_CURVE.getSpacedPoints(400);
const TRACK_WIDTH = 3.6;
const KEYS = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };

function onMonzaTrack(x, z) {
  let closest = Infinity;
  for (let i = 0; i < MONZA_SAMPLES.length - 1; i++) {
    const a = MONZA_SAMPLES[i], b = MONZA_SAMPLES[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z;
    const length = dx * dx + dz * dz;
    const t = length ? THREE.MathUtils.clamp(((x - a.x) * dx + (z - a.z) * dz) / length, 0, 1) : 0;
    const px = x - (a.x + t * dx), pz = z - (a.z + t * dz);
    closest = Math.min(closest, px * px + pz * pz);
  }
  return closest <= TRACK_WIDTH * TRACK_WIDTH;
}

function CircuitStrip({ from, to, height, color, alternating = false }) {
  const geometry = useMemo(() => {
    const positions = [], colors = [];
    const red = new THREE.Color('#c94a3f'), white = new THREE.Color('#ece8dd');
    const count = MONZA_SAMPLES.length - 1;
    const point = (index, distance) => {
      const i = index % count;
      const p = MONZA_SAMPLES[i], before = MONZA_SAMPLES[(i + count - 1) % count], after = MONZA_SAMPLES[(i + 1) % count];
      const tangent = new THREE.Vector2(after.x - before.x, after.z - before.z).normalize();
      return [p.x - tangent.y * distance, height, p.z + tangent.x * distance];
    };
    for (let i = 0; i < count; i++) {
      const aa = point(i, from), ab = point(i, to), ba = point(i + 1, from), bb = point(i + 1, to);
      for (const vertex of [aa, ba, ab, ab, ba, bb]) {
        positions.push(...vertex);
        if (alternating) { const c = Math.floor(i / 3) % 2 ? red : white; colors.push(c.r, c.g, c.b); }
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (alternating) result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    result.computeVertexNormals();
    return result;
  }, [from, to, height, alternating]);
  React.useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color={color} vertexColors={alternating} roughness={1} side={THREE.DoubleSide} /></mesh>;
}

function ContextMonitor({ onLost }) {
  const gl = useThree((state) => state.gl);
  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl, onLost]);
  return null;
}

function Oval({ outerX, outerZ, innerX, innerZ, color, height }) {
  const shape = useMemo(() => {
    const result = new THREE.Shape();
    result.absellipse(0, 0, outerX, outerZ, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, innerX, innerZ, 0, Math.PI * 2, true);
    result.holes.push(hole);
    return result;
  }, [outerX, outerZ, innerX, innerZ]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height, 0]}><shapeGeometry args={[shape, 128]} /><meshStandardMaterial color={color} roughness={1} side={THREE.DoubleSide} /></mesh>;
}

function Track({ track }) {
  return <>
    <color attach="background" args={['#a6b2a4']} />
    <fog attach="fog" args={['#a6b2a4', 80, 160]} />
    <hemisphereLight args={['#e7e9e2', '#64725f', 2]} />
    <directionalLight position={[15, 35, 12]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={25} shadow-camera-bottom={-25} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#778a70" roughness={1} /></mesh>
    {track === 'oval' ? <>
    <Oval outerX={22.5} outerZ={14.5} innerX={13.5} innerZ={5.5} color="#d8d4c7" height={.015} />
    <Oval outerX={22} outerZ={14} innerX={14} innerZ={6} color="#32383a" height={.025} />
    <Oval outerX={21.65} outerZ={13.65} innerX={21.53} innerZ={13.53} color="#ede7d8" height={.035} />
    <Oval outerX={14.47} outerZ={6.47} innerX={14.35} innerZ={6.35} color="#ede7d8" height={.035} />
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[(i % 2) * .42 - .21, .045, 8.5 + Math.floor(i / 2) * .42]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.42, .42]} /><meshBasicMaterial color={(i + Math.floor(i / 2)) % 2 ? '#e9e6db' : '#202427'} /></mesh>)}
    {Array.from({ length: 32 }, (_, i) => { const a = i / 32 * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 22.85, .15, Math.sin(a) * 14.85]}><boxGeometry args={[.35, .3, .35]} /><meshStandardMaterial color={i % 2 ? '#e7e3d9' : '#c4493b'} /></mesh>; })}
    <mesh position={[0, .08, 0]} receiveShadow><boxGeometry args={[8, .16, 2.5]} /><meshStandardMaterial color="#697b64" /></mesh>
    </> : <>
      <CircuitStrip from={-TRACK_WIDTH} to={TRACK_WIDTH} height={.025} color="#32383a" />
      <CircuitStrip from={-TRACK_WIDTH - .6} to={-TRACK_WIDTH} height={.03} color="#ffffff" alternating />
      <CircuitStrip from={TRACK_WIDTH} to={TRACK_WIDTH + .6} height={.03} color="#ffffff" alternating />
      <CircuitStrip from={-TRACK_WIDTH + .18} to={-TRACK_WIDTH + .26} height={.035} color="#eee9dc" />
      <CircuitStrip from={TRACK_WIDTH - .26} to={TRACK_WIDTH - .18} height={.035} color="#eee9dc" />
      {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-19 + (i % 2) * .4, .045, 15.6 + Math.floor(i / 2) * .8]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.4, .8]} /><meshBasicMaterial color={(i + Math.floor(i / 2)) % 2 ? '#eee9dd' : '#24292a'} /></mesh>)}
      {Array.from({ length: 28 }, (_, i) => { const angle = i * 2.399; const radius = 62 + (i % 3) * 6; return <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}><mesh position={[0, 1, 0]}><cylinderGeometry args={[.18, .25, 2, 6]} /><meshStandardMaterial color="#665c4d" /></mesh><mesh position={[0, 2.8, 0]}><coneGeometry args={[1.5, 3.4, 7]} /><meshStandardMaterial color={i % 2 ? '#506951' : '#5b7659'} /></mesh></group>; })}
    </>}
  </>;
}

function DrivingCar({ controls, resetKey, onReady, onSpeed, view, track }) {
  const { scene } = useGLTF(MODEL);
  const car = useRef();
  const state = useRef({ ...(track === 'oval' ? START : MONZA_START), speed: 0, rolling: 0, reset: resetKey, update: 0 });
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);
  const wheelTurn = useMemo(() => new THREE.Quaternion(), []);
  const axis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const model = useMemo(() => {
    const object = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    object.position.set(-center.x, -bounds.min.y, -center.z);
    const wheels = [];
    object.traverse((part) => {
      if (part.name.startsWith('wheel_')) wheels.push({ object: part, rotation: part.quaternion.clone() });
      if (part.isMesh) { part.castShadow = true; part.receiveShadow = true; }
    });
    return { object, wheels };
  }, [scene]);
  React.useEffect(() => { onReady(); }, [onReady]);
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, .05);
    const s = state.current;
    if (s.reset !== resetKey) Object.assign(s, track === 'oval' ? START : MONZA_START, { speed: 0, rolling: 0, reset: resetKey });
    const input = controls.current;
    const outer = (s.x / 22) ** 2 + (s.z / 14) ** 2;
    const inner = (s.x / 14) ** 2 + (s.z / 6) ** 2;
    const onTrack = track === 'oval' ? outer <= 1 && inner >= 1 : onMonzaTrack(s.x, s.z);
    const topSpeed = onTrack ? 15 : 5;
    if (input.up) s.speed += 6 * dt;
    if (input.down) s.speed -= (s.speed > 0 ? 11 : 5) * dt;
    if (!input.up && !input.down) s.speed = THREE.MathUtils.damp(s.speed, 0, onTrack ? .6 : 2, dt);
    s.speed = THREE.MathUtils.clamp(s.speed, -5, topSpeed);
    const steering = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    s.heading += steering * Math.min(Math.abs(s.speed) / 4, 1) * Math.sign(s.speed) * 1.3 * dt;
    const distance = s.speed * dt;
    const limitX = track === 'oval' ? 38 : 80;
    const limitZ = track === 'oval' ? 30 : 80;
    s.x = THREE.MathUtils.clamp(s.x + Math.sin(s.heading) * distance, -limitX, limitX);
    s.z = THREE.MathUtils.clamp(s.z + Math.cos(s.heading) * distance, -limitZ, limitZ);
    s.rolling += distance / (.08 * 2.2);
    car.current.position.set(s.x, .035, s.z);
    car.current.rotation.y = s.heading;
    wheelTurn.setFromAxisAngle(axis, s.rolling);
    model.wheels.forEach(({ object, rotation }) => object.quaternion.copy(rotation).multiply(wheelTurn));
    const forwardX = Math.sin(s.heading);
    const forwardZ = Math.cos(s.heading);
    const behind = view === 'cockpit' ? .35 : view === 'track' ? 12 : 5.8;
    const height = view === 'cockpit' ? .85 : view === 'track' ? 12 : 2.8;
    const lookAhead = view === 'cockpit' ? 12 : 5;
    const fov = view === 'cockpit' ? 65 : 55;
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    cameraPosition.set(s.x - forwardX * behind, height, s.z - forwardZ * behind);
    camera.position.copy(cameraPosition);
    cameraTarget.set(s.x + forwardX * lookAhead, view === 'cockpit' ? .2 : .4, s.z + forwardZ * lookAhead);
    camera.lookAt(cameraTarget);
    s.update += dt;
    if (s.update > .15) { onSpeed(Math.round(Math.abs(s.speed) * 12), onTrack); s.update = 0; }
  });
  return <group ref={car}><group scale={2.2}><primitive object={model.object} /></group></group>;
}

class PlaygroundError extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? <div className="playground-message" role="alert">The 3D track could not start. Exit and try again, or restart your browser if graphics remain blocked.</div> : this.props.children; }
}

export default function Playground({ onActiveChange }) {
  const [playing, setPlaying] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [onTrack, setOnTrack] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [view, setView] = useState('chase');
  const [track, setTrack] = useState('oval');
  const [stageVisible, setStageVisible] = useState(true);
  const controls = useRef({});
  const stage = useRef(null);
  const handleReady = useCallback(() => setReady(true), []);
  const handleSpeed = useCallback((value, track) => { setSpeed(value); setOnTrack(track); }, []);
  const handleContextLost = useCallback(() => { controls.current = {}; setFailed(true); setReady(false); }, []);
  React.useEffect(() => {
    const release = () => { controls.current = {}; };
    window.addEventListener('blur', release);
    return () => window.removeEventListener('blur', release);
  }, []);
  React.useEffect(() => {
    if (!playing) { setCanvasReady(false); return undefined; }
    // Let the hero's renderer release its GPU resources before creating another.
    const timer = window.setTimeout(() => setCanvasReady(true), 800);
    return () => window.clearTimeout(timer);
  }, [playing]);
  React.useEffect(() => {
    if (!playing || !stage.current || !('IntersectionObserver' in window)) { setStageVisible(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      setStageVisible(entry.isIntersecting);
      if (!entry.isIntersecting) controls.current = {};
    }, { threshold: 0 });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [playing]);
  const reset = () => { controls.current = {}; setResetKey((key) => key + 1); setSpeed(0); setOnTrack(true); };
  const chooseTrack = (next) => { if (next !== track) { setTrack(next); reset(); } };
  const onKey = (event, down) => {
    const key = KEYS[event.key];
    if (key) { event.preventDefault(); controls.current[key] = down; }
    if (down && (event.key === 'r' || event.key === 'R')) { event.preventDefault(); reset(); }
  };
  const start = () => { onActiveChange(true); setPlaying(true); setReady(false); setFailed(false); requestAnimationFrame(() => stage.current?.focus()); };
  const stop = () => { controls.current = {}; setPlaying(false); setReady(false); setSpeed(0); onActiveChange(false); };
  const controlButton = (name, label, symbol) => <button type="button" aria-label={label} onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); controls.current[name] = true; }} onPointerUp={() => { controls.current[name] = false; }} onPointerCancel={() => { controls.current[name] = false; }} onLostPointerCapture={() => { controls.current[name] = false; }}>{symbol}</button>;
  return <section className="playground-section" id="playground">
    <div className="playground-heading"><div><span className="section-kicker">THE PLAYGROUND / 01</span><h2>Take it for<br /><em>a spin.</em></h2></div><p>A little space to play. Get behind the wheel, find your line, and take a lap around the circuit.</p></div>
    <div className="circuit-picker" role="group" aria-label="Select a circuit">
      <span className="circuit-picker-label">SELECT A CIRCUIT</span>
      <button type="button" aria-pressed={track === 'oval'} onClick={() => chooseTrack('oval')}><span className="circuit-number">01</span><span><strong>THE OVAL</strong><small>THE ORIGINAL / EASY GOING</small></span><span className="circuit-selected">{track === 'oval' ? 'SELECTED' : 'SELECT ↗'}</span></button>
      <button type="button" aria-pressed={track === 'monza'} onClick={() => chooseTrack('monza')}><span className="circuit-number">02</span><span><strong>MONZA INSPIRED</strong><small>STRAIGHTS / CHICANES / ITALY</small></span><span className="circuit-selected">{track === 'monza' ? 'SELECTED' : 'SELECT ↗'}</span></button>
    </div>
    {!playing ? <div className="playground-invite"><span className="playground-invite-index">{track === 'oval' ? '01 / THE OVAL' : '02 / MONZA INSPIRED'}</span>{track === 'oval' ? <div className="track-diagram" aria-hidden="true"><div /><span /></div> : <svg className="circuit-preview" viewBox="-50 -35 100 65" aria-hidden="true"><path d="M -35 18 L 25 18 Q 42 18 42 7 Q 42 0 34 -1 L 9 -11 L 6 -10 L 3 -13 L -12 -17 Q -20 -20 -20 -24 Q -24 -31 -29 -25 L -35 -14 L -40 -9 Q -43 -5 -38 -2 Q -35 1 -35 8 Z" /><circle cx="-20" cy="18" r="1.2" /></svg>}<div className="playground-invite-copy"><span>YOUR CAR IS READY</span><h3>Ready when<br />you are.</h3><button type="button" onClick={start}>ENTER THE PLAYGROUND <b>↗</b></button></div><span className="playground-invite-foot">A SMALL DETOUR / BIG FUN</span></div> : <div className="playground-stage" ref={stage} tabIndex={0} onKeyDown={(e) => onKey(e, true)} onKeyUp={(e) => onKey(e, false)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) controls.current = {}; }} aria-label="Driving playground. Use arrow keys or W A S D to drive. Press R to reset.">
      {canvasReady && !failed && <PlaygroundError onError={() => setFailed(true)}><Canvas shadows frameloop={stageVisible ? 'always' : 'never'} dpr={[1, 1.5]} camera={{ position: [-5.8, 2.8, 10], fov: 55, near: .04, far: 200 }}><ContextMonitor onLost={handleContextLost} /><Track track={track} /><Suspense fallback={null}><DrivingCar controls={controls} resetKey={resetKey} onReady={handleReady} onSpeed={handleSpeed} view={view} track={track} /></Suspense></Canvas></PlaygroundError>}
      {!ready && !failed && <div className="playground-message" role="status">PREPARING YOUR CAR <span>···</span></div>}
      {failed && <div className="playground-message" role="alert">The 3D track could not start. Exit and try again, or restart your browser if graphics remain blocked.</div>}
      <div className="playground-hud"><div><small>{track === 'oval' ? 'THE OVAL / 01' : 'MONZA INSPIRED / 02'}</small><strong>{String(speed).padStart(3, '0')} <em>KM/H</em></strong><span>{onTrack ? 'ON TRACK' : 'OFF TRACK / SLOWING DOWN'}</span></div><div className="playground-actions"><button type="button" onClick={reset}>RESET <span>↻</span></button><button type="button" onClick={stop}>EXIT <span>×</span></button></div></div>
      <div className="playground-views" role="group" aria-label="Camera view"><span>VIEW</span>{[['chase', 'CHASE'], ['cockpit', 'DRIVER'], ['track', 'TRACK']].map(([value, label]) => <button type="button" key={value} aria-pressed={view === value} onClick={() => setView(value)}>{label}</button>)}</div>
      <div className="playground-instructions">CLICK THE TRACK, THEN USE <strong>ARROWS / WASD</strong> TO DRIVE <span>·</span> R TO RESET</div>
      <div className="drive-controls" aria-label="Touch driving controls"><div>{controlButton('left', 'Steer left', '←')}{controlButton('right', 'Steer right', '→')}</div><div>{controlButton('down', 'Brake or reverse', '↓')}{controlButton('up', 'Accelerate', '↑')}</div></div>
    </div>}
    <div className="playground-bottom"><span>DESIGNED FOR THE JOY OF THE DRIVE</span><span>NO LAP TIMES. JUST GOOD LINES.</span></div>
  </section>;
}
