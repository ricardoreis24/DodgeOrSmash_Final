/**
 * Pequeno jogo onde se tem de fugir ou saltar em cima dos enimigos, ganhando pontos por isso
 * @param {*} usersImg Caminho da imagem que o utilizador vai usar para jogar
 * @param {*} imagesInimig Array de objetos, cada objeto é um enimigo e tem que obrigatóriamente ter as seguintes caracteristicas: 
 * { 
 *  image: '[caminho da imagem do enimigo]',
 *  bonusHit: [pontuação por acertar, se 0 ou menor, entao perde se tocar no mesmo],
 *  bonusJump: [pontuação de saltar em cima],
 *  prob: [0-1] 
 * }
 * @param {*} w largura do canvas em px
 * @param {*} h altura do canvas em px
 * @param {*} fps frames por segundo
 * @param {*} backGroundColor cor do fundo do canvas se não preenchido ou se '' (vazio) entao ficará transparente
 */
function dodgeOrSmash(usersImg, imagesInimig, w, h, fps, backGroundColor) {
	if (!w || w == undefined) fps = 700;
	if (!h || h == undefined) fps = 800;
	if (!fps || fps == undefined) fps = 60;
	if (!backGroundColor || backGroundColor == undefined) backGroundColor = "";
	var options = {
		width_s: w,
		height_s: h,
		background_col: backGroundColor,
		fps_s: fps,
		usersImg_s: usersImg,
		imagesInimig_s: JSON.parse(JSON.stringify(imagesInimig)),
		speed_on_ground: null,
		started: -1,
		move_world: 0
	};

	var CONSTANTS = {
		HEIGHT_PIECES: w * .1,
		WIDTH_PIECES: w * .1,
		GRAVITY: 0.7,
		GRAVITY_INIMIGOS: 6,
		MIN_N_INIMIGOS: 12,
		STEP: 20,
		MOVE_X_SPEED: 5,
		SCORE_BY_SECOND: 10,
		WHEN_MVW_STEP: 0.5,
		GROUND_PERC_J: 0.85,
		D_JUMP_PERC: 1,
		DEBOUNCE_JUMP_TOUCH: 500,
		EVENTS_NAMES: {
			gameEnd: "gameend",
			gamePause: "gamepause",
			gameStart: "gamestart",
			gameStop: "gamestop"
		}
	};


	var eventos = {
		onGameEnd: [],
		onGamePause: [],
		onGameStart: [],
		onGameStop: []
	};

	var areaJogo = {
		canvas: document.createElement("canvas"),
		start: function () {
			if (options.started == 1) return;
			else if (options.started == 0) {
				this.startTimer();
				trigger(CONSTANTS.EVENTS_NAMES.gameStart, { isUnpause: true });
				return;
			}
			trigger(CONSTANTS.EVENTS_NAMES.gameStart, { isUnpause: false });
			this.width = options.width_s;
			this.height = options.height_s;
			this.fps = options.fps_s;
			this.inimigo = [];
			this.inimigoDef = options.imagesInimig_s;
			this.jogador = new objeto(1, (areaJogo.width / 2) - (CONSTANTS.WIDTH_PIECES / 2), (areaJogo.height / 2) - (CONSTANTS.HEIGHT_PIECES / 2), CONSTANTS.WIDTH_PIECES, CONSTANTS.HEIGHT_PIECES, CONSTANTS.GRAVITY, false, false, options.usersImg_s);
			this.pontuacao = new objeto(2, (areaJogo.width / 2), 40, "30px", "Consolas", 0, false, false, "#000000", 0, 0, "text", "center");
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			this.canvas.setAttribute("class", "dodgeOrSmash");
			this.context = this.canvas.getContext("2d");
			//numero de frame
			this.frameNo = CONSTANTS.STEP;
			this.score_by_fps = CONSTANTS.SCORE_BY_SECOND / this.fps;
			this.score = 0;
			this.keyLeft = false;
			this.keyRight = false;
			this.mouseX = null;

			this.double_jump = false;
			this.on_double_jump = true;
			this.af_double_jump = true;
			this.touch_jump=false;
			this.touch_jumping=false;
			this.touch_jump_timer=null;

			//input setas
			window.addEventListener('keydown', function (e) {
				switch(e.which || e.keyCode) {
					//char tecla esquerda
					case 37:
					//char: A
					case 65:
					//char: a
					case 97:
						areaJogo.keyLeft = true;
						break;
					//char: espaço
					case 32:
					//char: tecla topo
					case 38:
					//char: W
					case 87:
					//char: w
					case 119:
						areaJogo.double_jump = true;
						break;
					//char: tecla direita
					case 39:
					//char: D
					case 68:
					//char: d
					case 100:
						areaJogo.keyRight = true;
						break;
				}
			});
			window.addEventListener('keyup', function (e) {
				switch(e.which || e.keyCode) {
					//char tecla esquerda
					case 37:
					//char: A
					case 65:
					//char: a
					case 97:
						areaJogo.keyLeft = false;
						break;
					//char: espaço
					case 32:
					//char: tecla topo
					case 38:
					//char: W
					case 87:
					//char: w
					case 119:
						areaJogo.double_jump = false;
						break;
					//char: tecla direita
					case 39:
					//char: D
					case 68:
					//char: d
					case 100:
						areaJogo.keyRight = false;
						break;
				}
			});
			this.canvas.addEventListener("mousemove", function (e) {
				var bounds = e.target.getBoundingClientRect();
				areaJogo.mouseX = e.pageX - bounds.left;
			}, false);
			this.canvas.addEventListener("mousedown", function (e) {
				areaJogo.double_jump = true;
			}, false);
			this.canvas.addEventListener("mouseup", function (e) {
				areaJogo.double_jump = false;
			}, false);
			this.touchHandler = function(e) {
				if(e.touches) {
					var bounds = e.target.getBoundingClientRect();
					areaJogo.mouseX = e.touches[0].pageX - bounds.left;
					e.preventDefault();
				}
			}
			this.touchStart = function(e) {
				if(e.touches) {					
					clearInterval(areaJogo.touch_jump_timer);
					if(areaJogo.touch_jump) areaJogo.double_jump=true;
					areaJogo.touch_jump=true;
					areaJogo.touchHandler(e);
					e.preventDefault();
				}
			}
			this.touchEnd= function() {
				clearInterval(areaJogo.touch_jump_timer);
				areaJogo.touch_jump_timer=setTimeout(function() {areaJogo.touch_jump=false;},CONSTANTS.DEBOUNCE_JUMP_TOUCH);
				areaJogo.double_jump = false;
			}
			this.canvas.addEventListener("touchstart", this.touchStart);
			this.canvas.addEventListener("touchmove", this.touchHandler);
			this.canvas.addEventListener("touchend", this.touchEnd);

			this.startTimer();
		},
		startTimer: function () {
			options.started = 1;
			areaJogo.interval = setInterval(areaJogo.update, 1000 / areaJogo.fps);
		},
		generateRandomEnemy: function () {
			var y = -CONSTANTS.HEIGHT_PIECES;
			var minX = -(CONSTANTS.WIDTH_PIECES / 2);
			var maxX = areaJogo.width - (CONSTANTS.WIDTH_PIECES / 2);
			//fazer o X random
			var xRandom = Math.floor(Math.random() * (maxX - minX) + minX);
			//cria um novo objeto
			var cena;
			do {
				cena = Math.floor(Math.random() * areaJogo.inimigoDef.length);
			} while (areaJogo.inimigoDef[cena].prob < Math.random());
			areaJogo.inimigo.push(new objeto(1, xRandom, y, CONSTANTS.WIDTH_PIECES, CONSTANTS.HEIGHT_PIECES, CONSTANTS.GRAVITY_INIMIGOS, true, true, areaJogo.inimigoDef[cena].image, areaJogo.inimigoDef[cena].bonusHit, areaJogo.inimigoDef[cena].bonusJump));
		},
		moveObjects: function () {
			for (i = 0; i < areaJogo.inimigo.length; i += 1) {
				areaJogo.inimigo[i].newPos();
				if (areaJogo.inimigo[i].toDelete) {
					areaJogo.inimigo.splice(i, 1);
					i--;
				} else areaJogo.inimigo[i].update();
			}
		},
		checkMovePlayer: function () {
			if (areaJogo.mouseX !== null) {
				var halfplayer = (areaJogo.jogador.width / 2);
				if (areaJogo.jogador.x + halfplayer >= areaJogo.mouseX - CONSTANTS.MOVE_X_SPEED && areaJogo.jogador.x + halfplayer <= areaJogo.mouseX + CONSTANTS.MOVE_X_SPEED) {
					areaJogo.mouseX = null;
				} else {
					if (areaJogo.jogador.x + halfplayer < areaJogo.mouseX) {
						areaJogo.jogador.speedX = CONSTANTS.MOVE_X_SPEED;
					} else if (areaJogo.jogador.x + halfplayer > areaJogo.mouseX) {
						areaJogo.jogador.speedX = -CONSTANTS.MOVE_X_SPEED;
					}
				}
			} else {
				areaJogo.jogador.speedX = 0;
				if (areaJogo.keyLeft) { areaJogo.jogador.speedX = -CONSTANTS.MOVE_X_SPEED; }
				else if (areaJogo.keyRight) { areaJogo.jogador.speedX = CONSTANTS.MOVE_X_SPEED; }
				if (areaJogo.keyLeft && areaJogo.keyRight) { areaJogo.jogador.speedX = 0; }
			}
		},
		checkPlayerColisions: function () {
			for (i = 0; i < areaJogo.inimigo.length; i += 1) {
				switch (areaJogo.jogador.colide(areaJogo.inimigo[i])) {
					case 2:
						if (areaJogo.inimigo[i].bonus > 0) {
							areaJogo.addToScore(areaJogo.inimigo[i].bonus);
							areaJogo.inimigo[i].toDelete = true;
						} else {
							areaJogo.stop();
							trigger(CONSTANTS.EVENTS_NAMES.gameEnd, { score: Math.floor(areaJogo.getScore()) });
							return false;
						}
						break;
					case 1:
						if (areaJogo.jogador.gravitySpeed > 0 && areaJogo.inimigo[i].bOj > 0) {
							areaJogo.addToScore(areaJogo.inimigo[i].bonus + areaJogo.inimigo[i].bOj);
							areaJogo.inimigo[i].toDelete = true;
							areaJogo.stopDoubleJump();
							areaJogo.jogador.jump(CONSTANTS.GROUND_PERC_J);
						}
				}
			}
			return true;
		},
		getScore: function () {
			return Math.floor(areaJogo.score);
		},
		addToScore: function (points) {
			areaJogo.score += points;
		},
		incrementScore: function () {
			areaJogo.score += areaJogo.score_by_fps;
		},
		verficaDoubleJump: function () {
			if (!areaJogo.on_double_jump && areaJogo.double_jump && !areaJogo.af_double_jump) {
				areaJogo.on_double_jump = true;
				areaJogo.jogador.jump(CONSTANTS.D_JUMP_PERC);
			}
			if (!areaJogo.double_jump && areaJogo.on_double_jump && options.speed_on_ground !== null && areaJogo.jogador.gravitySpeed < 0) {
				areaJogo.jogador.gravitySpeed = areaJogo.jogador.gravity * -3;
				areaJogo.on_double_jump = false;
				areaJogo.af_double_jump = true;
			}
		},
		stopDoubleJump: function () {
			areaJogo.on_double_jump = false;
			areaJogo.af_double_jump = false;
			areaJogo.double_jump = false;
		},
		updateScore: function () {
			areaJogo.pontuacao.text = "SCORE: " + areaJogo.getScore();
			areaJogo.pontuacao.update();
		},
		update: function () {
			if (!areaJogo.checkPlayerColisions()) return;
			areaJogo.clear();
			//frame number
			areaJogo.incrementScore();
			areaJogo.frameNo--;
			if (areaJogo.frameNo <= -1) {
				areaJogo.generateRandomEnemy();
				areaJogo.frameNo = CONSTANTS.STEP * (options.move_world > 0 ? CONSTANTS.WHEN_MVW_STEP : 1);
			}
			areaJogo.moveObjects();
			areaJogo.updateScore();
			areaJogo.jogador.wrap();
			areaJogo.checkMovePlayer();
			areaJogo.verficaDoubleJump();
			if (areaJogo.jogador.newPos())
				areaJogo.stopDoubleJump();
			areaJogo.jogador.hitTop();
			areaJogo.jogador.update();
		},
		clear: function () {
			if (options.background_col === "") this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			else {
				this.context.fillStyle = options.background_col;
				this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
				this.context.fillStyle = "#000000";
			}
		},
		stop: function () {
			clearInterval(this.interval);
			options.started = -1;
			trigger(CONSTANTS.EVENTS_NAMES.gameStop, {});
		},
		pause: function () {
			clearInterval(this.interval);
			options.started = 0;
			trigger(CONSTANTS.EVENTS_NAMES.gamePause, {});
		}
	};
	function objeto(type, x, y, w, h, gravity, const_gravity, vanish, cOi, bonus, bOj, text, textAlign) {
		this.type = type;

		if (!bonus || bonus == undefined) this.bonus = 0;
		else this.bonus = bonus;
		if (!bOj || bOj == undefined) this.bOj = 0;
		else this.bOj = bOj;
		if (vanish == undefined) this.vanish = true;
		else this.vanish = vanish;
		if (!cOi || cOi == undefined) {
			this.cOi = "#000000";
			type = 0;
		} else this.cOi = cOi;
		if (!text || text == undefined) this.text = "";
		else this.text = text;
		if (!textAlign || textAlign == undefined) this.textAlign = "start";
		else this.textAlign = textAlign;
		if (const_gravity == undefined) this.const_gravity = false;
		else this.const_gravity = const_gravity;

		this.width = w;
		this.height = h;
		this.speedX = 0;
		this.x = x;
		this.y = y;
		this.gravity = gravity;
		if (!this.const_gravity) this.gravitySpeed = 0;
		else this.gravitySpeed = this.gravity;
		this.image = null;
		this.toDelete = false;

		this.update = function () {
			ctx = areaJogo.context;
			ctx.textAlign = this.textAlign;
			//isto era suposto funcionar
			switch (this.type) {
				case 1:
					if (this.image === null) {
						this.image = new Image();
						this.image.src = this.cOi;
					}
					ctx.drawImage(this.image,
						this.x,
						this.y,
						this.width, this.height);
					break;
				case 2:
					ctx.font = this.width + " " + this.height;
					ctx.fillStyle = this.cOi;
					ctx.fillText(this.text, this.x, this.y);
					break;
				default:
					ctx.fillStyle = this.cOi;
					ctx.fillRect(this.x, this.y, this.width, this.height);
			}
		}
		//new position
		this.newPos = function () {
			if (!this.const_gravity) {
				this.gravitySpeed += this.gravity;
			}
			this.x += this.speedX;
			this.y += this.gravitySpeed + options.move_world;
			return this.checkHitGround();
		}
		//caso bata no fundo
		this.checkHitGround = function () {
			if (!this.vanish) {
				var fundo = areaJogo.height - this.height;
				if (this.y > fundo) {
					this.y = fundo;
					if (options.speed_on_ground === null) {
						options.speed_on_ground = areaJogo.jogador.gravitySpeed;
					}
					this.jump(CONSTANTS.GROUND_PERC_J);
					return true;
				}
			} else {
				if (this.y > areaJogo.height) {
					this.toDelete = true;
					return true;
				}
			}
			return false;
		}
		this.hitTop = function () {
			if (this.y <= 100 && this.gravitySpeed < 0) {
				options.move_world = -this.gravitySpeed;
			} else options.move_world = 0;
		}
		this.jump = function (perc) {
			this.gravitySpeed = -perc * options.speed_on_ground;
		}
		//dar a volta ao ecra
		this.wrap = function () {
			// 30 porque é o tamanho do boneco
			if (this.x + (this.width * 0.75) < 0) {
				this.x = areaJogo.width - this.width * 0.25 + 1;
			}
			else if (this.x + (this.width * 0.25) >= areaJogo.width) {
				this.x = -this.width * 0.75 + 1;
			}

		}
		//caso colide
		this.colide = function (outroObj) {
			var colisao = 0;
			var mErroE = 8, mErroD = 8, mErroT = 20, mErroB = 10;

			if (this.x < outroObj.x + outroObj.width - mErroE && this.x + this.width > outroObj.x + mErroD &&
				this.y < outroObj.y + outroObj.height - mErroB && this.y + this.height > outroObj.y) {
				colisao = 1;
				if (this.y + this.height > outroObj.y + mErroT) {
					colisao = 2;
				}
			}

			return colisao;
		}
	}

	function trigger(eventName, evt) {
		var evento = getEventObjByName(eventName);
		if (evento === null) return;
		for (var i = 0; i < evento.length; i++) {
			evento[i](evt);
		}
	}

	function getEventObjByName(name) {
		switch (name.toLowerCase()) {
			case CONSTANTS.EVENTS_NAMES.gameEnd:
				return eventos.onGameEnd;
			case CONSTANTS.EVENTS_NAMES.gamePause:
				return eventos.onGamePause;
			case CONSTANTS.EVENTS_NAMES.gameStart:
				return eventos.onGameStart;
			case CONSTANTS.EVENTS_NAMES.gameStop:
				return eventos.onGameStop;
			default:
				return null;
		}
	}

	this.getAreaJogo = function () { return areaJogo; }
	this.start = function () {
		areaJogo.start();
	}
	this.stop = function () {
		areaJogo.stop();
	}
	this.pause = function () {
		areaJogo.pause();
	}
	this.remove = function () {
		areaJogo.stop();
		areaJogo.canvas.remove();
	}
	this.getCanvas = function () {
		return areaJogo.canvas;
	}
	this.getScore = function () {
		return Math.floor(areaJogo.score);
	}
	this.unbind = function (eventName) {
		if (!eventName || eventName == undefined) {
			eventos.onGameEnd = [];
			eventos.onGamePause = [];
			eventos.onGameStart = [];
			eventos.onGameStop = [];
		} else {
			var evento = getEventObjByName(eventName);
			evento.splice(0, evento.length);
		}
	}
	this.addEventListener = function (eventName, funcToTrig) {
		//funcToTrig(areaJogo.score);//fazer que seja triggered quando acaba o jogo
		var evento = getEventObjByName(eventName);
		evento.push(funcToTrig);
		return evento.length - 1;
	}
	this.removeEventListener = function (eventName, id) {
		var evento = getEventObjByName(eventName);
		if (evento.length <= id) return false;
		evento.splice(id, 1);
		return true;
	}

	this.setNewEnemies = function (imagesInimig) {
		options.imagesInimig_s = JSON.parse(JSON.stringify(imagesInimig));
	}
	this.setNewPlayer = function (usersImg) {
		options.usersImg_s = usersImg;
		if (areaJogo.jogador.image !== null) areaJogo.jogador.image.src = options.usersImg_s;
	}
};