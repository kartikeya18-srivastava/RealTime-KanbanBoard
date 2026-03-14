import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader2, Kanban, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1e293b]/50 p-8 shadow-2xl backdrop-blur-xl border border-[#334155]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
            <Kanban className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue to your workspace
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div className="space-y-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-slate-500'}`} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`block w-full rounded-xl border-0 bg-[#0f172a]/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ${
                    errors.email ? 'ring-red-500' : 'ring-[#334155]'
                  } placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 flex items-center text-xs text-red-500">
                  <AlertCircle size={12} className="mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-slate-500'}`} />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className={`block w-full rounded-xl border-0 bg-[#0f172a]/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ${
                    errors.password ? 'ring-red-500' : 'ring-[#334155]'
                  } placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                  placeholder="Password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 flex items-center text-xs text-red-500">
                  <AlertCircle size={12} className="mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-500 hover:text-blue-400"
            >
              Sign up today
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
