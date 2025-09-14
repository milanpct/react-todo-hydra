import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Todo, TodoContextType } from '../types';
import { mockApi } from '../services/mockApi';
import { hydraService } from '../services/hydraService';
import { useAuth } from './AuthContext';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadTodos = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userTodos = await mockApi.getTodos(user.id);
      setTodos(userTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTodos();
    } else {
      setTodos([]);
    }
  }, [user, loadTodos]);

  const addTodo = async (title: string, description: string) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const newTodo = await mockApi.addTodo(user.id, title, description);
      setTodos(prev => [...prev, newTodo]);
      
      // Track todo creation event
      try {
        await hydraService.trackEvent('todo_created', {
          todoId: newTodo.id,
          title: newTodo.title,
          userId: user.id
        });
      } catch (error) {
        console.error('Failed to track todo creation event:', error);
        // Continue without tracking
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const updatedTodo = await mockApi.updateTodo(id, updates);
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
      
      // Track todo update event
      try {
        await hydraService.trackEvent('todo_updated', {
          todoId: id,
          updates: Object.keys(updates),
          userId: user.id
        });
      } catch (error) {
        console.error('Failed to track todo update event:', error);
        // Continue without tracking
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      await mockApi.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      
      // Track todo deletion event
      try {
        await hydraService.trackEvent('todo_deleted', {
          todoId: id,
          userId: user.id
        });
      } catch (error) {
        console.error('Failed to track todo deletion event:', error);
        // Continue without tracking
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    await updateTodo(id, { completed: !todo.completed });
    
    // Track todo completion event
    try {
      await hydraService.trackEvent('todo_toggled', {
        todoId: id,
        completed: !todo.completed,
        userId: user?.id
      });
    } catch (error) {
      console.error('Failed to track todo toggle event:', error);
      // Continue without tracking
    }
  };

  const value: TodoContextType = {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    loading,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
