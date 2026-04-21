import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    fetchTodos();
  }, [])

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_BASE}/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Failed to load todos", err)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo, status: 'pending' })
      });
      const data = await res.json();
      setTodos([data, ...todos]);
      setNewTodo('');
    } catch (err) {
      console.error(err);
    }
  }

  const toggleTodo = async (id, currentStatus) => {
    try {
      const nextStatusMap = {
        'pending': 'in-progress',
        'in-progress': 'completed',
        'completed': 'pending'
      };
      const nextStatus = nextStatusMap[currentStatus || 'pending'];
      setTodos(todos.map(t => t._id === id ? { ...t, status: nextStatus } : t));
      await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.error(err);
      fetchTodos();
    }
  }

  const deleteTodo = async (id) => {
    try {
      setTodos(todos.filter(t => t._id !== id));
      await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error(err);
      fetchTodos();
    }
  }

  return (
    <div className="app-container">
      <h1>Focus Flow (V2)</h1>
      <form className="input-group" onSubmit={handleAdd}>
        <input 
          type="text" 
          placeholder="What needs to be done?" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit" className="add-btn">Add</button>
      </form>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo._id} className={`todo-item ${todo.status === 'completed' ? 'completed' : ''}`}>
            <div className="todo-left" onClick={() => toggleTodo(todo._id, todo.status)}>
              <div className={`status-badge ${todo.status || 'pending'}`}>
                {(todo.status || 'pending').replace('-', ' ').toUpperCase()}
              </div>
              <span className={`todo-text ${todo.status === 'completed' ? 'completed-text' : ''}`}>{todo.title}</span>
            </div>
            <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
