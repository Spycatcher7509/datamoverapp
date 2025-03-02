
import AppLayout from "@/components/AppLayout";
import FileSyncApp from "@/components/FileSyncApp";
import FolderSelector from "@/components/FolderSelector";

const Index = () => {
  return (
    <AppLayout>
      <div className="mb-4">
        <FolderSelector />
      </div>
      <FileSyncApp />
    </AppLayout>
  );
};

export default Index;
