"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useRef, useState } from "react"
import * as THREE from "three"

// Componente de la impresora
function Printer() {
  return (
    <group>
      {/* Base de la impresora */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[4, 0.5, 3]} />
        <meshStandardMaterial 
          color="#c0c0c0" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Marco vertical izquierdo */}
      <mesh position={[-1.75, 0.5, 0]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial 
          color="#b8b8b8" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Marco vertical derecho */}
      <mesh position={[1.75, 0.5, 0]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial 
          color="#b8b8b8" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Marco superior */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3.5, 0.1, 0.1]} />
        <meshStandardMaterial 
          color="#b8b8b8" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Mesa de impresión */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[3, 0.1, 2.5]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>
      
      {/* Panel de control */}
      <mesh position={[1.2, -0.3, 1.2]}>
        <boxGeometry args={[0.8, 0.3, 0.1]} />
        <meshStandardMaterial 
          color="#d0d0d0" 
          metalness={0.5} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Pantalla */}
      <mesh position={[1.2, -0.2, 1.25]}>
        <boxGeometry args={[0.6, 0.2, 0.05]} />
        <meshStandardMaterial 
          color="#000000" 
          emissive="#00ff00" 
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

// Componente del cabezal de impresión
function PrintHead() {
  const headRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (headRef.current) {
      const time = state.clock.getElapsedTime()
      // Animación del cabezal siguiendo un patrón de impresión
      const x = Math.sin(time * 0.5) * 1.2
      const z = Math.cos(time * 0.3) * 0.8
      const y = 1.5 + Math.sin(time * 0.8) * 0.1
      
      headRef.current.position.set(x, y, z)
      headRef.current.rotation.y = time * 0.2
    }
  })

  return (
    <group ref={headRef}>
      {/* Cuerpo del cabezal */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial 
          color="#d0d0d0" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Nozzle */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Ventilador */}
      <mesh position={[0.3, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1]} />
        <meshStandardMaterial 
          color="#c8c8c8" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* Cable */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        <meshStandardMaterial 
          color="#404040" 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>
    </group>
  )
}

// Componente del objeto que se está imprimiendo
function PrintingObject() {
  const objectRef = useRef<THREE.Group>(null)
  const [printProgress, setPrintProgress] = useState(0)
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const progress = (time % 8) / 8 // Ciclo de 8 segundos
    setPrintProgress(progress)
    
    if (objectRef.current) {
      // Animación de construcción/desconstrucción
      const totalLayers = 15
      const activeLayers = Math.floor(progress * totalLayers)
      
      objectRef.current.children.forEach((child, index) => {
        child.visible = index < activeLayers
      })
    }
  })

  return (
    <group ref={objectRef} position={[0, -0.3, 0]}>
      {Array.from({ length: 15 }, (_, i) => (
        <mesh
          key={i}
          position={[0, i * 0.08, 0]}
          visible={false}
        >
          <boxGeometry args={[0.8, 0.08, 0.8]} />
          <meshStandardMaterial 
            color="#ff6b35" 
            emissive="#ff6b35" 
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// Componente principal del Canvas
export function PrinterAnimation() {
  return (
    <div className="w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-transparent">
      <Canvas
        camera={{ position: [5, 3, 5], fov: 50 }}
      >
        {/* Iluminación mejorada */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, 5, -5]} intensity={0.8} />
        <pointLight position={[0, 3, 0]} intensity={0.6} color="#ffffff" />
        
        {/* Impresora */}
        <Printer />
        
        {/* Cabezal de impresión */}
        <PrintHead />
        
        {/* Objeto que se está imprimiendo */}
        <PrintingObject />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}
