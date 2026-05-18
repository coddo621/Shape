import type { FC } from "react";
import type { Field } from "../types/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FieldEditorProps {
  field: Field;
  index?: number;
  onChange: (field: Field) => void;
  onRemove: (id: string) => void;
}

export const FieldEditor: FC<FieldEditorProps> = ({ field, index, onChange, onRemove }) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Question {index ?? ""}</div>
          <Input
            placeholder="Question title"
            value={field.label}
            onChange={(e) => onChange({ ...field, label: e.target.value })}
            className="mt-2"
          />
        </div>
        <Button variant="destructive" size="sm" onClick={() => onRemove(field.id)}>
          Remove
        </Button>
      </div>
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
        className="border rounded px-3 py-2 bg-white dark:bg-background text-foreground border-border"
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="date">Date</option>
        <option value="time">Time</option>
        <option value="file">File</option>
        <option value="checkbox">Checkbox</option>
      </select>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={field.required}
          onCheckedChange={(checked) => onChange({ ...field, required: !!checked })}
        />
        <span className="text-foreground">Required</span>
      </div>

      {field.type === "checkbox" && (
        <div className="mt-2">
          <label className="block font-medium mb-1 text-foreground">Options</label>
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
    </div>
  );
};