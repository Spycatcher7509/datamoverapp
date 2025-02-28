
import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Clock, ZapIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PollingControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const PollingControl = ({
  value,
  onChange,
  min = 1,
  max = 60,
  step = 1
}: PollingControlProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number[]) => {
    const value = newValue[0];
    setLocalValue(value);
    onChange(value);
  };

  const getSpeedLabel = () => {
    if (localValue <= 2) return "Very Fast";
    if (localValue <= 5) return "Fast";
    if (localValue <= 15) return "Normal";
    if (localValue <= 30) return "Slow";
    return "Very Slow";
  };

  return (
    <div className="space-y-4 animated-panel">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">
          Polling Frequency
        </label>
        <div className="flex items-center text-sm">
          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
          <span className="font-medium">{localValue} seconds</span>
        </div>
      </div>
      
      <div className="pt-1 px-1">
        <Slider 
          value={[localValue]} 
          min={min} 
          max={max} 
          step={step} 
          onValueChange={handleChange}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
        <span>1s</span>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full transition-all",
          "bg-primary/10 text-primary",
          "animate-fade-in"
        )}>
          <ZapIcon className={cn(
            "h-3 w-3", 
            localValue <= 5 ? "animate-pulse-subtle" : ""
          )} />
          <span className="font-medium">{getSpeedLabel()}</span>
        </div>
        <span>60s</span>
      </div>
    </div>
  );
};

export default PollingControl;
