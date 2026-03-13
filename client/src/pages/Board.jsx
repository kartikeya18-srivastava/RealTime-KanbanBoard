import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import BoardHeader from '../components/BoardHeader';
import BoardContent from '../components/BoardContent';
import WorkspaceModal from '../components/modals/WorkspaceModal';
import BoardModal from '../components/modals/BoardModal';
import ColumnModal from '../components/modals/ColumnModal';
import CardModal from '../components/modals/CardModal';
import CardDetailModal from '../components/modals/CardDetailModal';
import useBoardData from '../hooks/useBoardData';
import useBoardSockets from '../hooks/useBoardSockets';
import api from '../api/client';
import { toast } from 'react-hot-toast';
import { Loader2, Kanban } from 'lucide-react';

const Board = () => {
  const {
    workspaces, setWorkspaces,
    activeWorkspace, setActiveWorkspace,
    boards, setBoards,
    activeBoard, setActiveBoard,
    boardData, setBoardData,
    isLoading,
    deleteBoard,
    deleteWorkspace
  } = useBoardData();

  const { presence, handleMoveCard } = useBoardSockets(activeBoard?._id, setBoardData);

  // Modal Visibility States
  const [modals, setModals] = useState({
    workspace: false,
    board: false,
    column: false,
    card: false,
    detail: false
  });

  const [targetColumnId, setTargetColumnId] = useState(null);
  const [activeCardDetail, setActiveCardDetail] = useState(null);

  const handleDeleteColumn = async (columnId) => {
    if (!activeBoard || !window.confirm('Delete this column? All cards in it will be lost if not moved first.')) return;
    try {
      await api.delete(`/boards/${activeBoard._id}/columns/${columnId}`);
      toast.success('Column deleted');
    } catch (err) {
      toast.error('Failed to delete column');
    }
  };

  const toggleModal = (key, isOpen, extra = {}) => {
    setModals(prev => ({ ...prev, [key]: isOpen }));
    if (extra.columnId) setTargetColumnId(extra.columnId);
    if (extra.card) setActiveCardDetail(extra.card);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background text-text-main overflow-hidden">
      <Sidebar 
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        boards={boards}
        activeBoard={activeBoard}
        setActiveBoard={setActiveBoard}
        onAddBoard={() => toggleModal('board', true)}
        onAddWorkspace={() => toggleModal('workspace', true)}
        onDeleteWorkspace={deleteWorkspace}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <BoardHeader 
          activeBoard={activeBoard}
          activeWorkspace={activeWorkspace}
          presence={presence}
          onDeleteBoard={deleteBoard}
        />

        <div className="flex-1 overflow-x-auto p-8">
          {boardData ? (
            <BoardContent 
              board={boardData.board}
              columns={boardData.columns}
              cards={boardData.cards}
              presence={presence}
              onMoveCard={handleMoveCard}
              onMoveColumn={(id, index) => toast('Column move feature coming soon')}
              onAddCard={(columnId) => toggleModal('card', true, { columnId })}
              onAddColumn={() => toggleModal('column', true)}
              onDeleteColumn={handleDeleteColumn}
              onCardClick={(card) => toggleModal('detail', true, { card })}
            />
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-text-muted">
               <div className="h-20 w-20 rounded-full bg-surface flex items-center justify-center mb-4 border border-border-subtle">
                  <Kanban size={40} className="text-text-muted/50" />
               </div>
               <p className="max-w-xs text-center">
                 {activeWorkspace 
                   ? 'The selected workspace has no boards, or no board is selected. Select a board from the sidebar.'
                   : 'Please select a workspace from the sidebar to view your boards.'}
               </p>
            </div>
          )}
        </div>
      </main>

      <WorkspaceModal 
        isOpen={modals.workspace}
        onClose={() => toggleModal('workspace', false)}
        setWorkspaces={setWorkspaces}
        setActiveWorkspace={setActiveWorkspace}
      />

      <BoardModal 
        isOpen={modals.board}
        onClose={() => toggleModal('board', false)}
        activeWorkspaceId={activeWorkspace?._id}
        setBoards={setBoards}
        setActiveBoard={setActiveBoard}
      />

      <ColumnModal
        isOpen={modals.column}
        onClose={() => toggleModal('column', false)}
        activeBoardId={activeBoard?._id}
      />

      <CardModal
        isOpen={modals.card}
        onClose={() => toggleModal('card', false)}
        activeBoardId={activeBoard?._id}
        targetColumnId={targetColumnId}
      />

      <CardDetailModal
        isOpen={modals.detail}
        onClose={() => toggleModal('detail', false)}
        card={activeCardDetail}
      />
    </div>
  );
};

export default Board;
