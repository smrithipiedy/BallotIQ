'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'outline' | 'bento';
  hover?: boolean;
}

export function Card({ children, className, variant = 'glass', hover = true }: CardProps) {
  const variants = {
    glass: "glass",
    solid: "bg-card text-card-foreground shadow-xl",
    outline: "border border-border bg-transparent",
    bento: "bento-card"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "rounded-[2rem] p-6 transition-all duration-300",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
