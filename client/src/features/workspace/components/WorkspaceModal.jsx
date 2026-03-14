import React, { useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import api from '../../../api/client';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle } from 'lucide-react';

const workspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
});

const WorkspaceModal = ({ isOpen, onClose, setWorkspaces, setActiveWorkspace }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(workspaceSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-');
      const res = await api.post('/workspaces', { ...data, slug });
      setWorkspaces(prev => [...prev, res.data.workspace]);
      setActiveWorkspace(res.data.workspace);
      onClose();
      toast.success('Workspace created!');
    } catch (err) {
      toast.error('Failed to create workspace');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Workspace">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
          <input 
            {...register('name')}
            autoFocus
            className={`w-full rounded-xl bg-[#0f172a] border p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.name ? 'border-red-500' : 'border-[#334155]'
            }`}
            placeholder="Engineering Team"
          />
          {errors.name && (
            <p className="mt-1 flex items-center text-xs text-red-500">
              <AlertCircle size={12} className="mr-1" />
              {errors.name.message}
            </p>
          )}
        </div>
        <button 
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>
    </Modal>
  );
};

export default WorkspaceModal;
