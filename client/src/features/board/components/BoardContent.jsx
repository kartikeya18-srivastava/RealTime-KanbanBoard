import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableColumn, { ColumnContainer } from './SortableColumn';
import SortableCard, { CardContainer } from './SortableCard';
import { createPortal } from 'react-dom';
import { useBoardDnd } from '../hooks/useBoardDnd';

const BoardContent = ({
  board,
  columns = [],
  cards = [],
  onMoveCard,
  onMoveColumn,
  onAddCard,
  onAddColumn,
  onDeleteColumn,
  onCardClick,
  presence = []
}) => {
  const {
    localColumns,
    localCards,
    activeId,
    activeType,
    sensors,
    onDragStart,
    onDragOver,
    onDragEnd
  } = useBoardDnd(columns, cards, onMoveCard, onMoveColumn);

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full min-h-0 items-start space-x-6 pb-4 overflow-x-auto scrollbar-hide">
        <SortableContext items={localColumns.map(c => c._id)} strategy={horizontalListSortingStrategy}>
          {localColumns.map((col) => (
            <SortableColumn
              key={col._id}
              column={col}
              presence={presence}
              cards={localCards.filter(c => c.columnId === col._id).sort((a, b) => a.position - b.position)}
              onAddCard={onAddCard}
              onCardClick={onCardClick}
              onDeleteColumn={onDeleteColumn}
            />
          ))}
        </SortableContext>

        <button
          className="flex h-12 w-80 items-center justify-center rounded-2xl border-2 border-dashed border-border-subtle bg-transparent text-text-muted hover:border-blue-500/50 hover:text-blue-500 transition-all flex-shrink-0 font-medium"
          onClick={onAddColumn}
        >
          Add Column
        </button>
      </div>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId && activeType === 'column' ? (
            <ColumnContainer
              column={localColumns.find(c => c._id === activeId)}
              cards={localCards.filter(c => c.columnId === activeId)}
              isOverlay={true}
            />
          ) : null}
          {activeId && activeType === 'card' ? (
            <CardContainer
              card={localCards.find(c => c._id === activeId)}
              isOverlay={true}
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default BoardContent;
