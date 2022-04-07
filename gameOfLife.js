// Global variables
let nColumns = 20;
let nRows = 20;
let isRunning = false; //tracks whether the board is running on auto-evolve
let interval; //holds the auto-evolve interval which will need to be cleared

// Default board size
document.getElementById("num-cols").value = nColumns;
document.getElementById("num-rows").value = nRows;

// Init game
setBoard(nColumns, nRows);

// Clear and re-create the board whenever the user clicks "Set Board"
function setBoard(cols, rows) {
    clearBoard();

    if (!Number.isInteger(cols) || !Number.isInteger(rows)) {
        alert("You did not enter a number for at least one of your values!");
        return;
    }
    if (cols < 5 || rows < 5) {
        alert("At least one of your values is less than 5!");
        return;
    }
    if (cols > 99 || rows > 99) {
        alert("At least one of your values is over 99!");
        return;
    }

    nColumns = cols;
    nRows = rows;

    let board = document.getElementById("board");
    let cellWidth = 1 / cols * 100;
    let cellHeight = 1 / rows * 100;

    // Clear board completely of all dead and alive cells
    while (board.lastChild) {
      board.removeChild(board.lastChild);
    }

    // Insert row divs
    for (let r = 0; r < rows; r++) {
        let newRow = document.createElement("div");
        newRow.className = "board-row";
        newRow.style.height = String(cellHeight) + "%";
        board.appendChild(newRow);

        // Insert cell divs
        for (let c = 0; c < cols; c++) {
            let newCell = document.createElement("div");
            newCell.classList.add("cell");
            newCell.id = "r" + String(r) + "-c" + String(c)
            newCell.style.width = String(cellWidth) + "%";
            newCell.style.height = "100%";
            newCell.onclick = function() { this.classList.toggle("alive"); };
            newRow.appendChild(newCell);
        }
    }
}

// Stop continuous evolution
function stopEvolving() {
    clearInterval(interval);
    let button = document.getElementById("auto-evolve-button");
    isRunning = false;
    button.value = "stopped";
    button.innerHTML = "Auto-Evolve";
}

// Start or stop continuous evolution depending on current state
function toggleEvolve(button) {
    if (button.value === "stopped") {
        isRunning = true;
        button.value = "running";
        button.innerHTML = "Stop Evolving";
        interval = setInterval(function() { updateBoard(); }, 500);
    } else {
        stopEvolving();
    }
}

// Evolve the board once
function updateBoard() {
    let allCells = document.getElementsByClassName("cell");

    for (let i = 0; i < allCells.length; i++) {
        //iterate to get the new status of each cell
        let thisCell = allCells[i];
        let willLive = getNewStatus(thisCell.id);
        thisCell.classList.toggle("alive", willLive); //adds if willLive === true, removes if false
    }
}

// Compute the next status of a particular cell based on neighbors
function getNewStatus(cellId) {
    let numAliveNeighbors = countAliveNeighbors(cellId);
    let cell = getCell(cellId);
    let isAlive = cell.classList.contains("alive");

    if (isAlive) { //cell is alive
        if (numAliveNeighbors < 2 || numAliveNeighbors > 3) { // too few || too many
            isAlive = false; //cell dies
        }
    } else { //cell is dead
        if (numAliveNeighbors === 3) {
            isAlive = true; //cell is born
        }
    }
    return isAlive;
}

// Count the number of living neighboring cells, for a given cell
function countAliveNeighbors(cellId) {
    let neighborList = findNeighbors(cellId);
    let liveOnes = 0;

    neighborList.forEach( function(cellId) {
        let neighbor = getCell(cellId);

        if (!neighbor) {
            return;
        }
        if (neighbor.classList.contains("alive")) {
            liveOnes += 1;
        }
    });
    return liveOnes;
}

// Find the cell IDs of all neighbors of a given cell
function findNeighbors(cellId) {
    let coords = getCellCoordinates(cellId);

    let deltaList = [   [-1,-1],[-1,0], [-1,1],
				        [0,-1],         [0,1],
				        [1,-1], [1,0],  [1,1]
                    ];

    let neighborList = []; //list of cell IDs

    deltaList.forEach( function(delta) {
        // newRow = oldRow + deltaRow
        let newRow = coords[0] + delta[0];
        let newColumn = coords[1] + delta[1];

        if (newRow < 0 || newColumn < 0 || newRow >= nRows || newColumn >= nColumns) {
            //calculated cell is off the board (doesn't exist)
        } else {
            let newId = getCellId([newRow, newColumn]);
            neighborList.push(newId);
        }
    });
    return neighborList;
}

// Get the row and column numbers from the cell ID string (e.g. "r2-c4")
function getCellCoordinates(cellId) {
    let splitCell = cellId.split("-");
    let thisRow = parseInt(splitCell[0].slice(1));
    let thisColumn = parseInt(splitCell[1].slice(1));
    return [thisRow, thisColumn];
}

// Output the cell ID string for a given row and column number
function getCellId(coordList) {
    return "r" + String(coordList[0]) + "-c" + String(coordList[1]);
}

// Return the <div> element with the given ID
function getCell(cellId) {
    return document.getElementById(cellId);
}

// Set all cells to dead
function clearBoard() {
    if (isRunning) {
        stopEvolving();
    }

    let allCells = document.getElementsByClassName("cell");

    for (let i = 0; i < allCells.length; i++) {
        allCells[i].classList.remove("alive");
    }
}
