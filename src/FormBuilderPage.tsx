import { FormBuilder } from "./components/FormBuilder";

export default function FormBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Form</h1>
      <FormBuilder />
    </div>
  );
}