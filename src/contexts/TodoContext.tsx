import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Todo, TodoContextType } from "../types";
import { mockApi } from "../services/mockApi";
import { hydraService } from "../services/hydraService";
import { useAuth } from "./AuthContext";

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodos must be used within a TodoProvider");
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

  // ✅ LOAD TODOS FOR BOTH ANONYMOUS AND AUTHENTICATED USERS
  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Load from backend for authenticated users
        const userTodos = await mockApi.getTodos(user.id);
        setTodos(userTodos);
      } else {
        // Load from localStorage for anonymous users
        const storedTodos = localStorage.getItem("anonymous_todos");
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        } else {
          setTodos([]);
        }
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTodos();
  }, [user, loadTodos]);

  const addTodo = async (title: string, description: string) => {
    setLoading(true);
    try {
      if (user) {
        // ✅ AUTHENTICATED: Add to backend
        const newTodo = await mockApi.addTodo(user.id, title, description);
        setTodos((prev) => [...prev, newTodo]);

        // Track todo creation event
        hydraService.trackEvent("todo_created", {
          todoId: newTodo.id,
          title: newTodo.title,
          userId: user.id,
        });
      } else {
        // ✅ ANONYMOUS: Add to localStorage
        const newTodo: Todo = {
          id: Date.now().toString(),
          userId: "anonymous",
          title,
          description,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedTodos = [...todos, newTodo];
        setTodos(updatedTodos);
        localStorage.setItem("anonymous_todos", JSON.stringify(updatedTodos));

        // Track anonymous todo creation
        hydraService.trackEvent("todo_created", {
          todoId: newTodo.id,
          title: newTodo.title,
          anonymous: true,
        });
      }
    } catch (error) {
      console.error("Failed to add todo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    setLoading(true);
    try {
      if (user) {
        // ✅ AUTHENTICATED: Update on backend
        const updatedTodo = await mockApi.updateTodo(id, updates);
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );

        // Track todo update event
        hydraService.trackEvent("todo_updated", {
          todoId: id,
          updates: Object.keys(updates),
          userId: user.id,
        });
      } else {
        // ✅ ANONYMOUS: Update in localStorage
        const updatedTodos = todos.map((todo) => {
          if (todo.id === id) {
            return {
              ...todo,
              ...updates,
              updatedAt: new Date().toISOString(),
            } as Todo;
          }
          return todo;
        });
        setTodos(updatedTodos);
        localStorage.setItem("anonymous_todos", JSON.stringify(updatedTodos));

        // Track anonymous todo update
        hydraService.trackEvent("todo_updated", {
          todoId: id,
          updates: Object.keys(updates),
          anonymous: true,
        });
      }
    } catch (error) {
      console.error("Failed to update todo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    setLoading(true);
    try {
      if (user) {
        // ✅ AUTHENTICATED: Delete from backend
        await mockApi.deleteTodo(id);
        setTodos((prev) => prev.filter((todo) => todo.id !== id));

        // Track todo deletion event
        hydraService.trackEvent("todo_deleted", {
          todoId: id,
          userId: user.id,
        });
      } else {
        // ✅ ANONYMOUS: Delete from localStorage
        const updatedTodos = todos.filter((todo) => todo.id !== id);
        setTodos(updatedTodos);
        localStorage.setItem("anonymous_todos", JSON.stringify(updatedTodos));

        // Track anonymous todo deletion
        hydraService.trackEvent("todo_deleted", {
          todoId: id,
          anonymous: true,
        });
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    await updateTodo(id, { completed: !todo.completed });

    // ✅ Track todo completion event (fire-and-forget)
    hydraService.trackEvent("todo_toggled", {
      todoId: id,
      completed: !todo.completed,
      userId: user?.id,
    });
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
