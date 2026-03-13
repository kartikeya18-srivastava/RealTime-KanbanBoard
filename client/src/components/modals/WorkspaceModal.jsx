import React, { useState } from 'react';
import Modal from '../Modal';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

const WorkspaceModal = ({ isOpen, onClose, setWorkspaces, setActiveWorkspace }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
      const res = await api.post('/workspaces', { name, slug });
      setWorkspaces(prev => [...prev, res.data.workspace]);
      setActiveWorkspace(res.data.workspace);
      onClose();
      setName('');
      toast.success('Workspace created!');
    } catch (err) {
      toast.error('Failed to create workspace');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
          <input 
            autoFocus
            className="w-full rounded-xl bg-[#0f172a] border border-[#334155] p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Engineering Team"
          />
        </div>
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors">
          Create Workspace
        </button>
      </form>
    </Modal>
  );
};

export default WorkspaceModal;
