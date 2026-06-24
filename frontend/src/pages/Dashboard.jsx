import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, School, Activity } from 'lucide-react'
import { getStats, getActivities } from '../api/client'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}><Icon size={22} strokeWidth={1.8} /></div>
    <div><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-800">{value}</p></div>
  </div>
)

const actionLabel = { login: 'Đăng nhập', create_student: 'Thêm HS', update_student: 'Sửa HS', delete_student: 'Xóa HS',
  create_class: 'Thêm lớp', update_class: 'Sửa lớp', delete_class: 'Xóa lớp', export_csv: 'Xuất CSV', import_csv: 'Nhập CSV' }

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, classes: [], recent_students: [], classroom_count: 0 })
  const [logs, setLogs] = useState([])

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {})
    getActivities().then(r => setLogs(r.data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div><h2 className="page-title">Tổng quan</h2><p className="page-sub">Thống kê hệ thống</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Tổng học sinh" value={stats.total} color="bg-sky-50 text-sky-500" />
        <StatCard icon={UserCheck} label="Đang học" value={stats.active} color="bg-emerald-50 text-emerald-500" />
        <StatCard icon={UserX} label="Ngừng học" value={stats.inactive} color="bg-amber-50 text-amber-500" />
        <StatCard icon={School} label="Lớp học" value={stats.classroom_count || stats.classes.length} color="bg-violet-50 text-violet-500" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {stats.classes.length > 0 && (
          <div className="card">
            <h3 className="mb-4 font-semibold text-slate-800">Phân bổ theo lớp</h3>
            <div className="space-y-3">{stats.classes.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-24 truncate text-sm font-medium">{c.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary-400" style={{ width: `${stats.total ? (c.count/stats.total)*100 : 0}%` }} />
                </div>
                <span className="w-8 text-right text-sm text-slate-500">{c.count}</span>
              </div>
            ))}</div>
          </div>
        )}
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-800"><Activity size={18} className="text-primary-500" /> Nhật ký hoạt động</h3>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {logs.length === 0 ? <p className="text-sm text-slate-400">Chưa có hoạt động</p> : logs.map(l => (
              <div key={l.id} className="flex items-start gap-3 text-sm">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                <div><p className="font-medium text-slate-700">{actionLabel[l.action] || l.action} — {l.detail}</p>
                  <p className="text-xs text-slate-400">{l.username} · {new Date(l.created_at).toLocaleString('vi-VN')}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {stats.recent_students?.length > 0 && (
        <div className="card">
          <h3 className="mb-4 font-semibold text-slate-800">Học sinh mới nhất</h3>
          <div className="divide-y divide-slate-50">{stats.recent_students.map(s => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <div><p className="font-medium text-slate-700">{s.full_name}</p><p className="text-sm text-slate-400">{s.student_code} · {s.class_name || 'Chưa có lớp'}</p></div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status==='active'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{s.status==='active'?'Đang học':'Ngừng học'}</span>
            </div>
          ))}</div>
        </div>
      )}
    </div>
  )
}
