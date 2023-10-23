import React, { useState, useEffect } from 'react';
import './index.css'
const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [showNotFinishedOnly, setShowNotFinishedOnly] = useState(false);

  // Load tasks from LocalStorage on the first render
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(savedTasks);
  }, []);

  // Save tasks to LocalStorage  tasks state changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim() !== '') {
      setTasks([...tasks, { id: Date.now(), description: newTask, done: false }]);
      setNewTask('');
    }
  };

  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    setTasks(updatedTasks);
  };


  //Delete
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const filteredTasks = showNotFinishedOnly ? tasks.filter((task) => !task.done) : tasks;

  return (
    <div className="App">
      <h1>ToDo List</h1>
      <form onSubmit={handleTaskSubmit}>
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <button type="submit">Add Task</button>
      </form>
      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={showNotFinishedOnly}
            onChange={() => setShowNotFinishedOnly(!showNotFinishedOnly)}
          />
          Show Not Finished Only
        </label>
      </div>
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <input type="checkbox" checked={task.done} onChange={() => toggleTaskStatus(task.id)} />
            <span>{task.description}</span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
