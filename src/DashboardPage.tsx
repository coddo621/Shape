import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./context/useAuth"
import { useState, useEffect } from "react"
import type { Form, FormSubmission } from "./types/form"
import { Moon, Sun } from "lucide-react"

function getInitials(username: string): string {
  return username
    .split(/\s+/)
    .map(word => word[0]?.toUpperCase())
    .filter(letter => letter)
    .join("")
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, toggleDarkMode } = useAuth()
  const [forms, setForms] = useState<Form[]>([])
  const [responses, setResponses] = useState<FormSubmission[]>([])
  const [activeTab, setActiveTab] = useState<"forms" | "responses">("forms")
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const notify = (message: string, type: "success" | "error" = "success") => {
    setNotification({ type, message })
    window.setTimeout(() => setNotification(null), 4000)
  }

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [formsRes, responsesRes] = await Promise.all([
          fetch("http://localhost:5000/forms", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/responses", {
            credentials: "include",
          }),
        ])

        if (formsRes.ok) {
          const data = await formsRes.json()
          setForms(data)
        }

        if (responsesRes.ok) {
          const data = await responsesRes.json()
          setResponses(data)
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error)
        notify("Unable to refresh dashboard data.", "error")
      }
    }

    loadDashboard()
    const interval = window.setInterval(loadDashboard, 5000)
    return () => window.clearInterval(interval)
  }, [])

  const copyShareLink = async (formId: number | string) => {
    const url = `${window.location.origin}/share/${formId}`
    try {
      await navigator.clipboard.writeText(url)
      notify("Share link copied to clipboard.")
    } catch (err) {
      console.error(err)
      notify("Unable to copy share link.", "error")
    }
  }

  const deleteForm = async (formId: number) => {
    if (!window.confirm("Delete this form and all its responses?")) {
      return
    }

    try {
      const res = await fetch(`http://localhost:5000/forms/${formId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.ok) {
        setForms((prev) => prev.filter((form) => form.id !== formId))
        setResponses((prev) => prev.filter((response) => response.formId !== formId))
        notify("Form deleted successfully.")
      } else {
        notify("Unable to delete form.", "error")
      }
    } catch (error) {
      console.error("Failed to delete form:", error)
      notify("Failed to delete form.", "error")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f4] dark:bg-background">
      <nav className="bg-white dark:bg-card border-b w-full">
        <div className="flex justify-between items-center px-3 md:px-4 py-2">
          <span className="font-semibold text-lg">Shape</span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="w-9 h-9 p-0"
            >
              {user?.dark_mode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{user ? getInitials(user.username) : "?"}</AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        <div className="px-3 md:px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h5 className="text-lg font-semibold mb-0 text-foreground">Dashboard</h5>
              <p className="text-sm text-muted-foreground">Manage forms, share links, and review submitted responses.</p>
            </div>
            <div className="flex gap-2">
              <Button variant={activeTab === "forms" ? "default" : "secondary"} onClick={() => setActiveTab("forms")}>Forms</Button>
              <Button variant={activeTab === "responses" ? "default" : "secondary"} onClick={() => setActiveTab("responses")}>Responses</Button>
            </div>
          </div>

          {notification && (
            <div className={`mb-4 rounded-xl border p-4 text-sm shadow-sm ${notification.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100" : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100"}`}>
              {notification.message}
            </div>
          )}

          {activeTab === "forms" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {forms.map((form) => (
                <Card key={form.id} className="h-full">
                  <div className="h-28 bg-gray-100 border-b border-gray-200" />
                  <CardContent className="p-4">
                    <h6 className="text-lg font-medium truncate mb-2">{form.name}</h6>
                    {form.description && <p className="text-sm text-gray-600 mb-2 max-h-10 overflow-hidden text-ellipsis">{form.description}</p>}
                    <p className="text-sm text-gray-500 mb-4">Created {new Date(form.createdAt).toLocaleDateString()}</p>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full" onClick={() => navigate(`/forms/${form.id}`)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" className="w-full" onClick={() => copyShareLink(form.id)}>
                        Copy share link
                      </Button>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => navigate(`/share/${form.id}`)}>
                        Open share page
                      </Button>
                      <Button size="sm" variant="destructive" className="w-full" onClick={() => deleteForm(form.id)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="h-full border-dashed border-2 flex flex-col justify-center items-center p-6 cursor-pointer" onClick={() => navigate("/forms/new")}> 
                <span className="text-gray-400 text-3xl">+</span>
                <p className="mt-3 text-sm text-gray-500">Create new form</p>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                  No submissions yet. Share a form to collect responses.
                </div>
              ) : (
                responses.map((response) => (
                  <Card key={response.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Form</div>
                          <div className="font-semibold">{response.formName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Submitted by</div>
                          <div className="font-semibold">{response.user.username}</div>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {response.answers.map((answer) => (
                          <div key={answer.fieldId} className="rounded border border-gray-200 p-3 bg-gray-50">
                            <div className="text-xs text-gray-500">{answer.label}</div>
                            <div className="mt-1 text-sm text-gray-900 wrap-break-word">{answer.value || "—"}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-xs text-gray-500">Submitted {new Date(response.submittedAt).toLocaleString()}</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
