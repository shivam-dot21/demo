'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Environment, MeshWobbleMaterial } from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

const FloatingShape = ({ position, color, speed, size }: { position: [number, number, number], color: string, speed: number, size: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        meshRef.current.position.y = position[1] + Math.sin(t * speed) * 0.5;
        meshRef.current.rotation.x = t * speed * 0.2;
        meshRef.current.rotation.y = t * speed * 0.3;
        
        if (hovered) {
            meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
        } else {
            meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh
                ref={meshRef}
                position={position}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <octahedronGeometry args={[size, 0]} />
                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.4}
                    radius={1}
                    transparent
                    opacity={0.6}
                    roughness={0}
                    metalness={0.5}
                />
            </mesh>
        </Float>
    );
};

const Particles = ({ count = 40 }) => {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 20;
            p[i * 3 + 1] = (Math.random() - 0.5) * 20;
            p[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return p;
    }, [count]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#7bcbc4" transparent opacity={0.4} />
        </points>
    );
};

const MouseFollower = () => {
    const { mouse, viewport } = useThree();
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame(() => {
        if (lightRef.current) {
            lightRef.current.position.x = (mouse.x * viewport.width) / 2;
            lightRef.current.position.y = (mouse.y * viewport.height) / 2;
        }
    });

    return <pointLight ref={lightRef} intensity={2} color="#7bcbc4" />;
};

export default function HeroScene() {
    return (
        <div className="absolute inset-0 w-full h-full -z-10 bg-white">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                
                <MouseFollower />
                
                <FloatingShape position={[-4, 2, -2]} color="#7bcbc4" speed={0.5} size={0.8} />
                <FloatingShape position={[4, -2, -1]} color="#4B8C86" speed={0.7} size={0.6} />
                <FloatingShape position={[2, 3, -3]} color="#C8E8E6" speed={0.4} size={0.5} />
                <FloatingShape position={[-3, -3, -2]} color="#7bcbc4" speed={0.6} size={0.7} />
                
                <Sphere args={[1, 100, 100]} position={[0, 0, -4]}>
                    <MeshWobbleMaterial color="#F8F9FB" speed={1} factor={0.6} transparent opacity={0.3} />
                </Sphere>

                <Particles />
                
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
