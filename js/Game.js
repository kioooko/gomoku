function Game(boardElm, boardBackgroundElm){
    this.mode = "hvh";
    this.rounds = 0;
    var white, black,
        playing = false,
        history = [],
        players = {},
        board = new Board(boardElm, boardBackgroundElm),
        currentColor = "black",
        skillSystem = null,
        enableDoubleMove = false,
        doubleMoveCount = 0;

    board.clicked = function(r, c){
        var p = players[currentColor];
        if(p instanceof HumanPlayer){
            p.setGo(r, c);
        }
    };

    this.getCurrentPlayer = function(){
        return players[currentColor];
    };

    this.setCurrentColor = function(color){
        currentColor = color;
    };

    this.toHuman = function(color){
        board.setClickable(true, color);
    };

    this.toOthers = function(){
        board.setClickable(false);
    };

    this.update = function(r, c, color){
        if(playing){
            this.rounds++;
            board.updateMap(r, c, color);
            black.watch(r, c, color);
            white.watch(r, c, color);
            setTimeout(progress, 0);
        }
    };

    function progress(){
        if(currentColor === 'black'){
            white.myTurn();
        }else{
            black.myTurn();
        }
    }

    this.setGo = function(r, c, color){
        if(!playing || board.isSet(r, c) || board.isBlocked(r, c))return false;
        history.push({
            r: r,
            c: c,
            color:color
        });
        board.highlight(r, c);
        board.setGo(r, c, color);

        var result = board.getGameResult(r, c, color);

        if(result === "draw"){
            this.draw();
        }else if(result === "win"){
            this.win();
            board.winChange(r, c, color);
        }else{
            this.update(r, c, color);
        }
        
        // 处理双连技能
        if (enableDoubleMove && doubleMoveCount > 0) {
            doubleMoveCount--;
            if (doubleMoveCount === 0) {
                enableDoubleMove = false;
                gameInfo.setText('双连技能结束');
            } else {
                gameInfo.setText('双连模式：剩余 ' + doubleMoveCount + ' 次落子');
            }
        }
        
        return true;
    };

    this.undo = function(){
        if(!playing){
            if(!history.length)return;
            var last = history.pop();
            board.unsetGo(last.r,last.c);
            white.watch(last.r,last.c,'remove');
            black.watch(last.r,last.c,'remove');
            return;
        }
        do{
            if(!history.length)return;
            var last = history.pop();
            board.unsetGo(last.r,last.c);
            white.watch(last.r,last.c,'remove');
            black.watch(last.r,last.c,'remove');
        }while(players[last.color] instanceof AIPlayer);
        var last = history[history.length - 1];
        if(history.length > 0) board.highlight(last.r, last.c);
        else board.unHighlight();
        players[last.color].other.myTurn();
        for(var col in {'black':'','white':''}){
            if(players[col] instanceof AIPlayer && players[col].computing){
                players[col].cancel++;
            }
        }
    };

    this.draw = function(){
        playing = false;
        board.setClickable(false);
    };

    this.win = function(){
        playing = false;
        board.setClickable(false);
        showWinDialog(this);
    };

    this.init = function(player1, player2){
        console.log(player1, player2);
        this.rounds = 0;
        history = [];
        board.init();
        players = {};
        players[player1.color] = player1;
        players[player2.color] = player2;
        white = players['white'];
        black = players['black'];
        white.game = this;
        black.game = this;
        white.other = black;
        black.other = white;
        
        // 为SkillSystem提供访问接口
        this.black = black;
        this.white = white;
        
        console.log('Game.init - 设置玩家对象');
        console.log('this.black:', this.black);
        console.log('this.white:', this.white);
        if(!(black instanceof HumanPlayer)){
            board.setWarning(0, true);
        }

        if(!(white instanceof HumanPlayer)){
            board.setWarning(1, true);
        }
        
        // 初始化技能系统 - 延迟到玩家对象完全设置后再初始化
        if (typeof SkillSystem !== 'undefined') {
            console.log('Game.init - 延迟初始化SkillSystem');
            setTimeout(() => {
                console.log('Game.init - 现在初始化SkillSystem');
                console.log('this.black:', this.black);
                console.log('this.white:', this.white);
                skillSystem = new SkillSystem(this);
            }, 100);
        }
    };

    this.start = function(){
        playing = true;
        
        // 重置角色生命值
        players.black.character.reset();
        players.white.character.reset();
        
        // 开始技能系统
        if (skillSystem) {
            skillSystem.setCurrentPlayer(players.black);
            skillSystem.startRound();
        } else {
            players.black.myTurn();
        }
    };
}