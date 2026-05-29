import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "./context/useAuth"

export default function LoginPage() {
  const [flipped, setFlipped] = useState(false)
  const [formState, setFormState] = useState({
    email: "",
    username: "",
    password: "",
  })
  const navigate = useNavigate()
  const { login, signup, loading, error } = useAuth()

  useEffect(() => {
    setFormState({ email: "", username: "", password: "" })
  }, [flipped])

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const success = await signup(formState.email, formState.username, formState.password)
    if (success) {
      alert("✓ Account created! Switching to login...")
      setFlipped(false)
    } else {
      // Error is already set in state, but add alert for visibility
      alert(`❌ Signup failed: ${error || "Unknown error"}`)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await login(formState.username, formState.password)
    if (success) {
      navigate("/dashboard")
    } else {
      // Error is already set in state, but add alert for visibility
      alert(`❌ Login failed: ${error || "Unknown error"}`)
    }
  }

  return (
    <div className="relative flex h-screen w-screen bg-[#eef1f4] dark:bg-background overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-blue-800 dark:bg-blue-900 flex items-center justify-center text-white text-6xl font-bold transition-transform duration-700 ease-in-out z-10 px-12 ${
          flipped ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {flipped ? "Welcome! Create an account" : "Shape - Interactive Form Manager"}
      </div>

      <div
        className={`absolute top-0 right-0 h-full w-1/2 flex items-center justify-center p-12 md:p-16 transition-transform duration-700 ease-in-out ${
          flipped ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <Card className="w-full max-w-2xl p-16 rounded-md border border-[#d0d7de] dark:border-border bg-white dark:bg-card shadow-sm">
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={flipped ? handleSignup : handleLogin}
            >
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-950 border-2 border-red-500 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200 text-base font-semibold animate-pulse">
                  ⚠️ Error: {error}
                </div>
              )}

              {flipped ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[1.7rem] font-medium">
                      Email
                    </Label>
                    <Input id="email" type="email" value={formState.email} onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))} className="rounded-sm" disabled={loading} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="username" className="text-[1.7rem] font-medium">
                      Username
                    </Label>
                    <Input id="username" type="text" value={formState.username} onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))} className="rounded-sm" disabled={loading} />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-[1.7rem] font-medium">
                      Password
                    </Label>
                    <Input id="password" type="password" value={formState.password} onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))} className="rounded-sm" disabled={loading} />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-[#1f4aa8] border-[#1f4aa8] hover:bg-[#163b87] disabled:opacity-50"
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <label className="px-0 text-sm mb-4">
                    Already have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => setFlipped(false)}
                      disabled={loading}
                    >
                      Login
                    </Button>
                  </label>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="username" className="text-[1.7rem] font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={formState.username}
                      onChange={(e) => setFormState((prev) => ({ ...prev, username: e.target.value }))}
                      autoComplete="username"
                      className="rounded-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-[1.7rem] font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formState.password}
                      onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                      autoComplete="current-password"
                      className="rounded-sm"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-[#1f4aa8] border-[#1f4aa8] hover:bg-[#163b87] disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <label className="px-0 text-sm mb-4">
                    Don't have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => setFlipped(true)}
                      disabled={loading}
                    >
                      Sign up
                    </Button>
                  </label>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

                     
