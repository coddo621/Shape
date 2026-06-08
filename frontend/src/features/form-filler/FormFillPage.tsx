import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type {
  Field,
  SharedForm,
  SubmissionAnswer,
  FormSettings,
  FormSubmission,
} from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { API, apiCall } from "@/constants/api";
import { ALERT_STYLES } from "@/constants/colors";

const defaultFormSettings: FormSettings = {
  showProgressBar: false,
  shuffleQuestionOrder: false,
  confirmationMessage: "Thank you! Your response has been recorded.",
  showSubmitAnotherResponseLink: false,
  viewResultsSummary: false,
  disableAutoSave: false,
  allowResponseEditing: false,
  acceptingResponses: true,
  formClosedMessage: "This registration is now closed.",
  collectEmailAddresses: "do_not_collect",
  questionDefaultRequired: false,
  isQuiz: false,
  releaseMarksImmediately: true,
  showMissedQuestions: false,
  showCorrectAnswers: false,
  showPointValues: false,
};

const RESPONDER_EMAIL_FIELD_ID = "respondent_email";

function buildInitialValues(fields: Field[], settings: FormSettings) {
  const initialValues: Record<string, string | string[]> = {};
  fields.forEach((field) => {
    initialValues[field.id] = field.type === "checkbox" ? [] : "";
  });
  if (settings.collectEmailAddresses === "responder_input") {
    initialValues.email = "";
  }
  return initialValues;
}

export default function FormFillPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<SharedForm | null>(null);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<SubmissionAnswer[] | null>(null);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingResponseId, setEditingResponseId] = useState<number | null>(null);
  const [editTokenParam, setEditTokenParam] = useState<string | null>(null);

  const activeSettings = form
    ? { ...defaultFormSettings, ...(form.settings ?? {}) }
    : defaultFormSettings;

  const displayFields = useMemo(() => {
    if (!form) return [];
    const baseFields = [...form.fields];
    return activeSettings.shuffleQuestionOrder
      ? baseFields.sort(() => Math.random() - 0.5)
      : baseFields;
  }, [form, activeSettings.shuffleQuestionOrder]);

  const progressPercentage = useMemo(() => {
    const totalSteps = displayFields.length + (activeSettings.collectEmailAddresses === "responder_input" ? 1 : 0);
    if (totalSteps === 0) {
      return 0;
    }

    let completedSteps = 0;
    if (activeSettings.collectEmailAddresses === "responder_input") {
      if (String(values.email || "").trim() !== "") {
        completedSteps += 1;
      }
    }

    displayFields.forEach((field) => {
      const value = values[field.id];
      if (field.type === "checkbox") {
        if (Array.isArray(value) && value.length > 0) {
          completedSteps += 1;
        }
      } else if (String(value || "").trim() !== "") {
        completedSteps += 1;
      }
    });

    return Math.round((completedSteps / totalSteps) * 100);
  }, [displayFields, values, activeSettings.collectEmailAddresses]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiCall<SharedForm>(API.SHARE.GET(id));
        if (!res.ok || !res.data) {
          setError("Unable to load form");
          return;
        }
        const loadedSettings = { ...defaultFormSettings, ...(res.data.settings ?? {}) };
        setForm(res.data);
        setValues(buildInitialValues(res.data.fields, loadedSettings));
        setRestoredDraft(false);

        // If URL contains edit params, try to load the response to edit
        try {
          const params = new URLSearchParams(location.search);
          const editResponseId = params.get("editResponseId");
          const token = params.get("editToken");
          if (editResponseId) {
            const respUrl = `${API.RESPONSES.GET(editResponseId)}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
            const responseRes = await apiCall<FormSubmission>(respUrl);
            if (responseRes.ok && responseRes.data) {
              const respData = responseRes.data;
              setEditMode(true);
              setEditingResponseId(Number(editResponseId));
              setEditTokenParam(token);

              // Map answers into values
              const newValues = buildInitialValues(res.data.fields, loadedSettings);
              const answers = respData.answers || [];
              for (const a of answers) {
                const fieldDef = res.data.fields.find((f) => String(f.id) === String(a.fieldId));
                if (fieldDef && fieldDef.type === "checkbox") {
                  newValues[a.fieldId] = a.value ? String(a.value).split(", ") : [];
                } else if (String(a.fieldId) === RESPONDER_EMAIL_FIELD_ID) {
                  newValues.email = a.value ?? "";
                } else {
                  newValues[a.fieldId] = a.value ?? "";
                }
              }
              setValues(newValues);
            }
          }
        } catch (err) {
          console.warn("Failed to load edit response", err);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load form");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, location.search]);

  useEffect(() => {
    if (!form || !id) return;
    const storageKey = `shape-form-draft-${id}`;

    if (activeSettings.disableAutoSave) {
      localStorage.removeItem(storageKey);
      return;
    }

    const rawDraft = localStorage.getItem(storageKey);
    if (!rawDraft) return;

    try {
      const parsed = JSON.parse(rawDraft) as Record<string, string | string[]>;
      setValues({ ...buildInitialValues(form.fields, activeSettings), ...parsed });
      setRestoredDraft(true);
    } catch (err) {
      console.warn("Failed to restore draft", err);
    }
  }, [form, id, activeSettings.disableAutoSave]);

  useEffect(() => {
    if (!id) return;
    const storageKey = `shape-form-draft-${id}`;

    if (activeSettings.disableAutoSave) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(values));
  }, [id, values, activeSettings.disableAutoSave]);

  const handleChange = (field: Field, value: string | string[]) => {
    setError(null);
    setSuccess(null);
    setValues((prev) => ({ ...prev, [field.id]: value }));
  };

  const handleEmailChange = (value: string) => {
    setError(null);
    setSuccess(null);
    setValues((prev) => ({ ...prev, email: value }));
  };

  const validateResponse = () => {
    if (!form) return "Form is unavailable";

    if (activeSettings.collectEmailAddresses === "responder_input") {
      const rawEmail = String(values.email || "").trim();
      if (!rawEmail) {
        return "Email is required.";
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(rawEmail)) {
        return "Please enter a valid email address.";
      }
    }

    for (const field of displayFields) {
      const value = values[field.id];

      if (field.required) {
        if (field.type === "checkbox") {
          if (!Array.isArray(value) || value.length === 0) {
            return `${field.label} is required.`;
          }
        } else {
          const raw = String(value || "").trim();
          if (!raw) {
            return `${field.label} is required.`;
          }
        }
      }

      if (field.type === "number" && value) {
        const raw = String(value).trim();
        if (Number.isNaN(Number(raw))) {
          return `${field.label} must be a valid number.`;
        }
      }

      if (field.type === "date" && value) {
        const raw = String(value).trim();
        const parsed = Date.parse(raw);
        if (Number.isNaN(parsed)) {
          return `${field.label} must be a valid date.`;
        }
      }

      if (field.type === "time" && value) {
        const raw = String(value).trim();
        const timePattern = /^\d{2}:\d{2}$/;
        if (!timePattern.test(raw)) {
          return `${field.label} must be a valid time.`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!form) return;

    const validationError = validateResponse();
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    const answers: SubmissionAnswer[] = displayFields.map((field) => {
      const value = values[field.id];
      const normalized = field.type === "checkbox"
        ? Array.isArray(value)
          ? value.join(", ")
          : String(value || "")
        : String(value || "");

      return {
        fieldId: field.id,
        label: field.label,
        value: normalized,
      };
    });

    if (activeSettings.collectEmailAddresses === "responder_input") {
      answers.unshift({
        fieldId: RESPONDER_EMAIL_FIELD_ID,
        label: "Email",
        value: String(values.email || ""),
      });
    }

    try {
      let res;
      if (editMode && editingResponseId) {
        res = await apiCall(API.RESPONSES.UPDATE(editingResponseId), {
          method: "PUT",
          body: JSON.stringify({ answers, token: editTokenParam }),
        });
      } else {
        res = await apiCall(API.FORMS.RESPONSES(form.id), {
          method: "POST",
          body: JSON.stringify({ answers }),
        });
      }

      if (res.ok) {
        setSuccess(editMode ? "Response updated." : (activeSettings.confirmationMessage || "Response submitted successfully."));
        setError(null);
        setSubmitted(true);
        setSubmittedAnswers(answers);
        localStorage.removeItem(`shape-form-draft-${id}`);
      } else {
        setError(res.error || (editMode ? "Failed to update response" : "Failed to submit response"));
        setSuccess(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit response");
      setSuccess(null);
    }
  };

  const handleSubmitAnother = () => {
    if (!form) return;
    setSubmitted(false);
    setSuccess(null);
    setSubmittedAnswers(null);
    setValues(buildInitialValues(form.fields, activeSettings));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f3f4] dark:bg-background">
        <div className="text-foreground">Loading form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f3f4] dark:bg-background">
        <div className="text-foreground">Form not found.</div>
      </div>
    );
  }

  if (!activeSettings.acceptingResponses) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-card p-10 rounded-lg shadow text-center border dark:border-border">
          <div className="text-3xl font-semibold mb-4 text-foreground">Form closed</div>
          <p className="text-muted-foreground mb-6">{activeSettings.formClosedMessage}</p>
          <Button variant="default" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-card p-10 rounded-lg shadow text-center border dark:border-border">
          <div className="text-3xl font-semibold mb-4 text-foreground">Thank you!</div>
          <p className="text-muted-foreground mb-6">{activeSettings.confirmationMessage}</p>
          {activeSettings.showSubmitAnotherResponseLink && (
            <Button variant="secondary" className="mr-3" onClick={handleSubmitAnother}>
              Submit another response
            </Button>
          )}
          <Button variant="default" onClick={() => navigate('/dashboard')}>Return to dashboard</Button>
          {activeSettings.allowResponseEditing && (
            <p className="mt-4 text-sm text-muted-foreground">Response editing is allowed when an edit link is provided.</p>
          )}
          {activeSettings.viewResultsSummary && submittedAnswers && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-950">
              <div className="text-lg font-semibold text-foreground mb-3">Submission summary</div>
              <div className="space-y-3">
                {submittedAnswers.map((answer) => (
                  <div key={answer.fieldId} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-card">
                    <div className="text-sm font-medium text-foreground">{answer.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{answer.value || "No response"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-card p-6 rounded-lg shadow border dark:border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{form.name}</h1>
            {form.description && (
              <p className="mt-2 text-sm text-muted-foreground">{form.description}</p>
            )}
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Share link form</p>
            {activeSettings.collectEmailAddresses === "responder_input" && (
              <p className="mt-2 text-sm text-muted-foreground">This form will ask respondents for their email address.</p>
            )}
            {activeSettings.disableAutoSave ? (
              <p className="mt-2 text-sm text-muted-foreground">Drafts will not be saved automatically for this form.</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Drafts are automatically saved while you fill this form.</p>
            )}
          </div>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>Back</Button>
        </div>

        {error && (
          <div className={`mb-4 rounded border ${ALERT_STYLES.error.inline}`}>{error}</div>
        )}
        {success && (
          <div className={`mb-4 rounded border ${ALERT_STYLES.success.inline}`}>{success}</div>
        )}
        {restoredDraft && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-950">
            A saved draft was restored for this form.
          </div>
        )}

        {activeSettings.showProgressBar && (
          <div className="mb-6">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {progressPercentage}% complete
            </div>
          </div>
        )}

        {activeSettings.collectEmailAddresses === "responder_input" && (
          <div className="mb-4">
            <label className="block mb-2 font-medium text-foreground">
              Email address
            </label>
            <Input
              type="email"
              value={String(values.email || "")}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
          </div>
        )}

        {displayFields.map((field) => (
          <div key={field.id} className="mb-4">
            <label className="block mb-2 font-medium text-foreground">
              {field.label}
              {field.required && <span className="ml-1 text-rose-600">*</span>}
            </label>
            {field.type === "text" && (
              <Input
                value={String(values[field.id] || "")}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}
            {field.type === "number" && (
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(values[field.id] || "")}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}
            {field.type === "date" && (
              <Input
                type="date"
                value={String(values[field.id] || "")}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}
            {field.type === "time" && (
              <Input
                type="time"
                value={String(values[field.id] || "")}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            )}
            {field.type === "file" && (
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  handleChange(field, file ? file.name : "");
                }}
              />
            )}
            {field.type === "checkbox" && (
              <div className="space-y-2">
                {(field.options ?? []).map((option) => {
                  const selected =
                    Array.isArray(values[field.id]) &&
                    values[field.id].includes(option);
                  return (
                    <label key={option} className="flex items-center gap-2">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => {
                          const current: string[] = Array.isArray(values[field.id])
                            ? (values[field.id] as string[])
                            : [];
                          const next = checked
                            ? [...current, option]
                            : current.filter((value: string) => value !== option);
                          handleChange(field, next);
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <Button onClick={handleSubmit} className="mr-3">
          Submit response
        </Button>
      </div>
    </div>
  );
}
