import React, { useState } from 'react';
import { useTodos } from '../contexts/TodoContext';
import { Plus, Check, Trash2, Edit3, X, Save } from 'lucide-react';

const TodoList: React.FC = () => {
  const { todos, addTodo, updateTodo, deleteTodo, toggleTodo, loading } = useTodos();
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    try {
      await addTodo(newTodo.title, newTodo.description);
      setNewTodo({ title: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditForm({ title: todo.title, description: todo.description });
  };

  const handleEditSave = async (id: string) => {
    try {
      await updateTodo(id, editForm);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo(id);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(id);
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">My Todos</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Todo
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Todo title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Todo description (optional)"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Todo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTodo({ title: '', description: '' });
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {loading && todos.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading todos...
            </div>
          ) : todos.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No todos yet. Create your first todo!
            </div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className="px-6 py-4">
                {editingId === todo.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSave(todo.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggle(todo.id)}
                      className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        todo.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {todo.completed && <Check className="h-3 w-3" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium ${
                        todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`mt-1 text-sm ${
                          todo.completed ? 'text-gray-400 line-through' : 'text-gray-600'
                        }`}>
                          {todo.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Created: {new Date(todo.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStart(todo)}
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;
