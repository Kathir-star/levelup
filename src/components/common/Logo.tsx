import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className, onClick }: LogoProps) {
  return (
    <motion.div 
      animate={{ filter: ["drop-shadow(0 0 2px rgba(255, 51, 51, 0.4))", "drop-shadow(0 0 10px rgba(255, 51, 51, 0.8))", "drop-shadow(0 0 2px rgba(255, 51, 51, 0.4))"] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className={cn(
        "h-10 aspect-square shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 rounded-xl overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      <img 
        src="https://res.cloudinary.com/df2ejdvcz/image/upload/v1778747229/logo_ihy7qo.jpg"
        alt="App Logo"
        className="h-full w-full object-cover rounded-xl"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
}
