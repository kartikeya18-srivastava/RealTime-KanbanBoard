import { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-hot-toast';

const useBoardData = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial fetch: Workspaces
  useEffect(() => {
    const initFetch = async () => {
      try {
        const res = await api.get('/workspaces');
        setWorkspaces(res.data.workspaces);
        if (res.data.workspaces.length > 0) {
          setActiveWorkspace(res.data.workspaces[0]);
        }
      } catch (err) {
        toast.error('Failed to load workspaces');
      } finally {
        setIsLoading(false);
      }
    };
    initFetch();
  }, []);

  // Fetch boards when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return;
    const fetchBoards = async () => {
      try {
        const res = await api.get(`/boards?workspaceId=${activeWorkspace._id}`);
        const boardList = res.data.boards || [];
        setBoards(boardList);
        if (boardList.length > 0) {
          setActiveBoard(boardList[0]);
        } else {
          setActiveBoard(null);
          setBoardData(null);
        }
      } catch (err) {
        setBoards([]);
        toast.error('Failed to load boards');
      }
    };
    fetchBoards();
  }, [activeWorkspace]);

  // Fetch board details when active board changes
  useEffect(() => {
    if (!activeBoard) {
      setBoardData(null);
      return;
    }
    const fetchBoardDetail = async () => {
      try {
        // Reset board data while loading new board to avoid stale data crashes
        setBoardData(null); 
        const res = await api.get(`/boards/${activeBoard._id}`);
        setBoardData(res.data);
      } catch (err) {
        toast.error('Failed to load board details');
      }
    };
    fetchBoardDetail();
  }, [activeBoard]);

  const deleteBoard = async (boardId) => {
    if (!window.confirm('Are you sure you want to delete this board? This cannot be undone.')) return;
    try {
      await api.delete(`/boards/${boardId}`);
      toast.success('Board deleted');
      setBoards(prev => prev.filter(b => b._id !== boardId));
      if (activeBoard?._id === boardId) {
        setActiveBoard(null);
        setBoardData(null);
      }
    } catch (err) {
      toast.error('Failed to delete board');
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    if (!window.confirm('Are you sure you want to delete this workspace? All boards and cards will be lost.')) return;
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success('Workspace deleted');
      setWorkspaces(prev => prev.filter(ws => ws._id !== workspaceId));
      if (activeWorkspace?._id === workspaceId) {
        setActiveWorkspace(null);
        setBoards([]);
        setActiveBoard(null);
        setBoardData(null);
      }
    } catch (err) {
      toast.error('Failed to delete workspace');
    }
  };

  return {
    workspaces,
    setWorkspaces,
    activeWorkspace,
    setActiveWorkspace,
    boards,
    setBoards,
    activeBoard,
    setActiveBoard,
    boardData,
    setBoardData,
    isLoading,
    deleteBoard,
    deleteWorkspace
  };
};

export default useBoardData;
