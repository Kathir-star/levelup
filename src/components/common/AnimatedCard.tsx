import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glowOnHover?: boolean;
  glowColor?: string; // e.g. "rgba(6, 182, 212, 0.25)"
  onClick?: () => void;
  id?: string;
}

export default function AnimatedCard({
  children,
  className,
  delay = 0,
  glowOnHover = true,
  glowColor = "rgba(6, 182, 212, 0.22)",
  onClick,
  id
}: AnimatedCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.45, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={onClick || glowOnHover ? { 
        y: -4, 
        boxShadow: `0 12px 30px -4px ${glowColor}`,
        borderColor: "rgba(6, 182, 212, 0.4)"
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={cn(
        "glass-card overflow-hidden transition-colors border border-white/5",
        onClick ? "cursor-pointer" : "",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
