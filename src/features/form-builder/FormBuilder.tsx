import type { FC } from "react";
import type { Field, Form, FormSettings } from "@/types/form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_FORM_SETTINGS } from "@/constants/formSettings";
import { FieldEditor } from "./FieldEditor";
import { FormPreview } from "./FormPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API } from "@/constants/api";
import { ALERT_STYLES, CONTAINER_STYLES } from "@/constants/colors";
import { v4 as uuid } from "uuid";

interface FormBuilderProps {
  formId?: string;
}

export const FormBuilder: FC<FormBuilderProps> = ({ formId }) => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [settings, setSettings] = useState<FormSettings>(DEFAULT_FORM_SETTINGS);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!formId) return;

    let isMounted = true;

    const loadForm = async () => {
      try {
        const res = await fetch(API.FORMS.GET(formId), {
          credentials: "include",
        });
        if (res.ok && isMounted) {
          const form: Form = await res.json();
          setFormName(form.name);
          setFormDescription(form.description || "");
          setFields(form.fields);
          setSettings({ ...DEFAULT_FORM_SETTINGS, ...(form.settings ?? {}) });
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

  const updateSetting = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (formId) return;

    let isMounted = true;

    const loadPreferences = async () => {
      try {
        const res = await fetch(API.AUTH.PREFERENCES, {
          credentials: "include",
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.defaultFormSettings) {
            setSettings({ ...DEFAULT_FORM_SETTINGS, ...data.defaultFormSettings });
          }
        }
      } catch (error) {
        console.error("Failed to load form defaults:", error);
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [formId]);

  const addField = () => {
    const newField: Field = {
      id: uuid(),
      label: "",
      type: "text",
      required: settings.questionDefaultRequired,
      options: [],
    };
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
      const url = formId ? API.FORMS.UPDATE(formId) : API.FORMS.CREATE;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          fields,
          settings,
        }),
      });

      if (res.ok) {
        navigate("/dashboard");
        return;
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
    const dataStr = JSON.stringify(
      { name: formName, description: formDescription, fields, settings },
      null,
      2
    );
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
        <div className={CONTAINER_STYLES.card}>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="text-3xl font-semibold text-foreground">
                {formName || "Untitled form"}
              </div>
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
            <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${ALERT_STYLES.success.container}`}>
              {alert.message}
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Form settings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.showProgressBar}
                  onCheckedChange={(checked) => updateSetting("showProgressBar", !!checked)}
                />
                <span>Show progress bar</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.shuffleQuestionOrder}
                  onCheckedChange={(checked) => updateSetting("shuffleQuestionOrder", !!checked)}
                />
                <span>Shuffle question order</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.viewResultsSummary}
                  onCheckedChange={(checked) => updateSetting("viewResultsSummary", !!checked)}
                />
                <span>View results summary</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.showSubmitAnotherResponseLink}
                  onCheckedChange={(checked) => updateSetting("showSubmitAnotherResponseLink", !!checked)}
                />
                <span>Show submit another response link</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.disableAutoSave}
                  onCheckedChange={(checked) => updateSetting("disableAutoSave", !!checked)}
                />
                <span>Disable auto-save for respondents</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.allowResponseEditing}
                  onCheckedChange={(checked) => updateSetting("allowResponseEditing", !!checked)}
                />
                <span>Allow response editing</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.acceptingResponses}
                  onCheckedChange={(checked) => updateSetting("acceptingResponses", !!checked)}
                />
                <span>Accepting responses</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={settings.questionDefaultRequired}
                  onCheckedChange={(checked) => updateSetting("questionDefaultRequired", !!checked)}
                />
                <span>Make new questions required by default</span>
              </label>
              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-foreground">Form default: collect email addresses</span>
                <Select
                  value={settings.collectEmailAddresses}
                  onValueChange={(value) =>
                    updateSetting("collectEmailAddresses", value as FormSettings["collectEmailAddresses"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="do_not_collect">Do not collect</SelectItem>
                    <SelectItem value="verified">Verified accounts only</SelectItem>
                    <SelectItem value="responder_input">Responder input email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="flex flex-col gap-2 text-sm text-foreground">
                  <span>Confirmation message</span>
                  <Input
                    value={settings.confirmationMessage}
                    onChange={(e) => updateSetting("confirmationMessage", e.target.value)}
                  />
                </label>
              </div>
              {!settings.acceptingResponses && (
                <div className="md:col-span-2">
                  <label className="flex flex-col gap-2 text-sm text-foreground">
                    <span>Closed form message</span>
                    <Input
                      value={settings.formClosedMessage}
                      onChange={(e) => updateSetting("formClosedMessage", e.target.value)}
                    />
                  </label>
                </div>
              )}
              <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="font-medium">Quiz settings</span>
                  <Checkbox
                    checked={settings.isQuiz}
                    onCheckedChange={(checked) => updateSetting("isQuiz", !!checked)}
                  />
                </div>
                {settings.isQuiz ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={settings.releaseMarksImmediately}
                        onCheckedChange={(checked) => updateSetting("releaseMarksImmediately", !!checked)}
                      />
                      <span>Release marks immediately</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={settings.showMissedQuestions}
                        onCheckedChange={(checked) => updateSetting("showMissedQuestions", !!checked)}
                      />
                      <span>Show missed questions</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={settings.showCorrectAnswers}
                        onCheckedChange={(checked) => updateSetting("showCorrectAnswers", !!checked)}
                      />
                      <span>Show correct answers</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={settings.showPointValues}
                        onCheckedChange={(checked) => updateSetting("showPointValues", !!checked)}
                      />
                      <span>Show point values</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Enable quiz mode to reveal grading options.</p>
                )}
              </div>
            </div>
          </div>

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
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                Live preview
              </h2>
              <FormPreview fields={fields} settings={settings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
