import React, { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getAudio, getBeats, loadAudioAndBeats } from '../utils/AudioManager'


function BfImagesOrbit({
  centerRadius = 300,
  birdCount = 15,
  birdScale = 9,
  birdRadius = 48,
  sequences = [
    { path: '/r3f/gbf/gbf', length: 14 },
    { path: '/r3f/bf/bf', length: 14 },
    { path: '/r3f/rbf/rbf', length: 14 },
    { path: '/r3f/bbf/bbf', length: 14 }
  ]
}) {
  const { camera } = useThree()
  const pointRef = useRef()
  const groupRef = useRef()
  const [ready, setReady] = useState(false)
  const [beatIndex, setBeatIndex] = useState(0)
  const strengthRef = useRef(0)

  const recordedPositions = useRef([])

  useEffect(() => {
    loadAudioAndBeats().then(() => setReady(true))
  }, [])

  const frames = useLoader(
    THREE.TextureLoader,
    sequences.flatMap(seq =>
      Array.from({ length: seq.length }, (_, i) => `${seq.path}${i + 1}.png`)
    )
  )
  frames.forEach(f => { f.colorSpace = THREE.SRGBColorSpace })

	  const birds = useMemo(() => {
	  return Array.from({ length: birdCount }).map((_, i) => {
		const seqIndex = i % sequences.length
		const seqLen = sequences[seqIndex].length

		// Calculate and store constant random values
		const rM = Math.random()

		return {
		  seqIndex,
		  seqLen, // Cached
		  seqStart: seqIndex * seqLen, // Cached
		  textureIndex: Math.floor(Math.random() * seqLen),
		  baseRadius: birdRadius * (0.2 + Math.random() * 0.8),
		  angle: Math.random() * Math.PI * 2,
		  randX: rM * 6, // Cached
		  randZ: rM * 6, // Cached
		  randY: rM * 3, // Cached
		}
	  })
	}, [birdCount, sequences, birdRadius])

  const frameStates = useRef(birds.map(b => ({ current: b.textureIndex, timer: 0 })))

  const tempVec = new THREE.Vector3()

	useFrame((state, delta) => {
  if (!ready) return

  const time = state.clock.getElapsedTime()
  const camPos = camera.position
  const audio = getAudio()
  const beats = getBeats()

  // Beat logic remains the same
  if (beatIndex < beats.length && audio.currentTime >= beats[beatIndex].time) {
    strengthRef.current = beats[beatIndex].strength
    setBeatIndex(i => i + 1)
  }

  const strength = strengthRef.current

  // Cache sin/cos once per frame
  const angle = -time * 0.04 - Math.PI / 2
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const sin2 = Math.sin(time * 2)

  const px = camPos.x + centerRadius * cosA
  const pz = camPos.z + centerRadius * sinA
  const py = camPos.y + sin2 * 6 + strength * 6 - 2

  pointRef.current?.position.set(px, py, pz)

  groupRef.current?.children.forEach((mesh, i) => {
    const bird = birds[i]
    const anim = frameStates.current[i]

    // randX, randZ, randY are now directly available and constant (OPTIMIZED)

    const br = bird.baseRadius + strength * 9
    const a = bird.angle + time * 0.6
    const cosB = Math.cos(a)
    const sinB = Math.sin(a)

    // Compute target once into tempVec
    tempVec.set(
      px + bird.randX + br * cosB,
      py + Math.sin(time * 3 + i) * 3 + bird.randY,
      pz - bird.randZ + br * sinB
    )

    // Smooth movement
    mesh.position.lerp(tempVec, 0.1)

    // Optional: comment out for more speed
    mesh.lookAt(camPos)

    // Animate textures
    if (++anim.timer > 5) {
      // Use cached seqLen and seqStart (OPTIMIZED)
      anim.current = (anim.current + 1) % bird.seqLen
      mesh.material.map = frames[bird.seqStart + anim.current]
      anim.timer = 0
    }
  })
})


  if (!ready) return null

  return (
    <>
      <mesh ref={pointRef} position={[0, 0, 0]} visible={false}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <group ref={groupRef}>
        {birds.map((bird, i) => {
          const idx = bird.seqIndex * sequences[bird.seqIndex].length + bird.textureIndex
          return (
            <mesh key={i}>
              <planeGeometry args={[birdScale, birdScale]} />
              <meshBasicMaterial
                map={frames[idx]}
                transparent
                alphaTest={0.5}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )
        })}
      </group>
    </>
  )
}

export default React.memo(BfImagesOrbit, () => true)

