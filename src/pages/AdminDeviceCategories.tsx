import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { useToast, ToastContainer } from '../components/Toast'
import { motion } from 'framer-motion'
import { Settings, Plus, Trash2, Edit3, Tag } from 'lucide-react'

type Category = {
  id: string
  name: string
  description?: string
}

export default function AdminDeviceCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { toasts, removeToast, showSuccess, showError } = useToast()

  useEffect(() => {
    setCategories([
      { id: 'c1', name: 'Apple', description: 'iPhone, iPad, etc.' },
      { id: 'c2', name: 'Samsung', description: 'Galaxy phones and tablets' },
      { id: 'c3', name: 'Tecno', description: 'Tecno devices' },
    ])
  }, [])

  const addCategory = () => {
    const n = name.trim()
    if (!n) return showError('Category name is required')
    const id = `c${categories.length + 1}`
    setCategories([{ id, name: n, description: description.trim() }, ...categories])
    setName('')
    setDescription('')
    showSuccess('Category added')
  }

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    showSuccess('Category removed')
  }

  const renameCategory = (id: string, newName: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c))
    showSuccess('Category updated')
  }

  return (
    <Layout requireAuth>
      <div className="container-fluid">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <Settings size={20} />
            <h1 className="h4 m-0">Admin: Device Categories</h1>
          </div>
        </div>

        <div className="modern-card p-3 mb-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Category Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="form-control" placeholder="e.g. Apple" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Description (optional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className="form-control" placeholder="Short description" />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" onClick={addCategory}><Plus size={16} /> Add</button>
            </div>
          </div>
        </div>

        <div className="row g-3">
          {categories.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="col-12 col-md-6 col-lg-4">
              <div className="modern-card p-3 d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Tag size={18} />
                  <strong>{c.name}</strong>
                </div>
                <div className="text-secondary" style={{ minHeight: 24 }}>{c.description || '—'}</div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => {
                    const nn = prompt('Rename category', c.name)
                    if (nn !== null) renameCategory(c.id, nn)
                  }}><Edit3 size={14} /> Edit</button>
                  <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => removeCategory(c.id)}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </motion.div>
          ))}
          {categories.length === 0 && (
            <div className="col-12"><div className="modern-card p-4 text-center text-secondary">No categories yet</div></div>
          )}
        </div>
      </div>
    </Layout>
  )
}