import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import api from '../../../api/client';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Calendar, Tag, User, Eye, Edit3, X, Clock, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CardDetailModal = ({ isOpen, onClose, card, onTyping }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      setLabels(card.labels || []);
    }
  }, [card]);

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.patch(`/cards/${card._id}`, {
        title,
        description,
        dueDate: dueDate || null,
        labels,
        clientVersion: card.version
      });
      setIsEditing(false);
      toast.success('Card updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleTypingInternal = (e) => {
    setDescription(e.target.value);
    if (onTyping) onTyping(card._id);
  };

  const addLabel = () => {
    if (!newLabel.trim()) return;
    if (labels.includes(newLabel.trim())) return;
    setLabels([...labels, newLabel.trim()]);
    setNewLabel('');
  };

  const removeLabel = (labelToRemove) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return;
    try {
      await api.delete(`/cards/${card._id}`);
      onClose();
      toast.success('Card deleted');
    } catch (err) {
      toast.error('Failed to delete card');
    }
  };

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Card' : card.title} maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Header Tabs/Actions */}
        <div className="flex justify-between items-center bg-white/5 p-1.5 rounded-xl border border-white/5">
           <div className="flex space-x-1">
             <button 
               onClick={() => setIsEditing(false)}
               className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${!isEditing ? 'bg-blue-600 text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
             >
               <Eye size={14} />
               <span>Display</span>
             </button>
             <button 
               onClick={() => setIsEditing(true)}
               className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${isEditing ? 'bg-blue-600 text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
             >
               <Edit3 size={14} />
               <span>Edit</span>
             </button>
           </div>
           
           <button 
             onClick={handleDelete}
             className="p-2 text-red-400/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-95"
             title="Delete Card"
           >
             <Trash2 size={16} />
           </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isEditing ? 'edit' : 'preview'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {isEditing ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Card Title</label>
                  <input 
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3.5 text-text-main font-medium focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-text-muted/20"
                    placeholder="Card title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1">Description (Markdown)</label>
                  <textarea 
                    rows={6}
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3.5 text-text-main focus:ring-1 focus:ring-blue-500/50 outline-none resize-none transition-all font-mono text-xs placeholder:text-text-muted/20"
                    value={description}
                    onChange={handleTypingInternal}
                    placeholder="Markdown supported..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1 flex items-center">
                       <Calendar size={12} className="mr-1.5 text-blue-500/70" /> Due Date
                     </label>
                     <input 
                        type="date"
                        className="w-full rounded-xl bg-white/5 border border-white/10 p-3.5 text-sm text-text-main focus:ring-1 focus:ring-blue-500/50 outline-none transition-all [color-scheme:dark]"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                     />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 ml-1 flex items-center">
                      <Tag size={12} className="mr-1.5 text-blue-500/70" /> Labels
                    </label>
                    <input 
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-3.5 text-sm text-text-main focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-text-muted/20"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                      placeholder="Add label..."
                    />
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <AnimatePresence>
                        {labels.map(l => (
                          <motion.span 
                            key={l}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="flex items-center bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border border-blue-500/10"
                          >
                            {l}
                            <button onClick={() => removeLabel(l)} className="ml-1.5 hover:text-white transition-colors">
                              <X size={10} />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Stats Row */}
                <div className="flex flex-wrap items-center gap-3">
                   {dueDate && (
                      <div className="flex items-center space-x-2 text-[10px] text-blue-400 font-bold bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
                         <Clock size={12} />
                         <span>{new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                   )}
                   
                   <div className="flex flex-wrap gap-1.5">
                      {labels.map(l => (
                        <span key={l} className="bg-white/5 text-text-muted text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase border border-white/5">
                          {l}
                        </span>
                      ))}
                   </div>
                </div>

                {/* Description Content */}
                <div className="prose prose-invert prose-sm max-w-none text-text-main/80 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">
                  {description ? (
                    <ReactMarkdown>{description}</ReactMarkdown>
                  ) : (
                    <p className="text-text-muted/30 italic text-xs">No description...</p>
                  )}
                </div>

                {/* Assignees Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3 ml-1">
                    <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Collaborators</h4>
                    {isEditing && (
                      <div className="relative group/select">
                        <select 
                          className="bg-white/5 border border-white/10 rounded-lg py-1 px-3 text-[10px] text-text-muted hover:text-text-main hover:bg-white/10 outline-none cursor-pointer transition-all"
                          onChange={async (e) => {
                            const userId = e.target.value;
                            if (!userId) return;
                            const user = activeBoard.workspaceId.members.find(m => m.userId._id === userId)?.userId;
                            if (user && !labels.some(a => a._id === userId)) {
                               const newAssignees = [...(card.assignees || []), user];
                               await api.patch(`/cards/${card._id}`, { assignees: newAssignees.map(a => a._id) });
                               toast.success('Assignee added');
                            }
                          }}
                          value=""
                        >
                          <option value="">Add member...</option>
                          {activeBoard?.workspaceId?.members?.map(m => (
                            <option key={m.userId._id} value={m.userId._id}>{m.userId.displayName}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {card.assignees?.map(as => (
                      <div key={as._id} className="flex items-center space-x-2.5 bg-white/5 p-1.5 pr-4 rounded-xl border border-white/5 group hover:border-blue-500/20 transition-all relative">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {as.displayName[0]}
                        </div>
                        <span className="text-xs font-semibold text-text-muted group-hover:text-text-main transition-colors">{as.displayName}</span>
                        {isEditing && (
                          <button 
                             onClick={async () => {
                               const newAssignees = card.assignees.filter(a => a._id !== as._id);
                               await api.patch(`/cards/${card._id}`, { assignees: newAssignees.map(a => a._id) });
                               toast.success('Assignee removed');
                             }}
                             className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                    {(!card.assignees || card.assignees.length === 0) && (
                       <p className="text-[10px] text-text-muted/30 italic ml-1">No one assigned yet...</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4"
          >
            <button 
              onClick={handleUpdate}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-md active:scale-[0.99]"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default CardDetailModal;
