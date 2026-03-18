# 18-poker

This is a simple poker game implemented using express with an sqlite database to store previous game and using websockets to handle the game logic.

## TODO

- [ ] implement users
  - [ ] at first, just use a simple username input to log in with no authentication at all
  - [ ] use username instead of socket id
  - [ ] implement proper auth with a database, jsonwebtoken etc. at this stage, use the user ID with a token for authentication to store the players in a game instead of the username directly. This will prevent players impersonating someone else by sending a different username, as it also will require the token.
- [ ] allow spectating the game - make the `gameId` websocket independent of whether or not the player has joined, so it is possible to see the state of an unjoined game.
- [ ] when creating a game, automatically join it

## Run locally

```sh
bun install
bun run dev
```

(not tested with node)
