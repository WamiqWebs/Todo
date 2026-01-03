import { NextResponse } from "next/server";
import { addTodo, updateTodoStatus, getTodos, deleteTodo , editTodos,markAllCompleted,markAllUntick} from "@/lib/repo";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { task } = body;

    if (!task || task.trim() === "") {
      return NextResponse.json({ message: "Task is required" }, { status: 400 });
    }

    console.log("✅ Task received in API:", task);
    const result = await addTodo(task);
    console.log("✅ Task added to db successfully:", result);

    return NextResponse.json({ message: "Todo added successfully", todo: task });
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, task, completed, markAll,untickAll } = body;
 
    // ✅ Case 1: Mark and Unmark all todos completed
    if (untickAll) {
      await markAllUntick();
      return NextResponse.json({ message: "All todos marked as uncompleted" });
    }
    if(markAll) {
      await markAllCompleted();
      return NextResponse.json({ message: "All todos marked as completed" });
    }

    // ✅ Case 2: Checkbox update
    if (typeof completed === "boolean" && id) {
      await db.query("UPDATE todos SET completed = ? WHERE id = ?", [completed ? 1 : 0, id]);
      return NextResponse.json({ message: "Todo completion updated successfully" });
    }

    // ✅ Case 3: Text edit
    if (id && task && task.trim() !== "") {
      await db.query("UPDATE todos SET task = ? WHERE id = ?", [task, id]);
      return NextResponse.json({ message: "Task updated successfully" });
    }

    return NextResponse.json({ message: "No valid update field provided" }, { status: 400 });

  } catch (error) {
    console.error("❌ Error updating task:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const todo = await getTodos();
    console.log("✅ Todos fetched successfully:", todo);
    return NextResponse.json(todo);
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const del = await deleteTodo(id);
    console.log("✅ Todo deleted successfully:", del);
    return NextResponse.json({ message: "Todo deleted successfully", del });
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

