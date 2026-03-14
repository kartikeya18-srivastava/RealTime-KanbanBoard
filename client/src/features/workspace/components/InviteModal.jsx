import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import api from '../../../api/client';
import { toast } from 'react-hot-toast';
import { Loader2, Mail, UserPlus, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['editor', 'viewer']),
});

const InviteModal = ({ isOpen, onClose, workspaceId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'editor',
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post(`/workspaces/${workspaceId}/invite`, data);
      toast.success('Invitation sent successfully');
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">User Email</label>
          <div className="relative">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? 'text-red-500' : 'text-slate-500'}`} />
            <input
              {...register('email')}
              type="email"
              placeholder="colleague@example.com"
              className={`w-full bg-slate-900/50 border rounded-xl py-3 pl-10 pr-4 text-text-main placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                errors.email ? 'border-red-500' : 'border-white/10'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="mt-1 flex items-center text-xs text-red-500">
              <AlertCircle size={12} className="mr-1" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">Role</label>
          <div className="grid grid-cols-2 gap-3">
            {['editor', 'viewer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setValue('role', r)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                  selectedRole === r
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
