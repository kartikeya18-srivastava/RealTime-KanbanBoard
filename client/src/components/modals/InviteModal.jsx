import React, { useState } from 'react';
import Modal from '../Modal';
import api from '../../api/client';
import { toast } from 'react-hot-toast';
import { Loader2, Mail, UserPlus } from 'lucide-react';

const InviteModal = ({ isOpen, onClose, workspaceId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    
    setIsLoading(true);
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, { email, role });
      toast.success('Invitation sent successfully');
      setEmail('');
      setRole('editor');
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send invitation';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">User Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text-main placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">Role</label>
          <div className="grid grid-cols-2 gap-3">
            {['editor', 'viewer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                  role === r
                    ? 'bg-blue-600/20 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                    : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                }`}
                disabled={isLoading}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <UserPlus size={18} />
              <span>Send Invitation</span>
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};

export default InviteModal;
