'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, signInSchema, SignUpInput, SignInInput } from '../lib/validation/auth';
import { z } from 'zod';
import { supabase } from '../lib/supabase/client';
import { useRouter } from 'next/navigation';
import Input from './Input';
import Button from './Button';

type Mode = 'signup' | 'signin';

const containerStyle = 'min-h-screen flex items-center justify-center';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signup');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forms
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

  // Clip paths for two diagonal states and center horizontal
  const clipUp = 'polygon(0 0, 100% 0, 100% 40%, 0 60%)'; // beige top
  const clipCenter = 'polygon(0 0, 100% 0, 100% 50%, 0 50%)';
  const clipDown = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'; // beige bottom (we'll show reversed zones using layering)

  // We'll animate between two polygon shapes representing the beige zone.
  const [clipPath, setClipPath] = useState<string>(clipUp);
  useEffect(() => {
    // Animate the clip path sequence when mode changes
    if (mode === 'signup') {
      // beige upper -> ensure clipUp
      setClipPath(clipCenter);
      const t = setTimeout(() => setClipPath(clipUp), 450);
      return () => clearTimeout(t);
    } else {
      // signin: animate to center then to down
      setClipPath(clipCenter);
      const t = setTimeout(() => setClipPath('polygon(0 40%, 100% 60%, 100% 100%, 0 100%)'), 450);
      return () => clearTimeout(t);
    }
  }, [mode]);

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
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
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
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${containerStyle} bg-transparent`}>
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={false}
          animate={{ clipPath }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          style={{ background: '#EDE6D6', width: '100%', height: '100%' }}
          className="absolute inset-0"
        />
        <div
          style={{ background: '#FFF9F2' }}
          className="absolute inset-0"
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left area / background heading - visible in signin state */}
          <div className="hidden md:flex items-center justify-center">
            <AnimatePresence>
              {mode === 'signin' && (
                <motion.h1
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.08, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className="text-6xl md:text-7xl font-semibold text-black tracking-tight select-none"
                  style={{ fontSize: '5rem', lineHeight: 1 }}
                >
                  Welcome back
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {/* Card area */}
          <div className="flex items-center justify-center">
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full md:w-[480px] bg-[#FBF6EC] rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                {mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
              </h2>

              <div>
                <AnimatePresence mode="wait">
                  {mode === 'signup' ? (
                    <motion.form
                      key="signup"
                      onSubmit={handleSubmitSignUp(onSubmitSignUp)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-4"
                    >
                      <Input label="Name" {...registerSignUp('name')} error={signUpErrors.name?.message} />
                      <Input label="Email" {...registerSignUp('email')} error={signUpErrors.email?.message} />
                      <Input label="Password" type="password" {...registerSignUp('password')} error={signUpErrors.password?.message} />
                      <Input label="Confirm Password" type="password" {...registerSignUp('confirmPassword')} error={signUpErrors.confirmPassword?.message} />

                      {error && <p className="text-sm text-red-600">{error}</p>}

                      <div>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create account'}
                        </Button>
                      </div>

                      <div className="text-sm text-black/70">
                        <span>Already have an account? </span>
                        <button
                          type="button"
                          className="font-semibold text-black underline-offset-2"
                          onClick={() => {
                            setMode('signin');
                            resetSignIn();
                            setError(null);
                          }}
                        >
                          Sign In
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signin"
                      onSubmit={handleSubmitSignIn(onSubmitSignIn)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                      className="space-y-4"
                    >
                      <Input label="Email" {...registerSignIn('email')} error={signInErrors.email?.message} />
                      <Input label="Password" type="password" {...registerSignIn('password')} error={signInErrors.password?.message} />

                      {error && <p className="text-sm text-red-600">{error}</p>}

                      <div>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                      </div>

                      <div className="text-sm text-black/70">
                        <span>Don't have an account? </span>
                        <button
                          type="button"
                          className="font-semibold text-black underline-offset-2"
                          onClick={() => {
                            setMode('signup');
                            resetSignUp();
                            setError(null);
                          }}
                        >
                          Sign Up
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
