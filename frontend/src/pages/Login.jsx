import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { login as apiLogin, register as apiRegister } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '', full_name: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (mode === 'login') {
        const { data } = await apiLogin(form)
        login(data.token, data.user)
        toast.success('Đăng nhập thành công')
        nav('/')
      } else {
        await apiRegister(form)
        toast.success('Đăng ký thành công, mời đăng nhập')
        setMode('login')
        setForm({ username: form.username, password: '', full_name: '' })
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Có lỗi xảy ra') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500"><GraduationCap size={28} /></div>
          <h1 className="text-2xl font-bold text-slate-800">EduManager</h1>
          <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản mới'}</p>
        </div>
        <div className="mb-6 flex rounded-xl bg-slate-50 p-1">
          {['login', 'register'].map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === m ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500'}`}>
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div><label className="mb-1.5 block text-sm font-medium text-slate-600">Họ và tên</label>
              <input className="input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required /></div>
          )}
          <div><label className="mb-1.5 block text-sm font-medium text-slate-600">Tài khoản</label>
            <input className="input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required /></div>
          <div><label className="mb-1.5 block text-sm font-medium text-slate-600">Mật khẩu</label>
            <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Tối thiểu 6 ký tự" required /></div>
          <button className="btn-primary w-full !py-3" disabled={loading}>
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>
        {mode === 'login' && <p className="mt-4 text-center text-xs text-slate-400">Admin: admin / admin123</p>}
      </div>
    </div>
  )
}
