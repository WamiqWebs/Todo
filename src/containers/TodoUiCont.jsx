"use client"
import { useState, useEffect } from "react"

export default function TodoUiCont() {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deletedTodo, setDeletedTodo] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);
  const [theme, setTheme] = useState("light");
  // const [color,setColor] = useState("black");


  useEffect(() => {
    async function fetchTodos() {
      try {
        const res = await fetch(("/api/list"), {
          method: "GET"
        });
        const data = await res.json();
        console.log("Fetched todos:", data);

        // ✅ Convert completed from 0/1 to true/false
        setTodos(
          Array.isArray(data)
            ? data.map(todo => ({ ...todo, completed: todo.completed === 1 }))
            : []
        );
      } catch (err) {
        console.error("Error fetching todos:", err);
      }
    }
    fetchTodos();
  }, [task, editingText]);


  async function handleAdd() {
    if (task.trim() === "") {
      alert("Input is blank, please fill it first");
      return;
    }

    try {
      const res = await fetch("/api/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      const data = await res.json();

      if (res.ok) {
        const newtodo = {
          id: data.todo.id,
          task: data.todo.task,
          completed: data.todo.completed
        };
        setTodos([...todos, newtodo]);
        setTask(""); // input box clear
      } else {
        alert("❌ " + data.message);
      }

    } catch (err) {
      console.error("Error while sending data:", err);
    }
  }

  async function handleCheckboxChange(id, completed) {
    try {
      const res = await fetch("/api/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
      });

      const data = await res.json();

      if (res.ok) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id ? { ...todo, completed } : todo
          )
        );
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("❌ Error updating todo:", error);
    }
  }
  async function handleDelete(id) {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    // frontend remove first
    setTodos(prev => prev.filter(t => t.id !== id));
    setDeletedTodo({ ...todoToDelete, index: todos.findIndex(t => t.id === id) });


    // show Undo for 2 sec
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/list", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        setDeletedTodo(null);
      } catch (err) {
        console.error("Error deleting todo:", err);
      }
    }, 3000);

    setUndoTimer(timer);
  }


  async function handleUpdate(id) {
    if (editingText.trim() === "") {
      alert("Task cannot be empty");
      return;
    }

    try {
      const res = await fetch("/api/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, task: editingText }),
      });

      const data = await res.json();

      if (res.ok) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id ? { ...todo, task: editingText } : todo
          )
        );
        setEditingId(null);
        setEditingText("");
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("❌ Error updating task:", error);
    }
  }

  function startEditing(todo) {
    setEditingId(todo.id);
    setEditingText(todo.task);
  }
  function cancelEditing() {
    setEditingId(null);
    setEditingText("");
  }
  function handleUndo() {
    if (!deletedTodo) return;
    clearTimeout(undoTimer);
    setTodos(prev => {
      const newTodos = [...prev];
      newTodos.splice(deletedTodo.index, 0, deletedTodo);
      return newTodos;
    });

    setDeletedTodo(null);
  }

  async function handleMarkAllCompleted() {
    try {
      const res = await fetch("/api/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })
      if (res.ok) {
        setTodos((prev) => prev.map((todo) => ({ ...todo, completed: true })));
      } else {
        alert("❌ failed to mark all todos");
      }
    }
    catch (err) {
      console.error(" ❌ error marking all todos", err);
    }
  }
  async function handleMarkAllUntick() {
    try {
      const res = await fetch("/api/list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ untickAll: true }),
      })
      if (res.ok) {
        setTodos((prev) => prev.map((todo) => ({ ...todo, completed: false })));
      } else {
        alert("❌ failed to unmark all todos");
      }
    } catch (err) {
      console.error(" ❌ error in server unmarking all todos", err);
    }

  }
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, [])
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }

  return (
    <section className="flex flex-col">
      <div className={`flex justify-center items-center flex-wrap gap-y-2 py-5 px-2 gap-x-5 bg-cyan-700 dark:bg-gray-900 ${theme === "light" ? "bg-gray-200" : "bg-gray-800"}`}>
        <button
          className={`px-3 py-1 rounded-md border text-sm font-medium ${theme === "light" ? "bg-gray-200 text-gray-700 hover:bg-gray-500  hover:text-gray-200 " : "bg-gray-700 text-gray-200 hover:bg-pink-500"}`}
          onClick={toggleTheme}
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
        <input
          className="rounded bg-white border-0 p-2 w-[50%]"
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter task"
        />
        <button className={`bg-cyan-500 py-2 px-4 rounded-md text-white ${theme === "light" ? "bg-gray-400 hover:bg-gray-500" : "bg-pink-500 hover:bg-cyan-500"} `}
          onClick={handleAdd}>
          Add
        </button>
      </div>

      <div className={`flex justify-center items-center px-2 py-5 gap-2 flex-wrap 
        ${theme === "light" ? "bg-gray-400" : "bg-cyan-300"}`}>

        <ul>
          <div className="flex justify-center items-center gap-x-2">
            <button
              onClick={handleMarkAllCompleted}
              className={`mark-all-btn  py-2 px-3 rounded-md text-white 
              ${theme === "light" ? "bg-gray-400 hover:bg-gray-500" : "bg-cyan-300 hover:bg-cyan-400"}`}
            >
              Select All
            </button>
            <button
              onClick={handleMarkAllUntick}
              className={`mark-all-btn py-2 px-3 rounded-md text-white 
            ${theme === "light" ? "bg-gray-400 hover:bg-gray-500" : "bg-cyan-300 hover:bg-cyan-400"}`}
            >
              Unselect All
            </button>
          </div>
          {todos.map((todo, index) => (
            <label
              key={index}
              className={`flex flex-wrap items-start justify-between gap-3 px-5 mt-2 py-2 rounded-md 
    ${theme === "light" ? "bg-gray-500" : "bg-cyan-500"}`}
            >
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="rounded px-2 flex-1 text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 px-2 text-white rounded"
                      onClick={() => handleUpdate(todo.id)}
                    >
                      ✅ Save
                    </button>
                    <button
                      className="bg-gray-500 px-2 text-white rounded"
                      onClick={cancelEditing}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 wrap-break-words whitespace-normal">
                    <span className="text-white">{index + 1}. {todo.task}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) =>
                        handleCheckboxChange(todo.id, e.target.checked)
                      }
                    />
                    <button
                      type="button"
                      className="p-1 bg-gray-200 hover:bg-gray-400 text-white rounded-md"
                      onClick={() => startEditing(todo)}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="p-1 bg-gray-200 hover:bg-gray-400 text-white rounded-md"
                      onClick={() => handleDelete(todo.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </label>
          ))}
        </ul>

        {deletedTodo && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleUndo}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Undo delete (3s)
            </button>
          </div>
        )}
        <div className="bg-gray-800 rounded ">
          {/* Progress Bar Section */}
          <div className="w-[90%] mx-auto mt-4 bg-gray-300 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`${theme === "dark" ? "bg-pink-500" : "bg-gray-600"} h-4 transition-all duration-700 ease-in-out`}
              style={{
                width: `${todos.length === 0
                  ? 0
                  : (todos.filter((t) => t.completed).length / todos.length) * 100
                  }%`,
              }}
            ></div>
          </div>

          {/* Percentage Text */}
          <p className="text-center mt-2 font-medium px-2 text-white">
            {todos.length === 0
              ? "No tasks yet"
              : `${Math.round(
                (todos.filter((t) => t.completed).length / todos.length) * 100
              )}% completed`}
          </p>
        </div>

      </div>
    </section>
  )
}

