
import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

interface AppLayoutProps extends PropsWithChildren {
  className?: string;
}

const AppLayout = ({ children, className }: AppLayoutProps) => {
  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col items-center justify-center p-6",
      className
    )}>
      <div className="w-full max-w-md mx-auto animate-scale-in">
        {children}
      </div>
      
      <footer className="mt-8 text-center text-xs text-muted-foreground animate-fade-in">
        <p>Cross-platform File Sync • macOS ARM64 & Windows 11</p>
      </footer>
    </div>
  );
};

export default AppLayout;
