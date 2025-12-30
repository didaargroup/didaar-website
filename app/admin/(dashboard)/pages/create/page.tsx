import { CreatePageForm } from "./form";

export default async function CreatePage() {
  return (
    <div className="p-6 space-y-6 text-xl">
      <h1 className="">Create New Page</h1>
      <CreatePageForm />
    </div>
  );
}
