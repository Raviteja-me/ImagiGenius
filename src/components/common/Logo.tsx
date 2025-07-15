import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', iconSize = 32, textSize = "text-4xl" }) => {
  return (
    <Link href="/" className={`flex items-center font-headline font-extrabold tracking-tighter ${className} ${textSize} group`}>
      Imagi
      <span className="relative text-primary group-hover:text-accent transition-colors duration-300">
        Genius
        <Sparkles className="absolute -top-1 -right-3 w-5 h-5 text-accent group-hover:text-primary transition-colors duration-300 opacity-75 group-hover:opacity-100" style={{width: iconSize * 0.5, height: iconSize * 0.5, top: -iconSize*0.1, right: -iconSize*0.3}}/>
      </span>
    </Link>
  );
};
export default Logo;
