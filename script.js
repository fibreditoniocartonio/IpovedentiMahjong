/**
 * MAHJONG SOLITARIO PER NONNO - Versione 2.0
 */

// --- CONFIGURAZIONE E STATO ---
var TILE_WIDTH = 60;
var TILE_HEIGHT = 80;
// Offset 3D aumentato per visibilità
var OFFSET_X = 10; 
var OFFSET_Y = 10; 

// Limiti Zoom
var MIN_ZOOM = 0.75; // Impedisce che diventi troppo piccolo
var MAX_ZOOM = 2.5;

var state = {
    seed: 1,
    tiles: [],
    zoom: 1.0,
    panX: 0,
    panY: 0,
    selectedId: null
};

// Generatore Random (LCG)
var Random = {
    _seed: 1,
    init: function(s) { this._seed = s % 2147483647; if (this._seed <= 0) this._seed += 2147483646; },
    next: function() { return (this._seed = this._seed * 16807 % 2147483647); },
    nextFloat: function() { return (this.next() - 1) / 2147483646; }
};

// --- SIMBOLI (Alto contrasto) ---
var SYMBOLS = [
    { content: "1", class: "type-number" }, { content: "2", class: "type-number" }, { content: "3", class: "type-number" },
    { content: "4", class: "type-number" }, { content: "5", class: "type-number" }, { content: "6", class: "type-number" },
    { content: "7", class: "type-number" }, { content: "8", class: "type-number" }, { content: "9", class: "type-number" },
    
    { content: "A", class: "type-letter" }, { content: "B", class: "type-letter" }, { content: "C", class: "type-letter" },
    { content: "D", class: "type-letter" }, { content: "E", class: "type-letter" }, { content: "F", class: "type-letter" },
    { content: "G", class: "type-letter" }, { content: "H", class: "type-letter" }, { content: "K", class: "type-letter" },
    
    { content: "●", class: "type-shape" }, { content: "■", class: "type-shape" }, { content: "▲", class: "type-shape" },
    { content: "★", class: "type-shape" }, { content: "✚", class: "type-shape" }, { content: "◆", class: "type-shape" },
    { content: "♥", class: "type-shape" }, { content: "♠", class: "type-shape" }, { content: "♣", class: "type-shape" },
    
    { content: "I", class: "type-roman" }, { content: "II", class: "type-roman" }, { content: "III", class: "type-roman" },
    { content: "IV", class: "type-roman" }, { content: "V", class: "type-roman" }, { content: "VI", class: "type-roman" },
    { content: "X", class: "type-roman" }, { content: "O", class: "type-roman" }, { content: "=", class: "type-roman" }
];

// --- LOGICA GENERAZIONE ---

function getTurtleLayout() {
    var pos = [];
    var x, y;
    
    // Livello 0 (Base)
    for(x=0; x<12; x++) {
        for(y=0; y<8; y++) {
             if((x===0 || x===11) && (y===0 || y===7)) continue;
             pos.push({x: x*2, y: y*2, z: 0});
        }
    }
    // Livello 1
    for(x=3; x<9; x++) {
        for(y=2; y<6; y++) {
            pos.push({x: x*2, y: y*2, z: 1});
        }
    }
    // Livello 2
    for(x=4; x<8; x++) {
        for(y=3; y<5; y++) {
            pos.push({x: x*2, y: y*2, z: 2});
        }
    }
    // Livello 3 (Cima)
    pos.push({x: 10, y: 7, z: 3}); 
    pos.push({x: 12, y: 7, z: 3}); 

    // Extra per arrivare a 144
    pos.push({x: -4, y: 7, z: 0}); pos.push({x: -2, y: 7, z: 0});
    pos.push({x: 24, y: 7, z: 0}); pos.push({x: 26, y: 7, z: 0});
    
    while(pos.length < 144) {
        var rx = Math.floor(Random.nextFloat() * 14) * 2;
        var ry = Math.floor(Random.nextFloat() * 10) * 2;
        var exists = false;
        for(var i=0; i<pos.length; i++) if(pos[i].x === rx && pos[i].y === ry && pos[i].z === 0) exists=true;
        if(!exists) pos.push({x: rx, y: ry, z: 0});
    }
    
    return pos.slice(0, 144);
}

function isFree(target, allTiles, onlyActive) {
    if (onlyActive && target.removed) return false;

    var blockedAbove = false;
    var blockedLeft = false;
    var blockedRight = false;

    for (var i = 0; i < allTiles.length; i++) {
        var other = allTiles[i];
        if (onlyActive && other.removed) continue;
        if (other.id === target.id) continue;

        // Sopra
        if (other.z === target.z + 1) {
            if (Math.abs(other.x - target.x) < 2 && Math.abs(other.y - target.y) < 2) blockedAbove = true;
        }

        // Lati
        if (other.z === target.z) {
            if (Math.abs(other.y - target.y) < 2) {
                if (other.x === target.x - 2) blockedLeft = true;
                if (other.x === target.x + 2) blockedRight = true;
            }
        }
    }

    if (blockedAbove) return false;
    if (blockedLeft && blockedRight) return false;
    return true;
}

function generateSolvableBoard() {
    var positions = getTurtleLayout();
    var simTiles = [];
    for(var i=0; i<positions.length; i++) {
        simTiles.push({
            id: i,
            x: positions[i].x, y: positions[i].y, z: positions[i].z,
            removed: false, assigned: false
        });
    }

    var pairsCount = 72;
    for (var p = 0; p < pairsCount; p++) {
        var candidates = [];
        for (var i = 0; i < simTiles.length; i++) {
            if (!simTiles[i].assigned && isFree(simTiles[i], simTiles, true)) {
                candidates.push(i);
            }
        }

        if (candidates.length < 2) return generateSolvableBoard(); // Riprova

        var idx1 = Math.floor(Random.nextFloat() * candidates.length);
        var t1 = candidates[idx1];
        candidates.splice(idx1, 1);
        
        var idx2 = Math.floor(Random.nextFloat() * candidates.length);
        var t2 = candidates[idx2];

        simTiles[t1].pairGroup = p;
        simTiles[t2].pairGroup = p;
        simTiles[t1].assigned = true; simTiles[t1].removed = true;
        simTiles[t2].assigned = true; simTiles[t2].removed = true;
    }

    var symbolDeck = [];
    for(var s=0; s<36; s++) { symbolDeck.push(s); symbolDeck.push(s); }
    
    // Mischia
    for(var k=symbolDeck.length-1; k>0; k--) {
        var j = Math.floor(Random.nextFloat() * (k+1));
        var temp = symbolDeck[k]; symbolDeck[k] = symbolDeck[j]; symbolDeck[j] = temp;
    }

    var finalTiles = [];
    for(var i=0; i<simTiles.length; i++) {
        var t = simTiles[i];
        finalTiles.push({
            id: t.id,
            x: t.x, y: t.y, z: t.z,
            type: symbolDeck[t.pairGroup],
            visible: true
        });
    }
    return finalTiles;
}

// --- RENDER ---

function renderBoard() {
    var wrapper = document.getElementById('board-wrapper');
    wrapper.innerHTML = '';
    
    // Posizionamento wrapper (pan e zoom)
    wrapper.style.transform = 'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.zoom + ')';

    // Ordina per rendering (z -> y -> x)
    var renderList = state.tiles.slice().sort(function(a, b) {
        if (a.z !== b.z) return a.z - b.z;
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
    });

    for (var i = 0; i < renderList.length; i++) {
        var t = renderList[i];
        if (!t.visible) continue;

        var clickable = isFree(t, state.tiles, true);

        var el = document.createElement('div');
        var classes = 'tile ';
        if (state.selectedId === t.id) classes += 'selected ';
        if (!clickable) classes += 'blocked ';
        
        el.className = classes;
        
        // Calcolo posizione con offset 3D accentuato
        var left = (t.x * (TILE_WIDTH/2)) - (t.z * OFFSET_X);
        var top = (t.y * (TILE_HEIGHT/2)) - (t.z * OFFSET_Y);
        
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        el.style.zIndex = (t.z * 10) + Math.floor(t.y); 

        var sym = SYMBOLS[t.type];
        el.innerHTML = sym.content;
        el.classList.add(sym.class);
        
        if (clickable) {
            (function(tid) {
                el.onclick = function(e) { e.stopPropagation(); handleTileClick(tid); };
            })(t.id);
        }

        wrapper.appendChild(el);
    }
}

// --- LOGICA INTERAZIONE ---

function handleTileClick(id) {
    var tile = null;
    for(var i=0; i<state.tiles.length; i++) if(state.tiles[i].id === id) tile = state.tiles[i];
    
    if (state.selectedId === null) {
        state.selectedId = id;
    } else if (state.selectedId === id) {
        state.selectedId = null; 
    } else {
        var other = null;
        for(var j=0; j<state.tiles.length; j++) if(state.tiles[j].id === state.selectedId) other = state.tiles[j];

        if (other.type === tile.type) {
            tile.visible = false; tile.removed = true;
            other.visible = false; other.removed = true;
            state.selectedId = null;
            checkWin();
        } else {
            state.selectedId = id;
        }
    }
    saveGame();
    renderBoard();
}

function checkWin() {
    var remaining = 0;
    for(var i=0; i<state.tiles.length; i++) if(state.tiles[i].visible) remaining++;
    if(remaining === 0) {
        setTimeout(function() {
            alert("Complimenti Nonno! Hai vinto!");
            openNewGameModal();
        }, 500);
    }
}

// --- GESTIONE VISTA (ZOOM & PAN) ---
var container = document.getElementById('game-container');
var isDragging = false;
var lastX, lastY;

function centerAndFitBoard() {
    var minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
    
    for(var i=0; i<state.tiles.length; i++) {
        var t = state.tiles[i];
        if(!t.visible) continue;
        
        var tx = (t.x * (TILE_WIDTH/2)) - (t.z * OFFSET_X);
        var ty = (t.y * (TILE_HEIGHT/2)) - (t.z * OFFSET_Y);
        
        if(tx < minX) minX = tx;
        if(tx + TILE_WIDTH > maxX) maxX = tx + TILE_WIDTH;
        if(ty < minY) minY = ty;
        if(ty + TILE_HEIGHT > maxY) maxY = ty + TILE_HEIGHT;
    }
    
    var boardW = maxX - minX;
    var boardH = maxY - minY;
    var winW = window.innerWidth;
    var winH = window.innerHeight - 60; 
    
    var scaleX = winW / (boardW + 100);
    var scaleY = winH / (boardH + 100);
    var newZoom = (scaleX < scaleY) ? scaleX : scaleY;
    
    if(newZoom > 1.5) newZoom = 1.5;
    if(newZoom < MIN_ZOOM) newZoom = MIN_ZOOM; // Usa il nuovo limite

    state.zoom = newZoom;
    
    var centerX = minX + boardW / 2;
    var centerY = minY + boardH / 2;
    state.panX = -centerX;
    state.panY = -centerY;
    
    renderBoard();
}

window.oncontextmenu = function(e) { e.preventDefault(); return false; };

container.addEventListener('mousedown', function(e) {
    if (e.button === 2) {
        isDragging = true;
        lastX = e.clientX; lastY = e.clientY;
        container.style.cursor = 'grabbing';
    }
});

window.addEventListener('mousemove', function(e) {
    if (isDragging) {
        var dx = e.clientX - lastX;
        var dy = e.clientY - lastY;
        
        // FIX PANNING: Rimosso la divisione per zoom. 
        // Ora il movimento del mouse corrisponde esattamente al movimento della tavola su schermo.
        var newPanX = state.panX + dx;
        var newPanY = state.panY + dy;
        
        // Limiti
        var limit = 1500;
        if (newPanX > limit) newPanX = limit;
        if (newPanX < -limit) newPanX = -limit;
        if (newPanY > limit) newPanY = limit;
        if (newPanY < -limit) newPanY = -limit;

        state.panX = newPanX;
        state.panY = newPanY;

        lastX = e.clientX;
        lastY = e.clientY;
        
        var wrapper = document.getElementById('board-wrapper');
        wrapper.style.transform = 'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.zoom + ')';
    }
});

window.addEventListener('mouseup', function(e) {
    if (isDragging) { isDragging = false; container.style.cursor = 'grab'; saveGame(); }
});

container.addEventListener('wheel', function(e) {
    if (e.preventDefault) e.preventDefault();
    var scaleAmount = 0.05;
    
    if (e.deltaY < 0) {
        state.zoom += scaleAmount;
        if (state.zoom > MAX_ZOOM) state.zoom = MAX_ZOOM;
    } else {
        state.zoom -= scaleAmount;
        if (state.zoom < MIN_ZOOM) state.zoom = MIN_ZOOM; // Usa costante MIN_ZOOM (0.75)
    }
    
    var wrapper = document.getElementById('board-wrapper');
    wrapper.style.transform = 'translate(' + state.panX + 'px, ' + state.panY + 'px) scale(' + state.zoom + ')';
    
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveGame, 1000);
});

// --- SISTEMA ---
function saveGame() {
    try { localStorage.setItem('mahjong_nonno_state', JSON.stringify(state)); } catch(e) {}
}

function loadGame() {
    try {
        var s = localStorage.getItem('mahjong_nonno_state');
        if (s) {
            var loaded = JSON.parse(s);
            if (loaded.tiles && loaded.tiles.length > 0) {
                state = loaded;
                document.getElementById('current-seed').innerText = state.seed;
                return true;
            }
        }
    } catch(e) {}
    return false;
}

function startNewGame(seedInput) {
    var seed = parseInt(seedInput);
    if (isNaN(seed)) seed = Math.floor(Math.random() * 100000);
    Random.init(seed);
    state.seed = seed;
    state.tiles = generateSolvableBoard();
    state.selectedId = null;
    document.getElementById('current-seed').innerText = state.seed;
    centerAndFitBoard();
    saveGame();
}

function openNewGameModal() {
    document.getElementById('seed-input').value = Math.floor(Math.random() * 99999) + 1;
    document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
function startNewGameFromModal() { startNewGame(document.getElementById('seed-input').value); closeModal(); }

// INIT
window.onload = function() {
    if (!loadGame()) {
        startNewGame(Math.floor(Math.random() * 10000));
    } else {
        renderBoard();
    }
};