/*
Copyright 2011 Saiyasodharan (http://saiy2k.blogspot.com/)

This file is part of the open source game, Tic Tac Toe Extended (https://github.com/saiy2k/Tic-Tac-Toe-Extended-HTML5-Game)

Tic Tac Toe Extended is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Tic Tac Toe Extended is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Tic Tac Toe Extended.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
    This class is the master class that manages the screen flow and
	updates the other components of the game

	@namespace
	@author			<a href="saiy2k.blogspot.com">Saiyasodharan</a>
*/
ZicZacZoe.GameManager	=	function() {

	/**	Frames per Second (30)
		@type	double
		@private */
    var FPS				=	30.0;

    /**	2D drawing context to the HTML5 canvas. This object is used to make all the draw calls
		@type	canvas context
		@private */
    var context;
    
    /** GameBoard object
		@type	ZicZacZoe.GameBoard
		@private */
	var gBoard;
	
	/**	GameOver Screen
		@type	ZicZacZoe.GameOver
		@private */
	var gOver;
	
	/**	Current Game Screen. Possible Values: "Splash", "Game", "End"
		@type	string
		@private */
	var	currentScreen;
	
	/** if true, AI will take the role of Player 2 and make its move automatically
		@type	bool
		@private */
	var isAI;
	
	function setupJqueryHandlers() {
		$( "#vsHumanButton" ).click(function() {
			console.log($("#p1NameDiv1").focus());
			currentScreen		=	"Game";
			isAI				=	false;
			ZicZacZoe.GameState.reset();
			gBoard.reset();
		});
		
		$("#vsAIButton").click(function() {
			currentScreen		=	"Game";
			isAI				=	true;
			ZicZacZoe.GameState.reset();
			gBoard.reset();
		});
		
		$("#shareFacebookWidget").click(function() {
			ZicZacZoe.FBWrapper.shareAIWinText();
		});
		
		$("#shareTwitterWidget").click(function() {
			console.log("share in twitter");
		});
		
		$("#p1NameDiv1").keypress(function() {
			var text		=	$("#p1NameDiv1").val();
			ZicZacZoe.GameState.p1Name =	text;
			$("#p1NameDiv2").text(text);
			if(currentScreen == "End")
				updateGameOverStatus();				
		});

		$("#p2NameDiv1").keypress(function() {
			var text		=	$("#p2NameDiv1").val();
			ZicZacZoe.GameState.p2Name =	text;
			if(currentScreen == "End")
				updateGameOverStatus();				
		});
	
		$("#p1NameDiv1").blur(function() {
			ZicZacZoe.GameState.p1Name = $("#p1NameDiv1").val();
		});
		
		$("#p2NameDiv1").blur(function() {
			ZicZacZoe.GameState.p2Name = $("#p2NameDiv1").val();
		});

		$("#p1NameDiv1").click(function(e) {
			e.stopPropagation();
		});

		$("#p2NameDiv1").click(function(e) {
			e.stopPropagation();
		});

	}
	
	function updateGameOverStatus() {
		var							st;
		var							rankArray;
		st						=	ZicZacZoe.GameState;
		rankArray					=	["Amoeba", "Mosquito", "Street Dog", "Police Dog", "Monkey", "Student", "Professor", "Scientist", "Super Hero", "God"];
		if(isAI) {
			if(st.player1Score > st.player2Score) {
				var rank			=	st.player1Score - st.player2Score;
				rank				=	rank<0 ? 0 : rank;
				rank				=	rank>9 ? 9 : rank;
				st.gameStatus			=	st.p1Name + " Wins";
				st.gameDescription		=	st.p1Name + " scored " + st.player1Score + " points and earned the title of " + rankArray[rank];			
			} else {
				st.gameStatus			=	st.p1Name + " Loses";
				st.gameDescription		=	st.p1Name + " scored " + st.player1Score + " points in Tic Tac Tow and lost the game";			
			}
		} else {
			if(st.currentPlayerID == 1) {
				var rank			=	(st.player1Score - st.player2Score) / 2 + (st.p2ElapsedTime - st.p1ElapsedTime) / 30000;
				rank				=	rank<0 ? 0 : rank;
				rank				=	rank>9 ? 9 : rank;
				st.gameStatus			=	st.p1Name + " Wins";
				st.gameDescription		=	st.p1Name + " scored " + st.player1Score + " points against " + st.p2Name + " and earned the title of " + rankArray[rank];
			} else {
				var rank			=	(st.player2Score - st.player1Score) / 2 + (st.p1ElapsedTime - st.p2ElapsedTime) / 30000;
				rank				=	rank<0 ? 0 : rank;
				rank				=	rank>9 ? 9 : rank;
				st.gameStatus			=	st.p2Name + " Wins";
				st.gameDescription		=	st.p2Name + " scored " + st.player2Score + " points against " + st.p1Name + " and earned the title of " + rankArray[rank];
			}
		}
	}
	
	/** @scope ZicZacZoe.GameManager */
	return {
		/** Initializes the canvas context, game board, gamestate and sets the game loop */
		init			:	function() {
								currentScreen			=	"Game";
							
                                var canvas              =	document.getElementById("boardCanvas"); context					=	canvas.getContext('2d');
        
								ZicZacZoe.GameState.reset();
								gBoard					=	new ZicZacZoe.GameBoard(context, ZicZacZoe.GameState.rows, ZicZacZoe.GameState.cols);
								gOver					=	new ZicZacZoe.GameOver(context);
								
								setInterval(ZicZacZoe.GameManager.loop, (1/FPS) * 1000);
																
								setupJqueryHandlers();
							},

		/** Game Loop. Getting called as per the given FPS */
		loop			:	function() {
								ZicZacZoe.GameManager.update();
								ZicZacZoe.GameManager.draw();
							},

		/** update the current screen */
		update			:	function() {								
								var mouse	=   ZicZacZoe.InputManager.getMouse();
                                var click   =   ZicZacZoe.InputManager.getClickIfAny();

								var	mx		=	mouse.x - gBoard.x();
								var my		=	mouse.y - gBoard.y();
															
								if(currentScreen		==	"Game") {
									if(mx > 0 && my > 0 && mx < gBoard.width() && my < gBoard.height()) {
										gBoard.update(mouse, click);
										
										if ( click != null ) {
											ZicZacZoe.GameLogic.updateScore(ZicZacZoe.GameState);	
											if(ZicZacZoe.GameState.isValidMove)
												ZicZacZoe.GameLogic.endTurn(ZicZacZoe.GameState);
											ZicZacZoe.GameLogic.updateUI(ZicZacZoe.GameState);
											
											if(ZicZacZoe.GameState.isGameOver) {
												updateGameOverStatus();
												currentScreen = "End";
												$('#shareScoreWidget').show();
												return;
											}
											
											if(isAI) {
												if(ZicZacZoe.GameState.isValidMove) {
													ZicZacZoe.GameLogic.aiMove(ZicZacZoe.GameState);
													gBoard.updateAIMove(ZicZacZoe.GameState);
													ZicZacZoe.GameLogic.endTurn(ZicZacZoe.GameState);
													ZicZacZoe.GameLogic.updateUI(ZicZacZoe.GameState);
												}
												
												if(ZicZacZoe.GameState.isGameOver) {
													updateGameOverStatus();		
													currentScreen = "End";
													$('#shareScoreWidget').show();
													return;
												}
											}
										}
									}
									
									ZicZacZoe.GameLogic.calcTime(ZicZacZoe.GameState);
									
								} else if(currentScreen	==	"End") {
									if ( click != null ) {
										gOver.update(mouse, click);
									}
								} else if(currentScreen	==	"Splash") {
								
								}
							},

		/** draw the current screen */
		draw			:	function() {
								if(currentScreen		==	"Game") {
									gBoard.draw(context);
								}
								else if(currentScreen	==	"End")
								{
									gBoard.draw(context);
									gOver.draw(context);
								}
								else if(currentScreen	==	"Splash")
								{
								
								}
							}
	};
}();
