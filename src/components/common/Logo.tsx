import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className, onClick }: LogoProps) {
  return (
    <motion.img 
      animate={{ filter: ["drop-shadow(0 0 2px rgba(255, 51, 51, 0.4))", "drop-shadow(0 0 10px rgba(255, 51, 51, 0.8))", "drop-shadow(0 0 2px rgba(255, 51, 51, 0.4))"] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      src="https://res.cloudinary.com/df2ejdvcz/image/upload/v1778747229/logo_ihy7qo.jpg"
      alt="App Logo"
      onClick={onClick}
      className={cn(
        "h-10 w-auto object-contain cursor-pointer transition-transform duration-200 hover:scale-105 rounded-xl",
        className
      )}
    />
  );
}
