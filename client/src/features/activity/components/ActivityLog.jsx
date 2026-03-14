import React, { useState, useEffect } from 'react';
import api from '../../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, MessageSquare, ArrowRight, Trash2, Edit3, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityItem = ({ activity }) => {
  const getIcon = () => {
    switch (activity.action) {
      case 'card:created': return <MessageSquare size={14} className="text-green-500" />;
      case 'card:moved': return <ArrowRight size={14} className="text-blue-500" />;
      case 'card:updated': return <Edit3 size={14} className="text-amber-500" />;
      case 'card:deleted': return <Trash2 size={14} className="text-red-500" />;
      case 'column:created': return <MessageSquare size={14} className="text-green-400" />;
      case 'member:invited': return <UserPlus size={14} className="text-purple-500" />;
      default: return <Clock size={14} />;
    }
  };

  const getMessage = () => {
    const actor = activity.actorId?.displayName || 'Someone';
    const payload = activity.payload || {};
    
    switch (activity.action) {
      case 'card:created': return <span><b>{actor}</b> created card <b>"{payload.title}"</b></span>;
      case 'card:moved': return <span><b>{actor}</b> moved card to a next stage</span>;
      case 'card:updated': return <span><b>{actor}</b> updated details of a card</span>;
      case 'card:deleted': return <span><b>{actor}</b> deleted card <b>"{payload.title}"</b></span>;
      case 'column:created': return <span><b>{actor}</b> created column <b>"{payload.title}"</b></span>;
      case 'member:invited': return <span><b>{actor}</b> invited <b>{payload.email}</b></span>;
      default: return <span><b>{actor}</b> performed {activity.action}</span>;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
      <div className="mt-0.5 p-2 rounded-lg bg-white/5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-main leading-relaxed">
          {getMessage()}
        </p>
        <span className="text-[10px] text-text-muted mt-1 block font-medium">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

const ActivityLog = ({ isOpen, onClose, boardId }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && boardId) {
      const fetchActivity = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/boards/${boardId}/activity`);
          setActivities(res.data.activities);
        } catch (err) {
          console.error('Failed to fetch activity', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchActivity();
    }
  }, [isOpen, boardId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-80 bg-surface/90 border-l border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Activity Log</h3>
              <button 
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activities.length > 0 ? (
                activities.map(act => (
                  <ActivityItem key={act._id} activity={act} />
                ))
              ) : (
                <div className="text-center py-10">
                  <Clock className="h-8 w-8 text-text-muted/20 mx-auto mb-3" />
                  <p className="text-xs text-text-muted">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityLog;
