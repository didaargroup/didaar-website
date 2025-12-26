import { CreatePageForm } from "./form";

export default async function CreatePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="w-full max-w-lg">
        <CreatePageForm />
      </div>
    </div>
  );
}