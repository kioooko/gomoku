// 技能五子棋技能系统
function SkillSystem(game) {
    console.log('SkillSystem 构造函数被调用');
    console.log('传入的game对象:', game);
    console.log('game.black:', game.black);
    console.log('game.white:', game.white);
    
    this.game = game;
    this.currentPlayer = null;
    this.currentAction = null; // 'place' 或 'skill'
    this.selectedSkill = null;
    this.skillTarget = null;
    this.timer = null;
    this.timeLeft = 6;
    this.round = 1;
    this.maxRounds = 10;
    this.gameState = 'waiting'; // 'waiting', 'action_selection', 'skill_selection', 'processing'
    
    this.init();
}

SkillSystem.prototype.init = function() {
    console.log('SkillSystem init 被调用');
    console.log('this.game:', this.game);
    console.log('this.game.black:', this.game.black);
    console.log('this.game.white:', this.game.white);
    
    this.bindEvents();
    this.updateDisplay();
};

SkillSystem.prototype.bindEvents = function() {
    var self = this;
    
    // 行动选择按钮
    $('#place-stone-btn').on('click', function() {
        self.selectAction('place');
    });
    
    $('#use-skill-btn').on('click', function() {
        self.selectAction('skill');
    });
    
    // 棋盘点击事件（用于下棋和技能目标选择）
    $('.go-board').on('click', '.go-place', function() {
        if (self.gameState === 'action_selection' && self.currentAction === 'place') {
            var $place = $(this);
            var r = $place.data('row');
            var c = $place.data('col');
            self.placeStone(r, c);
        } else if (self.gameState === 'skill_selection' && self.selectedSkill) {
            var $place = $(this);
            var r = $place.data('row');
            var c = $place.data('col');
            self.selectSkillTarget(r, c);
        }
    });
};

SkillSystem.prototype.setCurrentPlayer = function(player) {
    this.currentPlayer = player;
    this.updateDisplay();
};

SkillSystem.prototype.startRound = function() {
    this.gameState = 'action_selection';
    this.currentAction = null;
    this.selectedSkill = null;
    this.skillTarget = null;
    this.timeLeft = 6;
    
    this.updateDisplay();
    this.startTimer();
    this.showActionPanel();
};

SkillSystem.prototype.selectAction = function(action) {
    if (this.gameState !== 'action_selection') return;
    
    this.currentAction = action;
    
    if (action === 'place') {
        this.gameState = 'action_selection';
        this.hideActionPanel();
        this.showPlaceMode();
    } else if (action === 'skill') {
        this.gameState = 'skill_selection';
        this.hideActionPanel();
        this.showSkillPanel();
    }
};

SkillSystem.prototype.placeStone = function(r, c) {
    if (this.gameState !== 'action_selection' || this.currentAction !== 'place') return;
    
    // 检查是否可以下棋
    if (this.game.board.isSet(r, c) || this.game.board.isBlocked(r, c)) {
        gameInfo.setText('该位置不能下棋！');
        return;
    }
    
    // 下棋
    var success = this.game.setGo(r, c, this.currentPlayer.color);
    if (success) {
        this.processAction('place', {r: r, c: c});
    }
};

SkillSystem.prototype.showSkillPanel = function() {
    $('#skills-panel').show();
    this.generateSkillButtons();
    gameInfo.setText('选择要使用的技能');
};

SkillSystem.prototype.hideSkillPanel = function() {
    $('#skills-panel').hide();
};

SkillSystem.prototype.generateSkillButtons = function() {
    var $container = $('#skill-buttons');
    $container.empty();
    
    var character = this.currentPlayer.character;
    var skills = character.skills;
    var self = this;
    
    for (var i = 0; i < skills.length; i++) {
        var skillName = skills[i];
        var skill = SKILLS[skillName];
        
        var $btn = $('<button class="skill-btn" data-skill="' + skillName + '">' + skillName + '</button>');
        $btn.on('click', function() {
            var skillName = $(this).data('skill');
            self.selectSkill(skillName);
        });
        
        $container.append($btn);
    }
};

SkillSystem.prototype.selectSkill = function(skillName) {
    if (this.gameState !== 'skill_selection') return;
    
    this.selectedSkill = skillName;
    var skill = SKILLS[skillName];
    
    $('#skill-description').text(skill.description);
    
    // 根据技能类型决定是否需要选择目标
    if (skill.type === 'remove_stone') {
        gameInfo.setText('选择要移除的对手棋子');
        $('.go-board').addClass('skill-target-mode');
    } else if (skill.type === 'role_block' && skillName === '调程离山') {
        // 调程离山不需要选择目标，直接使用
        this.useSkill(skillName);
    } else {
        // 其他技能直接使用
        this.useSkill(skillName);
    }
};

SkillSystem.prototype.selectSkillTarget = function(r, c) {
    if (this.gameState !== 'skill_selection' || !this.selectedSkill) return;
    
    var skill = SKILLS[this.selectedSkill];
    
    if (skill.type === 'remove_stone') {
        // 检查是否是对手的棋子
        if (this.game.board.isSet(r, c) && this.game.board.getColor(r, c) !== this.currentPlayer.color) {
            this.skillTarget = {r: r, c: c};
            this.useSkill(this.selectedSkill);
        } else {
            gameInfo.setText('请选择对手的棋子！');
            return;
        }
    }
    
    $('.go-board').removeClass('skill-target-mode');
};

SkillSystem.prototype.useSkill = function(skillName) {
    this.processAction('skill', {skill: skillName, target: this.skillTarget});
};

SkillSystem.prototype.processAction = function(type, data) {
    // 停止计时器
    this.stopTimer();
    
    // 记录玩家行动
    this.currentPlayer.lastAction = {
        type: type,
        data: data,
        timestamp: Date.now()
    };
    
    // 检查是否双方都已行动
    if (this.game.black.lastAction && this.game.white.lastAction) {
        this.processRound();
    } else {
        // 切换到下一个玩家
        this.switchPlayer();
    }
};

SkillSystem.prototype.switchPlayer = function() {
    this.gameState = 'waiting';
    this.hideActionPanel();
    this.hideSkillPanel();
    $('.go-board').removeClass('skill-target-mode');
    
    // 切换到下一个玩家
    if (this.currentPlayer.color === 'black') {
        this.currentPlayer = this.game.white;
    } else {
        this.currentPlayer = this.game.black;
    }
    
    this.startRound();
};

SkillSystem.prototype.processRound = function() {
    this.gameState = 'processing';
    this.hideActionPanel();
    this.hideSkillPanel();
    $('.go-board').removeClass('skill-target-mode');
    
    // 技能优先级判定
    var result = this.resolveSkills();
    
    if (result.winner) {
        this.endGame(result.winner, result.reason);
        return;
    }
    
    // 处理棋盘变化
    this.processBoardChanges(result);
    
    // 检查连珠胜利
    var lineWin = this.checkLineWin();
    if (lineWin) {
        this.handleLineWin(lineWin);
        return;
    }
    
    // 进入下一轮
    this.nextRound();
};

SkillSystem.prototype.resolveSkills = function() {
    var blackAction = this.game.black.lastAction;
    var whiteAction = this.game.white.lastAction;
    
    var blackSkill = blackAction.type === 'skill' ? SKILLS[blackAction.data.skill] : null;
    var whiteSkill = whiteAction.type === 'skill' ? SKILLS[whiteAction.data.skill] : null;
    
    // 按优先级处理技能
    for (var i = 0; i < SKILL_PRIORITY.length; i++) {
        var skillName = SKILL_PRIORITY[i];
        var skill = SKILLS[skillName];
        
        var blackHasSkill = blackSkill && blackAction.data.skill === skillName;
        var whiteHasSkill = whiteSkill && whiteAction.data.skill === skillName;
        
        if (blackHasSkill || whiteHasSkill) {
            var result = this.processSkill(skillName, blackHasSkill, whiteHasSkill, blackAction, whiteAction);
            if (result) {
                return result;
            }
        }
    }
    
    return {winner: null, reason: null};
};

SkillSystem.prototype.processSkill = function(skillName, blackHasSkill, whiteHasSkill, blackAction, whiteAction) {
    var skill = SKILLS[skillName];
    
    // 处理棋圣之道（禁用所有技能）
    if (skillName === '棋圣之道' && (blackHasSkill || whiteHasSkill)) {
        gameInfo.setText('棋圣之道：本回合所有技能无效');
        return {winner: null, reason: 'skill_blocked'};
    }
    
    // 处理直接胜利技能
    if (skill.type === 'direct_win') {
        if (blackHasSkill && whiteHasSkill) {
            // 双方都有直接胜利技能，互相抵消
            gameInfo.setText(skillName + ' 互相抵消');
            return {winner: null, reason: 'mutual_cancel'};
        } else if (blackHasSkill) {
            if (skill.counter && whiteAction.data.skill === skill.counter) {
                gameInfo.setText(skill.counter + ' 抵消了 ' + skillName);
                return {winner: null, reason: 'countered'};
            } else {
                return {winner: 'black', reason: skillName};
            }
        } else if (whiteHasSkill) {
            if (skill.counter && blackAction.data.skill === skill.counter) {
                gameInfo.setText(skill.counter + ' 抵消了 ' + skillName);
                return {winner: null, reason: 'countered'};
            } else {
                return {winner: 'white', reason: skillName};
            }
        }
    }
    
    // 处理其他技能
    if (blackHasSkill) {
        this.executeSkill(skillName, 'black', blackAction);
    }
    if (whiteHasSkill) {
        this.executeSkill(skillName, 'white', whiteAction);
    }
    
    return null;
};

SkillSystem.prototype.executeSkill = function(skillName, playerColor, action) {
    var skill = SKILLS[skillName];
    var player = this.game[playerColor];
    
    switch (skillName) {
        case '飞沙走石':
            if (action.data.target) {
                this.game.board.unsetGo(action.data.target.r, action.data.target.c);
                gameInfo.setText(player.character.name + ' 使用了飞沙走石');
            }
            break;
        case '静如止水':
            // 标记对方不能下棋
            player.other.blocked = true;
            gameInfo.setText(player.character.name + ' 使用了静如止水');
            break;
        case '擒拿':
            // 对方本回合判负
            player.other.frozen = true;
            gameInfo.setText(player.character.name + ' 使用了擒拿');
            break;
        case '调程离山':
            if (player.other.character.name === '太子') {
                player.other.blocked = true;
                gameInfo.setText(player.character.name + ' 对太子使用了调程离山');
            }
            break;
        case '保洁上门':
            this.clearBoard();
            gameInfo.setText(player.character.name + ' 使用了保洁上门');
            break;
    }
};

SkillSystem.prototype.clearBoard = function() {
    // 清除棋盘上所有棋子
    for (var r = 0; r < 15; r++) {
        for (var c = 0; c < 15; c++) {
            if (this.game.board.isSet(r, c)) {
                this.game.board.unsetGo(r, c);
            }
        }
    }
};

SkillSystem.prototype.checkLineWin = function() {
    // 检查是否有五连
    for (var r = 0; r < 15; r++) {
        for (var c = 0; c < 15; c++) {
            if (this.game.board.isSet(r, c)) {
                var color = this.game.board.getColor(r, c);
                if (this.game.board.getGameResult(r, c, color) === 'win') {
                    return {color: color, r: r, c: c};
                }
            }
        }
    }
    return null;
};

SkillSystem.prototype.handleLineWin = function(lineWin) {
    var winner = this.game[lineWin.color];
    var loser = winner.other;
    
    // 对方生命值-1
    loser.character.takeDamage(1);
    this.updateHpDisplay();
    
    gameInfo.setText(winner.character.name + ' 连成五子！' + loser.character.name + ' 生命值-1');
    
    if (loser.character.hp <= 0) {
        this.endGame(winner.color, 'line_win');
    } else {
        this.nextRound();
    }
};

SkillSystem.prototype.nextRound = function() {
    this.round++;
    
    if (this.round > this.maxRounds) {
        // 10轮结束，比较生命值
        this.endGameByHp();
        return;
    }
    
    // 重置玩家状态
    this.game.black.lastAction = null;
    this.game.white.lastAction = null;
    this.game.black.blocked = false;
    this.game.white.blocked = false;
    this.game.black.frozen = false;
    this.game.white.frozen = false;
    
    // 开始下一轮
    this.startRound();
};

SkillSystem.prototype.endGameByHp = function() {
    var blackHp = this.game.black.character.hp;
    var whiteHp = this.game.white.character.hp;
    
    if (blackHp > whiteHp) {
        this.endGame('black', 'hp_win');
    } else if (whiteHp > blackHp) {
        this.endGame('white', 'hp_win');
    } else {
        this.endGame(null, 'draw');
    }
};

SkillSystem.prototype.endGame = function(winner, reason) {
    this.gameState = 'finished';
    this.stopTimer();
    
    if (winner) {
        var winnerPlayer = this.game[winner];
        var loserPlayer = winnerPlayer.other;
        
        var reasonText = '';
        switch (reason) {
            case 'line_win':
                reasonText = '连珠胜利';
                break;
            case 'hp_win':
                reasonText = '生命值胜利';
                break;
            default:
                reasonText = reason;
        }
        
        gameInfo.setText(winnerPlayer.character.name + ' 获胜！(' + reasonText + ')');
        this.showWinDialog(winnerPlayer, reasonText);
    } else {
        gameInfo.setText('平局！');
        this.showDrawDialog();
    }
};

SkillSystem.prototype.showWinDialog = function(winner, reason) {
    // 显示胜利对话框
    setTimeout(function() {
        $('#game-won h4').html(winner.character.name + ' 获胜！');
        $('#win-content').html(winner.character.name + ' 赢得了游戏！(' + reason + ')');
        $('#happy-outer').fadeIn(500);
    }, 1000);
};

SkillSystem.prototype.showDrawDialog = function() {
    setTimeout(function() {
        $('#game-won h4').html('平局！');
        $('#win-content').html('双方势均力敌，平局收场！');
        $('#happy-outer').fadeIn(500);
    }, 1000);
};

SkillSystem.prototype.startTimer = function() {
    var self = this;
    this.timer = setInterval(function() {
        self.timeLeft--;
        $('#timer').text(self.timeLeft);
        
        if (self.timeLeft <= 0) {
            self.handleTimeout();
        }
    }, 1000);
};

SkillSystem.prototype.stopTimer = function() {
    if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
};

SkillSystem.prototype.handleTimeout = function() {
    this.stopTimer();
    gameInfo.setText('时间到！自动选择下棋');
    
    // 超时自动选择下棋
    this.currentAction = 'place';
    this.gameState = 'action_selection';
    this.hideActionPanel();
    this.showPlaceMode();
};

SkillSystem.prototype.showActionPanel = function() {
    $('#action-panel').show();
    gameInfo.setText(this.currentPlayer.character.name + ' 的回合 - 选择行动');
};

SkillSystem.prototype.hideActionPanel = function() {
    $('#action-panel').hide();
};

SkillSystem.prototype.showPlaceMode = function() {
    this.game.toHuman(this.currentPlayer.color);
    gameInfo.setText('选择落子位置');
};

SkillSystem.prototype.updateDisplay = function() {
    console.log('SkillSystem updateDisplay 被调用');
    console.log('this.game:', this.game);
    console.log('this.game.black:', this.game.black);
    console.log('this.game.white:', this.game.white);
    
    // 检查game对象和玩家对象是否存在
    if (!this.game) {
        console.error('game对象不存在');
        return;
    }
    
    if (!this.game.black || !this.game.white) {
        console.error('玩家对象不存在', {black: this.game.black, white: this.game.white});
        return;
    }
    
    // 检查玩家角色对象是否存在
    if (!this.game.black.character || !this.game.white.character) {
        console.error('玩家角色对象不存在', {
            blackCharacter: this.game.black.character,
            whiteCharacter: this.game.white.character
        });
        return;
    }
    
    // 更新回合显示
    $('#current-round').text(this.round);
    
    // 更新玩家信息
    try {
        $('#player1-name').text(this.game.black.character.name + ' ' + this.game.black.character.emoji);
        $('#player1-hp').text(this.getHpDisplay(this.game.black.character.hp));
        
        $('#player2-name').text(this.game.white.character.name + ' ' + this.game.white.character.emoji);
        $('#player2-hp').text(this.getHpDisplay(this.game.white.character.hp));
    } catch (error) {
        console.error('更新玩家信息时发生错误:', error);
        // 使用默认值
        $('#player1-name').text('玩家1');
        $('#player1-hp').text('♥️♥️♥️♥️♥️');
        $('#player2-name').text('玩家2');
        $('#player2-hp').text('♥️♥️♥️♥️♥️');
    }
    
    // 更新游戏信息
    if (this.currentPlayer) {
        gameInfo.setColor(this.currentPlayer.color);
    }
};

SkillSystem.prototype.updateHpDisplay = function() {
    $('#player1-hp').text(this.getHpDisplay(this.game.black.character.hp));
    $('#player2-hp').text(this.getHpDisplay(this.game.white.character.hp));
};

SkillSystem.prototype.getHpDisplay = function(hp) {
    var hearts = '';
    for (var i = 0; i < hp; i++) {
        hearts += '♥️';
    }
    return hearts;
};

// 导出到全局
window.SkillSystem = SkillSystem;
