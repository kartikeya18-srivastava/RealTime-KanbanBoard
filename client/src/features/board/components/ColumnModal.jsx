import React, { useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import api from '../../../api/client';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle } from 'lucide-react';

const columnSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(50, 'Title too long'),
});

const ColumnModal = ({ isOpen, onClose, activeBoardId }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(columnSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      await api.post(`/boards/${activeBoardId}/columns`, data);
      onClose();
      toast.success('Column added!');
    } catch (err) {
      toast.error('Failed to add column');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Column">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-400 mb-1">Column Title</label>
          <input 
            {...register('title')}
            autoFocus
            className={`w-full rounded-xl bg-[#0f172a] border p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.title ? 'border-red-500' : 'border-[#334155]'
            }`}
            placeholder="e.g. In Review"
          />
          {errors.title && (
            <p className="mt-1 flex items-center text-xs text-red-500">
              <AlertCircle size={12} className="mr-1" />
              {errors.title.message}
            </p>
          )}
        </div>
        <button 
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Column'}
        </button>
      </form>
    </Modal>
  );
};

export default ColumnModal;
