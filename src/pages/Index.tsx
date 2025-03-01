
import AppLayout from "@/components/AppLayout";
import FileSyncApp from "@/components/FileSyncApp";
import { useState, useEffect } from "react";

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Add a small delay to ensure proper initialization of components
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppLayout>
      {isLoaded ? (
        <FileSyncApp />
      ) : (
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
