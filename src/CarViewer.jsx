import React, { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_FILE = `${import.meta.env.BASE_URL}f1-car-wheels-v2.glb`;

function CarModel({ replayKey, reducedMotion, onReady }) {
  const { scene } = useGLTF(MODEL_FILE);
  const carRef = useRef(null);
  const previousReplay = useRef(replayKey);
  const startTime = useRef(null);
  const wheels = useRef([]);
  const wheelRotation = useRef(new THREE.Quaternion());
  const axle = useRef(new THREE.Vector3(1, 0, 0));

  useEffect(() => {
    wheels.current = [];
    scene.traverse((part) => {
      if (part.name.startsWith('wheel_')) wheels.current.push({ object: part, initial: part.quaternion.clone() });
      if (part.isMesh) {
        part.castShadow = true;
        part.receiveShadow = true;
        const materials = Array.isArray(part.material) ? part.material : [part.material];
        materials.filter(Boolean).forEach((material) => {
          material.roughness = .68;
          material.metalness = 0;
          material.envMapIntensity = .45;
          if (material.normalScale) material.normalScale.set(.65, .65);
          material.needsUpdate = true;
        });
      }
    });
    onReady();
  }, [scene, onReady]);

  useFrame(({ clock }) => {
    const car = carRef.current;
    if (!car) return;
    if (previousReplay.current !== replayKey) {
      previousReplay.current = replayKey;
      startTime.current = clock.elapsedTime;
    }
    if (startTime.current === null) startTime.current = clock.elapsedTime;
    const duration = reducedMotion ? 1.5 : 9;
    const distance = reducedMotion ? .3 : 5.5;
    const progress = THREE.MathUtils.clamp((clock.elapsedTime - startTime.current) / duration, 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    // Rolling angle follows distance travelled: tyre radius .08, scaled with the car.
    const rollingAngle = distance * eased / (.08 * 4.8);
    wheelRotation.current.setFromAxisAngle(axle.current, rollingAngle);
    wheels.current.forEach(({ object, initial }) => object.quaternion.copy(initial).multiply(wheelRotation.current));
    const remaining = distance * (1 - eased);
    car.position.set(-Math.sin(.12) * remaining, 0, -Math.cos(.12) * remaining);
    car.rotation.set(0, .12, 0);
    car.scale.setScalar(4.8);
  });

  return <Center><group ref={carRef} scale={4.8} rotation={[0, .12, 0]}><primitive object={scene} /></group></Center>;
}

class ModelErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function CarViewer() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [webgl, setWebgl] = useState(true);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener?.('change', update);
    return () => preference.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      setWebgl(Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))));
    } catch { setWebgl(false); }
  }, []);

  return <>
    {!ready && !failed && webgl && <div className="viewer-status" role="status"><span /> Loading the car model</div>}
    {(failed || !webgl) && <div className="viewer-status viewer-error" role="status"><span>{failed ? 'Could not load the local car model.' : '3D preview is unavailable on this device.'}</span></div>}
    {webgl && <Canvas className="car-canvas-wrap" shadows dpr={[1, 1.6]} camera={{ position: [4.4, 2.8, 6.5], fov: 30 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
      <ambientLight intensity={.85} />
      <spotLight position={[3, 7, 5]} intensity={28} angle={.65} penumbra={1} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -4]} intensity={1.7} color="#ffe7d2" />
      <pointLight position={[-4, 1.5, 1]} intensity={3} color="#d84438" />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 5, 1]} />
        <Lightformer intensity={1.3} position={[-5, 2, 1]} scale={[5, 4, 1]} color="#fff0df" />
        <Lightformer intensity={.8} position={[5, 3, -1]} scale={[5, 4, 1]} color="#d94a40" />
      </Environment>
      <Suspense fallback={null}>
        <ModelErrorBoundary onError={() => setFailed(true)}><CarModel replayKey={replayKey} reducedMotion={reducedMotion} onReady={handleReady} /></ModelErrorBoundary>
      </Suspense>
      <ContactShadows position={[0, -.55, 0]} opacity={.4} scale={9} blur={2.6} far={3.5} />
      <OrbitControls makeDefault enablePan={false} minDistance={4.5} maxDistance={11} minPolarAngle={Math.PI / 3.8} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>}
    {ready && <button className="replay-drive" type="button" onClick={() => setReplayKey((key) => key + 1)}>REPLAY ARRIVAL <span>↻</span></button>}
  </>;
}
