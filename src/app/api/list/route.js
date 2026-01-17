import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function GET() {
  try {
    const { data, error } = await supabase.from("todos").select("*").order("id");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error fetching todos:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { task } = await req.json();
    if (!task || task.trim() === "") {
      return NextResponse.json({ message: "Task is required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("todos").insert([{ task, completed: false }]).select();
    if (error) throw error;

    return NextResponse.json({ message: "Todo added successfully", todo: data[0] });
  } catch (err) {
    console.error("❌ Error adding todo:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, task, completed, markAll, untickAll } = await req.json();

    // ✅ Mark all completed
    if (markAll) {
      const { error } = await supabase.from("todos").update({ completed: true });
      if (error) throw error;
      return NextResponse.json({ message: "All todos marked completed" });
    }

    // ✅ Unmark all
    if (untickAll) {
      const { error } = await supabase.from("todos").update({ completed: false });
      if (error) throw error;
      return NextResponse.json({ message: "All todos unmarked" });
    }

    // ✅ Update checkbox
    if (typeof completed === "boolean" && id) {
      const { data, error } = await supabase.from("todos").update({ completed }).eq("id", id).select();
      if (error) throw error;
      return NextResponse.json({ message: "Todo status updated", todo: data[0] });
    }

    // ✅ Update text
    if (task && task.trim() !== "" && id) {
      const { data, error } = await supabase.from("todos").update({ task }).eq("id", id).select();
      if (error) throw error;
      return NextResponse.json({ message: "Task updated", todo: data[0] });
    }

    return NextResponse.json({ message: "No valid field provided" }, { status: 400 });

  } catch (err) {
    console.error("❌ Error updating todo:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: "Invalid data" }, { status: 400 });

    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting todo:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
export async function deleteAllTodos() {
  await supabase.from("todos").delete().neq("id", 0);
  return NextResponse.json({ ok: true });
}
