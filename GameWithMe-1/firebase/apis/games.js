import { auth, firestore } from "../firebase-setup"
import { collection, addDoc, getDoc, getDocs, doc, deleteDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { updateUser } from "./users";

const createGame = async (gameData) => {

  gameData.participants = []

  return await addDoc(collection(firestore, "games"), gameData)
    .then((result) => {
      updateDoc(gameData.dmRef, {
        hosted: arrayUnion(result)
      })
    })
    .catch(err => {
      console.error('Error in createGame');
      throw err;
    });
}

const deleteGame = async (gameId) => {
  console.log('deleting game', gameId);
  await deleteDoc(doc(firestore, "/games/" + gameId))
    .catch(err => {
      console.error('Error in deleteGame', err);
      throw err;
    });
  console.log('deleted game', gameId);
  await updateUser(auth.currentUser.uid, {
    hosted: arrayRemove(doc(firestore, "/games/" + gameId))
  }).catch(err => {
    console.error('error in deleteGame', err);
    throw err;
  })
}

const updateGame = async (gameId, data) => {
  await updateDoc(doc(firestore, "/games/" + gameId), data)
    .catch(err => {
      console.error('Error in updateGame');
      throw err;
    });
}

const getAllGame = async () => {
  return await getDocs(collection(firestore, "/games/"))
    .then(result => {
      return result.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    })
    .catch(err => {
      console.error('Error in getAllGame');
      throw err;
    });
}

const getGameById = async (gameId) => {
  return await getDoc(doc(firestore, "/games/" + gameId))
    .then(result => {
      if (result.exists()) {
        return {
          id: result.id,
          ...result.data()
        }
      } else {
        throw gameId + "does not exist"
      }
    })
    .catch(err => {
      console.error('Error in getGameById');
      throw err;
    });
}

const getGameByRef = async (gameRef) => {
  console.log('game ref', gameRef.id);
  return await getDoc(gameRef)
    .then(result => {
      if (result.exists()) {
        return {
          id: result.id,
          ...result.data()
        }
      } else {
        console.error(gameRef, 'does not exist');
        throw gameRef + 'does not exist';
      }
    })
    .catch(err => {
      console.error('Error in getGameByRef');
      throw err;
    });
}

const getGameRefById = async (gameId) => {
  return doc(firestore, 'games', gameId);
}

const getGamesByRefs = async (gameRefArray) => {
  // clean up invalid games
  // we cannot update other users' document as written in the requirement
  // therefore we have to clean up the invalid game ids from user themselves at start
  // this is considered a dirty hack just to comply with the requirements
  const cleanGameRefs = [];
  await Promise.all(gameRefArray.map(gameRef => {
    return getDoc(gameRef).then(result => {
      if (!result.exists()) {
        updateUser(auth.currentUser.uid, {
          joined: arrayRemove(gameRef)
        })
        console.log('clean invalid gameRef', gameRef.id);
      } else {
        cleanGameRefs.push(gameRef);
      }
    })
  }))

  return Promise.all(cleanGameRefs.map(gameRef => {
      return getDoc(gameRef).then(result => {
        return getGameByRef(gameRef);
      })
    }))
    .catch(err => {
      console.error('Error in getGamesByRefs', err);
    });
}

const addUserToGame = async (userId, gameId) => {
  console.log("addUserToGame");
  const userRef = doc(firestore, "users", userId);
  const gameRef = doc(firestore, "games", gameId);

  try {
    await updateGame(gameId, {
      participants: arrayUnion(userRef)
    })
    await updateUser(userId, {
      joined: arrayUnion(gameRef)
    })
  } catch (err) {
    console.error("Error in addUserToGame", err)
  }
}

const removeUserFromGame = async (userId, gameId) => {
  console.log("removeUserFromGame");
  const userRef = doc(firestore, "users", userId);
  const gameRef = doc(firestore, "games", gameId);

  try {
    await updateGame(gameId, {
      participants: arrayRemove(userRef)
    })
    await updateUser(userId, {
      joined: arrayRemove(gameRef)
    })
  } catch (err) {
    console.error("Error in removeUserFromGame", err)
  }
}

export { createGame, deleteGame, updateGame, getAllGame, getGameById, getGameByRef, getGameRefById, getGamesByRefs, addUserToGame, removeUserFromGame };