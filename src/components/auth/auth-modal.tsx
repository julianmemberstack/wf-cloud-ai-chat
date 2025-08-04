"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMemberstack } from "@/contexts/memberstack-context";
import { Loader2, Mail, Lock, User, AlertCircle } from "lucide-react";

interface AuthModalProps {
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
}

export function AuthModal({ mode, onModeChange }: AuthModalProps) {
  const { memberstack } = useMemberstack();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberstack) return;

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        console.log('[Auth] Starting signup process');
        await memberstack.signupMemberEmailPassword({
          email,
          password,
          customFields: {
            firstName,
            lastName,
          },
        });
        console.log('[Auth] Signup successful');
      } else {
        console.log('[Auth] Starting login process');
        await memberstack.loginMemberEmailPassword({
          email,
          password,
        });
        console.log('[Auth] Login successful');
      }
    } catch (err) {
      console.error('[Auth] Authentication error:', err);
      
      if (err instanceof Error) {
        switch ((err as any).code) {
          case 'invalid_credentials':
            setError('Invalid email or password. Please try again.');
            break;
          case 'email_not_verified':
            setError('Please verify your email before logging in.');
            break;
          case 'member_not_found':
            setError('No account found with this email. Please sign up first.');
            break;
          case 'email_already_exists':
            setError('An account with this email already exists. Please try logging in.');
            break;
          case 'weak_password':
            setError('Password is too weak. Please choose a stronger password.');
            break;
          case 'invalid_email':
            setError('Please enter a valid email address.');
            break;
          case 'too_many_requests':
            setError('Too many attempts. Please try again later.');
            break;
          default:
            setError(err.message || 'An error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (!memberstack) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      console.log(`[Auth] Starting ${provider} authentication`);
      if (mode === 'signup') {
        await memberstack.signupWithProvider({
          provider,
          allowLogin: true,
        });
      } else {
        await memberstack.loginWithProvider({
          provider,
          allowSignup: true,
        });
      }
    } catch (err) {
      console.error(`[Auth] ${provider} authentication error:`, err);
      setError(err instanceof Error ? err.message : 'Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'login' 
            ? 'Sign in to access your AI chat' 
            : 'Sign up to start chatting with AI'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              Google
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
            >
              GitHub
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full text-muted-foreground">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}