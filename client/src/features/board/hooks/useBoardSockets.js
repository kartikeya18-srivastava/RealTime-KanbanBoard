import { useEffect, useCallback } from 'react';
import useSocket from '../../../hooks/useSocket';
import { toast } from 'react-hot-toast';
import api from '../../../api/client';

const useBoardSockets = (activeBoardId, setBoardData) => {
  const { socket, presence, emitEvent, onEvent, offEvent } = useSocket(activeBoardId);

  useEffect(() => {
    if (!socket) return;

    onEvent('board:state', (data) => {
      setBoardData(data);
    });

    onEvent('card:created', ({ card }) => {
      setBoardData(prev => {
        if (!prev) return prev;
        if (prev.cards.find(c => c._id === card._id)) return prev;
        return { ...prev, cards: [...prev.cards, card] };
      });
    });

    onEvent('card:updated', ({ card: updatedCard }) => {
      setBoardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map(c => c._id === updatedCard._id ? updatedCard : c)
        };
      });
    });

    onEvent('card:deleted', ({ cardId }) => {
      setBoardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.filter(c => c._id !== cardId)
        };
      });
    });

    onEvent('card:moved', ({ cardId, fromColumnId, toColumnId, newPosition, version }) => {
      setBoardData(prev => {
        if (!prev) return prev;
        const newCards = prev.cards.map(c => {
          if (c._id === cardId) {
            return { ...c, columnId: toColumnId, position: newPosition, version };
          }
          return c;
        });
        return { ...prev, cards: newCards };
      });
    });

    onEvent('column:created', ({ column }) => {
      setBoardData(prev => {
        if (!prev) return prev;
        const columns = prev.columns || [];
        if (columns.find(c => c._id === column._id)) return prev;
        return {
          ...prev,
          columns: [...columns, { ...column, cards: [] }]
        };
      });
    });

    onEvent('column:deleted', ({ columnId }) => {
      setBoardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: (prev.columns || []).filter(c => c._id !== columnId),
          cards: (prev.cards || []).filter(c => c.columnId !== columnId)
        };
      });
    });

    onEvent('card:rejected', ({ cardId }) => {
      toast.error('Sync conflict! Reverting change.');
      if (activeBoardId) {
        api.get(`/boards/${activeBoardId}`).then(res => setBoardData(res.data));
      }
    });

    return () => {
      offEvent('board:state');
      offEvent('card:created');
      offEvent('card:updated');
      offEvent('card:deleted');
      offEvent('card:moved');
      offEvent('card:rejected');
    };
  }, [socket, onEvent, offEvent, activeBoardId, setBoardData]);

  const handleMoveCard = useCallback(({ cardId, fromColumnId, toColumnId, newPosition, clientVersion }) => {
    emitEvent('card:move', {
      cardId,
      fromColumnId,
      toColumnId,
      newPosition,
      clientVersion
    });
  }, [emitEvent]);

  const handleTyping = useCallback((cardId) => {
    emitEvent('user:typing', { cardId });
  }, [emitEvent]);

  return {
    socket,
    presence,
    handleMoveCard,
    handleTyping
  };
};

export default useBoardSockets;
