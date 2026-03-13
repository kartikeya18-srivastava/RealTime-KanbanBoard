import React, { useState } from 'react';
import Modal from '../Modal';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

const CardModal = ({ isOpen, onClose, activeBoardId, targetColumnId }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/cards', { 
        boardId: activeBoardId, 
        columnId: targetColumnId, 
        title 
      });
      onClose();
      setTitle('');
      toast.success('Card added!');
    } catch (err) {
      toast.error('Failed to add card');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Card Title</label>
          <input 
            autoFocus
            className="w-full rounded-xl bg-[#0f172a] border border-[#334155] p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Handle concurrent edits..."
          />
        </div>
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors">
          Create Card
        </button>
      </form>
    </Modal>
  );
};

export default CardModal;
