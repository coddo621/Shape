import type { FC } from "react";
import type { Field } from "../types/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface FormPreviewProps {
  fields: Field[];
}

export const FormPreview: FC<FormPreviewProps> = ({ fields }) => {
  return (
    <form className="border p-4 rounded space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block mb-1 font-medium">{field.label}</label>
          {field.type === "text" && <Input placeholder={field.label} />}
          {field.type === "textarea" && <textarea className="border rounded p-2 w-full" />}
          {field.type === "checkbox" && <Checkbox />}
        </div>
      ))}
    </form>
  );
};