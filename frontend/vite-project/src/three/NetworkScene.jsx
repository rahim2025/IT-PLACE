import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 46;
const RADIUS = 4.4;

function useNetworkGeometry() {
  return useMemo(() => {
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / NODE_COUNT);
      const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
      const r = RADIUS * (0.72 + Math.random() * 0.34);
      nodes.push(
        new THREE.Vector3(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi)
        )
      );
    }

    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      let closest = null;
      let closestDist = Infinity;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const d = nodes[i].distanceTo(nodes[j]);
        if (d < closestDist) {
          closestDist = d;
          closest = j;
        }
      }
      if (closest !== null && Math.random() > 0.35) {
        edges.push([nodes[i], nodes[closest]]);
      }
    }

    return { nodes, edges };
  }, []);
}

function NodePoints({ nodes }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      arr[i * 3] = n.x;
      arr[i * 3 + 1] = n.y;
      arr[i * 3 + 2] = n.z;
    });
    return arr;
  }, [nodes]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={nodes.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color="#7dd3fc"
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

function EdgeLines({ edges }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      arr[i * 6] = a.x;
      arr[i * 6 + 1] = a.y;
      arr[i * 6 + 2] = a.z;
      arr[i * 6 + 3] = b.x;
      arr[i * 6 + 4] = b.y;
      arr[i * 6 + 5] = b.z;
    });
    return arr;
  }, [edges]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={edges.length * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#38bdf8" transparent opacity={0.22} />
    </lineSegments>
  );
}

function RotatingGroup({ reducedMotion }) {
  const groupRef = useRef(null);
  const { nodes, edges } = useNetworkGeometry();
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const speed = reducedMotion ? 0.02 : 0.09;
    groupRef.current.rotation.y += delta * speed;
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    const targetX = reducedMotion ? 0 : pointer.current.y * 0.15;
    const targetZ = reducedMotion ? 0 : -pointer.current.x * 0.15;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <NodePoints nodes={nodes} />
      <EdgeLines edges={edges} />
      <mesh>
        <icosahedronGeometry args={[RADIUS * 0.62, 1]} />
        <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export default function NetworkScene({ className = "" }) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9.5], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <RotatingGroup reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
