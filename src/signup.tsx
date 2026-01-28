import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent
} from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Signup() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen w-screen bg-[#eef1f4] flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center p-12 md:p-16">
        <Card className="w-full max-w-2xl p-16 rounded-md border border-[#d0d7de] bg-white shadow-sm">
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="username" className="text-[1.7rem] font-medium">
                  Username
                </Label>
                <Input id="username" type="text" autoComplete="username" className="rounded-sm"/>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-[1.7rem] font-medium">
                  Password
                </Label>
                <Input id="password" type="password" autoComplete="current-password" className="rounded-sm"/>
              </div>

              <Button type="button" variant="link" className="px-0 text-sm mb-4">
                Forgot password?
              </Button>

              <Button
                type="submit"
                className="w-full py-2 bg-[#1f4aa8] border-[#1f4aa8] hover:bg-[#163b87]"
                onClick={() => navigate("/dashboard")}
              >
                Login
              </Button>

              <label className="px-0 text-sm mb-4">
                Don't have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </Button>
              </label>
            </form>
          </CardContent>
        </Card>
      </div>

			<div className="hidden md:block flex-1 bg-blue-800">
        <label className="flex items-center justify-center h-full text-6xl font-bold text-white">
          Sign up
        </label>
      </div>
    </div>
  )
}
