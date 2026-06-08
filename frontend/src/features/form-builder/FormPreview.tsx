import type { FC } from "react";
import type { Field, FormSettings } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface FormPreviewProps {
  fields: Field[];
  settings: FormSettings;
}

export const FormPreview: FC<FormPreviewProps> = ({ fields, settings }) => {
  return (
    <div className="border border-border p-4 rounded space-y-4 bg-white dark:bg-card">
      <div className="mb-4 border-b border-border pb-4">
        <div className="text-xl font-semibold text-foreground">Form preview</div>
        <div className="text-sm text-muted-foreground">
          How this form will appear to respondents.
        </div>
      </div>
      {settings.showProgressBar && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full w-2/5 rounded-full bg-primary" />
          </div>
          <div className="text-xs text-muted-foreground">Progress is visible to respondents while filling the form.</div>
        </div>
      )}
      {settings.shuffleQuestionOrder && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-muted-foreground">
          Question order will be randomized for each respondent.
        </div>
      )}
      {settings.collectEmailAddresses === "responder_input" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-muted-foreground">
          The respondent will be asked to enter their email address before submitting.
        </div>
      )}
      <form className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <label className="block mb-1 font-medium text-foreground">
              {field.label}
              {field.required && <span className="ml-1 text-rose-600">*</span>}
            </label>
            {field.type === "text" && <Input placeholder={field.label} />}
            {field.type === "number" && <Input type="number" placeholder={field.label} />}
            {field.type === "date" && <Input type="date" />}
            {field.type === "time" && <Input type="time" />}
            {field.type === "file" && <Input type="file" />}
            {field.type === "checkbox" && (
              <div className="space-y-1">
                {(field.options ?? []).map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <Checkbox disabled />
                    <span className="text-foreground">{opt || `Option ${idx + 1}`}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </form>
      {settings.viewResultsSummary && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-muted-foreground">
          Respondents may view a summary of group responses after submitting.
        </div>
      )}
      {settings.disableAutoSave && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-muted-foreground">
          Auto-save is disabled for all respondents.
        </div>
      )}
    </div>
  );
};
