
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GameCardProps {
  title: string;
  description: string;
  imagePath: string;
  path: string;
  buttonText: string;
  buttonClass?: string;
  isNew?: boolean;
  icon?: React.ReactNode;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  imagePath,
  path,
  buttonText,
  buttonClass = "btn-primary",
  isNew = false,
  icon
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-sm">
      {isNew && (
        <div className="absolute top-2 right-2 bg-primary px-2 py-0.5 rounded-md text-xs font-semibold">
          NEW
        </div>
      )}
      
      <div className="h-40 overflow-hidden">
        <img 
          src={imagePath} 
          alt={title} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/placeholder.svg';
          }} 
        />
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">{description}</p>
        <Link to={path}>
          <button className={cn("w-full py-2 px-4 rounded-md font-medium text-sm", buttonClass)}>
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default GameCard;
