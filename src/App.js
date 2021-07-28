import "./App.css";
import firebase from "./firebase";
import { useEffect, useState } from "react";
import { XYToIndex, indexToXY, useStickyState, cleanup } from "./utils";
import {
  login,
  logout,
  acceptPlayer,
  changeBallPos,
  authenticationListener,
  startGameHost,
  startListeningToStartGame,
  listenToPlayersPositions,
  removeKnockPlayer,
  startListeningToKnocks,
  knockOnRoom,
  startListeningIfInGame,
} from "./firebase_utils";

function App() {
  const [gameBoard, setGameBoard] = useState(
    Array.from({ length: 12 * 12 }).map((_, index) => {
      return {
        xy: indexToXY(index, 12),
        value: null,
      };
    })
  );
  const auth = firebase.auth();
  const fireDB = firebase.database();
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState();
  const [roomToBe, setRoomToBe] = useState();
  const [clientsKnocks, setClientsKnocks] = useState({});
  const [inGame, setInGame] = useState(false);
  const [startGame, setStartGame] = useState(false);
  const [players, setPlayers] = useState({});
  const [username, setUsername] = useStickyState();

  // Startup
  // Listen to current User
  // Listen to players
  useEffect(() => {
    authenticationListener(auth, setUser);
  }, [auth, fireDB]);

  useEffect(() => {
    if (room) {
      startListeningToStartGame(fireDB, room, setStartGame, setPlayers);
    }
  }, [fireDB, room]);

  // Host routine
  function host() {
    setRoom(user);
    acceptPlayer(fireDB, user, user, username);
    setInGame(true);
    startListeningToKnocks(fireDB, user, setClientsKnocks);
  }

  // Client routine
  function client() {
    setRoom(roomToBe);
    knockOnRoom(fireDB, roomToBe, user, username);
    startListeningIfInGame(fireDB, roomToBe, user, setInGame);
  }

  // Firebase characters position listener
  useEffect(() => {
    if (startGame && players) {
      listenToPlayersPositions(
        fireDB,
        room,
        players,
        indexToXY,
        XYToIndex,
        12,
        setGameBoard
      );
    }
  }, [fireDB, room, startGame, players]);

  return (
    <>
      <header className="App-header">Game</header>
      <div className="App">
        <div className="board">
          {gameBoard.map((_) => (
            <button
              className="button--board"
              key={`button${XYToIndex(_.xy, 12)}`}
              onClick={() => {
                changeBallPos(fireDB, room, user, _.xy);
              }}
            >
              {_.value}
            </button>
          ))}
        </div>
        <p>User: {user}</p>
        {user ? (
          <>
            <button
              onClick={() => {
                cleanup(
                  room === user,
                  fireDB,
                  room,
                  setStartGame,
                  setInGame,
                  setPlayers,
                  setRoom
                );
                logout(auth);
              }}
            >
              Logout
            </button>
            <br />
            {room ? (
              room === user && !startGame ? (
                <>
                  <button
                    onClick={() => {
                      startGameHost(fireDB, room, setStartGame);
                    }}
                  >
                    Start Game!
                  </button>
                  <p>Players waiting to be let in</p>
                  {Object.keys(clientsKnocks).map((uid) => (
                    <p key={uid}>
                      {clientsKnocks[uid]}{" "}
                      <button
                        onClick={() => {
                          acceptPlayer(fireDB, room, uid, clientsKnocks[uid]);
                          removeKnockPlayer(fireDB, room, uid);
                        }}
                      >
                        Accept?
                      </button>
                    </p>
                  ))}
                </>
              ) : (
                <p>{inGame ? username : "Waiting to be let in"}</p>
              )
            ) : (
              <>
                <button onClick={host}>Host</button>
                <br />
                <input
                  type="textbox"
                  onChange={(event) => {
                    setRoomToBe(event.target.value);
                  }}
                  value={roomToBe}
                ></input>
                <button onClick={client}>Client</button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                login(auth);
                if (!username){setUsername("I don't know my name")}
              }}
            >
              Login
            </button>
            <input
              type="textbox"
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              value={username}
            ></input>
          </>
        )}
      </div>
    </>
  );
}

export default App;
