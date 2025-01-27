import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle, Edit2, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getTasks, createTask, updateTask, updateTaskStatus, deleteTask } from '../services/api';
import { Task } from '../types';

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({ task_name: '', task_description: '' });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      toast.error('Error al cargar las tareas');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        ...newTask,
        task_status: 'Pendiente',
        user_id: '123', // This should come from the authenticated user
      });
      setNewTask({ task_name: '', task_description: '' });
      setIsAddingTask(false);
      loadTasks();
      toast.success('Tarea creada exitosamente');
    } catch (error) {
      toast.error('Error al crear la tarea');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, editingTask);
      setEditingTask(null);
      loadTasks();
      toast.success('Tarea actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['task_status']) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadTasks();
      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      await deleteTask(taskId);
      loadTasks();
      toast.success('Tarea eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la tarea');
    }
  };

  const getStatusIcon = (status: Task['task_status']) => {
    switch (status) {
      case 'Pendiente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Terminada':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Cancelada':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
        <button
          onClick={() => setIsAddingTask(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Nueva Tarea
        </button>
      </div>

      {isAddingTask && (
        <form onSubmit={handleAddTask} className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={newTask.task_name}
                onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={newTask.task_description}
                onChange={(e) => setNewTask({ ...newTask, task_description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay tareas disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow">
              {editingTask?.id === task.id ? (
                <form onSubmit={handleUpdateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={editingTask.task_name}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, task_name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={editingTask.task_description}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, task_description: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingTask(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{task.task_name}</h3>
                      <p className="mt-1 text-gray-500">{task.task_description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1 text-gray-400 hover:text-gray-500"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.task_status)}
                      <span
                        className={`text-sm font-medium ${
                          task.task_status === 'Pendiente'
                            ? 'text-yellow-500'
                            : task.task_status === 'Terminada'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {task.task_status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(task.id, 'Pendiente')}
                        className="px-3 py-1 text-sm rounded-md border border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                      >
                        Pendiente
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'Terminada')}
                        className="px-3 py-1 text-sm rounded-md border border-green-500 text-green-500 hover:bg-green-50"
                      >
                        Terminada
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'Cancelada')}
                        className="px-3 py-1 text-sm rounded-md border border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Cancelada
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};