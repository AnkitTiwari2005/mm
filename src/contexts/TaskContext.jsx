import React, { createContext, useState, useEffect } from 'react';
import { scheduleTaskNotification } from '../utils/notifications';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('marshmallow_tasks')) || []);

  useEffect(() => {
    localStorage.setItem('marshmallow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    const newTask = { ...task, id: Date.now().toString(), completed: false };
    setTasks(prev => [...prev, newTask]);
    scheduleTaskNotification(newTask);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, toggleTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
