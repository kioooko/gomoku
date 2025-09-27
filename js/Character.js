// 角色系统
function Character(name, hp, skills, description) {
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.skills = skills;
    this.description = description;
    this.emoji = this.getEmoji();
}

Character.prototype.getEmoji = function() {
    const emojiMap = {
        '张技能五': '⚔️',
        '子棋': '🎯',
        '太子': '🤴',
        '王教练': '👨‍🏫'
    };
    return emojiMap[this.name] || '🎮';
};

Character.prototype.takeDamage = function(damage) {
    this.hp = Math.max(0, this.hp - damage);
    return this.hp <= 0;
};

Character.prototype.heal = function(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
};

Character.prototype.isAlive = function() {
    return this.hp > 0;
};

Character.prototype.reset = function() {
    this.hp = this.maxHp;
};

// 预定义角色
const CHARACTERS = {
    'zhang': new Character('张技能五', 5, [
        '飞沙走石', '拾金不昧', '力拔山兮', '东山再起', 
        '静如止水', '水滴石穿', '调程离山', '保洁上门'
    ], '技能大师，拥有最全面的技能组合'),
    
    'ziqi': new Character('子棋', 6, [
        '飞沙走石', '拾金不昧', '力拔山兮', '东山再起', 
        '静如止水', '水滴石穿', '调程离山'
    ], '平衡型角色，生命值较高'),
    
    'taizi': new Character('太子', 3, [
        '飞沙走石', '拾金不昧', '力拔山兮', '东山再起', 
        '静如止水', '水滴石穿', '擒拿', '棋圣之道'
    ], '高技能角色，但生命值较低，容易被调程离山克制'),
    
    'wang': new Character('王教练·王金宝', 1, [
        '手刀'
    ], '极端角色，只有1点生命值但拥有最强技能')
};

// 技能定义
const SKILLS = {
    // 直接胜利类
    '手刀': {
        name: '手刀',
        type: 'direct_win',
        description: '直接使对方彻底丧失战斗力 → 直接获胜',
        priority: 1,
        counter: null
    },
    '两级反转': {
        name: '两级反转',
        type: 'direct_win',
        description: '攻击对方"黑历史"，直接使其丧失战斗力',
        priority: 1,
        counter: null
    },
    '力拔山兮': {
        name: '力拔山兮',
        type: 'direct_win',
        description: '摔坏棋盘 → 直接获胜',
        priority: 2,
        counter: '东山再起'
    },
    '东山再起': {
        name: '东山再起',
        type: 'counter',
        description: '抵消"力拔山兮"，棋局继续',
        priority: 2,
        counter: null
    },
    
    // 全禁技类
    '棋圣之道': {
        name: '棋圣之道',
        type: 'skill_block',
        description: '本回合双方技能全部无效',
        priority: 3,
        counter: null
    },
    
    // 禁棋类
    '静如止水': {
        name: '静如止水',
        type: 'move_block',
        description: '目标本回合不能下棋',
        priority: 4,
        counter: '水滴石穿'
    },
    '水滴石穿': {
        name: '水滴石穿',
        type: 'counter',
        description: '抵消"静如止水"',
        priority: 4,
        counter: null
    },
    
    // 冻结类
    '擒拿': {
        name: '擒拿',
        type: 'freeze',
        description: '使对方本回合判负（丧失战斗力）',
        priority: 5,
        counter: null
    },
    
    // 角色定向禁棋
    '调程离山': {
        name: '调程离山',
        type: 'role_block',
        description: '仅当对手是太子时，本回合禁其下棋',
        priority: 6,
        counter: null
    },
    
    // 移子类
    '飞沙走石': {
        name: '飞沙走石',
        type: 'remove_stone',
        description: '移除对方任意1子',
        priority: 7,
        counter: '拾金不昧'
    },
    '拾金不昧': {
        name: '拾金不昧',
        type: 'counter',
        description: '抵消"飞沙走石"',
        priority: 7,
        counter: null
    },
    
    // 清盘类
    '保洁上门': {
        name: '保洁上门',
        type: 'clear_board',
        description: '清除棋盘所有棋子，使棋局重新开始',
        priority: 8,
        counter: null
    }
};

// 技能优先级排序
const SKILL_PRIORITY = [
    '手刀', '两级反转',           // 优先级 1
    '力拔山兮', '东山再起',       // 优先级 2
    '棋圣之道',                   // 优先级 3
    '静如止水', '水滴石穿',       // 优先级 4
    '擒拿',                      // 优先级 5
    '调程离山',                  // 优先级 6
    '飞沙走石', '拾金不昧',       // 优先级 7
    '保洁上门'                   // 优先级 8
];

// 导出到全局
window.Character = Character;
window.CHARACTERS = CHARACTERS;
window.SKILLS = SKILLS;
window.SKILL_PRIORITY = SKILL_PRIORITY;
