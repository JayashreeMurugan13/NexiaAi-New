"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, useRef } from "react";
import { cn } from "@/lib/utils";

interface MagneticBoxProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number; // How much it moves (default: 20)
}

export const MagneticBox = ({ children, className, intensity = 20 }: MagneticBoxProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth out the movement
    const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15 });

    const transform = useMotionTemplate`translate(${xSpring}px, ${ySpring}px)`;

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Move in the direction of the mouse relative to center
        x.set(mouseX / (width / intensity));
        y.set(mouseY / (height / intensity));
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform }}
            className={cn("relative inline-block", className)}
        >
            {children}
        </motion.div>
    );
};
