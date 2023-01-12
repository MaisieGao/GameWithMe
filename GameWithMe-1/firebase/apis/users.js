import { firestore } from "../firebase-setup"
import { collection, addDoc, getDoc, getDocs, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";

const createUser = async (userData) => {
  // create games for new user
  userData.joined = [];
  userData.hosted = [];
  if (!userData.avatar) {
    userData.avatar = "images/defaultProfile.jpg";
  }
  if (!userData.city) {
    userData.city = "Place Unknown";
  }
  if (!userData.username) {
    userData.username = "";
  }

  const { id, ...userDataWithoutId } = userData;

  return await setDoc(doc(firestore, "users", userData.id), userDataWithoutId)
    .catch(err => {
      console.error('Error in createUser');
      throw err;
    });
}

const deleteUser = async (userId) => {
  await deleteDoc(doc(firestore, "/users/" + userId))
    .catch(err => {
      console.error('Error in deleteUser');
      throw err;
    });
}

const updateUser = async (userId, data) => {
  await updateDoc(doc(firestore, "/users/" + userId), data)
    .catch(err => {
      console.error('Error in updateUser');
      throw err;
    });
}

const getAllUser = async () => {
  return await getDocs(collection(firestore, "/users/"))
    .then(result => {
      return result.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    })
    .catch(err => {
      console.error('Error in getAllUser');
      throw err;
    });
}

const getUserById = async (userId) => {
  return await getDoc(doc(firestore, "/users/" + userId))
    .then(result => {
      if (result.exists()) {
        return {
          id: result.id,
          ...result.data()
        }
      } else {
        throw userId + "does not exist"
      }
    })
    .catch(err => {
      console.error('Error in getUserById');
      throw err;
    });
}

const getUserByRef = async (userRef) => {
  return await getDoc(userRef)
    .then(result => {
      if (result.exists()) {
        return {
          id: result.id,
          ...result.data()
        }
      } else {
        throw userRef + "does not exist"
      }
    })
    .catch(err => {
      console.error('Error in getUserByRef');
      throw err;
    });
}

const getUserRefById = async (userId) => {
  return doc(firestore, 'users', userId);
}

const getUsersByRefs = async (userRefArray) => {
  return Promise.all(userRefArray.map(userRef => {
      return getUserByRef(userRef);
    }))
    .catch(err => {
      console.error('Error in getUsersByRefs');
    });
}

export { createUser, deleteUser, updateUser, getAllUser, getUserById, getUserByRef, getUserRefById, getUsersByRefs };