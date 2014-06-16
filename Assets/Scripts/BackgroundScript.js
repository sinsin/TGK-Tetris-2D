#pragma strict

var backgroundTexture : Texture2D;
var backgroundRect : Rect;

var buttonWidth : int = 100;
var buttonHeight : int = 50;
var buttonCount : int = 3;
var buttonOffset : int = 10;
var customSkin : GUISkin;

var score : int;
var level : int;

var isHighScore : boolean = false;
var isCredit : boolean = false;

function Start () {
	backgroundRect = Rect(0, 0, backgroundTexture.width, backgroundTexture.height);
	level = 0;
	score = 0;
}

function OnGUI () {
	GUI.BeginGroup(Rect((Screen.width - backgroundTexture.width) * 0.5, (Screen.height - backgroundTexture.height) * 0.5, backgroundTexture.width, backgroundTexture.height));
	GUI.DrawTexture(backgroundRect, backgroundTexture);
	if (isHighScore) {
	Load();
		GUI.Box(backgroundRect, "High Score" + "\n" + "Level: " + level.ToString() + "\n" + "Score: " + score.ToString());
		if (GUI.Button(Rect((backgroundTexture.width - buttonWidth) * 0.5, (backgroundTexture.height - buttonHeight) * 0.5, buttonWidth, buttonHeight), "Back")) {
			isHighScore = false;
		}
	}
	if (isCredit) {
		GUI.Box(backgroundRect, "Sindi Amilia - 1103110143");
		if (GUI.Button(Rect((backgroundTexture.width - buttonWidth) * 0.5, (backgroundTexture.height - buttonHeight) * 0.5, buttonWidth, buttonHeight), "Back")) {
			isCredit = false;
		}
	}
	GUI.EndGroup();
	GUI.BeginGroup(Rect((Screen.width - buttonWidth) * 0.5, Screen.height - (buttonHeight * 4), buttonWidth, (buttonHeight * 3) + ((buttonCount - 1) * buttonOffset)));
	GUI.skin = customSkin;
	if (!isCredit && !isHighScore) {
		if (GUI.Button(Rect(0, 0, buttonWidth, buttonHeight), "Start")) {
			Application.LoadLevel("Game");
		}
		if (GUI.Button(Rect(0, buttonHeight + buttonOffset, buttonWidth, buttonHeight), "High Score")) {
			isHighScore = true;
		}
		if (GUI.Button(Rect(0, (buttonHeight * 2) + (buttonOffset * 2), buttonWidth, buttonHeight), "Credit")) {
			isCredit = true;
		}
	}
	GUI.EndGroup();
}

function Load () {
	score = PlayerPrefs.GetInt("highScore");
	level = PlayerPrefs.GetInt("highLevel");
}