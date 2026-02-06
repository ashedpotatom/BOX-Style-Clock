import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useTime } from '../hooks/useTime';
import { Group, MathUtils } from 'three';

// Easing functions (Cubic - Smooth, No Bounce)
function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}

function easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

interface BoxClockProps {
    isDarkMode: boolean;
    spinTrigger: number;
    fontMode: 'oi' | 'montserrat';
    isMobile: boolean;
}

const BoxClock: React.FC<BoxClockProps> = ({ isDarkMode, spinTrigger, fontMode, isMobile }) => {
    const time = useTime();
    const groupRef = useRef<Group>(null);

    const initialRotation = {
        x: -Math.PI / 8,
        y: Math.PI / 4,
        z: Math.PI / 32
    };

    const [baseRotation, setBaseRotation] = useState(initialRotation);
    const [targets, setTargets] = useState(initialRotation);
    const [starts, setStarts] = useState(initialRotation);
    const [animStartTime, setAnimStartTime] = useState(0);
    const [animDuration, setAnimDuration] = useState(800);
    const [useExpoEasing, setUseExpoEasing] = useState(false);

    const formatTime = (date: Date) => {
        // Use Ratio symbol (U+2236) instead of standard colon for better vertical alignment
        return date.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '∶');
    };
    const timeString = formatTime(time);

    // Helper function for Align (Reset to Front)
    const triggerAlign = () => {
        if (groupRef.current) {
            setStarts({
                x: groupRef.current.rotation.x,
                y: groupRef.current.rotation.y,
                z: groupRef.current.rotation.z
            });
        }
        setAnimStartTime(Date.now());
        setAnimDuration(2500); // Smooth 2.5s duration

        // Calculate nearest 2pi and add a full 360 spin for visual flair
        const normalize = (val: number) => {
            const twoPi = Math.PI * 2;
            const nearest = Math.round(val / twoPi) * twoPi;
            return nearest + twoPi; // Add one full turn
        };

        const newBase = {
            x: normalize(groupRef.current?.rotation.x || 0),
            y: normalize(groupRef.current?.rotation.y || 0),
            z: 0
        };

        setBaseRotation(newBase);
        setTargets(newBase);
        setUseExpoEasing(true);
    };

    // Handle manual align trigger from parent
    useEffect(() => {
        if (spinTrigger > 0) {
            triggerAlign();
        }
    }, [spinTrigger]);

    // Time-based animation
    useEffect(() => {
        if (groupRef.current) {
            setStarts({
                x: groupRef.current.rotation.x,
                y: groupRef.current.rotation.y,
                z: groupRef.current.rotation.z
            });
        }
        setAnimStartTime(Date.now());

        const seconds = time.getSeconds();

        if (seconds === 0) {
            triggerAlign();
        } else {
            setAnimDuration(800);

            const minRad = Math.PI / 4;
            const maxRad = Math.PI / 2;

            const randomDelta = () => {
                const val = minRad + (Math.random() * (maxRad - minRad));
                return Math.random() > 0.5 ? val : -val;
            };

            const clamp = (val: number, base: number, maxDeviation: number) => {
                const diff = val - base;
                if (Math.abs(diff) > maxDeviation) {
                    return base + Math.sign(diff) * maxDeviation;
                }
                return val;
            };

            const maxDeviationFromBase = Math.PI / 2;

            setTargets(prev => ({
                x: clamp(prev.x + randomDelta(), baseRotation.x, maxDeviationFromBase),
                y: clamp(prev.y + randomDelta(), baseRotation.y, maxDeviationFromBase),
                z: clamp(prev.z + (randomDelta() * 0.3), baseRotation.z, Math.PI / 6)
            }));

            setUseExpoEasing(false); // Use normal cubic for seconds
        }
    }, [timeString, time]);

    useFrame(() => {
        if (groupRef.current) {
            const now = Date.now();
            const elapsed = now - animStartTime;
            let progress = Math.min(elapsed / animDuration, 1);

            let easedProgress = 0;
            if (useExpoEasing) {
                // Dramatic snap for minute rotation
                easedProgress = easeOutExpo(progress);
            } else {
                // All other animations use Ease Out Cubic
                easedProgress = easeOutCubic(progress);
            }

            groupRef.current.rotation.x = MathUtils.lerp(starts.x, targets.x, easedProgress);
            groupRef.current.rotation.y = MathUtils.lerp(starts.y, targets.y, easedProgress);
            groupRef.current.rotation.z = MathUtils.lerp(starts.z, targets.z, easedProgress);
        }
    });

    // Colors based on dark mode
    const primaryColor = isDarkMode ? "#ffffff" : "#000000";
    const secondaryColor = isDarkMode ? "#000000" : "#ffffff";

    // Typography and Dimensions - Dynamic based on fontMode
    const isOi = fontMode === 'oi';
    const fontUrl = isOi
        ? "https://cdn.jsdelivr.net/gh/google/fonts@master/ofl/oi/Oi-Regular.ttf"
        : "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCs16Ew-.ttf";

    // Montserrat (Light 300) is thinner, but the user wants 10% reduction from the previous 4.5 baseline
    // Mobile reduction: additional 20% (multiplier 0.8)
    const mobileScale = isMobile ? 0.8 : 1.0;
    const fontSize = (isOi ? 4.05 : 5.18) * mobileScale;

    // Multipliers calibrated for "ultra-tight" look
    const boxWidth = isOi
        ? fontSize * 8 * 0.76   // Ultra-tight for Oi (reduced from 0.82)
        : fontSize * 8 * 0.53;  // Ultra-tight for Montserrat (reduced from 0.58)

    const boxHeight = isOi ? fontSize * 1.0 : fontSize * 0.95;
    const boxDepth = isOi ? fontSize * 1.0 : fontSize * 0.95;

    return (
        <group ref={groupRef} rotation={[initialRotation.x, initialRotation.y, initialRotation.z]}>
            <mesh>
                <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
                {/* Side faces use secondary color */}
                <meshBasicMaterial attach="material-0" color={secondaryColor} toneMapped={false} />
                <meshBasicMaterial attach="material-1" color={secondaryColor} toneMapped={false} />
                <meshBasicMaterial attach="material-2" color={secondaryColor} toneMapped={false} />
                <meshBasicMaterial attach="material-3" color={secondaryColor} toneMapped={false} />
                {/* Front/Back use primary color */}
                <meshBasicMaterial attach="material-4" color={primaryColor} toneMapped={false} />
                <meshBasicMaterial attach="material-5" color={primaryColor} toneMapped={false} />
            </mesh>

            {/* Front Face - Oi Font (High Res) */}
            <Text position={[0, 0, boxDepth / 2 + 0.01]} fontSize={fontSize} font={fontUrl} material-toneMapped={false} color={secondaryColor} anchorX="center" anchorY="middle" letterSpacing={-0.02} sdfGlyphSize={128}>
                {timeString}
            </Text>

            {/* Back Face */}
            <Text position={[0, 0, -(boxDepth / 2 + 0.01)]} rotation={[0, Math.PI, 0]} fontSize={fontSize} font={fontUrl} material-toneMapped={false} color={secondaryColor} anchorX="center" anchorY="middle" letterSpacing={-0.02} sdfGlyphSize={128}>
                {timeString}
            </Text>

            {/* Top Face */}
            <Text position={[0, boxHeight / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={fontSize} font={fontUrl} material-toneMapped={false} color={primaryColor} anchorX="center" anchorY="middle" letterSpacing={-0.02} sdfGlyphSize={128}>
                {timeString}
            </Text>

            {/* Bottom Face */}
            <Text position={[0, -(boxHeight / 2 + 0.01), 0]} rotation={[Math.PI / 2, 0, 0]} fontSize={fontSize} font={fontUrl} material-toneMapped={false} color={primaryColor} anchorX="center" anchorY="middle" letterSpacing={-0.02} sdfGlyphSize={128}>
                {timeString}
            </Text>
        </group>
    );
};

export default BoxClock;
