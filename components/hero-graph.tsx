"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Object3D,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import type { ThemeColors } from "@/hooks/use-theme-colors";

// A small 3D "map of a codebase" for the home page hero: a few big module nodes,
// smaller file nodes around each one, and thin lines joining them.
// It is decorative only. HeroGraphVisual loads it, pauses it and swaps in a still image.

// ---------- The graph's shape ----------

// How many file nodes sit around each module. 5 modules + 35 files = 40 nodes.
const FILES_PER_MODULE = [9, 7, 6, 7, 6];

type GraphNode = {
  position: Vector3;
  radius: number;
  isModule: boolean;
  // Each node pulses on its own rhythm, so they never glow all at once.
  pulsePhase: number;
  pulseSpeed: number;
};

type Graph = {
  nodes: GraphNode[];
  // Each edge is a pair of node indexes.
  edges: [number, number][];
};

// A tiny random number generator that gives the same numbers every time for the
// same seed. That keeps the graph identical on every visit, and identical to the still image.
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildGraph(): Graph {
  const random = seededRandom(7);
  const nodes: GraphNode[] = [];
  const edges: [number, number][] = [];
  // The node indexes of each module's files, used below to add a few cross links.
  const filesByModule: number[][] = [];
  const moduleIds: number[] = [];

  FILES_PER_MODULE.forEach((fileCount, moduleNumber) => {
    // Modules sit on a wide oval, with a little depth so the rotation looks 3D.
    const angle = (moduleNumber / FILES_PER_MODULE.length) * Math.PI * 2 + 0.5;
    const center = new Vector3(Math.cos(angle) * 2.1, Math.sin(angle) * 1.15, (random() - 0.5) * 1.6);
    const moduleId = nodes.length;
    moduleIds.push(moduleId);
    nodes.push({
      position: center,
      radius: 0.2 + random() * 0.07,
      isModule: true,
      pulsePhase: random() * Math.PI * 2,
      pulseSpeed: 0.35 + random() * 0.3,
    });

    // Files are scattered around their module, each joined to it by a line.
    const files: number[] = [];
    for (let i = 0; i < fileCount; i++) {
      const direction = new Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
      const distance = 0.55 + random() * 0.5;
      files.push(nodes.length);
      edges.push([moduleId, nodes.length]);
      nodes.push({
        position: center.clone().addScaledVector(direction, distance),
        radius: 0.055 + random() * 0.04,
        isModule: false,
        pulsePhase: random() * Math.PI * 2,
        pulseSpeed: 0.5 + random() * 0.6,
      });
    }
    filesByModule.push(files);
  });

  // Modules that depend on each other: a loop around the oval plus two shortcuts.
  const moduleLinks = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3]];
  for (const [a, b] of moduleLinks) edges.push([moduleIds[a], moduleIds[b]]);

  // A file in one module that imports a file in the next module:
  // join the closest pair of files between neighbouring modules.
  for (let m = 0; m < FILES_PER_MODULE.length; m++) {
    const next = (m + 1) % FILES_PER_MODULE.length;
    let best: [number, number] = [filesByModule[m][0], filesByModule[next][0]];
    let bestDistance = Infinity;
    for (const a of filesByModule[m]) {
      for (const b of filesByModule[next]) {
        const distance = nodes[a].position.distanceTo(nodes[b].position);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = [a, b];
        }
      }
    }
    edges.push(best);
  }

  return { nodes, edges };
}

// ---------- Motion settings ----------

const SPIN_SPEED = 0.06; // radians per second around the vertical axis
const MAX_TILT = 0.2; // how far (in radians) the graph leans toward the mouse
const TRAVEL_SECONDS = 1.4; // how long a light pulse takes to cross one line
const TRAVELLER_COUNT = 3; // at most this many light pulses at once

type Traveller = { edge: number; progress: number; reverse: boolean };

// ---------- Colours ----------

function makePalette(colors: ThemeColors) {
  const accent = new Color(colors.accent);
  const soft = new Color(colors.accentSoft);
  return {
    module: accent.clone(),
    // Files are a quieter version of the accent.
    file: accent.clone().lerp(soft, colors.isDark ? 0.25 : 0.2),
    // In light mode the lines stay the plain accent; blending toward the pale soft colour washes them out.
    line: colors.isDark ? accent.clone().lerp(soft, 0.45) : accent.clone(),
    // Values above 1 are brighter than the screen can show, which is what the bloom picks up.
    glow: accent.clone().multiplyScalar(colors.isDark ? 2.6 : 1.6),
  };
}

// ---------- The scene ----------

type SceneProps = { colors: ThemeColors; onReadyChange: (ready: boolean) => void };

function GraphScene({ colors, onReadyChange }: SceneProps) {
  const graph = useMemo(() => buildGraph(), []);
  const palette = useMemo(() => makePalette(colors), [colors]);

  // One geometry holding every line, so all lines are drawn in a single call.
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    for (const [a, b] of graph.edges) {
      positions.push(...graph.nodes[a].position.toArray(), ...graph.nodes[b].position.toArray());
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, [graph]);
  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);

  const nodesRef = useRef<InstancedMesh>(null);
  const spinRef = useRef<Group>(null);
  const tiltRef = useRef<Group>(null);
  const travellerRefs = useRef<(Mesh | null)[]>([]);
  const travellers = useRef<Traveller[]>(
    Array.from({ length: TRAVELLER_COUNT }, () => ({ edge: 0, progress: 1, reverse: false })),
  );
  const nextTravellerAt = useRef(1);
  const framesDrawn = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  // Reused every frame instead of creating new objects (which would make garbage).
  const scratch = useMemo(() => ({ object: new Object3D(), color: new Color() }), []);

  // Place every node and give it its colour, the "resting" state of the graph.
  // The frame loop below then adds the pulses on top.
  function updateNodes(time: number) {
    const mesh = nodesRef.current;
    if (!mesh) return;
    graph.nodes.forEach((node, i) => {
      // A sine wave raised to a high power stays near 0 most of the time
      // and rises to 1 briefly, which gives a soft, occasional pulse.
      const wave = Math.sin(time * node.pulseSpeed + node.pulsePhase) * 0.5 + 0.5;
      const pulse = Math.pow(wave, 8);
      scratch.object.position.copy(node.position);
      scratch.object.scale.setScalar(node.radius * (1 + pulse * 0.3));
      scratch.object.updateMatrix();
      mesh.setMatrixAt(i, scratch.object.matrix);
      scratch.color.copy(node.isModule ? palette.module : palette.file).lerp(palette.glow, pulse * 0.85);
      mesh.setColorAt(i, scratch.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  // Set the colours before the first frame, so the material is built with per-node colours.
  useLayoutEffect(() => updateNodes(0));

  // Tell the wrapper when the 3D has gone away, so it shows the still image again.
  useEffect(() => () => onReadyChange(false), [onReadyChange]);

  // On desktop, the graph leans gently toward the mouse. The canvas ignores the mouse
  // (so it never blocks clicks), so we listen on the window instead.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    function onMove(event: PointerEvent) {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, rawDelta) => {
    // After a pause the gap since the last frame can be long, so cap it to avoid a jump.
    const delta = Math.min(rawDelta, 0.1);
    const time = state.clock.elapsedTime;

    if (spinRef.current) spinRef.current.rotation.y += delta * SPIN_SPEED;
    if (tiltRef.current) {
      // damp() eases toward the target a little each frame, so the tilt glides.
      tiltRef.current.rotation.x = MathUtils.damp(tiltRef.current.rotation.x, pointer.current.y * MAX_TILT, 2.5, delta);
      tiltRef.current.rotation.y = MathUtils.damp(tiltRef.current.rotation.y, pointer.current.x * MAX_TILT, 2.5, delta);
    }

    updateNodes(time);

    // Now and then, send a small light along a random line.
    if (time > nextTravellerAt.current) {
      const free = travellers.current.find((traveller) => traveller.progress >= 1);
      if (free) {
        free.edge = Math.floor(Math.random() * graph.edges.length);
        free.progress = 0;
        free.reverse = Math.random() < 0.5;
      }
      nextTravellerAt.current = time + 1.2 + Math.random() * 1.8;
    }
    travellers.current.forEach((traveller, i) => {
      const mesh = travellerRefs.current[i];
      if (!mesh) return;
      if (traveller.progress >= 1) {
        mesh.visible = false;
        return;
      }
      traveller.progress = Math.min(1, traveller.progress + delta / TRAVEL_SECONDS);
      const [from, to] = graph.edges[traveller.edge];
      const t = traveller.reverse ? 1 - traveller.progress : traveller.progress;
      mesh.position.lerpVectors(graph.nodes[from].position, graph.nodes[to].position, t);
      // Fades in at the start of the line and out at the end.
      const fade = Math.sin(traveller.progress * Math.PI);
      mesh.scale.setScalar(0.035 + fade * 0.025);
      (mesh.material as MeshBasicMaterial).opacity = fade;
      mesh.visible = true;
    });

    // Two frames in, the canvas has really drawn something, so the wrapper can fade it in.
    framesDrawn.current += 1;
    if (framesDrawn.current === 2) onReadyChange(true);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5} floatingRange={[-0.12, 0.12]}>
      <group ref={tiltRef}>
        <group ref={spinRef} rotation={[0.25, 0, 0]}>
          <lineSegments geometry={lineGeometry}>
            <lineBasicMaterial color={palette.line} transparent opacity={colors.isDark ? 0.4 : 0.3} toneMapped={false} />
          </lineSegments>

          {/* All 40 nodes in one instanced mesh: one draw call, simple low-poly spheres. */}
          <instancedMesh ref={nodesRef} args={[undefined, undefined, graph.nodes.length]} frustumCulled={false}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshBasicMaterial toneMapped={false} />
          </instancedMesh>

          {Array.from({ length: TRAVELLER_COUNT }, (_, i) => (
            <mesh
              key={i}
              ref={(mesh) => {
                travellerRefs.current[i] = mesh;
              }}
              visible={false}
            >
              <sphereGeometry args={[1, 12, 8]} />
              <meshBasicMaterial color={palette.glow} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
    </Float>
  );
}

type HeroGraphProps = {
  colors: ThemeColors;
  // False stops the frame loop entirely (off-screen or hidden tab).
  running: boolean;
  onReadyChange: (ready: boolean) => void;
};

export default function HeroGraph({ colors, running, onReadyChange }: HeroGraphProps) {
  return (
    <Canvas
      // Never render at more than 1.5x the screen's pixels: sharp enough, and much cheaper on retina screens.
      dpr={[1, 1.5]}
      frameloop={running ? "always" : "never"}
      camera={{ position: [0, 0, 9], fov: 40 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <GraphScene colors={colors} onReadyChange={onReadyChange} />
      <EffectComposer multisampling={4}>
        <Bloom
          mipmapBlur
          // Bloom adds light, which reads as a pale halo on the cream light-mode page, so it's gentler there.
          intensity={colors.isDark ? 1.1 : 0.35}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.3}
          radius={0.7}
        />
      </EffectComposer>
    </Canvas>
  );
}
