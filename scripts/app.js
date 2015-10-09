$(document).ready(function () {
	
	//Game Objects
	var car = $('#car');
	var totalIsles = 7;
	var currentIsle = 1;
	var trafficCount = 0;
	var startingTrafficCount = 5;
	
	var incrementDifficultyEvery = 200;
	var lastDifficulty = 0;
	
	
	function playSound(sound) {
		if(soundOn)
			document.getElementById(sound).play();
	}
	
	function stopSound(sound) {
		document.getElementById(sound).pause();
	}
	
	function addTrafficObject() {
		var trafficTemplate = $("<div class='traffic'></div>");
		var newTraffic = trafficTemplate.clone();
		newTraffic.attr('id', 'traffic'+ (trafficCount+1));
		// console.log("New Traffic id: "+newTraffic.attr('id'));
		//Add to gamespace
		$('#scrollScreen').append(newTraffic);
		trafficCount++;
				
		resetTraffic(newTraffic);
	}
	
	function checkDifficulty() {
		if((score - lastDifficulty) > incrementDifficultyEvery) {
			addTrafficObject();
			//New Level Sound?
			console.info("Next Level");
			playSound('levelUpAudio');
			lastDifficulty = score;
		}
	}
	
	var soundButton = $('#soundButton');
	
	
	var scoreBox = $("#scoreBox");
	var highScores = [];
	
	var ScoreObj = function(nme, scr) {
		this.name = nme;
		this.score = scr;
	}
	
	//Game Variables
	var isPlaying = false;
	var isEnding = false;
	var carLane = 3;
	var score = 0;
	var gameSpeed = 12;
	var soundOn = true;
	setupNewGame();
	var speedBonus = 0;
	
	//Game Setup
	loadScores();
	function setupNewGame() {
		var top = $('#lane3').position().top+10;
		var left = $('#lane3').position().left + 20;
		car.css('top',top+"px");
		car.css('left', left+"px");
		score = 0;
		updateScore();
		carLane = 3;
		currentIsle = 1;
		isPlaying = false;
		lastDifficulty = 0;
		gameSpeed = 12;
		speedBonus = 0;
		setInfo("Press Enter to start a game!");
		$('.traffic').remove();
		trafficCount = 0;
		
		//set traffic
		for(var i = 0; i < startingTrafficCount; i++) {
			addTrafficObject();
		}
	}
	
	function setInfo(text) {
		$('#info').text(text);
	}
	
	function updateScore() {
		scoreBox.text(score);
	}
	
	//Button listeners
	$('#soundButton').on('click',function (){
		if(soundOn) {
			soundButton.text('Sound Off');
			//stop all audio
			stopSound('carIdle');
			stopSound('crashAudio');
			soundOn = false; 
		}else {
			soundButton.text('Sound On');
			soundOn = true;
			if(isPlaying)
				playSound('carIdle');
		}
	});
	
	$('#highScoreTab').on('click',showScoresTab);
	$('#erase').on('click', clearScores);
	
	
	//Keypress listeners

	
	$(document).on("keydown", function(event) {
		if(isPlaying) {//Only allowed during gameplay
			if(event.which == 38){
				//Up key was pressed: Move up 70px
				if(carLane > 1){
					car.css('top', "-=70px");
					carLane--;
				}
			}else if(event.which == 40) {
				//Down key was pressed
				if(carLane < 5) {
					car.css('top', "+=70px");
					carLane++;
				}
			}else if(event.which == 37) {
				//Left Arrow
				gameSpeed -= 2;
				speedBonus --;
				if(speedBonus < 0)
					speedBonus = 0;
				if(currentIsle > 1){
					currentIsle--;
					//Shift player
					car.css('left','-=50px');
				}
			}else if(event.which == 39) {
				//Right Arrow
				gameSpeed += 2;
				speedBonus ++;
				if(currentIsle < totalIsles) {
					currentIsle++;
					car.css('left', '+=50px');
				}
			}
		} else {//only allowed out of game
			if(event.which == 13 && !isEnding) {//enter, start a game
				setupNewGame();
				playSound('carIdle');
				playSound('startAudio');
				isPlaying = true;
				setInfo('Play Game!');
				setTimeout(MainLogicRunner, 100);
				if(highScoresVisible)
					showScoresTab();
			}
		}
	});
	
	
	// ---------- Game Logic ---------- \\
	
	function MainLogicRunner() {
		//is the game running?
		if(isPlaying) {
			//did i crash?
			if(checkCrash()) {
				//OH NO YOU CRASHED!
				//Begin end game
				isEnding = true;
				isPlaying = false;
				setInfo('You Died');
			} else {
				//lets get more points :)
				score += 1+speedBonus;
				updateScore();
				checkDifficulty();
			}
			RunTraffic();
			setTimeout(MainLogicRunner, 20);
		} else if(isEnding) {
			//did i get a high score?
			checkScore();
			//Wrapup stuffs
			setInfo("Play Again? Press Enter");
			isEnding = false;
			if(!highScoresVisible)
				showScoresTab();
		}
		//finally do a set timeout to run through it all again!
		//Runs ever 20 milliseconds... is it fast enough?
	}
	
	function RunTraffic() {
		//move them all left
		for(var i = 0; i <	trafficCount; i++) {
			var trafficI = $('#traffic'+(i+1));
			trafficI.css('left', '-='+gameSpeed+'px');
			//Am I too far right? (hide?)
			var traf = new CarObj(trafficI);			
			
			//check if they are too far left
			if(traf.left < -50) {
				resetTraffic(trafficI);
			}
		}
	}
	
	function resetTraffic(trafficObj) {
		//pick a lane
		var newLane = Math.floor((Math.random()*10)/2);
		//set to lane
		var newTop = $('#lane1').position().top+10;
		newTop += (newLane*70);
		trafficObj.css('top', newTop+'px');
		//set left starting
		var newLeft = $('#scrollScreen').position().left + $('#scrollScreen').width();
		//add a differentiator
		newLeft += Math.floor(Math.random()*100)*Math.floor(Math.random()*100/4);
		trafficObj.css('left',newLeft+'px');	
	}
	
	
	var CarObj = function(jEle) {
		try {
			this.left = jEle.position().left;
			this.right = jEle.width()+this.left;
			this.top = jEle.position().top;
			this.bot = jEle.height()+this.top;
		} catch (e) {
			// console.error(e);
		}
	}
	
	function checkDivCollision(ele1, ele2) {
		//I need to be passed two Car objects
		if((ele1.left <= ele2.right && ele1.left >= ele2.left) || (ele1.right <= ele2.right && ele1.right >= ele2.left)){
			if((ele1.top <= ele2.bot && ele1.top >= ele2.top) || (ele1.bot <= ele2.top && ele1.bot >= ele2.bot))
				return true;//oh you crashed!
		}
		return false;
	}
	
	function checkCrash() {
		// Have I crashed?
		var car = $('#car');
		var player = new CarObj(car);
		//check crash with traffic
		for(var i = 0; i < trafficCount; i++) {
			var traffic = new CarObj($('#traffic'+(i+1)));
			//made objects
			var crashed = checkDivCollision(player, traffic);
			if(crashed){
				playSound('crashAudio');
				stopSound('carIdle');
				return true;
			}
		}
		return false;
	}
	
	// ---------- Score Logic ---------- \\
	function loadScores() {
		var data = localStorage.getItem('FDriverLocal');
		console.log(data);
		if(data === null) {//no data
			console.info("No save data found.");
			return;
		}
		highScores = JSON.parse(data);
		console.info("Scores loaded.");
		setScoresInfo();
	}
	
	function saveScores() {
		var data = JSON.stringify(highScores);
		localStorage.setItem('FDriverLocal', data);
		console.info("Scores saved.");
		console.log(highScores);
		setScoresInfo();
	}
	
	function clearScores() {
		localStorage.removeItem('FDriverLocal');
		highScores = [];
		setScoresInfo();
	}
	
	function getScore() {
		var name = prompt("New high score! Please enter your name.");
		name = name.trim();
		if(name == '' || !name) {
			name = 'Ghost';
		}
		return new ScoreObj(name, score);
	}
	
	function checkScore() {
		console.info("Checking your score."+score);
		if(highScores.length == 0){
			highScores.push(getScore());
			saveScores();
		} else {
			if(highScores.length < 10) {
				//get a high score info and push it
				highScores.push(getScore());
				//sort the array :)
				sortHighScores();
				saveScores();
			} else if (highScores[9].score < score) {
				//remove last
				highScores.pop();
				//get score and push it
				highScores.push(getScore());
				//sort the array
				sortHighScores();
				saveScores();
			}
		}
		setScoresInfo();
	}
	
	function sortHighScores() {
		//sort
		highScores.sort(function(a, b) {
			if(a.score < b.score)
				return 1;
			if(a.score > b.score)
				return -1;
			return 0;
		});
		//Save
		saveScores();
	}
	
	var highScoresVisible = false;
	function showScoresTab () {
		var tab = $('#highScoreTab');
		if(!highScoresVisible) {
			tab.animate({right: "10px"}, 500);
			highScoresVisible = true;
		} else {
			tab.animate({right: "-200px"}, 500);
			highScoresVisible = false;
		}	
	}
	
	function setScoresInfo () {
		var scoreTemplate = $('<li></li>');
		var list = $('#highScoresList');
		list.empty();
		for(var i = 0; i < highScores.length; i++) {
			var newbie = scoreTemplate.clone();
			newbie.text(highScores[i].score + " : "+highScores[i].name);
			list.append(newbie);
		}
		if(highScores.length == 0) {
			var newbie = scoreTemplate.clone();
			newbie.text('No Score Data');
			list.append(newbie); 	
		}
	}
	
	setScoresInfo();
	
	
	
});