const grid = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const addedScoreElement = document.getElementById("added-score");
const modalContainer = document.querySelector(".modal-container");
const tryAgainBtn = document.getElementById("try-again");
const newGameBtn = document.getElementById("new-game");
const recordElement = document.getElementById("record");
const upBtn = document.getElementById("up-btn");
const leftBtn = document.getElementById("left-btn");
const downBtn = document.getElementById("down-btn");
const rightBtn = document.getElementById("right-btn");

let score;
let record;
const cells = [];

const getRecord = () => {
  record = localStorage.getItem("2048-record");
  if (record !== null) return +record;
  return record;
};

const setRecord = () => {
  recordElement.textContent = record;
  localStorage.setItem("2048-record", record);
};

const startGame = () => {
  score = 0;
  scoreElement.textContent = score;

  if (getRecord()) {
    setRecord();
  } else {
    record = 0;
    setRecord();
  }

  createTile(2);
  createTile();
};

const getLightness = (value) => {
  const bgLightness = Math.log2(value) * 7.5;
  const colorLightness = bgLightness >= 50 ? "10%" : "90%";
  return [`${bgLightness}%`, colorLightness];
};

const createCells = () => {
  for (let x = 0; x < 4; x++) {
    const cellsGroup = [];
    for (let y = 0; y < 4; y++) {
      const cellElement = document.createElement("div");
      cellElement.classList.add("cell");
      grid.append(cellElement);

      cellsGroup.push({ x, y, tile: null, mergedBefore: false });
    }
    cells.push(cellsGroup);
  }
};

const createTile = (reservedValue) => {
  let selectedCell;
  while (!selectedCell) {
    const randomX = Math.floor(Math.random() * 4);
    const randomY = Math.floor(Math.random() * 4);

    if (!cells[randomX][randomY].tile) selectedCell = cells[randomX][randomY];
  }

  let randomValue = reservedValue;
  if (!randomValue) randomValue = Math.random() > 0.5 ? 2 : 4;

  const [bgLightness, colorLightness] = getLightness(randomValue);

  const tileElement = document.createElement("div");
  tileElement.classList.add("tile");
  tileElement.style.setProperty("--x", selectedCell.x);
  tileElement.style.setProperty("--y", selectedCell.y);
  tileElement.style.setProperty("--bg-lightness", bgLightness);
  tileElement.style.setProperty("--color-lightness", colorLightness);
  tileElement.textContent = randomValue;
  tileElement.classList.add("appear");
  tileElement.addEventListener("animationend", () => {
    tileElement.classList.remove("appear");
    tileElement.classList.remove("bounce");
  });
  grid.append(tileElement);

  const tile = { x: selectedCell.x, y: selectedCell.y, value: randomValue, element: tileElement };
  selectedCell.tile = tile;
};

const getColumns = () => {
  const columns = [];
  for (let y = 0; y < 4; y++) {
    const column = [];
    for (let x = 0; x < 4; x++) {
      column.push(cells[x][y]);
    }
    columns.push(column);
  }
  return columns;
};

const getRows = () => {
  const rows = [];
  for (let x = 0; x < 4; x++) {
    const row = [];
    for (let y = 0; y < 4; y++) {
      row.push(cells[x][y]);
    }
    rows.push(row);
  }
  return rows;
};

const fullTile = () => {
  for (const row of cells) {
    for (const cell of row) {
      if (!cell.tile) return false;
    }
  }

  return true;
};

const canMove = (_cells) => {
  for (const cellArray of _cells) {
    if (
      cellArray[0].tile.value === cellArray[1].tile.value ||
      cellArray[1].tile.value === cellArray[2].tile.value ||
      cellArray[2].tile.value === cellArray[3].tile.value
    ) {
      return true;
    }
  }

  return false;
};

const moveTiles = (_cells) => {
  let anyTileMoved = false;
  let addedScore = 0;
  const willBeRemovedMergedTiles = [];

  _cells.forEach((cellArray) => {
    for (let i = 1; i < 4; i++) {
      for (let j = i; j > 0; j--) {
        if (!cellArray[j].tile) continue;
        if (cellArray[j].mergedBefore || cellArray[j - 1].mergedBefore) continue;
        if (cellArray[j - 1].tile && cellArray[j - 1].tile.value !== cellArray[j].tile.value) continue;

        anyTileMoved = true;

        if (cellArray[j - 1].tile) {
          cellArray[j - 1].mergedBefore = true;
          cellArray[j - 1].tile = {
            ...cellArray[j - 1].tile,
            x: cellArray[j - 1].x,
            y: cellArray[j - 1].y,
            value: cellArray[j].tile.value * 2,
          };
          score += cellArray[j - 1].tile.value;
          addedScore += cellArray[j - 1].tile.value;
          scoreElement.textContent = score;
          if (score > record) {
            record = score;
            setRecord();
          }
          willBeRemovedMergedTiles.push({ ...cellArray[j].tile, x: cellArray[j - 1].x, y: cellArray[j - 1].y });
          cellArray[j].tile = null;
          cellArray[j - 1].tile.element.classList.add("bounce");
        } else {
          cellArray[j - 1].tile = { ...cellArray[j].tile, x: cellArray[j - 1].x, y: cellArray[j - 1].y };
          cellArray[j].tile = null;
        }
      }
    }

    for (const tile of willBeRemovedMergedTiles) {
      tile.element.style.setProperty("--x", tile.x);
      tile.element.style.setProperty("--y", tile.y);
    }

    for (const cell of cellArray) {
      if (cell.tile) {
        const [bgLightness, colorLightness] = getLightness(cell.tile.value);
        cell.tile.element.style.setProperty("--x", cell.tile.x);
        cell.tile.element.style.setProperty("--y", cell.tile.y);
        cell.tile.element.style.setProperty("--bg-lightness", bgLightness);
        cell.tile.element.style.setProperty("--color-lightness", colorLightness);
        cell.tile.element.textContent = cell.tile.value;
        cell.mergedBefore = false;
      }
    }
  });

  if (addedScore > 0) {
    addedScoreElement.textContent = `+${addedScore}`;
    addedScoreElement.classList.add("score-added");
  }

  if (anyTileMoved) {
    setTimeout(() => {
      for (const tile of willBeRemovedMergedTiles) {
        tile.element.remove();
      }

      createTile();

      if (fullTile()) {
        if (!canMove(getColumns()) && !canMove(getRows())) {
          modalContainer.classList.add("show-modal");
        }
      }
    }, 200);
  }
};

const newGame = () => {
  cells.forEach((row) => {
    for (const cell of row) {
      if (cell.tile) {
        cell.tile.element.remove();
        cell.tile = null;
      }
    }
  });

  startGame();
};

addedScoreElement.addEventListener("animationend", () => addedScoreElement.classList.remove("score-added"));

tryAgainBtn.addEventListener("click", () => {
  modalContainer.classList.remove("show-modal");
  newGame();
});

newGameBtn.addEventListener("click", () => newGame());

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      moveTiles(getColumns());
      break;
    case "ArrowDown":
      moveTiles(
        getColumns().map((column) => {
          return column.reverse();
        })
      );
      break;
    case "ArrowLeft":
      moveTiles(getRows());
      break;
    case "ArrowRight":
      moveTiles(
        getRows().map((row) => {
          return row.reverse();
        })
      );
      break;
  }
});

upBtn.addEventListener("click", () => moveTiles(getColumns()));
leftBtn.addEventListener("click", () => moveTiles(getRows()));
downBtn.addEventListener("click", () =>
  moveTiles(
    getColumns().map((column) => {
      return column.reverse();
    })
  )
);
rightBtn.addEventListener("click", () =>
  moveTiles(
    getRows().map((row) => {
      return row.reverse();
    })
  )
);

createCells();
startGame();
