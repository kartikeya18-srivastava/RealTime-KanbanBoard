import { useState, useEffect } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

export const useBoardDnd = (columns, cards, onMoveCard, onMoveColumn) => {
  const [localColumns, setLocalColumns] = useState(columns || []);
  const [localCards, setLocalCards] = useState(cards || []);
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);

  useEffect(() => {
    setLocalColumns(columns);
    setLocalCards(cards);
  }, [columns, cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setActiveType(active.data.current?.type);
  };

  const onDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === 'card';
    const isOverACard = over.data.current?.type === 'card';
    const isOverAColumn = over.data.current?.type === 'column';

    if (!isActiveACard) return;

    // Moving between columns or reordering within column
    if (isActiveACard && (isOverACard || isOverAColumn)) {
      const activeCard = localCards.find(c => c._id === activeId);
      const overCard = isOverACard ? localCards.find(c => c._id === overId) : null;
      const overColumnId = isOverAColumn ? overId : overCard?.columnId;

      if (!activeCard || !overColumnId) return;

      if (activeCard.columnId !== overColumnId) {
        setLocalCards((prev) => {
          const activeIndex = prev.findIndex((c) => c._id === activeId);
          const newCards = [...prev];
          newCards[activeIndex] = { ...activeCard, columnId: overColumnId };
          
          // If over a card, place it at that card's position
          if (isOverACard) {
             const overIndex = prev.findIndex(c => c._id === overId);
             return arrayMove(newCards, activeIndex, overIndex);
          }
          return newCards;
        });
      } else if (isOverACard && activeId !== overId) {
        // Reordering within the same column
        setLocalCards((prev) => {
          const oldIndex = prev.findIndex((c) => c._id === activeId);
          const newIndex = prev.findIndex((c) => c._id === overId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    }
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeType === 'column') {
      if (activeId !== overId) {
        const oldIndex = localColumns.findIndex((c) => c._id === activeId);
        const newIndex = localColumns.findIndex((c) => c._id === overId);
        const newColumns = arrayMove(localColumns, oldIndex, newIndex);
        setLocalColumns(newColumns);
        onMoveColumn(activeId, newIndex);
      }
    }

    if (activeType === 'card') {
        const activeCard = localCards.find(c => c._id === activeId);
        const overData = over.data.current;
        let toColumnId = activeCard.columnId;
        let newPosition = 0;

        if (overData?.type === 'column') {
          toColumnId = overId;
        } else if (overData?.type === 'card') {
           toColumnId = overData.card.columnId;
           const columnCards = localCards
              .filter(c => c.columnId === toColumnId)
              .sort((a,b) => a.position - b.position);
           newPosition = columnCards.findIndex(c => c._id === overId);
        }

        onMoveCard({
           cardId: activeId,
           fromColumnId: activeCard.columnId,
           toColumnId,
           newPosition,
           clientVersion: activeCard.version
        });
    }
  };

  return {
    localColumns,
    localCards,
    activeId,
    activeType,
    sensors,
    onDragStart,
    onDragOver,
    onDragEnd
  };
};
