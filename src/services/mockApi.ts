import { User, Todo } from '../types';

// Mock API service for demonstration
class MockApiService {
  private users: Map<string, User & { password: string }> = new Map();
  private todos: Map<string, Todo> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    // Add some demo data
    this.users.set('demo@example.com', {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'demo@example.com',
      phone: '+1234567890',
      password: 'password123'
    });

    this.todos.set('todo-1', {
      id: 'todo-1',
      title: 'Learn React',
      description: 'Complete the React tutorial',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-1'
    });
  }

  // Simulate API delay
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email: string, password: string): Promise<User> {
    await this.delay();
    
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    this.currentUserId = user.id;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async signup(userData: Omit<User, 'id'> & { password: string }): Promise<User> {
    await this.delay();
    
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = {
      ...userData,
      id: `user-${Date.now()}`
    };

    this.users.set(userData.email, newUser);
    this.currentUserId = newUser.id;
    
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await this.delay();
    
    const userEntry = Array.from(this.users.entries()).find(([_, user]) => user.id === userId);
    if (!userEntry) {
      throw new Error('User not found');
    }

    const [email, user] = userEntry;
    const updatedUser = { ...user, ...updates };
    this.users.set(email, updatedUser);
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getTodos(userId: string): Promise<Todo[]> {
    await this.delay();
    
    return Array.from(this.todos.values()).filter(todo => todo.userId === userId);
  }

  async addTodo(userId: string, title: string, description: string): Promise<Todo> {
    await this.delay();
    
    const newTodo: Todo = {
      id: `todo-${Date.now()}`,
      title,
      description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };

    this.todos.set(newTodo.id, newTodo);
    return newTodo;
  }

  async updateTodo(todoId: string, updates: Partial<Todo>): Promise<Todo> {
    await this.delay();
    
    const todo = this.todos.get(todoId);
    if (!todo) {
      throw new Error('Todo not found');
    }

    const updatedTodo = {
      ...todo,
      ...updates,
      updatedAt: new Date()
    };

    this.todos.set(todoId, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(todoId: string): Promise<void> {
    await this.delay();
    
    if (!this.todos.has(todoId)) {
      throw new Error('Todo not found');
    }

    this.todos.delete(todoId);
  }
}

export const mockApi = new MockApiService();
