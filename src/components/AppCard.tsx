
import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface AppCardProps extends PropsWithChildren {
  className?: string;
}

const AppCard = ({ children, className }: AppCardProps) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm",
        "animate-slide-up transition-all duration-300",
        "backdrop-blur-sm glassmorphism",
        className
      )}
    >
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"
      />
      <div className="relative p-6 space-y-6">
        {children}
      </div>
    </div>
  );
};

export default AppCard;
