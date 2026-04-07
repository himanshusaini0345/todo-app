import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetchConfig();
    fetchTodos();
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/config`);
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error("Failed to load config", err)
    }
  }

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
      const payload = config?.FEATURE_NEW_STATUS 
        ? { title: newTodo, status: 'pending' }
        : { title: newTodo, completed: false };

      const res = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTodos([data, ...todos]);
      setNewTodo('');
    } catch (err) {
      console.error(err);
    }
  }

  const toggleTodo = async (id, currentCompleted, currentStatus) => {
    try {
      if (config?.FEATURE_NEW_STATUS) {
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
      } else {
        // Optimistic update
        setTodos(todos.map(t => t._id === id ? { ...t, completed: !currentCompleted } : t));
        
        await fetch(`${API_BASE}/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !currentCompleted })
        });
      }
    } catch (err) {
      console.error(err);
      fetchTodos(); // rollback
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
      <h1>Focus Flow</h1>
      
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
          <li key={todo._id} className={`todo-item ${(!config?.FEATURE_NEW_STATUS && todo.completed) || (config?.FEATURE_NEW_STATUS && todo.status === 'completed') ? 'completed' : ''}`}>
            {config?.FEATURE_NEW_STATUS ? (
              <div className="todo-left" onClick={() => toggleTodo(todo._id, null, todo.status)}>
                <div className={`status-badge ${todo.status || 'pending'}`}>
                  {(todo.status || 'pending').replace('-', ' ').toUpperCase()}
                </div>
                <span className={`todo-text ${todo.status === 'completed' ? 'completed-text' : ''}`}>{todo.title}</span>
              </div>
            ) : (
              <div className="todo-left" onClick={() => toggleTodo(todo._id, todo.completed, null)}>
                <div className={`checkbox ${todo.completed ? 'checked' : ''}`}>
                  <div className="checkbox-inner"></div>
                </div>
                <span className="todo-text">{todo.title}</span>
              </div>
            )}
            
            <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </li>
        ))}
        {todos.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '20px' }}>
            No tasks yet. Enjoy your day!
          </div>
        )}
      </ul>
    </div>
  )
}

export default App
