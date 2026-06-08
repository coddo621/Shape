import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/useAuth"
import { API, apiCall } from "@/constants/api"
import { DEFAULT_FORM_SETTINGS } from "@/constants/formSettings"
import type { FormSettings } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { user, updatePreferences } = useAuth()
  const [settings, setSettings] = useState<FormSettings>(DEFAULT_FORM_SETTINGS)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await apiCall<{ defaultFormSettings?: FormSettings }>(API.AUTH.PREFERENCES)

        if (res.ok && res.data) {
          setSettings({ ...DEFAULT_FORM_SETTINGS, ...res.data.defaultFormSettings })
        }
      } catch (error) {
        console.error("Unable to load preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const updateSetting = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const savePreferences = async () => {
    setStatus(null)
    const success = await updatePreferences({ defaultFormSettings: settings })

    if (success) {
      setStatus({ type: "success", message: "Account settings saved." })
    } else {
      setStatus({ type: "error", message: "Unable to save account settings." })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Account settings</h1>
            <p className="text-sm text-muted-foreground">
              Edit personal preferences and default form settings for new forms.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
        </div>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Your account information and personal preferences.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Username</label>
                <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-foreground dark:border-slate-700 dark:bg-slate-950">
                  {user?.username}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Email</label>
                <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-foreground dark:border-slate-700 dark:bg-slate-950">
                  {user?.email}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Form defaults</h2>
              <p className="text-sm text-muted-foreground">
                Control the default behavior for new forms you create.
              </p>
            </div>

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
                <span>New questions required by default</span>
              </label>

              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-foreground">
                  Form default: collect email addresses
                </span>
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
            </div>
          </CardContent>
        </Card>

        {status && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
                : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={savePreferences} disabled={loading}>
            Save settings
          </Button>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
