import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Image as ImageIcon, 
  Layout as LayoutIcon, 
  MessageSquare, 
  Users 
} from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useToast } from '../../components/Toast';

interface ContentItem {
  id: number;
  type: 'team' | 'testimonial';
  name: string;
  role: string;
  image_url: string;
  content: string;
  display_order: number;
  active: boolean;
}

export default function LandingContentManager() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'team' | 'testimonial'>('team');
  const { showSuccess, showError } = useToast();

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const API_URL_BASE = API_BASE ? `${API_BASE}/api` : (import.meta.env.VITE_API_URL || '/api');
  const API_URL = `${API_URL_BASE}/landing-content`;
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        showError('Error', 'Failed to fetch content');
      }
    } catch (err) {
      showError('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const isNew = !editingItem.id;
      const url = isNew ? API_URL : `${API_URL}/${editingItem.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingItem)
      });

      if (res.ok) {
        showSuccess('Success', `Content ${isNew ? 'added' : 'updated'} successfully`);
        setIsModalOpen(false);
        fetchContent();
      } else {
        showError('Error', 'Failed to save content');
      }
    } catch (err) {
      showError('Error', 'An error occurred while saving');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showSuccess('Success', 'Content deleted successfully');
        fetchContent();
      } else {
        showError('Error', 'Failed to delete content');
      }
    } catch (err) {
      showError('Error', 'An error occurred while deleting');
    }
  };

  const openModal = (item?: ContentItem) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem({
        id: 0,
        type: activeTab,
        name: '',
        role: '',
        image_url: '',
        content: '',
        display_order: 0,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const filteredItems = (items || []).filter(item => item.type === activeTab);

  return (
    <Layout requireAuth>
      <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">Landing Page Content</h1>
          <p className="text-muted">Manage team members and testimonials</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="btn btn-primary d-flex align-items-center gap-2"
        >
          <Plus size={20} />
          Add New {activeTab === 'team' ? 'Member' : 'Testimonial'}
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'team' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveTab('team')}
              >
                <Users size={18} />
                Team Members
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'testimonial' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveTab('testimonial')}
              >
                <MessageSquare size={18} />
                Testimonials
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <LayoutIcon size={48} className="mb-3 opacity-25" />
              <p>No content found. Add some items to get started.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Name / Role</th>
                    <th>Content</th>
                    <th>Status</th>
                    <th>Order</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          {item.image_url ? (
                            <img 
                                src={item.image_url} 
                                alt={item.name} 
                                className="rounded-circle object-fit-cover"
                                style={{ width: 40, height: 40 }}
                            />
                          ) : (
                            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                <ImageIcon size={20} className="text-muted" />
                            </div>
                          )}
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <div className="text-muted small">{item.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div className="text-truncate" title={item.content}>
                            {item.content}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${item.active ? 'bg-success' : 'bg-secondary'}`}>
                            {item.active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>{item.display_order}</td>
                      <td className="text-end pe-4">
                        <button 
                          onClick={() => openModal(item)}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingItem && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-dialog modal-lg modal-dialog-centered"
            >
              <form onSubmit={handleSave} className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingItem.id ? 'Edit' : 'Add'} {activeTab === 'team' ? 'Team Member' : 'Testimonial'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        value={editingItem.name}
                        onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role / Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        value={editingItem.role}
                        onChange={e => setEditingItem({...editingItem, role: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Image URL</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        placeholder="https://..."
                        value={editingItem.image_url || ''}
                        onChange={e => setEditingItem({...editingItem, image_url: e.target.value})}
                      />
                      {editingItem.image_url && (
                        <div className="mt-2">
                            <img src={editingItem.image_url} alt="Preview" className="rounded border" style={{ height: 60 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        {activeTab === 'team' ? 'Bio / Description' : 'Quote / Content'}
                      </label>
                      <textarea 
                        className="form-control" 
                        rows={4} 
                        required
                        value={editingItem.content}
                        onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Display Order</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={editingItem.display_order}
                        onChange={e => setEditingItem({...editingItem, display_order: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label d-block">&nbsp;</label>
                      <div className="form-check form-switch mt-2">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={editingItem.active}
                          onChange={e => setEditingItem({...editingItem, active: e.target.checked})}
                        />
                        <label className="form-check-label">Active (Visible)</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </Layout>
  );
}
