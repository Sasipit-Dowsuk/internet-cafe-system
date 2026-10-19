
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";

export function checkFirebaseConnection(callback) {
  const connectionRef = ref(database, ".info/connected");

  return onValue(connectionRef, (snapshot) => {
    const connected = snapshot.val() === true;

    callback({
      connected,
      message: connected
        ? "เชื่อมต่อ Firebase Realtime Database แล้ว"
        : "กำลังเชื่อมต่อ Firebase...",
    });
  });
}
