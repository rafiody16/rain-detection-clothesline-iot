import {
  getFirestore,
  collection,
  getDocs,
  doc,
  query,
  addDoc,
  where,
  updateDoc,
} from "firebase/firestore";
import app from "../firebase";
import bcrypt from "bcryptjs";

const db = getFirestore(app);

export async function signIn(email: string) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  if (data) {
    return data[0];
  } else {
    return null;
  }
}

export async function signUp(
  userData: {
    email: string;
    fullname: string;
    password: string;
    role?: string;
  },
  callback: (res: { status: string; message: string }) => void,
) {
  const q = query(
    collection(db, "users"),
    where("email", "==", userData.email),
  );
  const querySnapshot = await getDocs(q);
  const data = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  //   console.log("Query result:", data);
  // console.log(data.length < 0);
  // console.log(data.length > 0);
  if (data.length > 0) {
    // user sudah ada
    return callback({
      status: "error",
      message: "User already exists",
    });
  }

  try {
    userData.password = await bcrypt.hash(userData.password, 10);
    userData.role = "member";

    await addDoc(collection(db, "users"), userData);

    callback({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    callback({
      status: "error",
      message: "Failed to register user",
    });
  }
}

export async function signInWithOAuth(
  provider: string,
  userData: any,
  callback: any,
) {
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", userData.email),
    );
    const querySnapshot = await getDocs(q);
    const data: any = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    if (data.length > 0) {
      // User sudah ada, update data
      userData.role = data[0].role;
      await updateDoc(doc(db, "users", data[0].id), userData);
      callback({
        status: true,
        message: `User registered and logged in with ${provider}`,
        data: userData,
      });
    } else {
      // User belum ada, buat data baru
      userData.role = "member";
      await addDoc(collection(db, "users"), userData);
      callback({
        status: true,
        message: `User registered and logged in with ${provider}`,
        data: userData,
      });
    }
  } catch (error: any) {
    // Tangani error di sini
    callback({
      status: false,
      message: `Failed to register user with ${provider}`,
    });
  }
}
