import { FormBuilder } from "../form-builder/FormBuilder";

export default function FormBuilderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Create New Form</h1>
      <FormBuilder />
    </div>
  );
}
