// 游戏选择流程管理
function GameSelection() {
    this.currentStep = 'mode';
    this.gameData = {
        mode: null, // 'single' or 'multi'
        player1Character: null,
        player2Character: null,
        color: null, // 'black' or 'white'
        difficulty: null // 'easy', 'medium', 'hard'
    };
    this.characterSelectionCount = 0;
    
    this.init();
}

GameSelection.prototype.init = function() {
    console.log('GameSelection 初始化开始');
    this.bindEvents();
    console.log('事件绑定完成');
    this.showModeSelection();
    console.log('显示模式选择页面');
};

GameSelection.prototype.bindEvents = function() {
    var self = this;
    
    // 使用事件委托来处理动态创建的元素
    $(document).on('click', '.mode-option', function() {
        self.selectMode($(this).data('mode'));
    });
    
    $(document).on('click', '.character-option', function() {
        console.log('角色选项被点击');
        var character = $(this).data('character');
        console.log('获取到的角色数据:', character);
        self.selectCharacter(character);
    });
    
    $(document).on('click', '.color-option', function() {
        self.selectColor($(this).data('color'));
    });
    
    $(document).on('click', '.difficulty-option', function() {
        self.selectDifficulty($(this).data('difficulty'));
    });
    
    // 确认按钮
    $(document).on('click', '#confirm-character', function() {
        self.confirmCharacter();
    });
    
    $(document).on('click', '#confirm-color', function() {
        self.confirmColor();
    });
    
    $(document).on('click', '#confirm-difficulty', function() {
        self.confirmDifficulty();
    });
    
    // 返回按钮
    $(document).on('click', '.back-to-mode', function() {
        self.showModeSelection();
    });
    
    $(document).on('click', '.back-to-character', function() {
        self.showCharacterSelection();
    });
    
    $(document).on('click', '.back-to-color', function() {
        self.showColorSelection();
    });
    
    $(document).on('click', '.back-to-difficulty', function() {
        self.showDifficultySelection();
    });
    
    // 开始游戏
    $(document).on('click', '#start-game', function(e) {
        console.log('开始游戏按钮被点击');
        e.preventDefault();
        e.stopPropagation();
        
        // 添加视觉反馈
        $(this).addClass('ui-btn-active');
        setTimeout(() => {
            $(this).removeClass('ui-btn-active');
        }, 200);
        
        try {
            console.log('准备调用startGame方法');
            self.startGame();
        } catch (error) {
            console.error('开始游戏时发生错误:', error);
            alert('开始游戏时发生错误: ' + error.message);
        }
    });
};

GameSelection.prototype.showModeSelection = function() {
    this.currentStep = 'mode';
    $.mobile.changePage('#mode-selection');
    this.clearSelections();
};

GameSelection.prototype.showCharacterSelection = function() {
    this.currentStep = 'character';
    var title = this.characterSelectionCount === 0 ? '选择你的角色' : '选择对手角色';
    $('#character-selection-title').text(title);
    $.mobile.changePage('#character-selection');
    this.clearCharacterSelection();
};

GameSelection.prototype.showColorSelection = function() {
    this.currentStep = 'color';
    $.mobile.changePage('#color-selection');
    this.clearColorSelection();
};

GameSelection.prototype.showDifficultySelection = function() {
    this.currentStep = 'difficulty';
    $.mobile.changePage('#difficulty-selection');
    this.clearDifficultySelection();
};

GameSelection.prototype.showGameConfirm = function() {
    this.currentStep = 'confirm';
    this.updateGameSummary();
    $.mobile.changePage('#game-confirm');
};

GameSelection.prototype.selectMode = function(mode) {
    console.log('选择模式:', mode);
    $('.mode-option').removeClass('selected');
    $('.mode-option[data-mode="' + mode + '"]').addClass('selected');
    this.gameData.mode = mode;
    
    // 直接进入下一个页面
    setTimeout(() => {
        this.characterSelectionCount = 0;
        this.showCharacterSelection();
    }, 100);
};

GameSelection.prototype.selectCharacter = function(character) {
    console.log('选择角色:', character);
    $('.character-option').removeClass('selected');
    $('.character-option[data-character="' + character + '"]').addClass('selected');
    $('#confirm-character').prop('disabled', false);
    console.log('确认按钮状态:', $('#confirm-character').prop('disabled'));
    
    // 直接进入下一个页面，不需要点击确认按钮
    setTimeout(() => {
        this.confirmCharacter();
    }, 100);
};

GameSelection.prototype.selectColor = function(color) {
    console.log('选择颜色:', color);
    $('.color-option').removeClass('selected');
    $('.color-option[data-color="' + color + '"]').addClass('selected');
    $('#confirm-color').prop('disabled', false);
    
    // 直接进入下一个页面
    setTimeout(() => {
        this.confirmColor();
    }, 100);
};

GameSelection.prototype.selectDifficulty = function(difficulty) {
    console.log('选择难度:', difficulty);
    $('.difficulty-option').removeClass('selected');
    $('.difficulty-option[data-difficulty="' + difficulty + '"]').addClass('selected');
    $('#confirm-difficulty').prop('disabled', false);
    
    // 直接进入下一个页面
    setTimeout(() => {
        this.confirmDifficulty();
    }, 100);
};

GameSelection.prototype.confirmCharacter = function() {
    console.log('确认角色选择');
    var selectedCharacter = $('.character-option.selected').data('character');
    console.log('选中的角色:', selectedCharacter);
    console.log('当前选择计数:', this.characterSelectionCount);
    console.log('游戏模式:', this.gameData.mode);
    
    if (this.characterSelectionCount === 0) {
        this.gameData.player1Character = selectedCharacter;
        this.characterSelectionCount++;
        
        if (this.gameData.mode === 'single') {
            // 单人模式，AI随机选择角色
            var availableCharacters = ['zhang', 'ziqi', 'taizi', 'wang'];
            var aiCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
            this.gameData.player2Character = aiCharacter;
            console.log('AI选择角色:', aiCharacter);
            this.showColorSelection();
        } else {
            // 双人模式，继续选择第二个角色
            console.log('双人模式，继续选择第二个角色');
            this.showCharacterSelection();
        }
    } else {
        this.gameData.player2Character = selectedCharacter;
        console.log('第二个角色选择:', selectedCharacter);
        this.showColorSelection();
    }
};

GameSelection.prototype.confirmColor = function() {
    var selectedColor = $('.color-option.selected').data('color');
    this.gameData.color = selectedColor;
    
    if (this.gameData.mode === 'single') {
        this.showDifficultySelection();
    } else {
        this.showGameConfirm();
    }
};

GameSelection.prototype.confirmDifficulty = function() {
    var selectedDifficulty = $('.difficulty-option.selected').data('difficulty');
    this.gameData.difficulty = selectedDifficulty;
    this.showGameConfirm();
};

GameSelection.prototype.updateGameSummary = function() {
    // 更新游戏设置摘要
    $('#summary-mode').text(this.gameData.mode === 'single' ? '单人模式' : '双人模式');
    
    var character1 = CHARACTERS[this.gameData.player1Character];
    $('#summary-player1').text(character1.name + ' ' + character1.emoji);
    
    if (this.gameData.mode === 'multi') {
        var character2 = CHARACTERS[this.gameData.player2Character];
        $('#summary-player2').text(character2.name + ' ' + character2.emoji);
        $('#summary-player2-container').show();
    } else {
        $('#summary-player2-container').hide();
    }
    
    $('#summary-color').text(this.gameData.color === 'black' ? '黑子先行' : '白子后行');
    
    if (this.gameData.mode === 'single') {
        var difficultyText = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        $('#summary-difficulty').text(difficultyText[this.gameData.difficulty]);
        $('#summary-difficulty-container').show();
    } else {
        $('#summary-difficulty-container').hide();
    }
};

GameSelection.prototype.startGame = function() {
    console.log('=== 开始游戏方法被调用 ===');
    console.log('游戏数据:', this.gameData);
    console.log('CHARACTERS对象:', typeof CHARACTERS);
    console.log('game对象:', typeof game);
    console.log('window.game对象:', typeof window.game);
    
    // 检查必要对象是否存在
    if (typeof CHARACTERS === 'undefined') {
        console.error('CHARACTERS对象未定义');
        alert('CHARACTERS对象未定义，请检查Character.js是否正确加载');
        return;
    }
    
    if (typeof window.game === 'undefined') {
        console.error('game对象未定义');
        alert('game对象未定义，请检查Game.js是否正确加载');
        return;
    }
    
    // 根据设置创建游戏
    var player1Character = CHARACTERS[this.gameData.player1Character];
    var player2Character = CHARACTERS[this.gameData.player2Character];
    
    console.log('玩家1角色:', player1Character);
    console.log('玩家2角色:', player2Character);
    
    if (this.gameData.mode === 'single') {
        // 单人模式
        var humanColor = this.gameData.color;
        var aiColor = humanColor === 'black' ? 'white' : 'black';
        
        console.log('单人模式 - 人类颜色:', humanColor, 'AI颜色:', aiColor);
        
        var humanPlayer = new HumanPlayer(humanColor, player1Character);
        var aiPlayer = new AIPlayer(this.gameData.difficulty, aiColor, player2Character);
        
        if (humanColor === 'black') {
            window.game.init(humanPlayer, aiPlayer);
        } else {
            window.game.init(aiPlayer, humanPlayer);
        }
    } else {
        // 双人模式
        console.log('双人模式');
        var player1 = new HumanPlayer('black', player1Character);
        var player2 = new HumanPlayer('white', player2Character);
        window.game.init(player1, player2);
    }
    
    console.log('游戏初始化完成，跳转到游戏页面');
    // 开始游戏
    try {
        console.log('尝试跳转到游戏页面');
        $.mobile.changePage('#game-page');
        console.log('页面跳转完成，开始游戏');
        window.game.start();
        console.log('游戏启动完成');
    } catch (error) {
        console.error('游戏启动过程中发生错误:', error);
        alert('游戏启动失败: ' + error.message);
    }
};

GameSelection.prototype.clearSelections = function() {
    $('.mode-option').removeClass('selected');
    $('.character-option').removeClass('selected');
    $('.color-option').removeClass('selected');
    $('.difficulty-option').removeClass('selected');
    
    $('#confirm-character').prop('disabled', true);
    $('#confirm-color').prop('disabled', true);
    $('#confirm-difficulty').prop('disabled', true);
};

GameSelection.prototype.clearCharacterSelection = function() {
    $('.character-option').removeClass('selected');
    $('#confirm-character').prop('disabled', true);
};

GameSelection.prototype.clearColorSelection = function() {
    $('.color-option').removeClass('selected');
    $('#confirm-color').prop('disabled', true);
};

GameSelection.prototype.clearDifficultySelection = function() {
    $('.difficulty-option').removeClass('selected');
    $('#confirm-difficulty').prop('disabled', true);
};

// 导出到全局
window.GameSelection = GameSelection;
