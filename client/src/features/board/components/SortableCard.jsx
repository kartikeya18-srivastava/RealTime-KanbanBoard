import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlignLeft, MessageSquare, Clock } from 'lucide-react';

export const CardContainer = ({
  card,
  onClick,
  isOverlay = false,
  attributes,
  listeners,
  setNodeRef,
  style,
  presence = []
}) => {
  if (!card) return null;

  const typingUsers = presence.filter(p => p.cardId === card._id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative w-full cursor-pointer rounded-xl border border-border-subtle bg-surface p-4 shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md active:scale-[0.98] ${isOverlay ? 'shadow-2xl ring-2 ring-blue-500/20 rotate-1' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-main leading-tight group-hover:text-blue-500 transition-colors">
          {card.title}
        </h3>
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-1 ml-2">
            <div className="flex space-x-0.5">
              <span className="h-1 w-1 rounded-full bg-blue-500 animate-bounce" />
              <span className="h-1 w-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1 w-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {card.description && (
        <p className="mb-4 line-clamp-2 text-xs text-text-muted leading-relaxed">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-text-muted">
          {card.description && <AlignLeft size={12} title="This card has a description" />}
        </div>

        <div className="flex -space-x-1.5 overflow-hidden">
          {(card.assignees || []).map((as) => (
            <div
              key={as._id}
              className="h-5 w-5 rounded-full border border-background bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
              title={as.displayName}
            >
              {as.displayName ? as.displayName[0].toUpperCase() : '?'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SortableCard = (props) => {
  const { card } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card._id,
    data: {
      type: 'card',
      card
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
        className="h-24 w-full rounded-xl border-2 border-dashed border-blue-500/30 bg-blue-500/5"
      />
    );
  }

  return (
    <CardContainer
      {...props}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      style={style}
    />
  );
};

export default SortableCard;
