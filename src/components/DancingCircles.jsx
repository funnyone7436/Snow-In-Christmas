import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function DancingCircles({ currentFrameRef }) {
  // --- SETTINGS: CIRCLE 1 (Outer) ---
  const config1 = {
    count: 160,
    radius: 98,
    size: 1.1,
    baseY: -20.3,
    jumpPower: 1.4,
    lerpSpeed: 0.16,
    color: "white"
  }

  // --- SETTINGS: CIRCLE 2 (Inner) ---
  const config2 = {
    count: 100,
    radius: 76,
    size: 0.9,
    baseY: -22,
    jumpPower: 1.1,
    lerpSpeed: 0.2,
    color: "#e0f7fa"
  }

  const group1Ref = useRef([])
  const group2Ref = useRef([])

  // Pre-calculate positions in a circle
  const pos1 = useMemo(() => Array.from({ length: config1.count }, (_, i) => ({
    x: Math.sin((i / config1.count) * Math.PI * 2) * config1.radius,
    z: Math.cos((i / config1.count) * Math.PI * 2) * config1.radius
  })), [config1.count, config1.radius])

  const pos2 = useMemo(() => Array.from({ length: config2.count }, (_, i) => ({
    x: Math.sin((i / config2.count) * Math.PI * 2) * config2.radius,
    z: Math.cos((i / config2.count) * Math.PI * 2) * config2.radius
  })), [config2.count, config2.radius])

  useFrame(() => {
    const frame = currentFrameRef.current
    if (!frame || !frame.audio) return

    const bands = Object.keys(frame.audio)

    // Circle 1 Logic (Outer) - Maps balls to audio bands
    group1Ref.current.forEach((ball, i) => {
      if (!ball) return
      const strength = frame.audio[bands[i % bands.length]] || 0
      const target = config1.baseY + (strength * config1.jumpPower)
      ball.position.y = THREE.MathUtils.lerp(ball.position.y, target, config1.lerpSpeed)
    })

    // Circle 2 Logic (Inner) - Uses an offset (+5) to dance differently
    group2Ref.current.forEach((ball, i) => {
      if (!ball) return
      const strength = frame.audio[bands[(i + 5) % bands.length]] || 0
      const target = config2.baseY + (strength * config2.jumpPower)
      ball.position.y = THREE.MathUtils.lerp(ball.position.y, target, config2.lerpSpeed)
    })
  })

  return (
    <group>
      {/* Outer Circle Render */}
      {pos1.map((p, i) => (
        <mesh key={`c1-${i}`} ref={el => group1Ref.current[i] = el} position={[p.x, config1.baseY, p.z]}>
          <sphereGeometry args={[config1.size, 12, 12]} />
          <meshStandardMaterial color={config1.color} emissive={config1.color} emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Inner Circle Render */}
      {pos2.map((p, i) => (
        <mesh key={`c2-${i}`} ref={el => group2Ref.current[i] = el} position={[p.x, config2.baseY, p.z]}>
          <sphereGeometry args={[config2.size, 12, 12]} />
          <meshStandardMaterial color={config2.color} emissive={config2.color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}