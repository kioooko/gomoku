// Agents that represent either a player or an AI
function Player(color, character){
    this.color = color;
    this.character = character || CHARACTERS.zhang; // 默认角色
    this.lastAction = null;
    this.blocked = false;
    this.frozen = false;
}

Player.prototype.myTurn = function(){
    this.game.setCurrentColor(this.color);
    var colorText = this.color === 'black' ? '黑子' : '白子';
    gameInfo.setText(colorText + '的回合');
    gameInfo.setColor(this.color);
    gameInfo.setBlinking(false);
    
    // 更新技能系统的当前玩家
    if (this.game.skillsSystem) {
        this.game.skillsSystem.setCurrentPlayer(this);
    }
};

Player.prototype.watch = function(){};

Player.prototype.setGo = function(r,c){
    return this.game.setGo(r, c, this.color);
};

function HumanPlayer(color, character){
    Player.call(this, color, character);
}

HumanPlayer.prototype = new Player();

HumanPlayer.prototype.myTurn = function(){
    Player.prototype.myTurn.call(this);
    this.game.toHuman(this.color);
    if(this.other instanceof AIPlayer){
        gameInfo.setText('你的回合');
    }
};

function AIPlayer(mode, color, character){
    Player.call(this, color, character);
    this.computing = false;
    this.cancel = 0;
    this.mode = mode;
    this.worker = new Worker('js/ai-worker.js');
    var self=this;
    this.worker.onmessage=function(e){
        switch(e.data.type){
            /*case 'error':
                console.log(e.data.message);
                break;*/
            case 'decision':
                self.computing=false;
                if(self.cancel>0){
                    self.cancel--;
                }else{
                    self.setGo(e.data.r,e.data.c);
                }
                break;
            case 'starting':
                self.computing=true;
                break;
            case 'alert':
                alert(e.data.msg);
                break;
            default:
                console.log(e.data);
        }
    };
    // 将easy难度映射到novice，因为AI worker不支持easy
    var aiMode = mode;
    if (mode === 'easy') {
        aiMode = 'novice';
    }
    
    this.worker.postMessage({
        type: 'ini',
        color: color,
        mode: aiMode
    });
}

AIPlayer.prototype = new Player();

AIPlayer.prototype.myTurn = function(){
    Player.prototype.myTurn.call(this);
    this.game.toOthers();
    gameInfo.setText("AI思考中...");
    gameInfo.setBlinking(true);
    this.move();
};

AIPlayer.prototype.watch = function(r, c, color){
    this.worker.postMessage({
        type: 'watch',
        r: r,
        c: c,
        color: color
    });
};

AIPlayer.prototype.move = function(){
    if(this.game.rounds === 0){
        this.setGo(7, 7);
    }else if(this.game.rounds === 1){
        var moves=[
            [6,6],
            [6,7],
            [6,8],
            [7,6],
            [7,7],
            [7,8],
            [8,6],
            [8,7],
            [8,8]
        ];
        while(true){
            var ind=Math.floor(Math.random()*moves.length);
            if(this.setGo(moves[ind][0], moves[ind][1])){
                return;
            }else{
                moves.splice(ind,1);
            }
        }
    }else{
        this.worker.postMessage({
            type: 'compute'
        });
    }
};

