// 技能系统
function SkillsSystem(game) {
    this.game = game;
    this.skills = {
        block: {
            name: '阻挡',
            description: '阻挡对手的一次落子',
            cooldown: 3,
            uses: 3,
            cost: 1
        },
        double: {
            name: '双连',
            description: '连续落子两次',
            cooldown: 5,
            uses: 2,
            cost: 2
        },
        remove: {
            name: '移除',
            description: '移除对手的一颗棋子',
            cooldown: 4,
            uses: 2,
            cost: 1
        }
    };
    
    this.currentPlayer = null;
    this.skillMode = false;
    this.selectedSkill = null;
    this.skillTarget = null;
    
    this.init();
}

SkillsSystem.prototype.init = function() {
    this.bindEvents();
    this.updateSkillDisplay();
};

SkillsSystem.prototype.bindEvents = function() {
    var self = this;
    
    // 技能按钮点击事件
    $('.skill-btn').on('click', function() {
        var skillName = $(this).data('skill');
        self.useSkill(skillName);
    });
    
    // 棋盘点击事件（用于技能目标选择）
    $('.go-board').on('click', '.go-place', function() {
        if (self.skillMode && self.selectedSkill) {
            var $place = $(this);
            var r = $place.data('row');
            var c = $place.data('col');
            self.selectSkillTarget(r, c);
        }
    });
};

SkillsSystem.prototype.setCurrentPlayer = function(player) {
    this.currentPlayer = player;
    this.updateSkillDisplay();
};

SkillsSystem.prototype.useSkill = function(skillName) {
    if (!this.currentPlayer || this.skillMode) return;
    
    var skill = this.skills[skillName];
    if (!skill || skill.uses <= 0) return;
    
    this.selectedSkill = skillName;
    this.skillMode = true;
    
    // 根据技能类型设置不同的模式
    switch(skillName) {
        case 'block':
            this.setBlockMode();
            break;
        case 'double':
            this.setDoubleMode();
            break;
        case 'remove':
            this.setRemoveMode();
            break;
    }
    
    this.updateSkillDisplay();
};

SkillsSystem.prototype.setBlockMode = function() {
    gameInfo.setText('选择要阻挡的位置');
    $('.go-board').addClass('skill-target-mode');
};

SkillsSystem.prototype.setDoubleMode = function() {
    gameInfo.setText('双连模式：连续落子两次');
    // 双连技能不需要选择目标，直接激活
    this.activateDoubleSkill();
};

SkillsSystem.prototype.setRemoveMode = function() {
    gameInfo.setText('选择要移除的对手棋子');
    $('.go-board').addClass('skill-target-mode');
};

SkillsSystem.prototype.selectSkillTarget = function(r, c) {
    if (!this.skillMode || !this.selectedSkill) return;
    
    var skill = this.skills[this.selectedSkill];
    
    switch(this.selectedSkill) {
        case 'block':
            this.activateBlockSkill(r, c);
            break;
        case 'remove':
            this.activateRemoveSkill(r, c);
            break;
    }
    
    this.skillMode = false;
    this.selectedSkill = null;
    $('.go-board').removeClass('skill-target-mode');
    this.updateSkillDisplay();
};

SkillsSystem.prototype.activateBlockSkill = function(r, c) {
    // 阻挡技能：在指定位置放置一个阻挡标记
    var $place = $('.go-board .go-place').eq(r * 15 + c);
    $place.addClass('blocked');
    $place.find('.go').addClass('blocked-marker');
    
    // 减少技能使用次数
    this.skills.block.uses--;
    
    // 显示技能效果
    this.showSkillEffect('阻挡技能已激活！');
    
    // 更新游戏状态
    this.game.board.blockPosition(r, c);
    
    // 恢复正常游戏状态
    gameInfo.setText('阻挡技能已激活！');
};

SkillsSystem.prototype.activateDoubleSkill = function() {
    // 双连技能：允许连续落子两次
    this.game.enableDoubleMove = true;
    this.game.doubleMoveCount = 2;
    
    // 减少技能使用次数
    this.skills.double.uses--;
    
    // 显示技能效果
    this.showSkillEffect('双连技能已激活！');
    
    gameInfo.setText('双连模式：剩余 ' + this.game.doubleMoveCount + ' 次落子');
};

SkillsSystem.prototype.activateRemoveSkill = function(r, c) {
    // 移除技能：移除对手的棋子
    if (this.game.board.isSet(r, c) && this.game.board.getColor(r, c) !== this.currentPlayer.color) {
        this.game.board.unsetGo(r, c);
        
        // 减少技能使用次数
        this.skills.remove.uses--;
        
        // 显示技能效果
        this.showSkillEffect('移除技能已激活！');
    } else {
        gameInfo.setText('请选择对手的棋子！');
        return;
    }
};

SkillsSystem.prototype.showSkillEffect = function(message) {
    // 创建技能效果提示
    var $effect = $('<div class="skill-effect-message">' + message + '</div>');
    $('body').append($effect);
    
    setTimeout(function() {
        $effect.fadeOut(500, function() {
            $effect.remove();
        });
    }, 2000);
};

SkillsSystem.prototype.updateSkillDisplay = function() {
    var self = this;
    
    // 更新技能按钮状态
    $('.skill-btn').each(function() {
        var skillName = $(this).data('skill');
        var skill = self.skills[skillName];
        
        if (skill.uses <= 0) {
            $(this).prop('disabled', true).addClass('disabled');
        } else {
            $(this).prop('disabled', false).removeClass('disabled');
        }
    });
    
    // 更新技能信息显示
    var totalUses = Object.values(self.skills).reduce((sum, skill) => sum + skill.uses, 0);
    $('#skill-uses').text('剩余次数: ' + totalUses);
    
    // 更新冷却时间显示
    var cooldown = Object.values(self.skills).reduce((max, skill) => Math.max(max, skill.cooldown), 0);
    $('#skill-cooldown').text('冷却时间: ' + cooldown);
};

SkillsSystem.prototype.resetSkills = function() {
    // 重置所有技能
    Object.keys(this.skills).forEach(skillName => {
        this.skills[skillName].uses = this.skills[skillName].cost;
    });
    
    this.skillMode = false;
    this.selectedSkill = null;
    $('.go-board').removeClass('skill-target-mode');
    this.updateSkillDisplay();
};

// 技能效果提示样式
$('<style>')
    .prop('type', 'text/css')
    .html(`
        .skill-effect-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: skillEffect 0.5s ease-in-out;
        }
        
        .blocked-marker {
            background: #ff6b6b !important;
            border: 2px solid #ff4757 !important;
        }
        
        .skill-target-mode .go-place:not(.set) {
            cursor: crosshair;
        }
        
        .skill-target-mode .go-place:not(.set):hover .go {
            background: #ff6b6b !important;
            opacity: 0.7;
        }
    `)
    .appendTo('head');
