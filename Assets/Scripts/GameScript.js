var platformWidth : int = 800;
var platformHeight : int = 600;
var buttonMenuWidth : int = 150;
var buttonMenuHeight : int = 50;
var buttonArrowWidth : int = 50;
var buttonArrowHeight : int = 50;
var level : int = 1;
var score : int = 0;
var shapeSaved : int = -1;
var maxHeight : int = 0;
var maxTextureNumber = 4;
var maxShapeNumber = 7;
var speed : int = 101;
var stringLevel : String;
var stringScore : String;
var isPaused : boolean = false;
var isExit : boolean = false;
var isRotate : boolean = false;
var isGameOver : boolean = false;

var blockCountX : int = 13;
var blockCountY : int = 12;
var blockWidth : int;
var blockHeight : int;

var randomShape : int;
var renderedFrameCount : int = 0;
var timeElapsedSinceLastLevel : int = 0;
var timeIncreasedLevel : int = 60;
var currentBlockShape : BlockShape;

var arrayGridBox : Array;
var arrayGridObjectBox : Array;

function Start () {
	level = 1;
	score = 0;
	timeElapsedSinceLastLevel = Time.time;
	stringLevel = "Level: " + level.ToString();
	stringScore = "Score: " + score.ToString();
	blockWidth = (platformWidth - buttonMenuWidth) / blockCountX;
	blockHeight = (platformHeight - buttonMenuHeight) / blockCountY;
	randomShape = Random.Range(0, maxShapeNumber);
	currentBlockShape = BlockShape(randomShape, blockWidth, blockHeight, blockCountX, blockCountY, maxTextureNumber);
	arrayGridBox = new Array();
	arrayGridObjectBox = new Array();
	for (var i : int = 0; i < blockCountX; i++) {
		arrayGridBox[i] = new Array();
		arrayGridObjectBox[i] = new Array();
		for (var j : int = 0; j <= blockCountY; j++) {
			arrayGridBox[i][j] = false;
			arrayGridObjectBox[i][j] = null;
		}
	}
}

function OnGUI () {
	GUI.BeginGroup(Rect((Screen.width - platformWidth) * 0.5, (Screen.height - platformHeight) * 0.5, platformWidth, platformHeight));
	
	for (var i : int = 0; i < blockCountX; i++) {
		for (var j : int = 0; j <= blockCountY; j++) {
			if (arrayGridObjectBox[i][j] != null) {
				GUI.DrawTexture(Rect(arrayGridObjectBox[i][j].positionX, arrayGridObjectBox[i][j].positionY, blockWidth, blockHeight), Resources.Load("Block " + arrayGridObjectBox[i][j].textureNumber.ToString()));
			}
		}
	}
	
	if (isGameOver || isPaused) {
		if (isGameOver) {
			GUI.Box(Rect(0, 0, platformWidth - buttonMenuWidth, platformHeight), "Game Over");
			if (GUI.Button(Rect((platformWidth * 0.5) - buttonMenuWidth, (platformHeight - buttonMenuHeight) * 0.5, buttonMenuWidth, buttonMenuHeight), "Back to Menu")) {
				level = 1;
				score = 0;
				Application.LoadLevel("Menu");
			}
		}
		else {
			GUI.Box(Rect(0, 0, platformWidth - buttonMenuWidth, platformHeight), "Game Paused");
			if (GUI.Button(Rect((platformWidth * 0.5) - buttonMenuWidth, (platformHeight - buttonMenuHeight) * 0.5, buttonMenuWidth, buttonMenuHeight), "Resume")) {
				isPaused = false;
			}
		}
	}
	else {
		GUI.Box(Rect(0, 0, platformWidth - buttonMenuWidth, platformHeight), "");
	}
	
	GUI.Box(Rect(platformWidth - buttonMenuWidth, buttonMenuHeight * 2, buttonMenuWidth, buttonMenuHeight * 3), "");
	GUI.Box(Rect(platformWidth - buttonMenuWidth, buttonMenuHeight * 5, buttonMenuWidth, buttonMenuHeight * 2), stringLevel);
	GUI.Box(Rect(platformWidth - buttonMenuWidth, buttonMenuHeight * 7, buttonMenuWidth, buttonMenuHeight * 2), stringScore);
	GUI.Box(Rect(platformWidth - buttonMenuWidth, buttonMenuHeight * 9, buttonMenuWidth, buttonArrowHeight * 2), "");
	
	if (GUI.Button(Rect(platformWidth - buttonMenuWidth, 0, buttonMenuWidth, buttonMenuHeight), "Exit")) {
		Application.LoadLevel("Menu");
	}
	if (GUI.Button(Rect(platformWidth - buttonMenuWidth, buttonMenuHeight, buttonMenuWidth, buttonMenuHeight), "Pause")) {
		isPaused = true;
	}
	if (GUI.Button(Rect(platformWidth - buttonMenuWidth + ((buttonMenuWidth - buttonArrowWidth) * 0.5), platformHeight - buttonMenuHeight - (buttonArrowHeight * 2), buttonArrowWidth, buttonArrowHeight), "↑")) {
		currentBlockShape.Rotate(arrayGridBox);
	}
	if (GUI.Button(Rect(platformWidth - buttonMenuWidth, platformHeight - buttonMenuHeight - buttonArrowHeight, buttonArrowWidth, buttonArrowHeight), "←")) {
		currentBlockShape.UpdatePositionX(false, arrayGridBox);
	}
	if (GUI.Button(Rect(platformWidth - buttonMenuWidth + buttonArrowWidth, platformHeight - buttonMenuHeight - buttonArrowHeight, buttonArrowWidth, buttonArrowHeight), "↓")) {
		if (!currentBlockShape.isFinishedDropping) {
			currentBlockShape.Drop(arrayGridBox);
		}
	}
	if (GUI.Button(Rect(platformWidth - buttonMenuWidth + (buttonArrowWidth * 2), platformHeight - buttonMenuHeight - buttonArrowHeight, buttonArrowWidth, buttonArrowHeight), "→")) {
		currentBlockShape.UpdatePositionX(true, arrayGridBox);
	
	}
	if (GUI.Button(Rect(platformWidth - buttonMenuWidth, platformHeight - buttonMenuHeight, buttonMenuWidth, buttonMenuHeight), "Shift")) {
		if (shapeSaved == -1) {
			shapeSaved = currentBlockShape.randomShape;
			randomShape = Random.Range(0, maxShapeNumber);
			currentBlockShape = BlockShape(randomShape, blockWidth, blockHeight, blockCountX, blockCountY, maxTextureNumber);
		}
		else {
			var temp : int = shapeSaved;
			shapeSaved = currentBlockShape.randomShape;
			currentBlockShape = BlockShape(temp, blockWidth, blockHeight, blockCountX, blockCountY, maxTextureNumber);
		}
	}
	if (shapeSaved > -1) {
		GUI.DrawTexture(Rect(platformWidth - buttonMenuWidth, buttonMenuHeight * 2, buttonMenuWidth, buttonMenuHeight * 3), Resources.Load(shapeSaved.ToString()));
	}
	var arrayListBlockTemp : ArrayList = currentBlockShape.arrayListBlock;
	for (i = 0; i < arrayListBlockTemp.Count; i++) {
		var blockTemp : Block = arrayListBlockTemp[i];
		GUI.DrawTexture(Rect(blockTemp.positionX, blockTemp.positionY, blockWidth, blockHeight), Resources.Load("Block " + blockTemp.textureNumber.ToString()));
	}
	
	GUI.EndGroup();
}

function Save () {
	if (PlayerPrefs.HasKey("highScore")) {
		var scoreTemp : int = PlayerPrefs.GetInt("highScore");
		if (scoreTemp < score) {
			Debug.Log(scoreTemp);
			Debug.Log(score);
			PlayerPrefs.SetInt("highScore", score);
			PlayerPrefs.SetInt("highLevel", level);
			PlayerPrefs.Save();
		}
	}
	else {
		PlayerPrefs.SetInt("highScore", score);
		PlayerPrefs.SetInt("highLevel", level);
		PlayerPrefs.Save();
	}
}

function Update () {
	if (!isPaused && !isGameOver) {
		if (Input.GetKeyDown(KeyCode.LeftArrow)) {
			currentBlockShape.UpdatePositionX(false, arrayGridBox);
		}
		if (Input.GetKeyDown(KeyCode.RightArrow)) {
			currentBlockShape.UpdatePositionX(true, arrayGridBox);
		}
		if (Input.GetKeyDown(KeyCode.UpArrow)) {
			currentBlockShape.Rotate(arrayGridBox);
		}
		if (Input.GetKeyDown(KeyCode.DownArrow)) {
			if (!currentBlockShape.isFinishedDropping) {
				currentBlockShape.Drop(arrayGridBox);
			}
		}
		if (Input.GetKeyDown(KeyCode.LeftShift) || Input.GetKeyDown(KeyCode.RightShift)) {
			if (shapeSaved == -1) {
				shapeSaved = currentBlockShape.randomShape;
				randomShape = Random.Range(0, maxShapeNumber);
				currentBlockShape = BlockShape(randomShape, blockWidth, blockHeight, blockCountX, blockCountY, maxTextureNumber);
			}
			else {
				var temp : int = shapeSaved;
				shapeSaved = currentBlockShape.randomShape;
				currentBlockShape = BlockShape(temp, blockWidth, blockHeight, blockCountX, blockCountY, maxTextureNumber);
			}
		}
		
		if (Time.renderedFrameCount - renderedFrameCount > speed) {
			renderedFrameCount = Time.renderedFrameCount;
			if (!currentBlockShape.isFinishDropping) {
				currentBlockShape.UpdatePositionY(arrayGridBox);
			}
			else {
				for (var i : int = 0; i < currentBlockShape.arrayListBlock.Count; i++) {
					var indexX : int = currentBlockShape.arrayListBlock[i].positionX / blockWidth;
					var indexY : int = currentBlockShape.arrayListBlock[i].positionY / blockHeight;
					if (arrayGridBox[indexX][indexY] == false) {
						arrayGridBox[indexX][indexY] = true;
					}
					else {
						isGameOver = true;
						Save();
					}
					arrayGridObjectBox[indexX][indexY] = currentBlockShape.arrayListBlock[i];
				}
				var arrayIndexRemoved : Array = new Array();
				for (var b : int = blockCountY; b >= 0; b--) {
					var isRowRemoved : boolean = true;
					for (var a : int = 0; a < blockCountX; a++) {
						if (arrayGridBox[a][b] == false) {
							isRowRemoved = false;
							break;
						}
					}
					if (isRowRemoved) {
						arrayIndexRemoved.Add(b);
					}
				}
				RemoveRow(arrayIndexRemoved);
				randomShape = Random.Range(0, maxShapeNumber);
				currentBlockShape = BlockShape(randomShape, blockWidth, blockHeight, blockCountX, blockCountY, maxTextureNumber);
			}
		}
		if (Time.time - timeElapsedSinceLastLevel > timeIncreasedLevel) {
			level++;
			if (speed > 1) {
				speed -= 5;
			}
			stringLevel = "Level: " + level.ToString();
			timeElapsedSinceLastLevel = Time.time;
			Debug.Log(speed);
		}
	}
}

function RemoveRow(arrayIndexRemoved : Array) {
	for (var a : int = 0; a < arrayIndexRemoved.length; a++) {
		for (var b : int = arrayIndexRemoved[a]; b >= 0; b--) {
			for (var c : int; c < blockCountX; c++) {
				if (b > 0) {
					arrayGridBox[c][b] = arrayGridBox[c][b - 1];
					if (arrayGridObjectBox[c][b - 1] != null) {
						arrayGridObjectBox[c][b - 1].UpdatePositionY(arrayGridObjectBox[c][b - 1].positionY + blockHeight);
					}
					arrayGridObjectBox[c][b] = arrayGridObjectBox[c][b - 1];
				}
				else {
					arrayGridBox[c][b] = false;
					arrayGridObjectBox[c][b] = null;
				}
			}
		}
		for (var d : int = a + 1; d < arrayIndexRemoved.length; d++) {
			arrayIndexRemoved[d] += 1;
		}
		score += (level * arrayIndexRemoved.length);
		stringScore = "Score: " + score.ToString();
	}
}

class Block extends System.Object {

	var textureNumber : int;
	var positionX : int;
	var positionY : int;
	
	function Block (textureNumber : int, positionX : int, positionY : int) {
		this.textureNumber = textureNumber;
		this.positionX = positionX;
		this.positionY = positionY;
	}
	
	function UpdatePositionX (positionX : int) {
		this.positionX = positionX;
	}
	
	function UpdatePositionY (positionY : int) {
		this.positionY = positionY;
	}
	
}

class BlockShape extends System.Object {
	
	var arrayListBlock : ArrayList;
	var randomTextureNumber : int;
	var randomShape : int;
	var rotateState : int;
	var positionX : int;
	var positionY : int;
	var minPositionX : int;
	var maxPositionX : int;
	var deltaMinMaxPositionX : int;
	
	var blockWidth : int;
	var blockHeight : int;
	var blockCountX : int;
	var blockCountY : int;
	
	var isFinishDropping : boolean = false;
	
	function BlockShape (randomShape : int, blockWidth : int, blockHeight : int, blockCountX : int, blockCountY : int, maxTextureNumber : int) {
		this.blockWidth = blockWidth;
		this.blockHeight = blockHeight;
		this.blockCountX = blockCountX;
		this.blockCountY = blockCountY;
		this.randomShape = randomShape;
		
		arrayListBlock = new ArrayList();
		if (blockCountX % 2 == 1) {
			positionX = (((blockCountX - 1) / 2) + 1) * blockWidth;
		}
		else {
			positionX = (blockCountX / 2) * blockWidth;
		}
		rotateState = 0;
		positionY = 0;
		randomTextureNumber = Random.Range(0, maxTextureNumber);
		arrayListBlock.Add(Block(randomTextureNumber, positionX, positionY));
		
		switch (randomShape) {
			case 0 :
				// 0 = 1
				//     2
				//     3
				//     4
				var positionXTemp : int = positionX;
				var positionYTemp : int = positionY + blockHeight;
				minPositionX = positionX;
				maxPositionX = positionX;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionYTemp = positionYTemp + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionYTemp = positionYTemp + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				break;
			case 1 :
				// 1 = 14
				//     23
				positionXTemp = positionX;
				positionYTemp = positionY + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionX + blockWidth;
				minPositionX = positionX;
				maxPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionYTemp = positionY;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				break;
			case 2 :
				// 2 = 1
				//    324
				positionXTemp = positionX;
				positionYTemp = positionY + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionX - blockWidth;
				minPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionX + blockWidth;
				maxPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				break;
			case 3 :
				// 3 = 1
				//     2
				//     34
				positionXTemp = positionX;
				positionYTemp = positionY + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionYTemp = positionYTemp + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionX + blockWidth;
				minPositionX = positionX;
				maxPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				break;
			case 4 :
				// 4 = 1
				//     2
				//    43
				positionXTemp = positionX;
				positionYTemp = positionY + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionYTemp = positionYTemp + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionX - blockWidth;
				maxPositionX = positionX;
				minPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				break;
			case 5 :
				// 5 = 12
				//    43
				positionXTemp = positionX + blockWidth;
				positionYTemp = positionY;
				maxPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionX;
				positionYTemp = positionY + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionX - blockWidth;
				minPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				break;
			case 6 :
				// 6 = 12
				//      34
				positionXTemp = positionX + blockWidth;
				positionYTemp = positionY;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionYTemp = positionY + blockHeight;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				positionXTemp = positionXTemp + blockWidth;
				minPositionX = positionX;
				maxPositionX = positionXTemp;
				arrayListBlock.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
				break;
		}
		deltaMinMaxPositionX = maxPositionX - minPositionX;
	}
	
	function UpdatePositionX (isRight : boolean, arrayGridBox : Array) {
		if (!isFinishDropping) {
			if (isRight) {
				if (maxPositionX < (blockCountX - 1) * blockWidth) {
					if (maxPositionX < (blockCountX - 2) * blockWidth) {
						var isAbleMoveRight : boolean = true;
						for (var i : int = 0; i < arrayListBlock.Count; i++) {
							var indexNeighborRightX : int = (arrayListBlock[i].positionX / blockWidth) + 1;
							var indexNeighborRightY : int = arrayListBlock[i].positionY / blockHeight;
							if (indexNeighborRightY < 0) {
								indexNeighborRightY = 0;
							}
							if (indexNeighborRightY > blockCountY) {
								indexNeighborRightY = blockCountY;
							}
							if (indexNeighborRightX < blockCountX) {
								if (arrayGridBox[indexNeighborRightX][indexNeighborRightY] == true) {
									isAbleMoveRight = false;
									break;
								}
							}
						}
						if (isAbleMoveRight) {
							positionX += blockWidth;
							for (i = 0; i < arrayListBlock.Count; i++) {
								arrayListBlock[i].UpdatePositionX(arrayListBlock[i].positionX + blockWidth);
								if (maxPositionX < arrayListBlock[i].positionX) {
									maxPositionX = arrayListBlock[i].positionX;
									minPositionX = maxPositionX - deltaMinMaxPositionX;
								}
							}
						}
					}
					else {
						positionX += blockWidth;
						for (i = 0; i < arrayListBlock.Count; i++) {
							arrayListBlock[i].UpdatePositionX(arrayListBlock[i].positionX + blockWidth);
							if (maxPositionX < arrayListBlock[i].positionX) {
								maxPositionX = arrayListBlock[i].positionX;
								minPositionX = maxPositionX - deltaMinMaxPositionX;
							}
						}
					}
				}
			}
			else {
				if (minPositionX > 0) {
					if (minPositionX > 1) {
						var isAbleMoveLeft : boolean = true;
						for (var j : int = 0; j < arrayListBlock.Count; j++) {
							var indexNeighborLeftX : int = (arrayListBlock[j].positionX / blockWidth) - 1;
							var indexNeighborLeftY : int = arrayListBlock[j].positionY / blockHeight;
							if (indexNeighborLeftY < 0) {
								indexNeighborLeftY = 0;
							}
							if (indexNeighborLeftY > blockCountY) {
								indexNeighborLeftY = blockCountY;
							}
							if (indexNeighborLeftX >= 0) {
								if (arrayGridBox[indexNeighborLeftX][indexNeighborLeftY] == true) {
									isAbleMoveLeft = false;
									break;
								}
							}
						}
						if (isAbleMoveLeft) {
							positionX -= blockWidth;
							for (j = 0; j < arrayListBlock.Count; j++) {
								arrayListBlock[j].UpdatePositionX(arrayListBlock[j].positionX - blockWidth);
								if (minPositionX > arrayListBlock[j].positionX) {
									minPositionX = arrayListBlock[j].positionX;
									maxPositionX = minPositionX + deltaMinMaxPositionX;
								}
							}
						}
					}
					else {
						positionX -= blockWidth;
						for (j = 0; j < arrayListBlock.Count; j++) {
							arrayListBlock[j].UpdatePositionX(arrayListBlock[j].positionX - blockWidth);
							if (minPositionX > arrayListBlock[j].positionX) {
								minPositionX = arrayListBlock[j].positionX;
								maxPositionX = minPositionX + deltaMinMaxPositionX;
							}
						}
					}
				}
			}
		}
	}
	
	function UpdatePositionY (arrayGridBox : Array) {
		var i : int;
		var indexXTemp : int;
		var indexYTemp : int;
		var isDropping : boolean = true;
		var indexXArrayList : ArrayList = new ArrayList();
		var indexYArrayList : ArrayList = new ArrayList();
		for (i = 0; i < arrayListBlock.Count; i++) {
			indexXTemp = arrayListBlock[i].positionX / blockWidth;
			indexYTemp = (arrayListBlock[i].positionY / blockHeight) + 1;
			if (indexXArrayList.IndexOf(indexXTemp) < 0) {
				indexXArrayList.Add(indexXTemp);
				indexYArrayList.Add(indexYTemp);
			}
			else {
				if (indexYTemp > indexYArrayList[indexXArrayList.IndexOf(indexXTemp)]) {
					indexYArrayList[indexXArrayList.IndexOf(indexXTemp)] = indexYTemp;
				}
			}
		}
		for (i = 0; i < indexXArrayList.Count; i++) {
			if (indexYArrayList[i] <= blockCountY) {
				isDropping = isDropping && !arrayGridBox[indexXArrayList[i]][indexYArrayList[i]];
				if (!isDropping) {
					isFinishDropping = true;
				}
			}
			else {
				isDropping = false;
				isFinishDropping = true;
			}
		}
		if (isDropping) {
			positionY += blockHeight;
			for (i = 0; i < arrayListBlock.Count; i++) {
				arrayListBlock[i].UpdatePositionY(arrayListBlock[i].positionY + blockHeight);
			}
		}
	}
	
	function Drop (arrayGridBox : Array) {
		while (!isFinishDropping) {
			UpdatePositionY(arrayGridBox);
		}
	}
	
	function Rotate (arrayGridBox : Array) {
		var arrayListBlockTemp : ArrayList = new ArrayList();
		var positionXTemp : int;
		var positionYTemp : int;
		switch (randomShape) {
			case 0 :
				switch (rotateState) {
					// center of rotation = 2
					case 0 :
						// 0 = 1
						//     2
						//     3
						//     4
						positionX = positionX - blockWidth;
						positionY = positionY + blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + (blockWidth * 3);
						rotateState = 1;
						break;
					case 1 :
						// 0 = 1234
						positionX = positionX + blockWidth;
						positionY = positionY - blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX;
						rotateState = 0;
						break;
				}
				break;
			case 1 :
				arrayListBlockTemp = arrayListBlock;
				break;
			case 2 :
				switch (rotateState) {
					// center of rotation = 2
					case 0 :
						// 2 = 1
						//    324
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						positionYTemp = positionYTemp - blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + blockWidth;
						rotateState = 1;
						break;
					case 1 :
						// 2 = 1
						//     24
						//     3
						positionX = positionX - blockWidth;
						positionY = positionY + blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp - blockWidth;
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + (blockWidth * 2);
						rotateState = 2;
						break;
					case 2 :
						// 2 = 123
						//      4
						positionX = positionX + blockWidth;
						positionY = positionY - blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp - blockWidth;
						positionYTemp = positionYTemp - blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX - blockWidth;
						maxPositionX = positionX;
						rotateState = 3;
						break;
					case 3 :
						// 2 = 1
						//    42
						//     3
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionX - blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionX + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX - blockWidth;
						maxPositionX = maxPositionX + blockWidth;
						rotateState = 0;
						break;
				}
				break;
			case 3 :
				// center of rotation = 2
				switch (rotateState) {
					case 0 :
						// 3 = 1
						//     2
						//     34
						positionX = positionX - blockWidth;
						positionY = positionY + blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionX;
						positionYTemp = positionY + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + (blockWidth * 2);
						rotateState = 1;
						break;
					case 1 :
						// 3 = 123
						//     4
						positionY = positionY - blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp - blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + (blockHeight * 2);
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + blockWidth;
						rotateState = 2;
						break;
					case 2 :
						// 3 = 13
						//      2
						//      4
						positionY = positionY + blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp - blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + (blockWidth * 2);
						rotateState = 3;
						break;
					case 3 :
						//       4
						// 3 = 123
						positionX = positionX + blockWidth;
						positionY = positionY - blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + blockWidth;
						rotateState = 0;
						break;
				}
				break;
			case 4 :
				// center of rotation = 2
				switch (rotateState) {
					case 0 :
						// 4 = 1
						//     2
						//    43
						positionX = positionX - blockWidth;
						positionY = positionY + blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionX;
						positionYTemp = positionY - blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + (blockWidth * 2);
						rotateState = 1;
						break;
					case 1 :
						//     4
						// =   123
						positionX = positionX + blockWidth;
						positionY = positionY - blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + blockWidth;
						rotateState = 2;
						break;
					case 2 :
						// 4 = 14
						//     2
						//     3
						positionX = positionX - blockWidth;
						positionY = positionY + blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + (blockWidth * 2);
						rotateState = 3;
						break;
					case 3 :
						// 4 = 123
						//       4
						positionX = positionX + blockWidth;
						positionY = positionY - blockHeight;
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp - blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX - blockWidth;
						maxPositionX = positionX;
						rotateState = 0;
						break;
				}
				break;
			case 5 :
				// center of rotation = 3
				switch (rotateState) {
					case 0 :
						// 5 = 12
						//    43
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp - blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + blockWidth;
						rotateState = 1;
						break;
					case 1 :
						// 5 = 1
						//     32
						//      4
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp - blockWidth;
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp - blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX - blockWidth;
						maxPositionX = positionX + blockWidth;
						rotateState = 0;
						break;
				}
				break;
			case 6 :
				// center of rotation = 2
				switch (rotateState) {
					case 0 :
						// 6 = 12
						//      34
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp - blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionX;
						positionYTemp = positionY + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + blockWidth;
						rotateState = 1;
						break;
					case 1 :
						//      3
						// 6 = 12
						//     4
						positionXTemp = positionX;
						positionYTemp = positionY;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionYTemp = positionYTemp + blockHeight;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						positionXTemp = positionXTemp + blockWidth;
						arrayListBlockTemp.Add(Block(randomTextureNumber, positionXTemp, positionYTemp));
						minPositionX = positionX;
						maxPositionX = positionX + (blockWidth * 2);
						rotateState = 0;
						break;
				}
				break;
		}
		arrayListBlock = arrayListBlockTemp;
		var loopCount : int;
		var i : int;
		if (minPositionX < 0) {
			loopCount = minPositionX * -1 / blockWidth;
			for (i = 0; i < loopCount; i++) {
				UpdatePositionX(true, arrayGridBox);
			}
		}
		if (maxPositionX > (blockCountX - 1) * blockWidth) {
			loopCount = (maxPositionX - ((blockCountX - 1) * blockWidth)) / blockWidth;
			for (i = 0; i < loopCount; i++) {
				UpdatePositionX(false, arrayGridBox);
			}
		}
	}
	
}