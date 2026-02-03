import React, { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Leva } from 'leva' 

import BackgroundSphere from './components/BackgroundSphere'
import CameraController from './components/CameraController'
import AppUI from './components/AppUI'
import Santa from './components/Santa'
import SantaCar from './components/SantaCar'
import SnowEffect from './components/SnowEffect'
import CarSmoke from './components/CarSmoke'
import AudioSyncManager from './components/AudioSyncManager'
import PoseMotionValueDetector from './components/PoseMotionValueDetector'

export default function App() {
  const carRef = useRef()
  const santaRef = useRef()
  const [motionValue, setMotionValue] = useState(0)
  
  // NEW: State to kill scoring and motion once song loops
  const [isGameActive, setIsGameActive] = useState(true)

  // Helper to provide 0 if game is over, otherwise the real value
  const activeMotion = isGameActive ? motionValue : 0

  return (
    <>
      <Leva collapsed={true} />
      
      {/* UI receives 0 motion once game ends, stopping the score count */}
      <AppUI motionValue={activeMotion} isGameActive={isGameActive}/>

      <PoseMotionValueDetector
        onMotionValue={({ motionValue }) => {
          if (isGameActive) setMotionValue(motionValue)
        }}
        debug={false} 
      />

      <Canvas>
        <PerspectiveCamera makeDefault fov={75} position={[0, 0, 3]} far={2000} />
        <CameraController speed={0.01} initialAngle={Math.PI / 2} />

        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={5} />

        <Suspense fallback={null}>
          <BackgroundSphere />
          
          <AudioSyncManager 
            santaRef={santaRef} 
            motionValue={motionValue}
            // Triggered when the song restarts
            onFirstLoopComplete={() => setIsGameActive(false)}
          >
            <Santa 
              ref={santaRef}
              radius={90} 
              angle={Math.PI-Math.PI/9} 
              height={-15} 
              scale={.55} 
              rotationOffset={-Math.PI/10}
              motionValue={activeMotion} 
            />
          </AudioSyncManager>

          <SantaCar ref={carRef} radius={85} y={-16} scale={1.2} santaScale={2.4} motionValue={activeMotion}/>
          <CarSmoke carRef={carRef} motionValue={activeMotion} />
          <SnowEffect motionValue={activeMotion} />
        </Suspense>
      </Canvas>
    </>
  )
}
