'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { authClient } from '@mgc/auth/client'
import { useRouter } from '@/i18n/navigation'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError(false)
    try {
      const result =
        mode === 'login'
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name || (email.split('@')[0] ?? 'player') })
      if (result.error) {
        setError(true)
        return
      }
      router.push('/me')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm space-y-4">
      <h1 className="text-xl font-semibold">{mode === 'login' ? t('loginTitle') : t('registerTitle')}</h1>
      {mode === 'register' && (
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">{t('name')}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-sm text-zinc-400">{t('email')}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-zinc-400">{t('password')}</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
      </label>
      {error && <p className="text-sm text-red-400">{t('error')}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-500 py-2.5 font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {mode === 'login' ? t('submitLogin') : t('submitRegister')}
      </button>
      <p className="text-center text-sm text-zinc-400">
        {mode === 'login' ? t('switchToRegister') : t('switchToLogin')}
      </p>
    </form>
  )
}
