import { useState, useEffect } from "react";
import { FiUsers, FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { auth } from "../lib/auth";
import { api } from "../lib/api";

interface AuthScreenProps {
  onNavigate: (screen: string) => void;
  onAuthSuccess: () => void;
}

export function AuthScreen({ onNavigate, onAuthSuccess }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-scroll to top when auth screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await auth.signIn(loginEmail, loginPassword);
      onAuthSuccess();
      onNavigate("welcome");
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Błąd logowania. Sprawdź email i hasło.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signupPassword !== signupConfirmPassword) {
      setError("Hasła nie są takie same");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Hasło musi mieć minimum 6 znaków");
      return;
    }

    setIsLoading(true);

    try {
      await api.signup(signupEmail, signupPassword, signupName);
      // Auto login after signup
      await auth.signIn(signupEmail, signupPassword);
      onAuthSuccess();
      onNavigate("welcome");
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || "Błąd rejestracji. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 via-turquoise-500 to-blue-600 flex flex-col">
      {/* Header */}
      <div className="text-white text-center pt-12 pb-8 px-6">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <FiUsers size={40} />
          </div>
        </div>
        <h1 className="mb-2">GroupTrip</h1>
        <p className="text-white/90">
          Wspólne wyjazdy, niższe ceny
        </p>
      </div>

      {/* Auth Form */}
      <div className="flex-1 bg-white rounded-t-3xl p-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Logowanie</TabsTrigger>
            <TabsTrigger value="signup">Rejestracja</TabsTrigger>
          </TabsList>

          {error && (
            <Card className="p-4 mb-4 bg-red-50 border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </Card>
          )}

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <div className="relative mt-1">
                  <FiMail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="login-password">Hasło</Label>
                <div className="relative mt-1">
                  <FiLock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-turquoise-600 text-white h-12"
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
                <FiArrowRight size={20} className="ml-2" />
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Imię i nazwisko</Label>
                <div className="relative mt-1">
                  <FiUser size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jan Kowalski"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative mt-1">
                  <FiMail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password">Hasło</Label>
                <div className="relative mt-1">
                  <FiLock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-confirm">Potwierdź hasło</Label>
                <div className="relative mt-1">
                  <FiLock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-turquoise-600 text-white h-12"
              >
                {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
                <FiArrowRight size={20} className="ml-2" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Benefits */}
        <div className="mt-8 space-y-3">
          <p className="text-sm text-gray-600 text-center mb-4">Dlaczego warto?</p>
          <Card className="p-3 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-900">🎟️ Oszczędzaj na biletach grupowych</p>
          </Card>
          <Card className="p-3 bg-cyan-50 border-cyan-200">
            <p className="text-sm text-cyan-900">🤝 Poznaj nowych ludzi z Twojego regionu</p>
          </Card>
          <Card className="p-3 bg-purple-50 border-purple-200">
            <p className="text-sm text-purple-900">⚡ Organizuj wyjazdy dla znajomych</p>
          </Card>
        </div>
      </div>
    </div>
  );
}