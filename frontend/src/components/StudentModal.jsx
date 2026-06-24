import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const empty = { student_code: '', full_name: '', email: '', phone: '', date_of_birth: '', gender: '', class_name: '', address: '', status: 'active' }

export default function StudentModal({ open, onClose, onSave, student }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm(student ? { ...empty, ...student } : empty)
  }, [student, open])

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e) => { e.preventDefault(); onSave(form) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{student ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
          {[
            ['student_code', 'Mã học sinh', 'text', true],
            ['full_name', 'Họ và tên', 'text', true],
            ['email', 'Email', 'email', true],
            ['phone', 'Số điện thoại', 'tel'],
            ['date_of_birth', 'Ngày sinh', 'date'],
            ['class_name', 'Lớp', 'text'],
            ['address', 'Địa chỉ', 'text'],
          ].map(([k, label, type, req]) => (
            <div key={k} className={k === 'address' ? 'sm:col-span-2' : ''}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}{req && ' *'}</label>
              <input className="input" type={type} required={req} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Giới tính</label>
            <select className="input" value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
              <option value="">Chọn</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Đang học</option><option value="inactive">Ngừng học</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn-primary">{student ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
