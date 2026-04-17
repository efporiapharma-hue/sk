import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (username === 'admin' && password === '12345') {
        toast.success('Login successful! Welcome back.');
        onLogin(username);
      } else {
        toast.error('Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105 animate-pulse-slow"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop")',
          animationDuration: '10s'
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-medical-blue/40 to-slate-900/80" />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-6xl px-4 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Branding */}
        <div className="text-white max-w-xl hidden lg:block">
          <h1 className="text-6xl font-bold tracking-tight mb-4 drop-shadow-lg">
            DC Global Hospital
          </h1>
          <p className="text-2xl font-light opacity-90 mb-8 border-l-4 border-white pl-6">
            & Maternity Center
          </p>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 inline-block">
            <p className="text-sm font-medium tracking-widest uppercase opacity-70 mb-2">Emergency Services</p>
            <p className="text-3xl font-bold">24/7 Care Available</p>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 lg:p-12">
              {/* Logo & Header */}
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-12 h-12 bg-medical-blue rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-medical-blue/30">
                    DC
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-slate-800 leading-none">Digital Communique</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">Private Limited</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Welcome to <span className="text-medical-blue">Hospital</span></h3>
                <p className="text-lg font-semibold text-slate-700">Management System</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-blue transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 transition-all text-base"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-blue transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-blue/20 transition-all text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-medical-blue data-[state=checked]:border-medical-blue" />
                    <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">
                      Remember Me
                    </label>
                  </div>
                  <button type="button" className="text-sm font-semibold text-medical-blue hover:underline">
                    Forgot Password?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-medical-blue hover:bg-medical-blue/90 text-white font-bold text-lg rounded-xl shadow-lg shadow-medical-blue/20 transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </div>
                  ) : "Login"}
                </Button>
              </form>

              {/* Social Login */}
              <div className="mt-10">
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">Or Sign in with</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button className="w-14 h-14 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    <Facebook className="w-6 h-6 fill-current" />
                  </button>
                  <button className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </button>
                  <button className="w-14 h-14 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                    <Twitter className="w-6 h-6 fill-current" />
                  </button>
                </div>
              </div>

              <p className="mt-12 text-center text-[10px] text-slate-400 font-medium">
                © 2024 Digital Communique Private Limited. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
