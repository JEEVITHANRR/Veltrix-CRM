// apps/web/src/components/3d/HeroScene.tsx
'use client'

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Box, Torus, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ─── Floating geometric objects ───────────────────────────
function FloatingOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.2
    meshRef.current.rotation.y += 0.005
  })

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  )
}

function WireframeTorus({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.15
    ref.current.rotation.y = clock.elapsedTime * 0.25
  })

  return (
    <Float speed={1.5} floatIntensity={0.6}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[1.2, 0.15, 16, 100]} />
        <meshStandardMaterial
          color="#800020"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
    </Float>
  )
}

function GlassBox({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.2
    ref.current.rotation.z = clock.elapsedTime * 0.1
  })

  return (
    <Float speed={1.8} floatIntensity={1}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
          roughness={0}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>
    </Float>
  )
}

function Particles({ count = 120 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 16
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (!points.current) return
    points.current.rotation.y = clock.elapsedTime * 0.02
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#800020" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function CameraRig() {
  const { camera, mouse } = useThree()

  useFrame(() => {
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.05
    camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Scene() {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} color="#800020" distance={8} />
      <pointLight position={[3, -2, -2]} intensity={0.8} color="#cc0033" distance={6} />

      <Environment preset="city" />

      <Particles count={100} />

      <FloatingOrb position={[-3.5, 1, -1]} color="#800020" scale={0.8} />
      <FloatingOrb position={[3.5, -0.5, -2]} color="#cc0033" scale={0.55} />
      <FloatingOrb position={[0.5, 2.5, -3]} color="#a00028" scale={0.4} />

      <WireframeTorus position={[2.5, 1.5, -1.5]} />
      <WireframeTorus position={[-2, -1.5, -2]} />

      <GlassBox position={[0, -2, -1]} />
      <GlassBox position={[-4, 0, -3]} />
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
