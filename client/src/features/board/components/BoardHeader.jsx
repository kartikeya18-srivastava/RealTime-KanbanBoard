import React from 'react';
import { Trash2, Search, Bell } from 'lucide-react';

const BoardHeader = ({ activeBoard, activeWorkspace, presence, onDeleteBoard, onToggleActivity, searchQuery, setSearchQuery }) => {
  return (
    <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
           <h1 className="text-xl font-bold truncate max-w-[200px] text-text-main">
             {activeBoard?.title || 'Select a Board'}
           </h1>
           {activeBoard && (
              <button 
                onClick={() => onDeleteBoard(activeBoard._id)}
                className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Board"
              >
                <Trash2 size={16} />
              </button>
           )}
        </div>
        {activeWorkspace && (
          <span className="hidden sm:inline-block text-xs font-medium px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
            {activeWorkspace.name}
          </span>
        )}
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search cards, labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button 
          onClick={onToggleActivity}
          className="relative p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-xl transition-all active:scale-95"
          title="Activity Log"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full border-2 border-background" />
        </button>
        {presence.slice(0, 5).map((p, i) => (
          <div 
            key={p.userId} 
            className="h-8 w-8 rounded-full border-2 border-background bg-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-transparent transition-all hover:ring-blue-500 cursor-pointer text-white"
            title={p.displayName}
            style={{ zIndex: presence.length - i }}
          >
            {p.displayName ? p.displayName[0].toUpperCase() : '?'}
          </div>
        ))}
        {presence.length > 5 && (
          <div className="h-8 w-8 rounded-full border-2 border-background bg-surface flex items-center justify-center text-[10px] font-bold z-0 text-text-muted">
            +{presence.length - 5}
          </div>
        )}
      </div>
    </header>
  );
};

export default BoardHeader;
