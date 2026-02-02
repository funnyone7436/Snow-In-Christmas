import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'

export default function BackgroundSync({ currentFrameRef }) {
  const { scene } = useThree()
  
  const colors = [
    "#b37474", "#602323", "#615423", "#b3a674", 
    "#779b68", "#396028", "#29614a", "#66c59e", 
    "#66c0c4", "#1c5053", "#201d54", "#874dd2", 
    "#9e3f70", "#741549", "#9b0505"
  ]

  const [colorIndex, setColorIndex] = useState(0)
  const lerpSpeed = 0.1      
  const canChangeColor = useRef(true)
  const targetColor = useRef(new THREE.Color(colors[0]))

  // 1. INITIALIZATION: Set background to a color so it isn't null
  useEffect(() => {
    if (scene && !scene.background) {
      scene.background = new THREE.Color(colors[0])
    }
  }, [scene])

  useFrame(() => {
    // 2. SAFETY GATE: Don't run if the background or frame is missing
    if (!currentFrameRef?.current || !scene || !scene.background) return

    const frame = currentFrameRef.current
    const beat = frame.audio?.beat || 0

    // BEAT TRIGGER
    if (beat >= 1) {
      if (canChangeColor.current) {
        const nextIndex = (colorIndex + 1) % colors.length
        setColorIndex(nextIndex)
        targetColor.current.set(colors[nextIndex])
        canChangeColor.current = false 
      }
    } 
    
    // RESET GATE
    if (beat < 0.4) {
      canChangeColor.current = true
    }

    // Now safe to lerp
    scene.background.lerp(targetColor.current, lerpSpeed)
  })

  return null
}