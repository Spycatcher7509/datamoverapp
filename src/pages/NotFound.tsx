
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import AppCard from "@/components/AppCard";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout>
      <AppCard className="text-center py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <h1 className="text-4xl font-semibold tracking-tighter">404</h1>
          <p className="text-lg text-muted-foreground">This page doesn't exist</p>
          
          <Button asChild className="mt-4">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </AppCard>
    </AppLayout>
  );
};

export default NotFound;
