import type { FC } from "react";
import type { Field } from "../types/form";
import { useState } from "react";
import { FieldEditor } from "./FieldEditor";
import { FormPreview } from "./FormPreview";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";

export const FormBuilder: FC = () => {
  const [fields, setFields] = useState<Field[]>([]);

  const addField = () => {
    const newField: Field = { id: uuid(), label: "", type: "text", required: false, options: [] };
    setFields([...fields, newField]);
  };

  const updateField = (updated: Field) => {
    setFields(fields.map((f) => (f.id === updated.id ? updated : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const exportForm = () => {
    const dataStr = JSON.stringify(fields, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="md:w-1/2">
        <Button onClick={addField} className="mb-4">
          Add Field
        </Button>
        {fields.map((field) => (
          <FieldEditor
            key={field.id}
            field={field}
            onChange={updateField}
            onRemove={removeField}
          />
        ))}
        <Button variant="secondary" onClick={exportForm}>
          Export Form
        </Button>
      </div>
      <div className="md:w-1/2">
        <h2 className="font-bold mb-2">Preview</h2>
        <FormPreview fields={fields} />
      </div>
    </div>
  );
};