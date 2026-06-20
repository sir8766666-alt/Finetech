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

  const headingText = mode === 'signup' ? 'Create your account' : 'Welcome back';
  const subText = mode === 'signup'
    ? 'Start managing your finances today.'
    : 'Sign in to continue to your dashboard.';
  const linkText = mode === 'signup'
    ? { prefix: 'Already have an account? ', action: 'Sign In' }
    : { prefix: "Don't have an account? ", action: 'Sign Up' };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F2]">
      <div className="w-full max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl overflow-hidden min-h-[520px]">
          {/* Text side - animates position based on mode */}
          <motion.div
            layout
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className={`relative flex flex-col items-center justify-center p-12 ${
              mode === 'signup' ? 'md:order-1' : 'md:order-2'
            }`}
            style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <h1
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{
                    fontFamily: "'Georgia', serif",
                    color: '#22c55e',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {headingText}
                </h1>
                <p className="text-white/70 text-lg max-w-xs mx-auto">
                  {subText}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Form side */}
          <motion.div
            layout
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className={`flex items-center justify-center p-10 ${
              mode === 'signup' ? 'md:order-2' : 'md:order-1'
            }`}
          >
            <div className="w-full max-w-sm">
              <AnimatePresence mode="wait">
                {mode === 'signup' ? (
                  <motion.form
                    key="signup"
                    onSubmit={handleSubmitSignUp(onSubmitSignUp)}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
                      <p className="text-sm text-gray-500 mt-1">Create your account to get started.</p>
                    </div>
                    <Input label="Name" {...registerSignUp('name')} error={signUpErrors.name?.message} />
                    <Input label="Email" {...registerSignUp('email')} error={signUpErrors.email?.message} />
                    <Input label="Password" type="password" {...registerSignUp('password')} error={signUpErrors.password?.message} />
                    <Input label="Confirm Password" type="password" {...registerSignUp('confirmPassword')} error={signUpErrors.confirmPassword?.message} />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Account'}
                    </Button>

                    <p className="text-sm text-gray-500">
                      {linkText.prefix}
                      <button
                        type="button"
                        className="font-semibold text-green-600 hover:text-green-700"
                        onClick={() => {
                          setMode('signin');
                          resetSignIn();
                          setError(null);
                        }}
                      >
                        {linkText.action}
                      </button>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signin"
                    onSubmit={handleSubmitSignIn(onSubmitSignIn)}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                      <p className="text-sm text-gray-500 mt-1">Welcome back! Please enter your details.</p>
                    </div>
                    <Input label="Email" {...registerSignIn('email')} error={signInErrors.email?.message} />
                    <Input label="Password" type="password" {...registerSignIn('password')} error={signInErrors.password?.message} />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <p className="text-sm text-gray-500">
                      {linkText.prefix}
                      <button
                        type="button"
                        className="font-semibold text-green-600 hover:text-green-700"
                        onClick={() => {
                          setMode('signup');
                          resetSignUp();
                          setError(null);
                        }}
                      >
                        {linkText.action}
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
