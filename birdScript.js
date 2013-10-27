(function () {
    var feedOverride = '665Override';
    var isOpera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome;                          // Chrome 1+
    var isIE = /*@cc_on!@*/false;                            // At least IE6
    $(document).ready(function () {
        $('.js-feed').on('click', function () {
            feedRequest();
        });
        $('.js-slowStream').on('click', function () {
            $('.browser-warning#incompatible').addClass('css-hidden');
        });
        $('#feedCode').on('keyup', function (evt) {
            var keycode = evt.keyCode || evt.which;
            if (keycode == 13) {
                feedRequest();
            }
            if (keycode === 75 && evt.shiftKey) {
                $('#feedCode').val(Date.now().toString(19));
            }
            if (feedOverride.indexOf($(this).val()) != -1) {
                $(this).attr('type', 'password');
            } else {
                $(this).attr('type', 'text');
            }
        });
        $('#stream').attr('src', 'http://67.170.74.247:6548/video.cgi').load(function () {
            //stream working
        }).error(function (e) {
            console.log(JSON.stringify(e));
            if (!isChrome && !isFirefox) {
                $('.browser-warning#incompatible').removeClass('css-hidden');
                canvasBackup();
                if (isSafari) {
                    bashApple();
                }
            }
        });
    });
    function feedRequest() {
        var code = $('#feedCode').val();
        uiSendFeed();
        if (code != feedOverride) {
            decode = parseInt(code, 19);
        } else {
            decode = Date.now();
        }
        $.ajax({
            url: "http://67.170.74.247:6547/feedTheBird?feedCode=" + decode + "&now=" + Date.now(),
            type: 'GET',
            success: function (data) {
                console.log('success');
                console.log(data);
                $('#feed-loader').addClass('css-hidden');
                //TODO check response for incorrect code.
                //incorrectCode(true);
            },
            error: function (e) {
                console.log('error');
                console.log(e);
                $('#feed-loader').addClass('css-hidden');
                disconnectedMsg(true);
            }
        });
    }
    function uiSendFeed() {
        $('#feed-loader').removeClass('css-hidden');
        disconnectedMsg(false);
        incorrectCode(false);
    }
    function canvasBackup() {
        //If the browser cannot stream mjpg, use canvas.
        $('#canvasBackup').removeClass("css-hidden");
        $('#stream').addClass("css-hidden");
        var ctx = document.getElementById('canvasBackup').getContext('2d');
        var img = new Image();
        var count = 0;
        var errorCount = 0;
        img.onload = function () {
            console.log('draw');
            console.log(img.height);
            ctx.drawImage(img, 0, 0, 534, 400);
            count++;
            loadNext(img, count);
        };
        img.onerror = function (message, source, line) {
            console.log('error' + errorCount);
            errorCount++;
            loadNext(img, count);
        };
        img.onabort = function () {
            console.log('abort');
        };
        console.log('first');
        img.src = "http://kywe665.com/feedMyBird/birdStatus1.jpg";
    }
    function loadNext(img, count) {
        setTimeout(function () {
            console.log('loadNext');
            qparam = ranNum() + "=" + ranNum() + "&" + ranNum();
            img.src = "http://kywe665.com/feedMyBird/birdStatus" + (count % 3 + 1) + ".jpg?" + qparam;
        }, 300);
    }
    function ranNum() {
        return Math.round(Math.exp(Math.random() * Math.log(100000 - 0 + 1))) + 0;
    }
    function bashApple() {
        var msg = ''
          , deviceType = 'device'
        ;
        $('#incompatible .warning-container').append('<img class="warning-logo" src="http://kywe665.com/feedMyBird/appleWhite.png"/>');
        if (navigator.userAgent.match(/iPhone/i)) {
            deviceType = 'iPhone'; 
        }
        else if (navigator.userAgent.match(/iPad/i)) {
            deviceType = 'iPad';
        }
        else if (navigator.userAgent.match(/iPod/i)) {
            deviceType = 'iPod';
        }
        else if (screen.width > 480) {
            deviceType = 'browser';
        }
        msg = 'Your ' + deviceType + ' does not support some of the latest technology standards. Apple <a href="https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-dev/vYGxPx-tVKE" target="_blank">even prevents</a> the iOS Chrome app from supporting the required technology.';
        $('#incompatible .warning-message').html(msg);
    }
    function disconnectedMsg(show) {
        if (show) {
            $('#feed-disconnected').removeClass('css-hidden');
            $('#feedCode').addClass('feed-failed');
        }
        else {
            $('#feed-disconnected').addClass('css-hidden');
            $('#feedCode').removeClass('feed-failed');
        }
    }
    function incorrectCode(show) {
        if (show) {
            $('#incorrect-code').removeClass('css-hidden');
            $('#feedCode').addClass('feed-failed');
        }
        else {
            $('#incorrect-code').addClass('css-hidden');
            $('#feedCode').removeClass('feed-failed');
        }
    }
})();