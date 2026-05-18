import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "./context/useAuth"
import type { Field, SharedForm, SubmissionAnswer } from "./types/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export default function FormFillPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<SharedForm | null>(null)
  const [values, setValues] = useState<Record<string, string | string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!id) return

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/share/${id}`)
        if (!res.ok) {
          setError("Unable to load form")
          return
        }
        const data: SharedForm = await res.json()
        setForm(data)
        const initialValues: Record<string, string | string[]> = {}
        data.fields.forEach((field) => {
          initialValues[field.id] = field.type === "checkbox" ? [] : ""
        })
        setValues(initialValues)
      } catch (err) {
        console.error(err)
        setError("Unable to load form")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleChange = (field: Field, value: string | string[]) => {
    setError(null)
    setSuccess(null)
    setValues((prev) => ({ ...prev, [field.id]: value }))
  }

  const validateResponse = () => {
    if (!form) return "Form is unavailable"

    for (const field of form.fields) {
      const value = values[field.id]

      if (field.required) {
        if (field.type === "checkbox") {
          if (!Array.isArray(value) || value.length === 0) {
            return `${field.label} is required.`
          }
        } else {
          const raw = String(value || "").trim()
          if (!raw) {
            return `${field.label} is required.`
          }
        }
      }

      if (field.type === "number" && value) {
        const raw = String(value).trim()
        if (Number.isNaN(Number(raw))) {
          return `${field.label} must be a valid number.`
        }
      }

      if (field.type === "date" && value) {
        const raw = String(value).trim()
        const parsed = Date.parse(raw)
        if (Number.isNaN(parsed)) {
          return `${field.label} must be a valid date.`
        }
      }

      if (field.type === "time" && value) {
        const raw = String(value).trim()
        const timePattern = /^\d{2}:\d{2}$/
        if (!timePattern.test(raw)) {
          return `${field.label} must be a valid time.`
        }
      }
    }

    return null
  }

  const handleSubmit = async () => {
    if (!form) return
    if (!user) {
      setError("Please log in before submitting this form.")
      return
    }

    const validationError = validateResponse()
    if (validationError) {
      setError(validationError)
      setSuccess(null)
      return
    }

    const answers: SubmissionAnswer[] = form.fields.map((field) => {
      const value = values[field.id]
      const normalized = field.type === "checkbox"
        ? Array.isArray(value)
          ? value.join(", ")
          : String(value || "")
        : String(value || "")

      return {
        fieldId: field.id,
        label: field.label,
        value: normalized,
      }
    })

    try {
      const res = await fetch(`http://localhost:5000/forms/${form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers }),
      })

      if (res.ok) {
        setSuccess("Response submitted successfully.")
        setError(null)
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to submit response")
        setSuccess(null)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to submit response")
      setSuccess(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f3f4] dark:bg-background">
        <div className="text-foreground">Loading form...</div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f3f4] dark:bg-background">
        <div className="text-foreground">Form not found.</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-card p-10 rounded-lg shadow text-center border dark:border-border">
          <div className="text-3xl font-semibold mb-4 text-foreground">Thank you!</div>
          <p className="text-muted-foreground mb-6">Your response has been submitted successfully.</p>
          <Button variant="default" onClick={() => navigate('/dashboard')}>Return to dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-card p-6 rounded-lg shadow border dark:border-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{form.name}</h1>
            {form.description && <p className="mt-2 text-sm text-muted-foreground">{form.description}</p>}
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">Share link form</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>Back</Button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded border dark:border-red-800">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded border dark:border-green-800">{success}</div>}

        {form.fields.map((field) => (
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
                  const file = e.target.files?.[0]
                  handleChange(field, file ? file.name : "")
                }}
              />
            )}
            {field.type === "checkbox" && (
              <div className="space-y-2">
                {(field.options ?? []).map((option) => {
                  const selected = Array.isArray(values[field.id]) && values[field.id].includes(option)
                  return (
                    <label key={option} className="flex items-center gap-2">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => {
                          const current: string[] = Array.isArray(values[field.id]) ? values[field.id] as string[] : []
                          const next = checked
                            ? [...current, option]
                            : current.filter((value: string) => value !== option)
                          handleChange(field, next)
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        <Button onClick={handleSubmit} className="mr-3">
          Submit response
        </Button>
        {!user && (
          <span className="text-sm text-muted-foreground">You must be logged in to submit. Please login first.</span>
        )}
      </div>
    </div>
  )
}
