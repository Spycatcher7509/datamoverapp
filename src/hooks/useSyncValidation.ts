
import { useState, useCallback } from 'react';
import { toast } from "sonner";

interface ValidationErrors {
  source?: boolean;
  destination?: boolean;
  same?: boolean;
}

export function useSyncValidation() {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateConfig = useCallback((sourceFolder: string, destinationFolder: string) => {
    const errors = {
      source: !sourceFolder,
      destination: !destinationFolder,
      same: sourceFolder === destinationFolder && sourceFolder !== ''
    };
    
    setValidationErrors(errors);
    
    // If there are errors, show toast with most important error
    if (errors.source || errors.destination || errors.same) {
      if (errors.same) {
        toast.error("Source and destination folders must be different");
      } else if (errors.source && errors.destination) {
        toast.error("Source and destination folders are required");
      } else if (errors.source) {
        toast.error("Source folder is required");
      } else if (errors.destination) {
        toast.error("Destination folder is required");
      }
      return false;
    }
    
    return true;
  }, []);

  return {
    validationErrors,
    validateConfig
  };
}
