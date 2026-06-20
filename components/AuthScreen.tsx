'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, signInSchema, SignUpInput, SignInInput } from '../lib/validation/auth';
import { supabase } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';
import Input from './Input';
import Button from './Button';

type Mode = 'signup' | 'signin';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signup');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: signUpErrors },
    reset: resetSignUp,
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: signInErrors },
    reset: resetSignIn,
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmitSignUp(data: SignUpInput) {
    setError(null);
    setLoading(true);
    try {
      const { error: supError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name } },
      });
      if (supError) {
        setError(supError.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitSignIn(data: SignInInput) {
    setError(null);
    setLoading(true);
    try {
      const { error: supError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (supError) {
        setError(supError.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)' }}>
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[540px] border border-gray-100">
          {/* Dark text panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${mode}`}
              initial={{ opacity: 0, x: mode === 'signup' ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? 40 : -40 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className={`relative flex flex-col items-center justify-center p-12 text-center ${
                mode === 'signup' ? 'md:order-1' : 'md:order-2'
              }`}
              style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)' }}
            >
              <h1
                className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                style={{
                  fontFamily: "'Georgia', serif",
                  color: '#22c55e',
                  letterSpacing: '-0.02em',
                }}
              >
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-white/60 text-lg max-w-xs">
                {mode === 'signup'
                  ? 'Start managing your finances today.'
                  : 'Sign in to continue to your dashboard.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`form-${mode}`}
              initial={{ opacity: 0, x: mode === 'signup' ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -40 : 40 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className={`flex items-center justify-center p-10 ${
                mode === 'signup' ? 'md:order-2' : 'md:order-1'
              }`}
            >
              <div className="w-full max-w-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {mode === 'signup' ? 'Sign Up' : 'Sign In'}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {mode === 'signup'
                    ? 'Create your account to get started.'
                    : 'Welcome back! Please enter your details.'}
                </p>

                {mode === 'signup' ? (
                  <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} className="space-y-4">
                    <Input label="Name" {...registerSignUp('name')} error={signUpErrors.name?.message} />
                    <Input label="Email" {...registerSignUp('email')} error={signUpErrors.email?.message} />
                    <Input label="Password" type="password" {...registerSignUp('password')} error={signUpErrors.password?.message} />
                    <Input label="Confirm Password" type="password" {...registerSignUp('confirmPassword')} error={signUpErrors.confirmPassword?.message} />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Creating...' : 'Create Account'}
                    </Button>

                    <p className="text-sm text-gray-500 text-center">
                      Already have an account?{' '}
                      <button
                        type="button"
                        className="font-semibold text-green-600 hover:text-green-700"
                        onClick={() => { setMode('signin'); resetSignIn(); setError(null); }}
                      >
                        Sign In
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitSignIn(onSubmitSignIn)} className="space-y-4">
                    <Input label="Email" {...registerSignIn('email')} error={signInErrors.email?.message} />
                    <Input label="Password" type="password" {...registerSignIn('password')} error={signInErrors.password?.message} />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <p className="text-sm text-gray-500 text-center">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        className="font-semibold text-green-600 hover:text-green-700"
                        onClick={() => { setMode('signup'); resetSignUp(); setError(null); }}
                      >
                        Sign Up
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
