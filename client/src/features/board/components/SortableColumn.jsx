import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Plus, Trash2 } from 'lucide-react';
import SortableCard from './SortableCard';
import api from '../../../api/client';
import { toast } from 'react-hot-toast';

export const ColumnContainer = ({
  column,
  cards = [],
  onAddCard,
  onCardClick,
  onDeleteColumn,
  presence = [],
  isOverlay = false,
  attributes,
  listeners,
  setNodeRef,
  style
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const handleUpdate = async () => {
    if (!title.trim() || title === column.title) {
      setIsEditing(false);
      setTitle(column.title);
      return;
    }
    try {
      await api.patch(`/boards/${column.boardId}/columns/${column._id}`, { title });
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update column title');
    }
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex h-full w-80 shrink-0 flex-col rounded-2xl bg-surface/40 border border-border-subtle/50 backdrop-blur-sm ${isOverlay ? 'shadow-2xl ring-2 ring-blue-500/20 shadow-blue-500/10' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center justify-between p-4 ${isOverlay ? 'cursor-grabbing' : 'cursor-grab'} active:cursor-grabbing group`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              className="text-sm font-bold text-text-main bg-background border border-blue-500/50 rounded px-2 py-1 outline-none w-full"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={e => e.key === 'Enter' && handleUpdate()}
            />
          ) : (
            <h2
              onClick={() => !isOverlay && setIsEditing(true)}
              className="text-sm font-bold text-text-main tracking-wide uppercase truncate cursor-pointer hover:text-blue-500 transition-colors"
            >
              {column.title}
            </h2>
          )}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-border-subtle text-[10px] font-bold text-text-muted">
            {cards.length}
          </span>
        </div>
        {!isOverlay && (
          <div className="flex items-center space-x-1 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteColumn(column._id); }}
              className="p-1 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <button className="p-1 text-text-muted hover:text-text-main rounded-md hover:bg-border-subtle transition-colors">
              <MoreVertical size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4 scrollbar-hide">
        <SortableContext items={cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <SortableCard
              key={card._id}
              card={card}
              presence={presence}
              onClick={() => onCardClick?.(card)}
            />
          ))}
        </SortableContext>

        {!isOverlay && (
          <button
            onClick={() => onAddCard(column._id)}
            className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-border-subtle p-3 text-sm font-medium text-text-muted transition-all hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-500"
          >
            <Plus size={16} className="mr-2" />
            Add Card
          </button>
        )}
      </div>
    </div>
  );
};

const SortableColumn = (props) => {
  const { column } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column._id,
    data: {
      type: 'column',
      column
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex h-full w-80 shrink-0 flex-col rounded-2xl border-2 border-dashed border-blue-500/20 bg-blue-500/5 opacity-50"
      />
    );
  }

  return (
    <ColumnContainer
      {...props}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
    />
  );
};

export default SortableColumn;
