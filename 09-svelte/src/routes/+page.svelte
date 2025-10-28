<script lang="ts">
  import {writable} from "svelte/store";

  class Square {
    shown: bool;
    mine: bool;

    constructor(mine: bool) {
      this.shown = false;
      this.mine = mine;
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
      const square = g[row][col];
      square.shown = true;
      if (square.mine) {
        alert("nah bro tapte")
      }

      if (mines(row, col) == 0) {
        getAdjacent(row, col).map(([x, y]) => showSquare(x, y));
      }

      return g;
    })
  }
</script>

<div class="game">
  {#each $game as row, rowIdx}
    {#each row as square, colIdx}
      <button aria-label="square" class="square {square.shown ? 'shown' : ''}" onclick={() => showSquare(rowIdx, colIdx)}>
        {#if square.mine}
          <span class="content mine">M</span>
        {:else}
          <span class="content adjacentMines mines-{mines(rowIdx, colIdx)}">{mines(rowIdx, colIdx)}</span>
        {/if}
      </button>
    {/each}
  {/each}
</div>

<style>
  .game {
    width: 40rem;
    height: 40rem;
    background-color: #DDDDDD;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    padding: 1rem;
  }

  .square {
    border: 1rem solid;

    .content {
      font-family: monospace;
      font-size: 5rem;
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

    &:not(.shown) {
      .content {
        visibility: hidden;
      }

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
  }
</style>
