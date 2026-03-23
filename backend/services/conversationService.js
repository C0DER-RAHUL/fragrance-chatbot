import db from "../db.js";

export async function getOrCreateUser(sessionId) {

 const user = await db.query(
  "SELECT * FROM users WHERE session_id=$1",
  [sessionId]
 );

 if(user.rows.length > 0){
   return user.rows[0];
 }

 const newUser = await db.query(
  "INSERT INTO users(session_id,last_seen) VALUES($1,NOW()) RETURNING *",
  [sessionId]
 );

 return newUser.rows[0];
}



export async function getOrCreateConversation(userId){

 const conversation = await db.query(
  "SELECT * FROM conversations WHERE user_id=$1 AND status='active'",
  [userId]
 );

 if(conversation.rows.length > 0){
  return conversation.rows[0];
 }

 const newConversation = await db.query(
  "INSERT INTO conversations(user_id) VALUES($1) RETURNING *",
  [userId]
 );

 return newConversation.rows[0];
}



export async function saveMessage(conversationId,sender,message){

 await db.query(
  "INSERT INTO messages(conversation_id,sender,message) VALUES($1,$2,$3)",
  [conversationId,sender,message]
 );

}