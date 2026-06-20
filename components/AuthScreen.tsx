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
    <div className="min-h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)' }}>
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="relative h-[520px] rounded-2xl shadow-2xl overflow-hidden bg-white border border-gray-100">
          {/* Left door (text panel) */}
          <motion.div
            animate={{
              x: mode === 'signup' ? '0%' : '100%',
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 z-20"
          >
            <div
              className="h-full flex flex-col items-center justify-center p-8 text-center"
              style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h1
                    className="text-3xl lg:text-4xl font-bold mb-3 leading-tight"
                    style={{
                      fontFamily: "'Georgia', serif",
                      color: '#22c55e',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="text-white/60 text-base max-w-[240px] mx-auto">
                    {mode === 'signup'
                      ? 'Start managing your finances today.'
                      : 'Sign in to continue to your dashboard.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right door (form panel) */}
          <motion.div
            animate={{
              x: mode === 'signup' ? '0%' : '-100%',
            }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 z-20"
          >
            <div className="h-full flex items-center justify-center p-6 lg:p-8">
              <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                  {mode === 'signup' ? (
                    <motion.div
                      key="signup"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign Up</h2>
                      <p className="text-sm text-gray-500 mb-5">Create your account to get started.</p>
                      <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} className="space-y-3">
                        <Input label="Name" {...registerSignUp('name')} error={signUpErrors.name?.message} />
                        <Input label="Email" {...registerSignUp('email')} error={signUpErrors.email?.message} />
                        <Input label="Password" type="password" {...registerSignUp('password')} error={signUpErrors.password?.message} />
                        <Input label="Confirm Password" type="password" {...registerSignUp('confirmPassword')} error={signUpErrors.confirmPassword?.message} />

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" disabled={loading} className="w-full">
                          {loading ? 'Creating...' : 'Create Account'}
                        </Button>

                        <p className="text-sm text-gray-500 text-center pt-1">
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="signin"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
                      <p className="text-sm text-gray-500 mb-5">Welcome back! Please enter your details.</p>
                      <form onSubmit={handleSubmitSignIn(onSubmitSignIn)} className="space-y-3">
                        <Input label="Email" {...registerSignIn('email')} error={signInErrors.email?.message} />
                        <Input label="Password" type="password" {...registerSignIn('password')} error={signInErrors.password?.message} />

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" disabled={loading} className="w-full">
                          {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <p className="text-sm text-gray-500 text-center pt-1">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Background - visible through gaps during animation */}
          <div className="absolute inset-0 bg-gray-50 z-10" />
        </div>
      </div>
    </div>
  );
}
