import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function Login() {
  const [flipped, setFlipped] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const emailInput = document.getElementById("email") as HTMLInputElement | null
    const usernameInput = document.getElementById("username") as HTMLInputElement | null
    const passwordInput = document.getElementById("password") as HTMLInputElement | null

    if (emailInput) emailInput.value = ""
    if (usernameInput) usernameInput.value = ""
    if (passwordInput) passwordInput.value = ""
  }, [flipped])

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const payload = {
      email: (document.getElementById("email") as HTMLInputElement).value,
      username: (document.getElementById("username") as HTMLInputElement).value,
      password: (document.getElementById("password") as HTMLInputElement).value,
    }

    await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      username: (document.getElementById("username") as HTMLInputElement).value,
      password: (document.getElementById("password") as HTMLInputElement).value,
    }

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if(res.ok){
      navigate("/dashboard")
    }else{
      alert("Invalid username or password")
    }
  }

  return (
    <div className="relative flex h-screen w-screen bg-[#eef1f4] overflow-hidden">
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-blue-800 flex items-center justify-center text-white text-6xl font-bold transition-transform duration-700 ease-in-out z-10 ${
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
        <Card className="w-full max-w-2xl p-16 rounded-md border border-[#d0d7de] bg-white shadow-sm">
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={flipped ? handleSignup : handleLogin}
            >
              {flipped ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[1.7rem] font-medium">
                      Email
                    </Label>
                    <Input id="email" type="email" className="rounded-sm" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="username" className="text-[1.7rem] font-medium">
                      Username
                    </Label>
                    <Input id="username" type="text" className="rounded-sm" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-[1.7rem] font-medium">
                      Password
                    </Label>
                    <Input id="password" type="password" className="rounded-sm" />
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-2 bg-[#1f4aa8] border-[#1f4aa8] hover:bg-[#163b87]"
                    onClick={() => setFlipped(false)}
                  >
                    Sign Up
                  </Button>

                  <label className="px-0 text-sm mb-4">
                    Already have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => setFlipped(false)}
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
                      autoComplete="username"
                      className="rounded-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-[1.7rem] font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className="rounded-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-2 bg-[#1f4aa8] border-[#1f4aa8] hover:bg-[#163b87]"
                  >
                    Login
                  </Button>

                  <label className="px-0 text-sm mb-4">
                    Don't have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => setFlipped(true)}
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
