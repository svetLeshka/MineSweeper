'use strict'

let size  	     = 15,
	mines 	     = 35,
	timerCounter = -1, 
	currentMines = 0,
	fieldMatrix  = Array.from(Array(size), () => new Array(size).fill(0)),
	closeCells   = Math.pow(size, 2),
	timer;

function initField() {
	drawField();
	let table = document.querySelector('#field');
	table.onclick = showFirstItem;
	table.addEventListener('pointerover', overCell);
	table.addEventListener('pointerout', outCell);
	table.ondragstart = function() {
		return false;
	};
	let counter = document.querySelector('#counter');
	counter.innerHTML = mines;
	changeTimer();
}

function overCell(event) {
	let elem = event.target.closest('td');
	if( !elem || elem.style.backgroundColor ) return;
	for(let cl of elem.classList)
		if( cl == 'cellNeutral' ) {
			elem.style.backgroundColor 		 = 'blue';
		}
}

function outCell(event) {
	let elem = event.target.closest('td');
	if( !elem ) return;
	if( elem.style.backgroundColor == 'blue' )
		elem.style.backgroundColor = '';
}

function drawField() {
	let field  = document.querySelector('#field'),
		main   = document.querySelector('main'),
		header = document.querySelector('header'),
		width  = Math.floor(field.clientWidth/size),
		height = width;

	for(let i=0; i<size; i++) {
		let tr = document.createElement('tr');
		for(let j=0; j<size; j++) {
			let td = document.createElement('td');
			td.classList.add('cellNeutral');
			td.style.width    = width + 'px';
			td.style.height   = height + 'px';
			td.style.outline  = '1px solid black';
			td.style.overflow = 'hidden';
			td.id             = 'i'+i+'j'+j;
			tr.append(td);
		}
		field.append(tr);
	}
	main.style.width   = field.offsetWidth + 'px';
	header.style.width = field.offsetWidth + 'px';
}

function changeTimer() {
	let time = document.querySelector('#timer');
	timerCounter++;
	if( timerCounter%60 < 10 ) time.innerHTML = Math.floor(timerCounter/60) + ':0' + timerCounter%60;
	else time.innerHTML = Math.floor(timerCounter/60) + ':' + timerCounter%60;
}

function showFirstItem(event) {
	let elem 		  = event.target,
		countMines    = mines,
		countCells    = Math.floor(Math.pow(size, 2)/mines),
		row           = elem.id.slice(1, elem.id.match(/[j]/).index),
		col           = elem.id.slice(elem.id.match(/[j]/).index+1),
		borL 	  	  = +col-1,
		borT 	   	  = +row-1,
		borR 	   	  = +col+1,
		borB 	      = +row+1,
		table         = document.querySelector('#field');
	table.onclick = null;

	while( countMines ) {
		let i = Math.floor(Math.random()*size),
			j = Math.floor(Math.random()*size);
		if( fieldMatrix[i][j] ||
			(i >= borT && j >= borL && i <= borB && j <= borR) ) continue;
		fieldMatrix[i][j] = 1;
		countMines--;
	}
	timer = setInterval(changeTimer, 1000);

	openCell(+row, +col);
	table.addEventListener('click', waitClick);
	table.addEventListener('contextmenu', setFlag);
}

function openCell(i, j) {
	if( i < 0 || i >= size || j < 0 || j >= size || 
		fieldMatrix[i][j] == 2 || fieldMatrix[i][j] == -1 ) return;
	let num   = scoutMines(i, j),
		table = document.querySelector('#field'),
		elem  = document.querySelector('#i'+i+'j'+j);

	elem.classList.remove('cellNeutral');
	if( fieldMatrix[i][j] == 0 ) {
		if( num ) {
			elem.classList.add('n'+String(num));
			elem.innerHTML = num;
			elem.style.fontSize = Math.floor(table.clientWidth/size/1.5)+'px';
		}
		showCell(elem);
		
		fieldMatrix[i][j] = -1;
		if( closeCells-1 ) closeCells--;
		else endOfGame(true);
		if( !num ) {
			openCell(i-1, j);
			openCell(i, j-1);
			openCell(i+1, j);
			openCell(i, j+1);
			openCell(i-1, j-1);
			openCell(i+1, j-1);
			openCell(i+1, j+1);
			openCell(i-1, j+1);
		}
	} else {
		elem.classList.remove('cellNeutral');
		elem.classList.add('cellMine');
		showImg(elem, 'images/mine.png');
		elem.style.backgroundColor = 'red';
		endOfGame(false);
	}
}

function showCell(elem) {
	elem.style.position = 'relative';
	let bg = document.createElement('div');
	bg.style.width = elem.clientWidth + 'px';
	bg.style.height = elem.clientHeight + 'px';
	bg.style.backgroundColor = 'green';
	bg.style.position = 'absolute';
	elem.append(bg);
	bg.style.top = '0px';
	bg.style.left = '0px';
	bg.style.opacity = '1';
	let slide = setInterval(function() {
		if( bg.offsetTop > bg.clientHeight ) {
			bg.remove();
			clearInterval(slide);
			elem.style.position = '';
			elem.classList.add('cellEmpty');
		} else {
			bg.style.opacity = bg.style.opacity-0.05;
		}
	}, 10);
}

function scoutMines(i, j) {
	let counter = 0;
	for(let row=i-1; row<=i+1; row++) {
		for(let col=j-1; col<=j+1; col++) {
			if( row < 0 || row >= size || col < 0 || col >= size ) continue;
			if( fieldMatrix[row][col] == 1 ) counter++;
		}
	}
	return counter;
}

function waitClick(event) {
	event.preventDefault();
	let elem = event.target;
	if( elem.tagName != 'TD' ) return;
	for(let name of elem.classList)
		if( name == 'cellFlag' ) return;
	openCell(+elem.id.slice(1, elem.id.match(/[j]/).index), 
			 +elem.id.slice(elem.id.match(/[j]/).index+1));
}

function setFlag(event) {
	event.preventDefault();
	let elem = event.target.closest('td');
	if( !elem ) return;

	let i = +elem.id.slice(1, elem.id.match(/[j]/).index),
		j = +elem.id.slice(elem.id.match(/[j]/).index+1);
	if( fieldMatrix[i][j] == -1 ) return;

	let counter = document.querySelector('#counter');
	for(let name of elem.classList) {
		if( name == 'cellFlag' ) {
			counter.innerHTML = Number(counter.innerHTML)+1;
			hideImg(elem);
			closeCells++;
		} else {
			counter.innerHTML = Number(counter.innerHTML)-1;
			showImg(elem, 'images/flag.png');
			if( closeCells-1 ) closeCells--;
			else endOfGame(true);
		}
	}

	elem.classList.toggle('cellNeutral');
	elem.classList.toggle('cellFlag');
}

function showImg(elem, path) {
	let img = document.createElement('img');
	img.setAttribute('src', path);
	img.style.width  = elem.style.width;
	img.style.height = elem.style.height;
	img.style.display = 'block';
	elem.append(img);
	let op = elem.firstElementChild;
	op.style.opacity = '0';
	let int = setInterval( function() {
			if (+op.style.opacity < 1) 
				op.style.opacity = +op.style.opacity + 0.1;
			else clearInterval(int);
		}, 10 );
}

async function hideImg(elem) {
	let img = elem.firstElementChild;
	if( img.style.opacity != '1' ) {
		img.remove();
		return;
	}
	while( true ) {
		if ( +img.style.opacity > 0 ) {
			img.style.opacity = +img.style.opacity - 0.1;
			await new Promise((resolve, reject) => {
			    setTimeout(() => resolve(), 10)
			  });
		} else {
			img.remove();
			break;
		}
	}
	return Promise.resolve();
}

function showAll() {
	let table = document.querySelector('#field');

	for(let row of table.rows) {
		for(let cell of row.cells) {
			let i = Number(cell.id.slice(1, cell.id.match(/[j]/).index)),
				j = Number(cell.id.slice(cell.id.match(/[j]/).index+1));
			cell.style.cursor = 'default';
			if( cell.style.backgroundColor == 'blue' ) cell.style.backgroundColor = '';
			if( fieldMatrix[i][j] == 1 ) {
				for(let name of cell.classList) {
					cell.classList.add('cellMine');
					if( name == 'cellNeutral' && 
						cell.style.backgroundColor != 'red' )
					{
						cell.classList.remove('cellNeutral');
						showImg(cell, 'images/mine.png');
					} else if( name == 'cellFlag' && 
							   cell.style.backgroundColor != 'red' ) 
					{
						cell.classList.remove('cellFlag');
						hideImg(cell).finally(() => {
							showImg(cell, 'images/correct.png');
							cell.style.backgroundColor = '#E7EAED';
						});
						currentMines++;
					}
				}
			} else {
				for(let name of cell.classList) {
					if( name == 'cellFlag' ) {
						cell.classList.remove('cellFlag');
						cell.classList.add('cellEmpty');
						hideImg(cell);
					}
				}
			}
		}
	}
}

async function endOfGame(condition) {
	clearInterval(timer);
	await new Promise((resolve, reject) => {
			    setTimeout(() => resolve(), 500)
			  });
	let table = document.querySelector('#field'),
		board = document.querySelector('#finish');
	table.removeEventListener('click', waitClick);
	table.removeEventListener('contextmenu', setFlag);
	table.removeEventListener('pointerover', overCell);
	table.removeEventListener('pointerout', outCell);

	showAll();
	table.oncontextmenu = table.onclick = function(event) {
		if( !event.target.closest('table')  ) return false;
		showBoard(condition);
		table.onclick 		= null;
		table.oncontextmenu = null;
		board.addEventListener('click', {
			handleEvent(event) {
				if( !event.target.closest('#finish div:last-child > div:nth-child(3)') ) return;
				regame();
			}
		});
		return false;
	};
}

function showBoard(condition) {
	let field = document.querySelector('#field'),
		board = document.querySelector('#finish'),
		text  = document.querySelector('#re'),
		time  = document.querySelector('#finish div:last-child > div:nth-child(1) > div'),
		stat  = document.querySelector('#finish div:last-child > div:nth-child(2) > div');

	if( condition ) {
		board.style.backgroundColor = 'lightskyblue';
		text.innerHTML 				= 'YOU WIN';
	} else {
		board.style.backgroundColor = 'rgb(240, 62, 70)';
		text.innerHTML 				= 'YOU LOSE';
	}
	if( timerCounter%60 < 10 ) time.innerHTML = Math.floor(timerCounter/60) + ':0' + timerCounter%60;
	else time.innerHTML = Math.floor(timerCounter/60) + ':' + timerCounter%60;
	stat.innerHTML = currentMines + '/' + mines;

	board.style.width    = field.clientWidth + 'px';
	board.style.height   = field.clientHeight/2 + 'px';
	board.style.top      = window.pageYOffset +
					       field.getBoundingClientRect().top + 
					  	   field.clientHeight/4 + 'px';
	board.style.left     = window.pageXOffset + 
					       field.getBoundingClientRect().left + 
					  	   field.clientWeight/4 + 'px';
	board.style.display  = 'flex';
}

function regame() {
	timerCounter = -1;
	currentMines = 0;
	closeCells = Math.pow(size, 2);
	fieldMatrix  = Array.from(Array(size), () => new Array(size).fill(0));
	for(let i=0; i<size; i++) {
		for(let j=0; j<size; j++)
			fieldMatrix[i][j] = 0;
	}
	let table = document.querySelector('#field'),
		board = document.querySelector('#finish');
	while( true ) {
		let tr = document.querySelector('#field > tr');
		if( !tr ) break;
		tr.remove();
	}
	board.style.display = 'none';
	table.removeEventListener('click', waitClick);
	table.removeEventListener('contextmenu', setFlag);
	table.onclick 		= null;
	table.oncontextmenu = null;
	clearInterval(timer);
	initField();
}

function selectMode(event) {
	if( !Array.prototype.includes.call(event.target.classList, 'select') ) return false;
	let selected = document.querySelector('#selected'),
		bounds   = selected.getBoundingClientRect(),
		modes    = [
			document.querySelector('#easy'),
			document.querySelector('#medium'),
			document.querySelector('#hard'),
		];
	for(let i = 0; i < 3; i++) {
		modes[i].style.top = (i+1)*selected.offsetHeight+2 + 'px';
		modes[i].classList.add('select');
		modes[i].style.zIndex = '999';
		modes[i].style.display = 'block';
	}
	document.onclick = function(event) {
		let elem = event.target;
		if( Array.prototype.includes.call(elem.classList, 'select') &&
			elem.id !== 'selected' ) {
			if( selected.innerHTML !== elem.innerHTML ) {
				selected.innerHTML = elem.innerHTML;
				size  = Number(selected.innerHTML.slice(0, 2));
				mines = (size-10)/5*15+20;
				regame();
			}
		}
		if( elem.id !== 'selected' ) {
			for(let i = 0; i < 3; i++)
				modes[i].style.display = 'none';
			document.onclick = null;
		}
	}
}

initField();
let selector = document.querySelector('#selected');
selector.addEventListener('click', selectMode);