let config = require("visual-config-exposer").default;

const DEBUG = false;

const rows = config.settings.rows;
const columns = config.settings.columns;
const tileSize = window.mobile() ? 35 : 40;
const start = {
    x: 300,
    y: 300
};
const tileOffset = 10;

// https://www.emanueleferonato.com/2018/12/17/pure-javascript-class-to-handle-match3-games-like-bejeweled-ready-to-communicate-with-your-favorite-html5-framework-phaser-3-example-included/

class Match3 {

    // constructor, simply turns obj information into class properties
    constructor(obj) {
        this.rows = obj.rows;
        this.columns = obj.columns;
        this.items = obj.items;
    }

    // generates the game field
    generateField() {
        this.gameArray = [];
        this.selectedItem = false;
        for (let i = 0; i < this.rows; i++) {
            this.gameArray[i] = [];
            for (let j = 0; j < this.columns; j++) {
                do {
                    let randomValue = Math.floor(Math.random() * this.items);
                    this.gameArray[i][j] = {
                        value: randomValue,
                        isEmpty: false,
                        row: i,
                        column: j
                    }
                } while (this.isPartOfMatch(i, j));
            }
        }
    }

    // returns true if there is a match in the board
    matchInBoard() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.isPartOfMatch(i, j)) {
                    return true;
                }
            }
        }
        return false;
    }
   
    // returns true if the item at (row, column) is part of a match
    isPartOfMatch(row, column) {
        return this.isPartOfHorizontalMatch(row, column) || this.isPartOfVerticalMatch(row, column);
    }

    // returns true if the item at (row, column) is part of an horizontal match
    isPartOfHorizontalMatch(row, column) {
        return this.valueAt(row, column) === this.valueAt(row, column - 1) && this.valueAt(row, column) === this.valueAt(row, column - 2) ||
            this.valueAt(row, column) === this.valueAt(row, column + 1) && this.valueAt(row, column) === this.valueAt(row, column + 2) ||
            this.valueAt(row, column) === this.valueAt(row, column - 1) && this.valueAt(row, column) === this.valueAt(row, column + 1);
    }

    // returns true if the item at (row, column) is part of an horizontal match
    isPartOfVerticalMatch(row, column) {
        return this.valueAt(row, column) === this.valueAt(row - 1, column) && this.valueAt(row, column) === this.valueAt(row - 2, column) ||
            this.valueAt(row, column) === this.valueAt(row + 1, column) && this.valueAt(row, column) === this.valueAt(row + 2, column) ||
            this.valueAt(row, column) === this.valueAt(row - 1, column) && this.valueAt(row, column) === this.valueAt(row + 1, column)
    }

    // returns the value of the item at (row, column), or false if it's not a valid pick
    valueAt(row, column) {
        if (!this.validPick(row, column)) {
            return false;
        }
        return this.gameArray[row][column].value;
    }

    // returns true if the item at (row, column) is a valid pick
    validPick(row, column) {
        return row >= 0 && row < this.rows && column >= 0 && column < this.columns && this.gameArray[row] != undefined && this.gameArray[row][column] != undefined;
    }

    // returns the number of board rows
    getRows() {
        return this.rows;
    }

    // returns the number of board columns
    getColumns() {
        return this.columns;
    }

    // sets a custom data on the item at (row, column)
    setCustomData(row, column, customData) {
        this.gameArray[row][column].customData = customData;
    }

    // returns the custom data of the item at (row, column)
    customDataOf(row, column) {
        return this.gameArray[row][column].customData;
    }

    // returns the selected item
    getSelectedItem() {
        return this.selectedItem;
    }

    // set the selected item as a {row, column} object
    setSelectedItem(row, column) {
        this.selectedItem = {
            row: row,
            column: column
        }
    }

    // deleselects any item
    deleselectItem() {
        this.selectedItem = false;
    }

    // checks if the item at (row, column) is the same as the item at (row2, column2)
    areTheSame(row, column, row2, column2) {
        return row == row2 && column == column2;
    }

    // returns true if two items at (row, column) and (row2, column2) are next to each other horizontally or vertically
    areNext(row, column, row2, column2) {
        return Math.abs(row - row2) + Math.abs(column - column2) == 1;
    }

    // swap the items at (row, column) and (row2, column2) and returns an object with movement information
    swapItems(row, column, row2, column2) {
        let tempObject = Object.assign(this.gameArray[row][column]);
        this.gameArray[row][column] = Object.assign(this.gameArray[row2][column2]);
        this.gameArray[row2][column2] = Object.assign(tempObject);
        return [{
            row: row,
            column: column,
            deltaRow: row - row2,
            deltaColumn: column - column2
        }, {
            row: row2,
            column: column2,
            deltaRow: row2 - row,
            deltaColumn: column2 - column
        }]
    }
 
    // return the items part of a match in the board as an array of {row, column} object
    getMatchList() {
        let matches = [];
        let destroyRows = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (this.isPartOfMatch(i, j)) {
                    matches.push({
                        row: i,
                        column: j
                    });
                    if (this.customDataOf(i, j) && this.customDataOf(i, j).special) {
                        destroyRows.push(i);
                    }
                }
            }
        }
        
        destroyRows.map(row => {
            for (let i = 0; i < this.columns; i++) {
                matches.push({
                    row: row,
                    column: i
                });
            }
        });
            
        return matches;
    }

    // removes all items forming a match
    removeMatches() {
        let matches = this.getMatchList();
        matches.forEach(function(item) {
            this.setEmpty(item.row, item.column)
        }.bind(this))
    }

    // set the item at (row, column) as empty
    setEmpty(row, column) {
        this.gameArray[row][column].isEmpty = true;
    }

    // returns true if the item at (row, column) is empty
    isEmpty(row, column) {
        return this.gameArray[row][column].isEmpty;
    }

    // returns the amount of empty spaces below the item at (row, column)
    emptySpacesBelow(row, column) {
        let result = 0;
        if (row != this.getRows()) {
            for (let i = row + 1; i < this.getRows(); i++) {
                if (this.isEmpty(i, column)) {
                    result++;
                }
            }
        }
        return result;
    }

    // arranges the board after a match, making items fall down. Returns an object with movement information
    arrangeBoardAfterMatch() {
        let result = []
        for (let i = this.getRows() - 2; i >= 0; i--) {
            for (let j = 0; j < this.getColumns(); j++) {
                let emptySpaces = this.emptySpacesBelow(i, j);
                if (!this.isEmpty(i, j) && emptySpaces > 0) {
                    this.swapItems(i, j, i + emptySpaces, j)
                    result.push({
                        row: i + emptySpaces,
                        column: j,
                        deltaRow: emptySpaces,
                        deltaColumn: 0
                    });
                }
            }
        }
        return result;
    }

    // replenished the board and returns an object with movement information
    replenishBoard() {
        let result = [];
        for (let i = 0; i < this.getColumns(); i++) {
            if (this.isEmpty(0, i)) {
                let emptySpaces = this.emptySpacesBelow(0, i) + 1;
                for (let j = 0; j < emptySpaces; j++) {
                    let randomValue = Math.floor(Math.random() * this.items);
                    result.push({
                        row: j,
                        column: i,
                        deltaRow: emptySpaces,
                        deltaColumn: 0
                    });
                    this.gameArray[j][i].value = randomValue;
                    this.gameArray[j][i].isEmpty = false;
                }
            }
        }
        return result;
    }
}

class Tile {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.scale = 1;
        this.fitSize = tileSize;
    }

    makeSpecial() {
        this.special = true;
        this.growDuration = 0.3;
        this.growCd = this.growDuration;
        this.grow = true;
        this.minSize = tileSize * 0.9;
        this.maxSize = tileSize * 1.1;
        this.minRot = -12;
        this.maxRot = 12;
        if (random(100) < 50) {
            [this.minSize, this.maxSize] = [this.maxSize, this.minSize];
            [this.minRot, this.maxRot] = [this.maxRot, this.minRot];
        }
    }

    draw() {

        if (this.special) {
            if (this.grow) {
                this.fitSize = map(this.growCd, this.growDuration, 0, this.minSize, this.maxSize); 
                this.rotation = map(this.growCd, this.growDuration, 0, this.minRot, this.maxRot);
            } else {
                this.fitSize = map(this.growCd, this.growDuration, 0, this.maxSize, this.minSize);
                this.rotation = map(this.growCd, this.growDuration, 0, this.maxRot, this.minRot);
            }

            this.growCd -= deltaTime / 1000;
            if (this.growCd < 0) {
                this.growCd = this.growDuration;
                this.grow = !this.grow;
            }
        }

        if (!this.special) {
            this.fitSize = tileSize;
            this.rotation = 0;
        }

        let img = window.images.objects[this.value];
        let size = calculateAspectRatioFit(img.width, img.height, this.fitSize, this.fitSize);

        push();
        translate(start.x + this.y * (tileSize + tileOffset), start.y + this.x * (tileSize + tileOffset));
        scale(this.scale);
        rotate(radians(this.rotation));
        imageMode(CENTER);
        image(img, 0, 0, size.width, size.height);
        imageMode(CORNER);
        pop();
    }
}

class Game {
    constructor() {
        this.defaults();

        this.match3 = new Match3({
            rows: rows,
            columns: columns,
            items: Object.values(window.images.objects).length
        });

        this.match3.generateField();

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                let value = this.match3.valueAt(i, j);
                let tile = new Tile(i, j, value);
                this.match3.setCustomData(i, j, tile);
            }
        }

        this.canPick = true;
        this.dragging = false;

        if (config.settings.fixedLength) {
            this.gameTimer = config.settings.gameLength;
        }

        this.startPoint = undefined;
        this.touchCD = 0;
        this.minTouchDistance = tileSize * 0.6;

        this.messageTextSize = 0;
        this.startTween = false;
    }

    updateGame() {
        if (config.settings.fixedLength && this.score > 0) {

            textAlign(RIGHT);
            fill(color(config.settings.textColor));
            noStroke();
            textSize(this.scoreFontSize * 0.6);
            textFont(config.preGameScreen.fontFamily);
            text(this.gameTimer.toFixed(1), width - 25, this.scoreFontSize);

            this.gameTimer -= deltaTime / 1000;

            if (this.gameTimer < 0) {
                this.gameTimer = 0;
            }

            if (this.gameTimer <= 0 && !this.finished) {
                this.finishGame();
            }
        }

        if (this.finished) {
            if (!this.startTween) {
                if (config.settings.fixedLegth && this.score < config.settings.scoreToWin) {
                    playSound(window.sounds.lose);
                } else if (config.settings.fixedLength && this.score >= config.settings.scoreToWin) {
                    playSound(window.sounds.win);
                }

                shifty.tween({
                    from: {
                        size: 0
                    },
                    to: {
                        size: this.scoreFontSize * 1.2
                    },
                    duration: (this.delayBeforeExit * 0.6) * 1000,
                    easing: "elastic",
                    step: state => {
                        this.messageTextSize = state.size;
                    }
                });
                this.startTween = true;
            }

            textAlign(CENTER);
            textStyle(BOLD);
            textFont(config.preGameScreen.fontFamily);
            fill(color(config.settings.messageTextColor));
            noStroke();
            textSize(this.messageTextSize);
            let message = (config.settings.fixedLength && this.score < config.settings.scoreToWin) ? config.settings.timeUpText : config.settings.winText;
            text(message, width / 2, height / 4);
            textStyle(NORMAL);
        }
    }

    permaUpdate() {

        if (!this.finished) {
            this.swipeSelect();
        }

        if (config.settings.showGrid) {
            stroke(color(config.settings.gridColor));
            noFill();
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    let x = start.x + (tileSize + tileOffset) * i - tileSize / 2 - tileOffset / 2;
                    let y = start.y + (tileSize + tileOffset) * j - tileSize / 2 - tileOffset / 2;
                    rect(x, y, tileSize + tileOffset, tileSize + tileOffset);
                }
            }
        }

        // draw field
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                this.match3.customDataOf(i, j).draw();
            }
        }

        let item = this.match3.getSelectedItem();

        if (item) {
            stroke(color(config.settings.gridColor));
            noFill();
            rect(start.x + ((tileSize + tileOffset) * item.column) - tileSize / 2, start.y + ((tileSize + tileOffset) * item.row) - tileSize / 2, tileSize, tileSize);
        }
    }

    gemSelect() {
        if (this.canPick) {
            this.dragging = true;

            let row = floor((mouseY - start.y + tileSize / 2) / (tileSize + tileOffset));
            let col = floor((mouseX - start.x + tileSize / 2) / (tileSize + tileOffset));

            if (this.match3.validPick(row, col)) {

                this.selectedGem = this.match3.getSelectedItem();

                if (!this.selectedGem) {
                    this.match3.setSelectedItem(row, col);

                    // scale up the selected item
                    shifty.tween({
                        from: {
                            scale: 1
                        },
                        to: {
                            scale: 1.2
                        },
                        duration: 100,
                        easing: "bounce",
                        step: state => {
                            this.match3.customDataOf(row, col).scale = state.scale;
                        }
                    });
                } else {
                    if (this.match3.areTheSame(row, col, this.selectedGem.row, this.selectedGem.column)) {
                        this.match3.customDataOf(row, col).scale = 1;
                        this.match3.deleselectItem();
                    } else {
                        if (this.match3.areNext(row, col, this.selectedGem.row, this.selectedGem.column)) {
                            this.match3.customDataOf(this.selectedGem.row, this.selectedGem.column).scale = 1;
                            this.match3.deleselectItem();
                            this.swapGems(row, col, this.selectedGem.row, this.selectedGem.column, true);
                        } else {
                            this.match3.customDataOf(this.selectedGem.row, this.selectedGem.column).scale = 1;
                            shifty.tween({
                                from: {
                                    scale: 1
                                },
                                to: {
                                    scale: 1.2
                                },
                                duration: 100,
                                easing: "bounce",
                                step: state => {
                                    this.match3.customDataOf(row, col).scale = state.scale;
                                }
                            });
                            this.match3.setSelectedItem(row, col);
                        }
                    }
                }
            }
        }
    }

    swipeSelect() {

        if (mouseIsPressed && this.startPoint == undefined && this.canPick) {
            this.startPoint = {
                x: mouseX,
                y: mouseY
            };
            this.touchCD = 1.5;

            this.dragging = true;

            // select gem
            this.row = floor((mouseY - start.y + tileSize / 2) / (tileSize + tileOffset));
            this.col = floor((mouseX - start.x + tileSize / 2) / (tileSize + tileOffset));

            this.valid = this.match3.validPick(this.row, this.col);

            if (this.valid) {
                this.selectedGem = this.match3.getSelectedItem();

                if (!this.selectedGem) {
                    this.match3.setSelectedItem(this.row, this.col);
                    shifty.tween({
                        from: {
                            scale: 1
                        },
                        to: {
                            scale: 1.2
                        },
                        duration: 100,
                        easing: "bounce",
                        step: state => {
                            try {
                                this.match3.customDataOf(this.row, this.col).scale = state.scale;
                            } catch(err) {}
                        }
                    });
                }
            }
        }

        if (this.startPoint != undefined && this.canPick) {
            this.touchCD -= deltaTime / 1000;
            if (!mouseIsPressed) {
                let distance = dist(this.startPoint.x, this.startPoint.y, mouseX, mouseY);

                if (this.touchCD > 0 && distance > this.minTouchDistance) {
                    let dir = createVector(mouseX - this.startPoint.x, mouseY - this.startPoint.y);
                    dir.normalize();

                    if (this.valid) {
                        if (dir.x > 0 && dir.y < 0.45 && dir.y > -0.45) {
                            // console.log("right");
                            if (this.col == columns - 1) {
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.match3.deleselectItem();
                            } else {
                                this.match3.deleselectItem();
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.swapGems(this.row, this.col, this.row, this.col + 1, true);
                            }
                        } else if (dir.x < 0 && dir.y < 0.45 && dir.y > -0.45) {
                            // console.log("left");
                            if (this.col == 0) {
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.match3.deleselectItem();
                            } else {
                                this.match3.deleselectItem();
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.swapGems(this.row, this.col, this.row, this.col - 1, true);
                            } 
                        } else if (dir.x < 0.45 && dir.x > -0.45 && dir.y < 0) {
                            // console.log("up");
                            if (this.row == 0) {
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.match3.deleselectItem();
                            } else {
                                this.match3.deleselectItem();
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.swapGems(this.row, this.col, this.row - 1, this.col, true);
                            } 
                        } else if (dir.x < 0.45 && dir.x > -0.45 && dir.y > 0) {
                            // console.log("down");
                            if (this.row == rows - 1) {
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.match3.deleselectItem();
                            } else {
                                this.match3.deleselectItem();
                                this.match3.customDataOf(this.row, this.col).scale = 1;
                                this.swapGems(this.row + 1, this.col, this.row, this.col, true);
                            } 
                        }
                    }
                }

                if (this.valid) {
                    this.match3.customDataOf(this.row, this.col).scale = 1;
                    if (this.selectedGem) {
                        this.customDataOf(this.selectedGem.row, this.selectedGem.column).scale = 1;
                    }
                    this.match3.deleselectItem();
                }

                this.startPoint = undefined;
                this.valid = null;
                this.row = null;
                this.column = null;
            }
        }
    }

    swapGems(row, col, row2, col2, swapBack) {
        let movements = this.match3.swapItems(row, col, row2, col2);
        this.swappingGems = 2;
        this.canPick = false

        movements.map(m => {
            shifty.tween({
                from: {
                    x: this.match3.customDataOf(m.row, m.column).x,
                    y: this.match3.customDataOf(m.row, m.column).y
                },
                to: {
                    x: this.match3.customDataOf(m.row, m.column).x + m.deltaRow,
                    y: this.match3.customDataOf(m.row, m.column).y + m.deltaColumn
                },
                easing: "bounce",
                duration: 150,
                step: state => {
                    this.match3.customDataOf(m.row, m.column).x = state.x;
                    this.match3.customDataOf(m.row, m.column).y = state.y;
                }
            }).then(() => {
                this.swappingGems--;
                if (this.swappingGems == 0) {
                    if (!this.match3.matchInBoard()) {
                        if (swapBack) {
                            this.swapGems(row, col, row2, col2, false);
                            if (config.settings.wrongMoves) {
                                this.score -= config.settings.wrongMovePoints;
                                if (this.score < 0) {
                                    this.score = 0;
                                }
                                playSound(window.sounds.incorrect);
                            }
                            if (config.settings.timeWrongMoves && this.score > 0) {
                                this.gameTimer -= config.settings.wrongMoveTime;
                            }
                        } else {
                            this.canPick = true;
                        }
                    } else {
                        this.handleMatches();
                    }
                }
            });
        });
    }

    handleMatches() {
        let gemsToRemove = this.match3.getMatchList();

        this.score += gemsToRemove.length * config.settings.correctMovePoints;
        this.c_scoreFontSize = this.scoreFontSize * 1.8;
        playSound(window.sounds.correct);

        let destroyed = 0;
        gemsToRemove.map(gem => {

            let img = window.images.objects[this.match3.valueAt(gem.row, gem.column)];
            let x = start.x + gem.column * (tileSize + tileOffset) - tileSize / 2;
            let y = start.y + gem.row * (tileSize + tileOffset) - tileSize / 2;
            for (let i = 0; i < 5; i++) {
                let p = new Particle(x, y,randomParticleAcc(6), random(tileSize * 0.8, tileSize * 1.2));
                p.setLifespan(random(0.3, 0.5));
                p.image = img;
                this.particles.push(p);
            }
            
            let ft = new FloatingText(config.settings.correctMovePoints, x + tileSize / 2, y + tileSize / 2, { x: random(-1, 1), y: -3 }, random(30, 40), color(config.settings.onboardTextColor));
            ft.font = config.preGameScreen.fontFamily;
            this.particles.push(ft);

            destroyed++;

            shifty.tween({
                from: {
                    scale: 1
                },
                to: {
                    scale: 0
                },
                duration: 150,
                easing: "bounce",
                step: state => {
                    this.match3.customDataOf(gem.row, gem.column).scale = state.scale;
                }
            }).then(() => {
                destroyed--;
                if (destroyed == 0) {
                    this.makeGemsFall();
                }
            });
        });
    }

    makeGemsFall() {
        let moved = 0;
        this.match3.removeMatches();

        let fallingMovements = this.match3.arrangeBoardAfterMatch();

        fallingMovements.map(move => {
            moved++;

            shifty.tween({
                from: {
                    y: this.match3.customDataOf(move.row, move.column).x
                },
                to: {
                    y: this.match3.customDataOf(move.row, move.column).x + move.deltaRow,
                },
                duration: 200,
                easing: "easeInQuad",
                step: state => {
                    this.match3.customDataOf(move.row, move.column).x = state.y;
                }
            }).then(() => {
                moved--;
                if (moved == 0) {
                    this.endOfMove();
                }
            })
        });

        let replenishMovements = this.match3.replenishBoard();

        replenishMovements.map(move => {
            moved++;

            let x = move.row - move.deltaRow + 1;
            let y = move.column;
            let value = this.match3.valueAt(move.row, move.column);

            let tile = new Tile(x, y, value);
            
            if (random(100) < parseFloat(config.settings.specialGemChance)) {
                tile.makeSpecial();
            }

            this.match3.setCustomData(move.row, move.column, tile);

            shifty.tween({
                from: {
                    y: tile.x
                },
                to: {
                    y: move.row
                },
                duration: 200,
                easing: "easeInQuad",
                step: state => {
                    tile.x = state.y;
                }
            }).then(() => {
                moved--;
                if (moved == 0) {
                    this.endOfMove();
                }
            })
        });
    }

    endOfMove() {
        if (this.match3.matchInBoard()) {
            setTimeout(() => {
                this.handleMatches();
            }, 250);
        } else {
            this.canPick = true;
            this.selectedGem = null;
        }
    }

    onMousePress() {

    }

    finishGame() {
        if (!this.finished) {
            this.finished = true;
        }
    }

    defaults() {
        noStroke();

        this.pressed = false;

        this.score = 0;

        // turn this var to true to end the game
        this.finished = false;

        this.particles = [];

        this.instructionsFontSize = height / 30;
        this.scoreFontSize = height / 18;
        this.delayBeforeExit = 2.3;

        // Don'touch these
        this.started = false;
        this.c_instructionsFontSize = 0;
        this.c_scoreFontSize = 0;
    }

    mousePressed() {
        if (mouseIsPressed && !this.mouse_pressed) {
            this.mouse_pressed = true;

            if (!this.started) {
                this.started = true;
            }
            if (this.started) {
                this.onMousePress();
            }
        } else if (!mouseIsPressed) {
            this.mouse_pressed = false;
        }
    }

    calcBgImageSize() {
        // background image size calculations
        this.bgImage = window.images.background;
        let originalRatios = {
            width: window.innerWidth / this.bgImage.width,
            height: window.innerHeight / this.bgImage.height
        };

        let coverRatio = Math.max(originalRatios.width, originalRatios.height);
        this.bgImageWidth = this.bgImage.width * coverRatio;
        this.bgImageHeight = this.bgImage.height * coverRatio;


        // also calculate board x - y
        start.x = windowWidth / 2 - floor(rows / 2) * (tileSize + tileOffset);
        start.y = windowHeight / 2 - floor(columns / 2) * (tileSize + tileOffset);
    }

    draw() {
        clear();
        try {
            image(this.bgImage, width / 2 - this.bgImageWidth / 2, height / 2 - this.bgImageHeight / 2, this.bgImageWidth, this.bgImageHeight);
        } catch (err) {
            this.calcBgImageSize();
        }

        if (window.currentScreen == "gameScreen") {
            // Draw fps if in debug mode           
            if (DEBUG) {
                noStroke();
                fill(0);
                textAlign(LEFT);
                textFont("Arial");
                textSize(16);
                text(floor(frameRate()), 0, 15);
            }

            this.mousePressed();

            this.permaUpdate();

            if (this.started) {
                this.updateGame();
            }

            this.particles = this.particles.filter(p => {
                p.draw();
                return !p.dead;
            })

            // Animate instructions font size 
            // in and out
            if (this.instructionsFontSize - this.c_instructionsFontSize > 0.1 && !this.started) {
                this.c_instructionsFontSize = lerp(this.c_instructionsFontSize, this.instructionsFontSize, 0.2);
            }

            if (this.c_instructionsFontSize > 0.1) {

                if (this.started) {
                    this.c_instructionsFontSize = lerp(this.c_instructionsFontSize, 0, 0.4);
                }

                textStyle(NORMAL);
                noStroke();
                fill(color(config.settings.textColor));
                textFont(config.preGameScreen.fontFamily);
                textSize(this.c_instructionsFontSize);
                textAlign(CENTER);

                text(config.settings.instructions1, width / 2, height / 10);
                text(config.settings.instructions2, width / 2, (height / 10) * 1.5);
                text(config.settings.instructions3, width / 2, (height / 10) * 2);
            }

            if (this.started) {
                this.c_scoreFontSize = lerp(this.c_scoreFontSize, this.scoreFontSize, 0.2);

                textStyle(NORMAL);
                noStroke();
                fill(color(config.settings.textColor));
                textAlign(LEFT);
                textSize(this.c_scoreFontSize);
                textFont(config.preGameScreen.fontFamily);
                text(this.score, 20, this.scoreFontSize * 1.3);
            }

            if (this.finished) {
                this.delayBeforeExit -= deltaTime / 1000;

                if (this.delayBeforeExit < 0) {
                    window.setEndScreenWithScore(this.score);
                }
            }
        }
    }
}

// Helper functions

function playSound(sound) {
    if (window.soundEnabled) {
        sound.play();
    }
}

function randomFromArray(arr) {
    return arr[floor(random(arr.length))];
}

function setGradient(x, y, w, h, c1, c2) {
    for (let i = y; i <= y + h; i++) {
        let inter = map(i, y, y + h, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(x, i, x + w, i);
    }
}

class FloatingText {
    constructor(text, x, y, acc, size, color) {
        this.x = x;
        this.text = text;
        this.y = y;
        this.acc = acc;
        this.size = size;
        this.color = color;
        this.lifespan = 1;
        this.iLifespan = 1;
        this.easing = "easeInQuad";
        this.dead = false;
        this.startEase = false;
        this.font = "Arial";
        this.style = NORMAL;
        this.align = CENTER;
    }

    setLifespan(amt) {
        this.lifespan = amt;
        this.iLifespan = amt;
    }

    draw() {
        if (!this.startEase) {
            shifty.tween({
                from: { size: this.size },
                to: { size: 0 },
                duration: this.iLifespan * 1000,
                easing: this.easing,
                step: state => { this.size = state.size }
            });
            this.startEase = true;
        }

        this.lifespan -= deltaTime / 1000;
        this.dead = this.lifespan <= 0;

        if (!this.dead) {

            this.x += this.acc.x;
            this.y += this.acc.y;

            noStroke();
            fill(this.color);
            textAlign(this.align);
            textSize(this.size);
            textStyle(this.style);
            textFont(this.font);
            text(this.text, this.x, this.y);
        }
    }
}

class Particle {
    constructor(x, y, acc, size, _color) {
        this.x = x;
        this.y = y;
        this.acc = acc;
        this.size = size;
        this.lifespan = random(0.5, 0.1);
        this.iLifespan = this.lifespan;
        this.iSize = this.size;
        this.dead = false;
        if (_color) {
            this.color = _color;
        }
        this.image;
        this.rotation = 0;
        this.rotSpeed = 0;
        this.easing = "easeOutSine";
        this.startEase = false;
    }

    setLifespan(lifespan) {
        this.lifespan = lifespan;
        this.iLifespan = lifespan;
    }

    draw() {

        if (!this.startEase) {
            this.startEase = true;
            shifty.tween({
                from: { size: this.iSize },
                to: { size: 0 },
                duration: this.iLifespan * 1000,
                easing: this.easing,
                step: state => { this.size = state.size; }  
            });
        }

        this.lifespan -= deltaTime / 1000;

        this.rotation += this.rotSpeed * deltaTime / 1000;

        this.dead = this.lifespan <= 0;

        if (!this.dead) {

            this.x += this.acc.x;
            this.y += this.acc.y;

            if (this.image) {
                imageMode(CENTER);
                image(this.image, this.x, this.y, this.size, this.size);
                imageMode(CORNER);
            } else {
                fill(this.color);
                circle(this.x, this.y, this.size);
            }
        }
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.debugColor = color(255, 0, 0);
    }

    center() {
        return new Vector2(this.x + this.w / 2, this.y + this.h / 2);
    }

    top() {
        return this.y;
    }

    bottom() {
        return this.y + this.h;
    }

    left() {
        return this.x;
    }

    right() {
        return this.x + this.w;
    }

    includes(v) {
        if (v != null) {
            return v.x > this.x && v.y > this.y && v.x < this.right() && v.y < this.bottom();
        }
        return false;
    }

    debug() {
        if (DEBUG) {
            stroke(this.debugColor);
            rectMode(CORNER);
            noFill();
            rect(this.x, this.y, this.w, this.h);
        }
    }

    static FromPosition(x, y, w, h = w) {
        return new Rectangle(x - w / 2, y - h / 2, w, h);
    }
}

function intersectRect(r1, r2) {
    return !(r2.left() > r1.right() ||
        r2.right() < r1.left() ||
        r2.top() > r1.bottom() ||
        r2.bottom() < r1.top());
}

function randomParticleAcc(amt) {
    let x = random(-amt, amt);
    let y = random(-amt, amt);
    return {
        x,
        y
    };
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
        width: srcWidth * ratio,
        height: srcHeight * ratio
    };
}

//------------------------------ 

module.exports = Game;
