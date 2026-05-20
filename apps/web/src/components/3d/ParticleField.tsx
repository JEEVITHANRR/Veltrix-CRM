// apps/web/src/components/3d/ParticleField.tsx
'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Field({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10

      // Maroon to white gradient
      const t = Math.random()
      color.setRGB(0.5 + t * 0.5, t * 0.15, t * 0.15)
      col[i * 3]     = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return { positions: pos, colors: col }
  }, [count])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.015
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

export default function ParticleField() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 70 }} gl={{ alpha: true }} dpr={[1, 1.5]}>
      <Field count={180} />
    </Canvas>
  )
}
