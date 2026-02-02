import React, { useRef, useImperativeHandle, forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 1. Wrap the entire function in forwardRef so App.jsx can "hold" the car's position
const SantaCar = forwardRef(({ 
  radius = 96, 
  y = -18, 
  tireSpeed = 5, 
  bodyWobble = 0.1,
  bounceAmplitude = 3, 
  bounceFrequency = 5,
  giftJumpIntensity = 1.,
  motionValue = 0,
  santaScale = 1.5,
  ...props 
}, ref) => {
  const meshRef = useRef()
  const { nodes } = useGLTF('/glb/santa_car_v50.glb')

  // 2. This links the internal meshRef to the 'ref' passed from App.jsx
  useImperativeHandle(ref, () => meshRef.current)

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
	  
	  const maxExpectedMotion = 8.0 
      const factor = Math.min(motionValue / maxExpectedMotion, 1.0) 
      
      // Dynamic giftJumpIntensity range: 0.06 (calm) to 4.0 (intense)
     // const dynamicGiftJump = 0.06 + (factor * 2)

      // POSITION & SYNC
      const cameraAngle = Math.atan2(state.camera.position.x, state.camera.position.z)
      const carAngle = cameraAngle + Math.PI 

      meshRef.current.position.x = radius * Math.sin(carAngle)
      meshRef.current.position.z = radius * Math.cos(carAngle)
      
      const carBounce = Math.sin(t * bounceFrequency) * bounceAmplitude
      meshRef.current.position.y = y + carBounce

      // FACING
      meshRef.current.lookAt(state.camera.position)

      // TIRE SPIN
      const tireRotation = t * tireSpeed
      const tireNames = ['carTireB', 'carTireBB', 'carTireF', 'carTireFB']
      tireNames.forEach((name) => {
        if (nodes[name]) nodes[name].rotation.z = tireRotation
      })

      // BODY WOBBLE
      if (nodes.carBody) {
        nodes.carBody.rotation.z = Math.sin(t * 4) * bodyWobble 
      }

      // GIFT PHYSICS
      const jumpSync = (Math.sin(t * bounceFrequency) + 1) / 2
      for (let i = 1; i <= 8; i++) {
        const giftName = `gift${i}`
        if (nodes[giftName]) {
          if (!nodes[giftName].userData.initialY) {
            nodes[giftName].userData.initialY = nodes[giftName].position.y
          }
          const initialY = nodes[giftName].userData.initialY
          // Using the dynamic intensity calculated from motion
          const individualBoost = initialY * giftJumpIntensity
          nodes[giftName].position.y = initialY + (jumpSync * individualBoost)
        }
      }
        
      // SANTA SCALE
      if (nodes.Santa) {
        nodes.Santa.scale.set(santaScale, santaScale, santaScale)
      }
    }
  })

  return (
    <group ref={meshRef} dispose={null}>
      <group rotation={[0, Math.PI, 0]}>
        <primitive 
          object={nodes.Scene || nodes[Object.keys(nodes)[0]]} 
          scale={props.scale || 0.6} 
        />
      </group>
    </group>
  )
})

useGLTF.preload('/glb/santa_car_v50.glb')

export default SantaCar