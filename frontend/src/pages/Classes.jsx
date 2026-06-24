import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, School } from 'lucide-react'
import toast from 'react-hot-toast'
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from '../api/client'

const empty = { class_code: '', class_name: '', grade: '', teacher_name: '', capacity: 40 }

export default function Classes() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(empty)
  const [edit, setEdit] = useState(null)
  const [show, setShow] = useState(false)

  const load = () => getClassrooms().then(r => setList(r.data)).catch(() => toast.error('Lỗi tải dữ liệu'))
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      if (edit) { await updateClassroom(edit.id, form); toast.success('Cập nhật thành công') }
      else { await createClassroom(form); toast.success('Thêm lớp thành công') }
      setShow(false); setEdit(null); setForm(empty); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Lỗi') }
  }

  const openEdit = (c) => { setEdit(c); setForm({ class_code: c.class_code, class_name: c.class_name, grade: c.grade || '', teacher_name: c.teacher_name || '', capacity: c.capacity }); setShow(true) }
  const remove = async (id) => { if (!confirm('Xóa lớp?')) return; await deleteClassroom(id); toast.success('Đã xóa'); load() }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="page-title">Quản lý lớp học</h2><p className="page-sub">{list.length} lớp</p></div>
        <button className="btn-primary" onClick={() => { setEdit(null); setForm(empty); setShow(true) }}><Plus size={18} /> Thêm lớp</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map(c => (
          <div key={c.id} className="card group relative">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-500"><School size={20} /></div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button className="rounded-lg p-2 hover:bg-primary-50" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                <button className="rounded-lg p-2 hover:bg-red-50" onClick={() => remove(c.id)}><Trash2 size={15} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-800">{c.class_name}</h3>
            <p className="text-sm text-slate-500">Mã: {c.class_code} · Khối: {c.grade || '—'}</p>
            <p className="mt-1 text-sm text-slate-500">GV: {c.teacher_name || '—'}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">{c.student_count}/{c.capacity} HS</span>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-primary-500" style={{width: `${Math.min((c.student_count/c.capacity)*100,100)}%`}} /></div>
            </div>
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShow(false)} />
          <form onSubmit={save} className="relative w-full max-w-md space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold">{edit ? 'Sửa lớp' : 'Thêm lớp'}</h3>
            {[['class_code','Mã lớp'],['class_name','Tên lớp'],['grade','Khối'],['teacher_name','Giáo viên']].map(([k,l]) => (
              <div key={k}><label className="mb-1 block text-sm font-medium">{l}</label>
                <input className="input" required={k==='class_code'||k==='class_name'} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} /></div>
            ))}
            <div><label className="mb-1 block text-sm font-medium">Sĩ số tối đa</label>
              <input className="input" type="number" value={form.capacity} onChange={e => setForm({...form,capacity:+e.target.value})} /></div>
            <div className="flex justify-end gap-3"><button type="button" className="btn-secondary" onClick={() => setShow(false)}>Hủy</button><button className="btn-primary">Lưu</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
