import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { getStudents, createStudent, updateStudent, deleteStudent, getClasses, exportStudents, importStudents } from '../api/client'
import StudentModal from '../components/StudentModal'

export default function Students() {
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [className, setClassName] = useState('')
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getStudents({ page, per_page: 10, search, status, class_name: className })
      setStudents(data.students)
      setTotal(data.total)
    } catch { toast.error('Không tải được dữ liệu') }
    finally { setLoading(false) }
  }, [page, search, status, className])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { getClasses().then(r => setClasses(r.data)).catch(() => {}) }, [])

  const save = async (form) => {
    try {
      if (edit) { await updateStudent(edit.id, form); toast.success('Cập nhật thành công') }
      else { await createStudent(form); toast.success('Thêm thành công') }
      setModal(false); setEdit(null); fetch()
    } catch (e) { toast.error(e.response?.data?.error || 'Có lỗi xảy ra') }
  }

  const remove = async (id) => {
    if (!confirm('Xóa học sinh này?')) return
    try { await deleteStudent(id); toast.success('Đã xóa'); fetch() }
    catch { toast.error('Không xóa được') }
  }

  const handleExport = async () => {
    try {
      const { data } = await exportStudents()
      const url = URL.createObjectURL(data)
      const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click()
      toast.success('Xuất CSV thành công')
    } catch { toast.error('Xuất thất bại') }
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const { data } = await importStudents(file)
      toast.success(`Nhập ${data.imported} học sinh`)
      if (data.errors?.length) toast.error(`${data.errors.length} lỗi`)
      fetch()
    } catch { toast.error('Nhập thất bại') }
    e.target.value = ''
  }

  const pages = Math.ceil(total / 10) || 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Danh sách học sinh</h2>
          <p className="page-sub">{total} học sinh</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={handleExport}><Download size={18} /> Xuất CSV</button>
          <label className="btn-secondary cursor-pointer"><Upload size={18} /> Nhập CSV<input type="file" accept=".csv" className="hidden" onChange={handleImport} /></label>
          <button className="btn-primary" onClick={() => { setEdit(null); setModal(true) }}>
            <Plus size={18} /> Thêm học sinh
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="input pl-10" placeholder="Tìm theo tên, mã, email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="input lg:w-40" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">Tất cả TT</option><option value="active">Đang học</option><option value="inactive">Ngừng học</option>
          </select>
          <select className="input lg:w-40" value={className} onChange={e => { setClassName(e.target.value); setPage(1) }}>
            <option value="">Tất cả lớp</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Mã HS</th>
                <th className="px-4 py-3 font-medium">Họ tên</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Lớp</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Đang tải...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Không có dữ liệu</td></tr>
              ) : students.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-primary-500">{s.student_code}</td>
                  <td className="px-4 py-3 text-slate-700">{s.full_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-500">{s.email}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{s.class_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {s.status === 'active' ? 'Đang học' : 'Ngừng học'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-primary-50 hover:text-primary-600" onClick={() => { setEdit(s); setModal(true) }}><Pencil size={16} /></button>
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" onClick={() => remove(s.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Trang {page}/{pages}</p>
            <div className="flex gap-2">
              <button className="btn-secondary !px-3" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={18} /></button>
              <button className="btn-secondary !px-3" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      <StudentModal open={modal} onClose={() => { setModal(false); setEdit(null) }} onSave={save} student={edit} />
    </div>
  )
}
