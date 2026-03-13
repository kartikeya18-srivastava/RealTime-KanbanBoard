import React from 'react';
import { Trash2 } from 'lucide-react';

const BoardHeader = ({ activeBoard, activeWorkspace, presence, onDeleteBoard }) => {
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

      <div className="flex items-center -space-x-2 overflow-hidden">
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
