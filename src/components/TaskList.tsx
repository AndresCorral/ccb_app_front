import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  getTasksByUser,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../services/api";
import { Task } from "../types";

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Tipo explícito para `newTask`
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    task_name: "",
    task_description: "",
    task_status: "Pendiente", // Valor predeterminado
    user_id: localStorage.getItem("userId") || "", // Obtiene user_id desde localStorage
  });

  // Cargar tareas al inicializar
  useEffect(() => {
    loadTasks();
  }, []);

  // Cargar las tareas del usuario
  const loadTasks = async () => {
    try {
      const data = await getTasksByUser();
      setTasks(data);
    } catch {
      toast.error("Error al cargar las tareas");
    }
  };

  // Crear una nueva tarea
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.user_id) {
      toast.error(
        "No se encontró el ID del usuario en localStorage. Por favor, inicia sesión nuevamente."
      );
      return;
    }

    try {
      await createTask(newTask); // Crear tarea
      setNewTask({
        task_name: "",
        task_description: "",
        task_status: "Pendiente", // Valor predeterminado
        user_id: localStorage.getItem("user_id") || "",
      });
      setIsAddingTask(false);
      loadTasks();
      toast.success("Tarea creada exitosamente");
    } catch {
      toast.error("Error al crear la tarea");
    }
  };

  // Actualizar una tarea
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, editingTask);
      setEditingTask(null);
      loadTasks();
      toast.success("Tarea actualizada exitosamente");
    } catch {
      toast.error("Error al actualizar la tarea");
    }
  };

  // Cambiar el estado de la tarea
  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["task_status"]
  ) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadTasks();
      toast.success("Estado actualizado exitosamente");
    } catch {
      toast.error("Error al actualizar el estado");
    }
  };

  // Eliminar una tarea
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;

    try {
      await deleteTask(taskId);
      loadTasks();
      toast.success("Tarea eliminada exitosamente");
    } catch {
      toast.error("Error al eliminar la tarea");
    }
  };

  // Icono para el estado de la tarea
  const getStatusIcon = (status: Task["task_status"]) => {
    switch (status) {
      case "Pendiente":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "Terminada":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Cancelada":
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
        <form
          onSubmit={handleAddTask}
          className="mb-6 bg-white p-4 rounded-lg shadow"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                value={newTask.task_name}
                onChange={(e) =>
                  setNewTask({ ...newTask, task_name: e.target.value })
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
                value={newTask.task_description}
                onChange={(e) =>
                  setNewTask({ ...newTask, task_description: e.target.value })
                }
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
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {task.task_name}
                  </h3>
                  <p className="mt-1 text-gray-500">{task.task_description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.task_status)}
                  <select
                    value={task.task_status}
                    onChange={(e) =>
                      handleStatusChange(
                        task.id,
                        e.target.value as Task["task_status"]
                      )
                    }
                    className="ml-2 p-1 border rounded"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Terminada">Terminada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-1 text-gray-400 hover:text-blue-500"
                  >
                    Editar
                  </button>
                </div>
              </div>
              {editingTask?.id === task.id && (
                <form
                  onSubmit={handleUpdateTask}
                  className="mt-4 bg-gray-50 p-4 rounded-lg shadow"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={editingTask.task_name}
                        onChange={(e) =>
                          setEditingTask({
                            ...editingTask,
                            task_name: e.target.value,
                          })
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
                          setEditingTask({
                            ...editingTask,
                            task_description: e.target.value,
                          })
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
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
