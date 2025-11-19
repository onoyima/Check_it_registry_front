import React, { useMemo } from 'react'
import { Layout } from '../components/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, ChevronRight, CheckCheck, Plus, Send, BadgeCheck } from 'lucide-react'

type ChatMessage = {
  id: string
  type: 'incoming' | 'outgoing'
  text: string
  time: string
}

export default function MarketplaceThread() {
  const { id } = useParams()
  const navigate = useNavigate()

  const messages: ChatMessage[] = useMemo(() => ([
    { id: 'm1', type: 'incoming', text: "Hi, is this still available? What's the battery health like?", time: '10:30 AM' },
    { id: 'm2', type: 'outgoing', text: "Yes, it's available! The battery health is at 92%.", time: '10:31 AM' },
    { id: 'm3', type: 'incoming', text: 'Great. Would you consider $750?', time: '10:32 AM' },
  ]), [])

  return (
    <Layout requireAuth>
      <div className="container-fluid" style={{ maxWidth: 900 }}>
        {/* Top bar */}
        <div className="d-flex align-items-center justify-content-between py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-link text-decoration-none" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={22} style={{ color: 'var(--text-primary)' }} />
            </button>
            <div className="position-relative" style={{ width: 40, height: 40 }}>
              <div className="rounded-circle" style={{ width: 40, height: 40, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAOjBsaIvOI3rCPYOi4znJd8fWuq0dVlpIySS0STRTbiy0NJgypMSvbtk3AfU66oaR2I-5lfU1y7NuMxevWc6bpluU7oBPOkJWv4YYqsc1HIlEEgHTw30xeE1uR_Vd-it7JV0Z3UyoiwY_1oQoddFTqvp14R49icXPBNg0ofptbZgXVaCT12ZG2kdk40Cp_3rGkhml99Tq9pJrcdnM4mQbuGv4fwQmSPx12RN2k-mVD-PrgfrR3Hf39t7yrNZYfO9Hid-kxC4-dbtgi)' }} />
              <span className="position-absolute" style={{ bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: 'var(--success-500)', border: '2px solid var(--bg-primary)' }} />
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>John Doe</div>
              <div style={{ color: 'var(--success-500)', fontSize: 12 }}>Online</div>
            </div>
          </div>
          <button className="btn btn-link text-decoration-none" aria-label="More">
            <MoreVertical size={22} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {/* Context banner */}
        <div className="d-flex align-items-center gap-3 py-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
          <div className="rounded-3" style={{ width: 48, height: 48, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCMoez0ZInMNzkVBDx42Hzd9AU1az2I2eZvd9opyJei4OASfd23x9UCyVV-tWaN8y-SkBBWUFpBa2IshLMG5LrUKM2SAHL6C0iVZ8E7IyAl5rgPRqwrsXNNUS8eJS1N2XmcVw8aw7lxM9fVQZB22hrxwEdG8ismiboO5vzI2Qw6gY9U6Jz5HSslVkGXru6av1BXRWOnzuodyXn6MWEDEBN6TqDDBDOdQCv2fqXj7ccr6zwOdhzowURydeAmYxG_yKeN4DmvPbqEeLZw)' }} />
          <div className="flex-grow-1">
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>iPhone 13 Pro - 256GB</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>$800</div>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {/* Chat window */}
        <div className="py-3">
          <div className="text-center" style={{ color: 'var(--text-secondary)', fontSize: 13 }}>--- Today ---</div>
          {messages.map(m => (
            <div key={m.id} className={`d-flex ${m.type === 'outgoing' ? 'justify-content-end' : ''} align-items-end gap-2 px-2 pt-2`}>
              {m.type === 'incoming' && (
                <div className="rounded-circle" style={{ width: 32, height: 32, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuABMOvzQcQ42rbSsP-BbGfOVCzKsyM3Bl-TqP2yUAofJpD4T55chbUtVe8o7wNsDEv5q58dcDZWPKjai3RXfdEeE-L2KKUSNhaefHqXo7Zg4iCdPzsMGCKycc4Obo-VkiPI6yuF0GUrZQGSs4KxggXYtVfjaD3woj13Mv5sl49NF6t1L0tUVph9kr7tQPD4vkrl2PMGkDlQzPRVQFJzBLxBciNivds0X7x1v3SYGLQP0_9kph6fG7nPYnR-ZYiXX65KTxf7BlESMRMt)' }} />
              )}
              <div className="d-flex flex-column" style={{ maxWidth: '80%' }}>
                <div className={`px-3 py-2 rounded-3 ${m.type === 'outgoing' ? 'text-white' : ''}`}
                  style={{ background: m.type === 'outgoing' ? 'var(--primary-600)' : 'var(--gray-200)', color: m.type === 'outgoing' ? '#fff' : 'var(--text-primary)' }}>
                  {m.text}
                </div>
                <div className={`d-flex ${m.type === 'outgoing' ? 'justify-content-end' : ''} align-items-center gap-1`}>
                  <small style={{ color: 'var(--text-secondary)' }}>{m.time}</small>
                  {m.type === 'outgoing' && <CheckCheck size={14} style={{ color: 'var(--primary-600)' }} />}
                </div>
              </div>
            </div>
          ))}

          {/* Offer card */}
          <div className="d-flex justify-content-end px-2 pt-2">
            <div className="rounded-3 p-3" style={{ maxWidth: '80%', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 14 }}>You sent an offer</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 22 }}>$780.00</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Offer expires in 24 hours.</div>
              <div className="mt-2 d-flex gap-2">
                <button className="btn btn-secondary btn-sm">Withdraw Offer</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer input */}
        <div className="d-flex align-items-center gap-2 border-top py-3" style={{ borderColor: 'var(--border-color)', position: 'sticky', bottom: 0, background: 'var(--bg-primary)' }}>
          <button className="btn btn-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }} aria-label="Add">
            <Plus size={20} />
          </button>
          <input type="text" className="form-control rounded-pill" placeholder="Type a message..." />
          <button className="btn btn-gradient-primary d-flex align-items-center gap-2">
            <Send size={18} /> Send
          </button>
        </div>
      </div>
    </Layout>
  )
}