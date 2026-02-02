import React, { useRef, useEffect } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Persistent store
const persistentLeaves = {
  initialized: false,
  leaves: []
}

export default function FallingLeaves({ motionValue = 0 }) {
  const groupRef = useRef()

  const leafPaths = Array.from({ length: 23 }, (_, i) =>
    `/r3f/leave_color/leave_color_${i + 1}.png`
  )
  const textures = useLoader(THREE.TextureLoader, leafPaths)

  useEffect(() => {
    if (!persistentLeaves.initialized && textures.length > 0) {
      persistentLeaves.leaves = Array.from({ length: 50 }).map(() => createLeaf(textures))
      persistentLeaves.initialized = true
    }

    // Gradually increase count based on motion value
   // const targetCount = 10 + Math.floor(motionValue)
	const targetCount = Math.min(10 + Math.floor(motionValue), 600)
    const currentCount = persistentLeaves.leaves.length

    if (textures.length > 0 && targetCount > currentCount) {
      const newLeaves = Array.from({ length: targetCount - currentCount }).map(() =>
        createLeaf(textures)
      )
      persistentLeaves.leaves.push(...newLeaves)
    }
  }, [motionValue, textures])

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((leaf, i) => {
      const data = persistentLeaves.leaves[i]
      if (!data) return
		const p = 1000
		leaf.position.y -= data.fallSpeed + motionValue/p
	      // Small horizontal drift for natural feel
		leaf.position.x += (Math.random() - 0.5) * 0.3
		leaf.position.z += (Math.random() - 0.5) * 0.3

          // Apply rotation on all axes
		const t = Math.random()
		leaf.rotation.x += data.rotationSpeed.x * t //motionValue / p
		leaf.rotation.y += data.rotationSpeed.y * t //motionValue / p
		leaf.rotation.z += data.rotationSpeed.z * t //motionValue / p
	
      if (leaf.position.y < -200) {
        leaf.position.y = Math.random() * 500 + 200
		leaf.position.x = (Math.random() - 0.5) * 1000
        leaf.position.z = (Math.random() - 0.5) * 1000
      }
    })
  })

  return (
    <group ref={groupRef}>
      {persistentLeaves.leaves.map((leaf, i) => (
        <mesh key={i} position={leaf.position} rotation={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial
            map={leaf.texture}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function createLeaf(textures) {
  return {
    texture: textures[Math.floor(Math.random() * textures.length)],
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 1000,
      Math.random() * 500 + 300,
      (Math.random() - 0.5) * 1000
    ),
    rotationSpeed: new THREE.Vector3(
      Math.random() * 0.02, // x axis
      Math.random() * 0.06, // y axis (main)
      Math.random() * 0.02  // z axis
    ),
    fallSpeed: 0.6 + Math.random()
  }
}
