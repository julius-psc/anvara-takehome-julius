'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { IconArrowRight, IconBriefcase, IconBuildingStore } from '@tabler/icons-react';
import loginImg from '@/app/assets/login-img.jpg';
import { authClient } from '@/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const PASSWORD = 'password';

type Role = 'sponsor' | 'publisher';

const ROLES: {
  key: Role;
  label: string;
  email: string;
  blurb: string;
  icon: typeof IconBriefcase;
}[] = [
  {
    key: 'sponsor',
    label: 'Sponsor',
    email: 'sponsor@example.com',
    blurb: 'Browse inventory and run campaigns',
    icon: IconBriefcase,
  },
  {
    key: 'publisher',
    label: 'Publisher',
    email: 'publisher@example.com',
    blurb: 'List slots and fill placements',
    icon: IconBuildingStore,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [role, setRole] = useState<Role>('sponsor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const active = ROLES.find((r) => r.key === role)!;
  const pillTransition = reduceMotion
    ? { type: 'tween' as const, duration: 0, ease: EASE_IN_OUT }
    : { type: 'tween' as const, duration: 0.2, ease: EASE_IN_OUT };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email(
      {
        email: active.email,
        password: PASSWORD,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async (ctx) => {
          try {
            const userId = ctx.data?.user?.id;
            if (userId) {
              const roleRes = await fetch(`${API_URL}/api/auth/role/${userId}`);
              const roleData = await roleRes.json();
              if (roleData.role === 'sponsor') {
                router.push('/dashboard/sponsor');
              } else if (roleData.role === 'publisher') {
                router.push('/dashboard/publisher');
              } else {
                router.push('/');
              }
            } else {
              router.push('/');
            }
          } catch {
            router.push('/');
          }
        },
        onError: (ctx) => {
          setError(ctx.error.message || 'Login failed');
          setLoading(false);
        },
      }
    );

    if (signInError) {
      setError(signInError.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] lg:grid-cols-2">
      {/* Form column */}
      <div className="relative flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight text-(--color-foreground) text-balance">
            Sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-(--color-muted) text-pretty">
            Demo access — pick a role and jump straight into the marketplace.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-(--color-error)/25 bg-(--color-error-soft) px-3.5 py-3 text-sm text-(--color-error)"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-(--color-foreground)">Continue as</p>
              <LayoutGroup id="login-role">
                <div
                  role="tablist"
                  aria-label="Account role"
                  className="grid grid-cols-2 gap-1 rounded-xl border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-sm)"
                >
                  {ROLES.map(({ key, label, icon: Icon }) => {
                    const selected = role === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setRole(key)}
                        className="relative flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-1"
                      >
                        {selected && (
                          <motion.span
                            layoutId="login-role-pill"
                            initial={false}
                            className="pointer-events-none absolute inset-0 rounded-lg bg-(--color-surface-hover) shadow-(--shadow-sm)"
                            transition={pillTransition}
                          />
                        )}
                        <Icon
                          size={16}
                          stroke={1.8}
                          className={`relative z-10 ${selected ? 'text-(--color-accent)' : 'text-(--color-subtle)'}`}
                          aria-hidden
                        />
                        <span
                          className={`relative z-10 transition-colors ${
                            selected ? 'text-(--color-foreground)' : 'text-(--color-muted)'
                          }`}
                        >
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
              <p className="mt-2.5 text-xs leading-relaxed text-(--color-subtle)">{active.blurb}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-(--color-foreground)">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  readOnly
                  value={active.email}
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-hover) px-3.5 py-2.5 font-mono text-sm text-(--color-foreground) outline-none"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-(--color-foreground)">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  readOnly
                  value={PASSWORD}
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-hover) px-3.5 py-2.5 text-sm text-(--color-foreground) outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary pressable flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? (
                'Signing in…'
              ) : (
                <>
                  Continue as {active.label}
                  <IconArrowRight size={16} stroke={2} aria-hidden />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-(--color-muted)">
            <Link
              href="/"
              className="font-medium text-(--color-accent) transition-colors duration-150 ease-out hover:text-(--color-accent-hover)"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>

      {/* Brand panel — desktop */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={loginImg}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/15"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-end p-10 xl:p-14">
          <p className="max-w-sm text-2xl font-semibold tracking-tight text-white text-balance xl:text-3xl">
            One marketplace for sponsors and publishers.
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75 text-pretty">
            Transparent inventory, clear budgets, placements that actually fill.
          </p>
        </div>
      </div>
    </div>
  );
}
