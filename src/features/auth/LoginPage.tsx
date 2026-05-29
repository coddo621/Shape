import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import { ALERT_STYLES, COLORS } from "@/constants/colors";

export default function LoginPage() {
  const [flipped, setFlipped] = useState(false);
  const [formState, setFormState] = useState({
    email: "",
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login, signup, loading, error } = useAuth();

  const toggleForm = (newFlipped: boolean) => {
    setFlipped(newFlipped);
    setFormState({ email: "", username: "", password: "" });
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await signup(
      formState.email,
      formState.username,
      formState.password
    );
    if (success) {
      setFlipped(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formState.username, formState.password);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#eef1f4] dark:bg-background overflow-hidden">
      {/* Animated Panel */}
      <div
        className={`absolute top-0 left-0 h-full w-1/2 bg-blue-800 dark:bg-blue-900 flex items-center justify-center text-white text-6xl font-bold transition-transform duration-700 ease-in-out z-10 px-12 ${
          flipped ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {flipped ? "Welcome! Create an account" : "Shape - Interactive Form Manager"}
      </div>

      {/* Form Panel */}
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
                <div className={`${ALERT_STYLES.error.inline} text-base! font-semibold! border-2! animate-pulse`}>
                  ⚠️ Error: {error}
                </div>
              )}

              {flipped ? (
                <>
                  {/* Sign Up Form */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="email"
                      className="text-[1.7rem] font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="rounded-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="username"
                      className="text-[1.7rem] font-medium"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={formState.username}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="rounded-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-[1.7rem] font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formState.password}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="rounded-sm"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2"
                    style={{
                      backgroundColor: COLORS.primary.blue,
                      borderColor: COLORS.primary.blue,
                    }}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <label className="px-0 text-sm mb-4">
                    Already have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => toggleForm(false)}
                      disabled={loading}
                    >
                      Login
                    </Button>
                  </label>
                </>
              ) : (
                <>
                  {/* Login Form */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="username"
                      className="text-[1.7rem] font-medium"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={formState.username}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      autoComplete="username"
                      className="rounded-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="text-[1.7rem] font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formState.password}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      autoComplete="current-password"
                      className="rounded-sm"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2"
                    style={{
                      backgroundColor: COLORS.primary.blue,
                      borderColor: COLORS.primary.blue,
                    }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <label className="px-0 text-sm mb-4">
                    Don't have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="px-0"
                      onClick={() => toggleForm(true)}
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
  );
}
