import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className, onClick }: LogoProps) {
  return (
    <img 
      src="https://res.cloudinary.com/df2ejdvcz/image/upload/v1778747229/logo_ihy7qo.jpg"
      alt="App Logo"
      onClick={onClick}
      className={cn(
        "h-10 w-auto object-contain cursor-pointer transition-transform duration-200 hover:scale-105",
        className
      )}
    />
  );
}
