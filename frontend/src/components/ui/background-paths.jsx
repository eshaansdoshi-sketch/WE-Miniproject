import React from "react";
import { motion } from "framer-motion";

/**
 * FloatingPaths - Component that renders the animated SVG paths
 * 
 * @param {Object} props
 * @param {number} props.position - Direction modifier for the paths (1 or -1)
 */
function FloatingPaths({ position }) {
    const paths = Array.from({ length: 32 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}
        C-${380 - i * 5 * position} -${189 + i * 6}
        -${312 - i * 5 * position} ${216 - i * 6}
        ${152 - i * 5 * position} ${343 - i * 6}
        C${616 - i * 5 * position} ${470 - i * 6}
        ${684 - i * 5 * position} ${875 - i * 6}
        ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.6 + i * 0.03,
        opacity: 0.08 + i * 0.015,
    }));

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
            <svg style={{ width: '100%', height: '100%', display: 'block' }} viewBox="0 0 696 316" fill="none">
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke={`rgba(168, 85, 247, ${path.opacity})`}
                        strokeWidth={path.width}
                        initial={{ pathLength: 0.3, opacity: 0.4 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.2, 0.5, 0.2],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

/**
 * BackgroundPaths - Main container component for the animated background
 * 
 * Can wrap content or standalone
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Dashboard content
 * @param {string} props.className - Additional classes
 */
export default function BackgroundPaths({ children, className = "" }) {
    return (
        <div className={className} style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
                {children}
            </div>
        </div>
    );
}
