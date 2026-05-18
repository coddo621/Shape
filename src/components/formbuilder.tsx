import type { FC } from "react";
import type { Field, Form } from "../types/form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FieldEditor } from "./fieldeditor";
import { FormPreview } from "./formpreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuid } from "uuid";

interface FormBuilderProps {
  formId?: string;
}

export const FormBuilder: FC<FormBuilderProps> = ({ formId }) => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!formId) return;

    let isMounted = true;

    const loadForm = async () => {
      try {
        const res = await fetch(`http://localhost:5000/forms/${formId}`, {
          credentials: "include",
        });
        if (res.ok && isMounted) {
          const form: Form = await res.json();
          setFormName(form.name);
          setFormDescription(form.description || "");
          setFields(form.fields);
        }
      } catch (error) {
        console.error("Failed to load form:", error);
      }
    };

    loadForm();

    return () => {
      isMounted = false;
    };
  }, [formId]);

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

  const saveForm = async () => {
    if (!formName.trim()) {
      setAlert({ type: "error", message: "Please enter a form name." });
      return;
    }
    if (fields.length === 0) {
      setAlert({ type: "error", message: "Please add at least one field." });
      return;
    }

    try {
      const method = formId ? "PUT" : "POST";
      const url = formId ? `http://localhost:5000/forms/${formId}` : "http://localhost:5000/forms";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: formName, description: formDescription, fields }),
      });

      if (res.ok) {
        navigate("/dashboard")
        return
      } else {
        setAlert({ type: "error", message: "Failed to save form." });
      }
    } catch (error) {
      console.error("Save error:", error);
      setAlert({ type: "error", message: "Error saving form." });
    }
  };

  const cancel = () => {
    navigate("/dashboard");
  };

  const exportForm = () => {
    const dataStr = JSON.stringify({ name: formName, description: formDescription, fields }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background p-6">
      <div className="mx-auto flex max-w-350 flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="text-3xl font-semibold text-foreground">{formName || "Untitled form"}</div>
              <Input
                placeholder="Form title"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="text-2xl font-semibold"
              />
              <Input
                placeholder="Form description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-sm text-muted-foreground"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" onClick={cancel}>
                Cancel
              </Button>
              <Button onClick={addField} size="sm">
                Add question
              </Button>
              <Button variant="outline" size="sm" onClick={exportForm}>
                Export
              </Button>
              <Button variant="default" size="sm" onClick={saveForm}>
                Save
              </Button>
            </div>
          </div>

          {alert && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                alert.type === "success"
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200"
                  : "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200"
              }`}
            >
              {alert.message}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 p-10 text-center text-muted-foreground">
                  Add a question to build your form.
                </div>
              ) : (
                fields.map((field, index) => (
                  <FieldEditor
                    key={field.id}
                    field={field}
                    onChange={updateField}
                    onRemove={removeField}
                    index={index + 1}
                  />
                ))
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted p-5">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Live preview</h2>
              <FormPreview fields={fields} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};