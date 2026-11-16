'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Artículos', icon: 'M4 5h16M4 12h16M4 19h10' },
  { href: '/admin/nuevo', label: 'Nuevo artículo', icon: 'M12 5v14M5 12h14' },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: 'M4 19V10M10 19V4M16 19v-7M22 19H2' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-slate-100 text-slate-900">{children}</div>
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0">
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="font-bold text-lg tracking-tight">Santiago<span className="text-red-600"> Post</span></div>
          <div className="text-xs text-slate-400 mt-0.5">Panel de administración</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(n.href) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon d={n.icon} />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200 space-y-1">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100">
            <Icon d="M10 14L21 3M21 3h-6M21 3v6M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5" />
            Ver sitio
          </a>
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100">
            <Icon d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 min-w-0">{children}</main>
    </div>
  )
}
