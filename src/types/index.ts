export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}

export interface TodoContextType {
  todos: Todo[];
  addTodo: (title: string, description: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  loading: boolean;
}
