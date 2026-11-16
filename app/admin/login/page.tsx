'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
    })
    if (res.ok) router.push('/admin')
    else setError((await res.json().catch(() => ({})))?.error || 'Error')
    setLoading(false)
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-slate-100">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 w-full max-w-sm">
        <div className="text-center font-bold text-2xl tracking-tight">Santiago<span className="text-red-600"> Post</span></div>
        <h1 className="text-lg font-semibold text-center mt-3 text-slate-800">Panel de administración</h1>
        <p className="text-slate-500 text-sm text-center mt-1">Ingresa para gestionar el contenido.</p>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
          className="w-full mt-6 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button disabled={loading} className="w-full mt-4 rounded-xl bg-red-600 text-white font-semibold px-5 py-3 hover:bg-red-700 disabled:opacity-50">
          {loading ? '…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
