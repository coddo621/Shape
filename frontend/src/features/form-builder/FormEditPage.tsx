import { FormBuilder } from "../form-builder/FormBuilder";
import { useParams } from "react-router-dom";

export default function FormEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Edit Form</h1>
      <FormBuilder formId={id} />
    </div>
  );
}
