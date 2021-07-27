// Firebase Auth
export function login(auth) {
  auth.signInAnonymously();
}
export function logout(auth) {
  auth.signOut();
}

export function acceptPlayer(fireDB, room, uid, username) {
  fireDB.ref("rooms/" + room + "/players/" + uid).set(username);
}

export function removeKnockPlayer(fireDB, room, uid) {
  fireDB.ref("rooms/" + room + "/knock/" + uid).remove();
}

export function changeBallPos(fireDB, room, uid, toWhere) {
  fireDB.ref("rooms/" + room + "/gameProps/characters/" + uid).set(toWhere);
}

export function authenticationListener(auth, setUser) {
  auth.onAuthStateChanged((authUser) => {
    if (authUser) {
      setUser(authUser.uid);
    } else {
      setUser(null);
    }
  });
}

export function startListeningToNewPlayers(fireDB, room, setPlayers) {
  fireDB
    .ref("rooms/" + room + "/players")
    .on("value", (snap) => setPlayers(snap.val()));
}

export function stopListeningToNewPlayers(fireDB, room) {
  fireDB.ref("rooms/" + room + "/players").off("value");
}

export function startGameHost(fireDB, room) {
  fireDB.ref("rooms/" + room + "/startGame").set(true);
  fireDB.ref("rooms/" + room + "/knock").off();
}

export function startListeningToStartGame(
  fireDB,
  room,
  setStartGame,
  setPlayers
) {
  fireDB.ref("rooms/" + room + "/startGame").on("value", (snap) => {
    if (snap.val()) {
      fireDB
        .ref("rooms/" + room + "/players")
        .get()
        .then((snap) => {
          setPlayers(snap.val());
          fireDB.ref("rooms/" + room + "/startGame").off();
          setStartGame(true);
        });
    }
  });
}

export function listenToPlayersPositions(
  fireDB,
  room,
  players,
  gameBoardCoordsRelationalFunc,
  gameBoardCoordsInverseRelationalFunc,
  boardWidth,
  setGameBoard
) {
  fireDB
    .ref("rooms")
    .child(room)
    .child("gameProps")
    .child("characters")
    .on("value", (snap) => {
      if (snap.exists()) {
        const ballsPositions = snap.val();
        const newGameBoard = Array.from({
          length: boardWidth * boardWidth,
        }).map((_, index) => {
          return {
            xy: gameBoardCoordsRelationalFunc(index, boardWidth),
            value: null,
          };
        });
        Object.keys(ballsPositions).forEach((uid) => {
          const toWhere = ballsPositions[uid];
          newGameBoard[
            gameBoardCoordsInverseRelationalFunc(toWhere, boardWidth)
          ].value = players[uid].slice(0, 1);
        });
        setGameBoard(newGameBoard);
      }
    });
}

export function startListeningToKnocks(fireDB, room, setKnocks) {
  fireDB.ref("rooms/" + room + "/knock").on("value", (snap) => {
    if (snap.exists()) {
      setKnocks(snap.val());
    } else {
      setKnocks({});
    }
  });
}

export function knockOnRoom(fireDB, room, uid, username) {
  fireDB
    .ref("rooms/" + room + "/knock")
    .child(uid)
    .set(username);
}

export function startListeningIfInGame(fireDB, room, uid, setInGame) {
  fireDB.ref("rooms/" + room + "/players").on("value", (snap) => {
    if (uid in snap.val()) {
      setInGame(true);
      fireDB.ref("rooms/" + room + "/players").off();
    }
  });
}
