import React from 'react';
import { Layout, Plus, Settings, ChevronRight, Hash, LogOut, Kanban, Trash2, Sun, Moon, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ 
  workspaces, 
  activeWorkspace, 
  setActiveWorkspace, 
  boards, 
  activeBoard, 
  setActiveBoard,
  onAddBoard,
  onAddWorkspace,
  onDeleteWorkspace,
  onInvite
}) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen w-64 flex-col bg-surface text-text-muted border-r border-border-subtle">
      <div className="flex h-16 items-center px-6 border-b border-border-subtle">
        <Kanban className="h-6 w-6 text-blue-500 mr-2" />
        <span className="text-xl font-bold text-text-main tracking-tight">Kanter</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workspaces</span>
            <button onClick={onAddWorkspace} className="hover:text-text-main"><Plus size={14} /></button>
          </div>
          <div className="space-y-1">
            {workspaces.map(ws => (
              <div key={ws._id} className="group relative">
                <button
                  onClick={() => setActiveWorkspace(ws)}
                  className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors pr-10 ${
                    activeWorkspace?._id === ws._id 
                      ? 'bg-blue-600/10 text-blue-500' 
                      : 'hover:bg-border-subtle hover:text-text-main'
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full mr-3 ${activeWorkspace?._id === ws._id ? 'bg-blue-500' : 'bg-slate-600'}`} />
                  <span className="truncate">{ws.name}</span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {ws.members.find(m => m.userId === user?._id)?.role === 'owner' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onInvite(ws); }}
                      className="p-1.5 text-slate-500 hover:text-blue-500 rounded-md hover:bg-blue-500/10"
                      title="Invite Member"
                    >
                      <UserPlus size={12} />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteWorkspace(ws._id); }}
                    className="p-1.5 text-slate-500 hover:text-red-500 rounded-md hover:bg-red-500/10"
                    title="Delete Workspace"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeWorkspace && (
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Boards</span>
              <button onClick={onAddBoard} className="hover:text-text-main"><Plus size={14} /></button>
            </div>
            <div className="space-y-1">
              {boards.filter(b => b.workspaceId === activeWorkspace._id).map(board => (
                <button
                  key={board._id}
                  onClick={() => setActiveBoard(board)}
                  className={`flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeBoard?._id === board._id 
                      ? 'bg-border-subtle text-text-main shadow-sm' 
                      : 'hover:bg-border-subtle/50 hover:text-text-main'
                  }`}
                >
                  <Hash size={14} className="mr-3 text-slate-500" />
                  {board.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-border-subtle">
        <div className="flex items-center px-2 py-3 mb-2 justify-between">
          <div className="flex items-center overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-3 shrink-0">
              {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-text-main truncate">{user?.displayName}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <button 
              onClick={toggleTheme}
              className="p-1.5 text-text-muted hover:text-text-main rounded-lg hover:bg-border-subtle transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-border-subtle transition-colors">
              <Settings size={14} />
            </button>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-text-muted rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut size={14} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
