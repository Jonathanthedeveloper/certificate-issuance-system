import { LoaderCircleIcon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-32">
      <LoaderCircleIcon className="animate-spin h-6 w-6 text-primary" />
    </div>
  );
}
