<script lang="ts">
  import {writable} from "svelte/store";

  let gameActive: bool = true;
  let gameWon: bool = false;

  class Square {
    shown: bool;
    mine: bool;
    flag: bool;

    constructor(mine: bool) {
      this.shown = false;
      this.mine = mine;
      this.flag = false;
    }
  }

  let game = writable([
    [new Square(false), new Square(false), new Square(false), new Square(true)],
    [new Square(true),  new Square(false), new Square(false), new Square(false)],
    [new Square(false), new Square(false), new Square(false), new Square(false)],
    [new Square(false), new Square(true),  new Square(false), new Square(false)],
  ])

  function getAdjacent(row: number, col: number) {
    const maxCol = $game[0].length - 1;
    const maxRow = $game.length - 1;

    let coords = [];

    for (let i = Math.max(row-1, 0); i <= Math.min(row + 1, maxRow); i++) {
      for (let j = Math.max(col-1, 0); j <= Math.min(col + 1, maxCol); j++) {
        if (i == row && j == col) continue
        coords.push([i, j])
      }
    }

    return coords
  }

  function mines(row: number, col: number) {
    return getAdjacent(row, col).map(([x, y]) => $game[x][y].mine).filter(Boolean).length;
  }

  function showSquare(row: number, col: number) {
    game.update(g => {
      if (!gameActive) return g;

      const square = g[row][col];

      if (square.flag) return g;

      square.shown = true;

      if (square.mine) {
        gameWon = false;
        gameActive = false;
        return g;
      }

      if (g.every((row, _) => row.every((square, _) => square.shown || square.mine))) {
        gameWon = true;
        gameActive = false;
      }

      if (mines(row, col) == 0) {
        getAdjacent(row, col).map(([x, y]) => showSquare(x, y));
      }

      return g;
    })
  }

  function toggleFlag(row: number, col: number) {
    game.update(g => {
      const square = g[row][col];

      if (!square.shown) {
        square.flag = !square.flag;
      }

      return g;
    })
  }
</script>

<div class="gameContainer {gameActive ? 'active' : ''}">
  <div class="gameState">
    {#if gameWon}
      Du vant!
    {:else}
      Du tapte :(
    {/if}
  </div>

  <div class="game {gameActive ? 'active' : ''}">
    {#each $game as row, rowIdx}
      {#each row as square, colIdx}
        <button
          aria-label="square"
          class="square {square.shown ? 'shown' : ''} {square.flag ? 'flag' : ''}"
          onclick={() => showSquare(rowIdx, colIdx)}
          oncontextmenu={(e) => {
            e.preventDefault();
            toggleFlag(rowIdx, colIdx);
          }}
        >
          {#if square.mine}
            <span class="content mine">M</span>
          {:else}
            <span class="content adjacentMines mines-{mines(rowIdx, colIdx)}">{mines(rowIdx, colIdx)}</span>
          {/if}
        </button>
      {/each}
    {/each}
  </div>
</div>


<style>
  .gameContainer {
    background-color: #DDDDDD;
    width: 90vmin;
    padding: 1rem;

    &.active .gameState {
      visibility: hidden;
    }
  }

  .gameState {
    margin-bottom: 1rem;
    font-size: 3rem;
    text-align: center;
    font-family: monospace;
  }

  .game {
    width: 100%;
    aspect-ratio: 1 / 1;
    background-color: #DDDDDD;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    &:not(.active) {
      pointer-events: none;
    }
  }

  .square {
    border: 1rem solid;

    .content {
      font-family: monospace;
      font-size: 4rem;
      aspect-ratio: 1 / 1;
    }

    .adjacentMines {
      &.mines-0 {
        visibility: hidden;
      }

      &.mines-1 {
        color: blue;
      }

      &.mines-2 {
        color: green;
      }

      &.mines-3 {
        color: red;
      }
    }

    &.shown {
      background-color: #999999;
      border-color: #888888 #AAAAAA #AAAAAA #888888;
    }

    &:not(.shown) .content {
      visibility: hidden;
    }

    &:not(.shown):not(.flag) {
      background-color: #BBBBBB;
      border: 1rem solid;
      border-color: #CCCCCC #AAAAAA #AAAAAA #CCCCCC;

      cursor: pointer;

      &:hover {
        border: 1rem solid;
        background-color: #AAAAAA;
        border-color: #BBBBBB #999999 #999999 #BBBBBB;
      }

      &:active {
        background-color: #999999;
        border-color: #AAAAAA #888888 #888888 #AAAAAA;
      }
    }

    &.flag {
      background-color: #EE0000;
      border-color: #FF0000 #DD0000 #DD0000 #FF0000;
    }

  }
</style>
