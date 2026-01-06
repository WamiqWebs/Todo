// src/lib/repo.js
import { supabase } from "./supabase"; // ensure relative path correct ho

// ✅ Insert a new todo
export async function addTodo(task) {
  const { data, error } = await supabase
    .from("todos")
    .insert([{ task, completed: false }])
    .select()
    .single();

  if (error) {
    console.error("❌ Error adding todo:", error);
    throw error;
  }

  return data;
}

// ✅ Update todo completion
export async function updateTodoStatus(id, completed) {
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ Error updating todo status:", error);
    throw error;
  }

  return data;
}

// ✅ Get all todos
export async function getTodos() {
  const { data, error } = await supabase.from("todos").select("*");
  if (error) {
    console.error("❌ Error fetching todos:", error);
    throw error;
  }
  return data;
}

// ✅ Delete a todo
export async function deleteTodo(id) {
  const { data, error } = await supabase.from("todos").delete().eq("id", id).select().single();
  if (error) {
    console.error("❌ Error deleting todo:", error);
    throw error;
  }
  return data;
}

// ✅ Edit task text
export async function editTodos(id, task) {
  const { data, error } = await supabase
    .from("todos")
    .update({ task })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ Error editing todo:", error);
    throw error;
  }

  return data;
}

// ✅ Mark all todos completed
export async function markAllCompleted() {
  const { data, error } = await supabase.from("todos").update({ completed: true });
  if (error) {
    console.error("❌ Error marking all completed:", error);
    throw error;
  }
  return data;
}

// ✅ Mark all todos uncompleted
export async function markAllUntick() {
  const { data, error } = await supabase.from("todos").update({ completed: false });
  if (error) {
    console.error("❌ Error marking all uncompleted:", error);
    throw error;
  }
  return data;
}
