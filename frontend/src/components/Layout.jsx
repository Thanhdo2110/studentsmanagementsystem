import { NavLink, Outlet } from 'react-router-dom'
import { GraduationCap, LayoutDashboard, Users, School, Menu, X, Moon, Sun, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/students', icon: Users, label: 'Học sinh' },
  { to: '/classes', icon: School, label: 'Lớp học' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const { user, logout } = useAuth()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen lg:flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-100 bg-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><GraduationCap size={22} /></div>
          <div><p className="font-semibold text-slate-800">EduManager</p><p className="text-xs text-slate-400">Quản lý học sinh</p></div>
          <button className="ml-auto text-slate-400 lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="space-y-1 p-4">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              {({ isActive }) => <><Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />{label}</>}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-slate-100 bg-slate-50/50 p-4">
          <p className="truncate text-sm font-medium text-slate-700">{user?.full_name || user?.username}</p>
          <p className="text-xs capitalize text-slate-400">{user?.role}</p>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-100 bg-white/90 px-4 backdrop-blur-md lg:px-8">
          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 lg:hidden" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <h1 className="flex-1 text-base font-semibold text-slate-700">Hệ thống Quản lý Học sinh</h1>
          <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" onClick={logout} title="Đăng xuất"><LogOut size={18} /></button>
        </header>
        <main className="flex-1 p-5 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
