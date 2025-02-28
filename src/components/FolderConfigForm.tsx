
import { Separator } from "@/components/ui/separator";
import FileExplorer from './FileExplorer';
import PollingControl from './PollingControl';

interface ValidationErrors {
  source?: boolean;
  destination?: boolean;
  same?: boolean;
}

interface FolderConfigFormProps {
  sourceFolder: string;
  setSourceFolder: (value: string) => void;
  destinationFolder: string;
  setDestinationFolder: (value: string) => void;
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
  validationErrors: ValidationErrors;
}

const FolderConfigForm = ({
  sourceFolder,
  setSourceFolder,
  destinationFolder,
  setDestinationFolder,
  pollingInterval,
  setPollingInterval,
  validationErrors
}: FolderConfigFormProps) => {
  return (
    <div className="space-y-4">
      <FileExplorer
        id="source-folder"
        label="Source Folder"
        value={sourceFolder}
        onChange={setSourceFolder}
        placeholder="Select source folder to monitor"
        showError={validationErrors.source}
        errorMessage="Source folder is required"
      />
      
      <FileExplorer
        id="destination-folder"
        label="Destination Folder"
        value={destinationFolder}
        onChange={setDestinationFolder}
        placeholder="Select destination folder"
        showError={validationErrors.destination || validationErrors.same}
        errorMessage={validationErrors.same ? "Must be different from source" : "Destination folder is required"}
      />
      
      <PollingControl
        value={pollingInterval}
        onChange={setPollingInterval}
      />
    </div>
  );
};

export default FolderConfigForm;
