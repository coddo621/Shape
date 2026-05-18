import type { FC } from "react";
import type { Field } from "../types/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface FormPreviewProps {
  fields: Field[];
}

export const FormPreview: FC<FormPreviewProps> = ({ fields }) => {
  return (
    <div className="border border-border p-4 rounded space-y-4 bg-white dark:bg-card">
      <div className="mb-4 border-b border-border pb-4">
        <div className="text-xl font-semibold text-foreground">Form preview</div>
        <div className="text-sm text-muted-foreground">How this form will appear to respondents.</div>
      </div>
      <form className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block mb-1 font-medium text-foreground">{field.label}</label>
          {field.type === "text" && <Input placeholder={field.label} />}
          {field.type === "number" && <Input type="number" placeholder={field.label} />}
          {field.type === "date" && <Input type="date" />}
          {field.type === "time" && <Input type="time" />}
          {field.type === "file" && <Input type="file" />}
          {field.type === "checkbox" && (
            <div className="space-y-1">
              {(field.options ?? []).map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <Checkbox />
                  <span className="text-foreground">{opt || `Option ${idx + 1}`}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </form>
  </div>
  );
};