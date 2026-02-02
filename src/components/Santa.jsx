import React, { forwardRef, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Santa = forwardRef(({ 
  radius = 90, 
  angle = 0, 
  height = -14, 
  scale = 0.55, 
  rotationOffset = 0,
  currentFrameRef, 
  ...props 
}, ref) => {
  // FIXED: Changed the closing quote to a backtick ` to match the opening backtick
  const { nodes } = useGLTF(`${import.meta.env.BASE_URL}glb/Santa.glb`)
  
  const config = { threshold: 0.2, power: 2, lerp: 0.1 }
  const targetY = useRef(height)

  const x = radius * Math.sin(angle)
  const z = radius * Math.cos(angle)

  useFrame(() => {
    if (!currentFrameRef?.current || !ref?.current) return

    const frame = currentFrameRef.current
    const beat = frame.audio?.beat || 0

    targetY.current = beat > config.threshold 
      ? height + (beat * config.power) 
      : height

    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y, 
      targetY.current, 
      config.lerp
    )
  })

  return (
    <group 
      ref={ref} 
      position={[x, height, z]} 
      scale={scale} 
      rotation={[0, angle + rotationOffset, 0]} 
      dispose={null}
      {...props}
    >
      <primitive object={nodes.Scene || nodes[Object.keys(nodes)[0]]} />
    </group>
  )
})

useGLTF.preload(`${import.meta.env.BASE_URL}glb/Santa.glb`)

export default Santa