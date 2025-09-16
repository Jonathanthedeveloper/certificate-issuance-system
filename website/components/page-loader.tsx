import { LoaderCircleIcon } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderCircleIcon className="animate-spin" />
    </div>
  );
}
