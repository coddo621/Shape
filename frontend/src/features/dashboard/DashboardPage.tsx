import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { useState, useEffect, useMemo, useRef } from "react";
import type { Form, FormSubmission } from "@/types/form";
import { useNotification } from "@/hooks/useNotification";
import { copyToClipboard, getInitials, formatDate } from "@/utils/string";
import { API, apiCall } from "@/constants/api";
import { ALERT_STYLES } from "@/constants/colors";
import { Moon, Sun } from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, toggleDarkMode } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<FormSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<"forms" | "responses">("forms");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { notification, notify } = useNotification();

  const groupedResponses = useMemo(() => {
    const groups: Record<number, { formName: string; items: FormSubmission[] }> = {};
    responses.forEach((response) => {
      const formId = response.formId;
      if (!groups[formId]) {
        groups[formId] = { formName: response.formName, items: [] };
      }
      groups[formId].items.push(response);
    });
    return Object.entries(groups).map(([formId, group]) => ({
      formId: Number(formId),
      formName: group.formName,
      items: group.items,
    }));
  }, [responses]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const formsRes = await apiCall<Form[]>(API.FORMS.LIST);
        const responsesRes = await apiCall<FormSubmission[]>(API.RESPONSES.LIST);

        if (formsRes.ok && formsRes.data) {
          setForms(formsRes.data);
        }

        if (responsesRes.ok && responsesRes.data) {
          setResponses(responsesRes.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        notify("Unable to refresh dashboard data.", "error");
      }
    };

    loadDashboard();
    const interval = window.setInterval(loadDashboard, 5000);
    return () => window.clearInterval(interval);
  }, [notify]);

  const copyShareLink = async (formId: number | string) => {
    const url = `${window.location.origin}/share/${formId}`;
    const success = await copyToClipboard(url);
    if (success) {
      notify("Share link copied to clipboard.");
    } else {
      notify("Unable to copy share link.", "error");
    }
  };

  const copyEditLink = async (
    formId: number | string,
    responseId: number | string,
    editToken?: string | null
  ) => {
    if (!editToken) {
      notify("Unable to generate edit link.", "error");
      return;
    }

    const url = `${window.location.origin}/share/${formId}?editResponseId=${responseId}&editToken=${encodeURIComponent(editToken)}`;
    const success = await copyToClipboard(url);
    if (success) {
      notify("Edit link copied to clipboard.");
    } else {
      notify("Unable to copy edit link.", "error");
    }
  };



  const deleteForm = async (formId: number) => {
    if (!window.confirm("Delete this form and all its responses?")) {
      return;
    }

    try {
      const res = await apiCall(API.FORMS.DELETE(formId), {
        method: "DELETE",
      });
      if (res.ok) {
        setForms((prev) => prev.filter((form) => form.id !== formId));
        setResponses((prev) =>
          prev.filter((response) => response.formId !== formId)
        );
        notify("Form deleted successfully.");
      } else {
        notify("Unable to delete form.", "error");
      }
    } catch (error) {
      console.error("Failed to delete form:", error);
      notify("Failed to delete form.", "error");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f1f3f4] dark:bg-background">
      {/* Navigation */}
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
              {user?.dark_mode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="rounded-full border border-transparent p-1 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <Avatar>
                    <AvatarFallback>
                      {user ? getInitials(user.username) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg dark:bg-card dark:border-slate-700">
                    <div className="px-4 py-3 text-sm">
                      <div className="font-semibold text-foreground">{user?.username}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          navigate("/settings")
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Account settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          toggleDarkMode()
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Toggle theme
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="px-3 md:px-4 py-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h5 className="text-lg font-semibold mb-0 text-foreground">
                Dashboard
              </h5>
              <p className="text-sm text-muted-foreground">
                Manage forms, share links, and review submitted responses.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "forms" ? "default" : "secondary"}
                onClick={() => setActiveTab("forms")}
              >
                Forms
              </Button>
              <Button
                variant={activeTab === "responses" ? "default" : "secondary"}
                onClick={() => setActiveTab("responses")}
              >
                Responses
              </Button>
            </div>
          </div>

          {/* Notification Alert */}
          {notification && (
            <div
              className={`mb-4 ${ALERT_STYLES.card} ${
                notification.type === "success"
                  ? ALERT_STYLES.success.container
                  : ALERT_STYLES.error.container
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Forms Tab */}
          {activeTab === "forms" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {forms.map((form) => (
                <Card key={form.id} className="h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="mb-4">
                      {form.description && (
                        <h6 className="text-lg font-medium mb-2">
                          {form.description}
                        </h6>
                      )}
                      <p className="text-sm text-gray-600">
                        {form.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Created {formatDate(form.createdAt)}
                    </p>
                    <div className="space-y-2 mt-auto">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/forms/${form.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        onClick={() => copyShareLink(form.id)}
                      >
                        Copy share link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/share/${form.id}`)}
                      >
                        Open share page
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => deleteForm(form.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="h-full border-dashed border-2 flex flex-col justify-center items-center p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors" onClick={() => navigate("/forms/new")}>
                <span className="text-gray-400 text-3xl">+</span>
                <p className="mt-3 text-sm text-gray-500">Create new form</p>
              </Card>
            </div>
          ) : (
            /* Responses Tab */
            <div className="space-y-4">
              {responses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                  No submissions yet. Share a form to collect responses.
                </div>
              ) : (
                groupedResponses.map((group) => (
                  <Card key={group.formId} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-gray-500">Form</div>
                          <div className="font-semibold">{group.formName}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {group.items.length} response{group.items.length === 1 ? "" : "s"}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {group.items.map((response) => (
                          <div key={response.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div>
                                <div className="text-sm text-gray-500">Submitted by</div>
                                <div className="font-semibold">{response.user.username}</div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(response.submittedAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {response.answers.map((answer) => (
                                <div
                                  key={answer.fieldId}
                                  className="rounded border border-gray-200 bg-white p-3"
                                >
                                  <div className="text-xs text-gray-500">{answer.label}</div>
                                  <div className="mt-1 text-sm text-gray-900 wrap-break-word">
                                    {answer.value || "—"}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => copyEditLink(response.formId, response.id, response.editToken)}
                              >
                                Copy edit link
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/share/${response.formId}?editResponseId=${response.id}&editToken=${encodeURIComponent(response.editToken ?? "")}`)}
                              >
                                Open edit page
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
