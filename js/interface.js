$(document).ready(function(){
    window.game = new Game($(".go-board"), $(".board tbody"));

    var adjustSize = adjustSizeGen();

    $(window).resize(adjustSize);

    adjustSize();
    $.mobile.defaultDialogTransition = 'flow';
    $.mobile.defaultPageTransition = 'flow';
    
    $('.back-to-game').on('tap',function(){
        $.mobile.changePage('#game-page');
    });

    $("#undo-button").on('tap', function(){
			// 显示临时GIF（飞沙走石按钮 -> 显示 飞沙走石.gif）
			showTempGif('images/飞沙走石.gif');
        game.undo();
    });

		$("#restart-button").on('tap', function(){
			// 显示临时GIF（力拔山兮按钮 -> 显示 力拔山兮.gif）
			showTempGif('images/力拔山兮.gif');
			if (typeof game.restart === 'function') {
				game.restart();
			} else {
				// 回落到模式选择，保持可用性
				$.mobile.changePage('#mode-selection');
			}
		});

		function showTempGif(src){
			var $overlay = $('<div class="temp-gif-overlay"></div>');
			var $img = $('<img class="temp-gif-image" />').attr('src', src);
			$overlay.append($img);
			$('body').append($overlay);
			setTimeout(function(){
				$overlay.fadeOut(300, function(){
					$overlay.remove();
				});
			}, 2000);
		}
    
    $('.fullscreen-wrapper').on('tap', function(){
        $(this).hide();
        $.mobile.changePage('#game-won');
    });
    
    // 初始化所有对话框
    $('#mode-selection').page();
    $('#character-selection').page();
    $('#color-selection').page();
    $('#difficulty-selection').page();
    $('#game-confirm').page();
    $('#game-won').page();
    
    $('.back-to-game').button('disable');
    
    // 初始化游戏选择系统（在所有对话框初始化后）
    var gameSelection = new GameSelection();

    window.gameInfo = (function(){
        var blinking = false,
            text = "",
            color = "";

        var self = {};

        self.getBlinking = function(){
            return blinking;
        };

        var mainObj = $("#game-info");
        self.setBlinking = function(val){
            if(val !== blinking){
                blinking = val;
                if(val){
                    mainObj.addClass("blinking");
                }else{
                    mainObj.removeClass("blinking");
                }
            }
        };

        self.getText = function(){
            return text;
        };

        var textObj = $("#game-info>.cont");
        self.setText = function(val){
            text = val;
            textObj.html(val);
        };

        self.getColor = function(){
            return color;
        };

        var colorObj = $("#game-info>.go");
        self.setColor = function(color){
            colorObj.removeClass("white").removeClass("black");
            if(color){
                colorObj.addClass(color);
            }
        };

        return self;
    })();
});

function showWinDialog(game){
    gameInfo.setBlinking(false);
    if(game.mode === 'hvh'){
        var who = game.getCurrentPlayer().color === 'black' ? '黑子' : '白子';
        $("#game-won h4").html(who + '获胜！');
        gameInfo.value = who + '获胜了';
        $("#win-content").html(who + '赢得了游戏！再来一局吗？');
        $('#happy-outer').fadeIn(500);
    }else{
        if(game.getCurrentPlayer() instanceof HumanPlayer){
            $("#game-won h4").html('你赢了！');
            $("#win-content").html('太棒了！你赢得了游戏。还能再赢一次吗？');
            gameInfo.value = '你赢了';
            $('#sad-outer').fadeIn(800);
        }else{
            $("#game-won h4").html('你输了');
            $("#win-content").html("哎呀！不能让AI统治世界。再试一次？");
            gameInfo.value = 'AI赢了';
            $('#happy-outer').fadeIn(800);
        }
    }
}