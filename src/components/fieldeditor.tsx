import type { FC } from "react";
import type { Field } from "../types/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FieldEditorProps {
  field: Field;
  onChange: (field: Field) => void;
  onRemove: (id: string) => void;
}

export const FieldEditor: FC<FieldEditorProps> = ({ field, onChange, onRemove }) => {
  return (
    <div className="border p-4 rounded mb-4 flex flex-col gap-2">
      <Input
        placeholder="Field Label"
        value={field.label}
        onChange={(e) => onChange({ ...field, label: e.target.value })}
      />
      <select
        value={field.type}
        onChange={(e) => {
          const newType = e.target.value as Field["type"];
          const newField: Field = {
            ...field,
            type: newType,
            options: newType === "checkbox" ? field.options ?? [""] : undefined,
          };
          onChange(newField);
        }}
        className="border rounded px-3 py-2 bg-white"
      >
        <option value="text">Text</option>
        <option value="checkbox">Checkbox</option>
      </select>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={field.required}
          onCheckedChange={(checked) => onChange({ ...field, required: !!checked })}
        />
        <span>Required</span>
      </div>

      {field.type === "checkbox" && (
        <div className="mt-2">
          <label className="block font-medium mb-1">Options</label>
          {(field.options ?? []).map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <Input
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const opts = [...(field.options ?? [])];
                  opts[idx] = e.target.value;
                  onChange({ ...field, options: opts });
                }}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const opts = [...(field.options ?? [])];
                  opts.splice(idx, 1);
                  onChange({ ...field, options: opts });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            onClick={() =>
              onChange({
                ...field,
                options: [...(field.options ?? []), ""],
              })
            }
          >
            Add option
          </Button>
        </div>
      )}

      <Button variant="destructive" onClick={() => onRemove(field.id)}>
        Remove Field
      </Button>
    </div>
  );
};