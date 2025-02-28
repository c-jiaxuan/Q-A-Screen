import { firebaseConfig } from "./firebase-config.js";
import { getFirestore, collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// To store
// 1) Message Content
// 2) Date/Time
// 3) Sender
// 4) Preloaded/LLM?

async function addMessageData(message, llm_speed, avatar_speed) {
  try {
    const docRef = await addDoc(collection(db, 'Chat History'), {
      Date_Time: Timestamp.now(),
      Message_Content: message.msg_content,
      Sender: message.sender,
      LLM_Speed: llm_speed,
      Avatar_Speed: avatar_speed,
      Message_ID: message.msg_id
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

// Get data from Firestore
// Returns list of all message ids
async function getMessageIDData() {
  const querySnapshot = await getDocs(collection(db, 'Chat History'));

  var ID_List = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    ID_List.push(data.Message_ID);
  });

  return ID_List;
}

// Expose functions to the global scope
window.addMessageData = addMessageData;

window.getMessageIDData = getMessageIDData;
