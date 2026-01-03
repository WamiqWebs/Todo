import db from "@/lib/db";


// function to insert a new todo into the database
export async function addTodo(task) {
  try {
    const [result] = await db.query(
      "INSERT INTO todos (task, completed) VALUES (?, ?)",
      [task, false]
    );
    return { id: result.insertId, task, completed: false };
  } catch (error) {
    console.error("❌ Error adding todo to DB:", error);
    throw error;
  }
}

export async function updateTodoStatus(id, completed){
   try{
      await db.query("UPDATE todos SET completed = ? WHERE id = ?", [completed ? 1:0 , id]);
      return {id , completed};
   }catch(error){
      console.error("❌ Error updating todo status:", error);
      throw error;
   }
}
 export async function getTodos(req) {
  try{
    const [rows] = await db.query("SELECT * FROM todos") ;
    return rows;
  }
  catch (error){
    console.log("❌ Error getting todos from DB:", error);
    throw error;
  }
 }

 export async function deleteTodo(id) {
  try{
    await db.query("DELETE FROM todos WHERE id = ?", [id]);
    return id;
  }
  catch(error){
    console.error("❌ Error deleting todo from DB:", error);
    throw error;
  }
 }
 export async function editTodos(id,task) {
  try{
    await db.query("UPDATE todos SET task = ? WHERE id = ?", [task, id]);
    return {id, task};
  } catch(error){
    console.error("❌ Error editing todo from DB:", error);
    throw error;
    
  }
 }
 export async function markAllCompleted() {
  try {
    await db.query("UPDATE todos SET completed = 1");
    return { success: true };
  } catch (error) {
    console.error("❌ Error marking all completed:", error);
    throw error;
  }
}
export async function markAllUntick() {
  try{
    await db.query("UPDATE todos SET completed = 0");
    return { success: true };
  }catch(error){
    console.error("❌ Error marking all uncompleted:", error);
    throw error;
  }
}

