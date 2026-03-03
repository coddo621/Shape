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
        onChange={(e) => onChange({ ...field, type: e.target.value as Field["type"] })}
        className="border rounded px-3 py-2 bg-white"
      >
        <option value="text">Text</option>
        <option value="textarea">Textarea</option>
        <option value="checkbox">Checkbox</option>
      </select>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={field.required}
          onCheckedChange={(checked) => onChange({ ...field, required: !!checked })}
        />
        <span>Required</span>
      </div>
      <Button variant="destructive" onClick={() => onRemove(field.id)}>
        Remove Field
      </Button>
    </div>
  );
};