let canvas;
let jsText;

let resetBtn;
let saveBtn;

let columnsInput;
let rowsInput;
let sizeInput;
let paddingInput;
let bombsInput;

let columns = 15;
let rows = 15;
let size = 25;
let padding = 2;

let bombs = 40;
let marked = 0;
let bombMarked = 0;

let fields = [];

let ctx;

let colBomb = "#b80748";
let colNumber = "#030a6e";
let colMarked = "#d47517";

let end = false;
let win = false;

window.onload = function()
{
    canvas = document.getElementById("canvas");
    jsText = document.getElementById("text-ID");

    resetBtn = document.getElementById("reset-ID");
    saveBtn = document.getElementById("save-ID");

    resetBtn.addEventListener("click", initGame);
    saveBtn.addEventListener("click", function(){
        saveInput();
        initGame();
    });

    columnsInput = document.getElementById("columns-ID");
    rowsInput = document.getElementById("rows-ID");
    sizeInput = document.getElementById("size-ID");
    paddingInput = document.getElementById("padding-ID");
    bombsInput = document.getElementById("bombs-ID");

    loadInput();
    initGame();
}

function loadInput()
{
    columnsInput.value = columns;
    rowsInput.value = rows;
    sizeInput.value = size;
    paddingInput.value = padding;
    bombsInput.value = bombs;
}

function saveInput()
{
    columns = Number(columnsInput.value);
    rows = Number(rowsInput.value);
    size = Number(sizeInput.value);
    padding = Number(paddingInput.value);
    bombs = Number(bombsInput.value);
}

function initGame()
{
    end = false;
    win = false;
    marked = 0;
    bombMarked = 0;

    canvas.width = Number(((size+padding)*columns)+padding);
    canvas.height = Number(((size+padding)*rows)+padding)
    
    ctx = canvas.getContext("2d");
    ctx.font = "20px Arial";

    generateField(ctx);
    generateBombs();
    generateNumbers();

    canvas.addEventListener("mousedown", mouseDown);

    writeJsText();
}

function endGame()
{
    end = true;
    if(win)
    {
        alert("Game won");
    }
    else
    {
        showBombs();
        alert("Game over!");
    }
}

function generateNumbers()
{
    for(let y = 0; y < rows; y++)
    {
        for(let x = 0; x < columns; x++)
        {
            let number = 0;

            if(!fields[y][x].bomb)
            {
                for(let k = Math.max(0, (y-1)); k < Math.min(y+2, rows); k++)
                {
                    for(let i = Math.max(0, (x-1)); i < Math.min(x+2, columns); i++)
                    {
                        if(fields[k][i].bomb)
                        {
                            number++;
                        }
                    }
                }
            }
            fields[y][x].number = number;
        }
    }
}

function generateBombs()
{
    for(let i = 0; i < bombs; i++)
    {
        let y = Math.floor(Math.random() * rows);
        let x = Math.floor(Math.random() * columns);

        if(!fields[y][x].bomb)
        {
            fields[y][x].bomb = true;
        }
        else
        {
            i--;
        }
    }
}

function showBombs()
{
    for(let y = 0; y < rows; y++)
    {
        for(let x = 0; x < columns; x++)
        {
            if(fields[y][x].bomb)
            {
                colorField({y:y,x:x}, colBomb);
            }
        }
    }
}

function showNumbers()
{
    for(let y = 0; y < rows; y++)
    {
        for(let x = 0; x < columns; x++)
        {
            if(fields[y][x].number > 0)
            {
                drawText({y:y,x:x}, fields[y][x].number ,"#21b3db");
            }
        }
    }
}

function generateField()
{
    for(let y = 0; y < rows; y++)
    {
        let temp = [];
        for(let x = 0; x < columns; x++)
        {
            ctx.fillStyle = "#555555";

            ctx.fillRect((x*size)+((x+1)*padding), (y*size)+((y+1)*padding), size, size);
            temp[x] = new field(y, x, false, -1);
        }
        fields[y] = temp;
    }
}

function colorField(pos, color)
{
    ctx.fillStyle = color;
    ctx.fillRect((pos.x*size)+((pos.x+1)*padding), (pos.y*size)+((pos.y+1)*padding), size, size);

    //drawText(pos, "1", "#1111ff");
}

function drawText(pos, text, color)
{
    ctx.fillStyle = color;
    ctx.textAlign="center"; 
    ctx.textBaseline = "middle";
    ctx.fillText(text, ((pos.x*size)+((pos.x+1)*padding) + size / 2), ((pos.y*size)+((pos.y+1)*padding)) + size / 2);
}

function mouseDown(evt)
{
    if(!end)
    {
        let mPos = mousePosToField(getMousePosition(evt));
        if(evt.button == 0)
        {
            if(!fields[mPos.y][mPos.x].marked)
            {
                if(fields[mPos.y][mPos.x].bomb)
                {
                    endGame();
                }
                else if(fields[mPos.y][mPos.x].number > 0)
                {
                    colorField(mPos, "#888888");
                    drawText(mPos, fields[mPos.y][mPos.x].number, colNumber);
                    fields[mPos.y][mPos.x].open = true;
                }
                else
                {
                    openField(mPos);
                }
            }
        }
        else if (evt.button == 2)
        {
            if(!fields[mPos.y][mPos.x].open)
            {
                if(!fields[mPos.y][mPos.x].marked)
                {
                    colorField(mPos, colMarked);
                    fields[mPos.y][mPos.x].marked = true;
                    marked++;

                    if(fields[mPos.y][mPos.x].bomb)
                    {
                        bombMarked++;
                    }
                }
                else
                {
                    colorField(mPos, "#555555");
                    fields[mPos.y][mPos.x].marked  = false;
                    marked--;

                    if(fields[mPos.y][mPos.x].bomb)
                    {
                        bombMarked--;
                    }
                }

                if(bombMarked >= bombs)
                {
                    win = true;
                    endGame();
                }

                writeJsText();
            }
        }
    }
}

function writeJsText()
{
    console.log(marked);
    jsText.innerHTML = "<b>Bombs: </b>" + bombs+"<br><b>Marked: </b>" + marked;
}

function openField(pos, oneTime = false)
{
    if(pos.x >= 0 && pos.x < columns && pos.y >= 0 && pos.y < rows)
    {
        if(!fields[pos.y][pos.x].bomb && !fields[pos.y][pos.x].open)
        {
            colorField(pos, "#888888");
            fields[pos.y][pos.x].open = true;

            if(fields[pos.y][pos.x].number < 1)
            {
                if(!oneTime)
                {
                    openField({y:pos.y-1, x:pos.x});
                    openField({y:pos.y+1, x:pos.x});
            
                    openField({x:pos.x-1, y:pos.y});
                    openField({x:pos.x+1, y:pos.y});
                }
            }
            else
            {
                drawText(pos, fields[pos.y][pos.x].number, colNumber);
                if(!oneTime)
                {
                    openField({y:pos.y-1, x:pos.x}, true);
                    openField({y:pos.y+1, x:pos.x}, true);
            
                    openField({x:pos.x-1, y:pos.y}, true);
                    openField({x:pos.x+1, y:pos.y}, true);
                }
            }
        }
    }
    return;
}

function getMousePosition(evt)
{
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function mousePosToField(pos)
{
    let yPos = -1;
    let xPos = -1;

    let yStart = 0;
    let yEnd = 0;
    let xStart = 0;
    let xEnd = 0;

    for(let y = 0; y < rows; y++)
    {
        yStart = (padding+size)*y;
        yEnd = (padding+size)*(y+1);

        if(yStart <= pos.y && yEnd >= pos.y)
        {
            //found
            yPos = y;
            break;
        }
    }

    for(let x = 0; x < columns; x++)
    {
        xStart = (padding+size)*x;
        xEnd = (padding+size)*(x+1);

        if(xStart <= pos.x && xEnd >= pos.x)
        {
            //found
            xPos = x;
            break;
        }
    }

    return {
        x: xPos,
        y: yPos
    }
}

class field
{
    constructor(y,x, bomb, number)
    {
        this.y = y;
        this.x = x;
        this.bomb;
        this.number = number;
        this.open = false;
        this.marked = false;
    }
}