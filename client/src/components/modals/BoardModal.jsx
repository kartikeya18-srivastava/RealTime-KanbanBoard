import React, { useState } from 'react';
import Modal from '../Modal';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

const BoardModal = ({ isOpen, onClose, activeWorkspaceId, setBoards, setActiveBoard }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await api.post('/boards', { workspaceId: activeWorkspaceId, title });
      setBoards(prev => [...prev, res.data.board]);
      setActiveBoard(res.data.board);
      onClose();
      setTitle('');
      toast.success('Board created!');
    } catch (err) {
      toast.error('Failed to create board');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Board">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
          <input 
            autoFocus
            className="w-full rounded-xl bg-[#0f172a] border border-[#334155] p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Project Roadmap"
          />
        </div>
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors">
          Create Board
        </button>
      </form>
    </Modal>
  );
};

export default BoardModal;
