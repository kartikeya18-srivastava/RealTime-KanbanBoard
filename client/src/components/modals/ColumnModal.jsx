import React, { useState } from 'react';
import Modal from '../Modal';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

const ColumnModal = ({ isOpen, onClose, activeBoardId }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post(`/boards/${activeBoardId}/columns`, { title });
      onClose();
      setTitle('');
      toast.success('Column added!');
    } catch (err) {
      toast.error('Failed to add column');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Column">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Column Title</label>
          <input 
            autoFocus
            className="w-full rounded-xl bg-[#0f172a] border border-[#334155] p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. In Review"
          />
        </div>
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors">
          Add Column
        </button>
      </form>
    </Modal>
  );
};

export default ColumnModal;
