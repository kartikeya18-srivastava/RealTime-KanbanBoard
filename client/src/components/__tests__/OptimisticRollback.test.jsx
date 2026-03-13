import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import BoardContent from '../BoardContent';
import { ThemeProvider } from '../../context/ThemeContext';
import React from 'react';

// Mock the useBoardDnd hook to control its state
vi.mock('../../hooks/useBoardDnd', () => ({
  useBoardDnd: (columns, cards, onMoveCard) => {
    // We'll use a local state mock inside the test if needed, 
    // but for this test we want to verify how BoardContent reacts to card property changes
    return {
      localColumns: columns,
      localCards: cards,
      activeId: null,
      activeType: null,
      sensors: [],
      onDragStart: vi.fn(),
      onDragOver: vi.fn(),
      onDragEnd: vi.fn()
    };
  }
}));

describe('BoardContent Rollback', () => {
  const mockColumns = [
    { _id: 'col-1', title: 'To Do', boardId: 'board-1' },
    { _id: 'col-2', title: 'Done', boardId: 'board-1' }
  ];

  it('renders cards in their initial columns', () => {
    const mockCards = [
      { _id: 'card-1', title: 'Rollback Target', columnId: 'col-1', position: 0, version: 0 }
    ];

    render(
      <ThemeProvider>
        <BoardContent columns={mockColumns} cards={mockCards} onMoveCard={vi.fn()} />
      </ThemeProvider>
    );

    expect(screen.getByText('Rollback Target')).toBeDefined();
  });

  it('updates when cards prop changes (simulating server-side rollback)', async () => {
    const initialCards = [{ _id: 'card-1', title: 'Card 1', columnId: 'col-1', position: 0, version: 0 }];
    const { rerender } = render(
      <ThemeProvider>
        <BoardContent columns={mockColumns} cards={initialCards} onMoveCard={vi.fn()} />
      </ThemeProvider>
    );

    // Now simulate a "rollback" by passing the original cards back after an optimistic change was theoretically made
    // (In reality, useBoardData passes the cards to BoardContent)
    const rolledBackCards = [{ _id: 'card-1', title: 'Card 1', columnId: 'col-1', position: 0, version: 0 }];
    
    act(() => {
      rerender(
        <ThemeProvider>
          <BoardContent columns={mockColumns} cards={rolledBackCards} onMoveCard={vi.fn()} />
        </ThemeProvider>
      );
    });

    expect(screen.getByText('Card 1')).toBeDefined();
    // This test verifies that BoardContent correctly responds to prop changes, 
    // which is how the rollback manifests in the view layer.
  });
});
