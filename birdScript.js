(function () {
    var myArray = [86, 106];
    var feedOverride = '';
    var isOpera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome;                          // Chrome 1+
    var isIE = /*@cc_on!@*/false;                            // At least IE6
    myArray.forEach(function (n) { feedOverride += n.toString(11) });
    feedOverride = parseInt(feedOverride).toString(36);
    console.log(feedOverride);
    $(document).ready(function () {
        $('.js-feed').on('click', function () {
            feedRequest();
        });
        $('.js-slowStream').on('click', function () {
            $('.browser-warning#incompatible').addClass('css-hidden');
        });
        $('#feedCode').on('keyup', function (evt) {
            var foo = evt.keyCode || evt.which;
            if (foo == 13) {
                feedRequest();
            }
            if ($('#feedCode').attr('data-code') == 665) {
                if (foo === (myArray[0] - 11) && evt.shiftKey) {
                    $('#feedCode').val(Date.now().toString(19));
                }
            }
            if (feedOverride.indexOf($(this).val()) != -1 || 'override'.indexOf($(this).val()) != -1) {
                $(this).attr('type', 'password');
            } else {
                $(this).attr('type', 'text');
            }
        });
        loadStream(0);
    });
    function loadStream(tryCount) {
        var timeWait = 10 * 1000; //10 sec
        if (tryCount > 0) { timeWait = 20 * 1000; }
        var loaded = setTimeout(function () {
            errorHandle(true, tryCount, loaded);
        }, timeWait);
        $('#stream').attr('src', 'http://goo.gl/sIGOkW').load(function () {
            //stream working
            clearTimeout(loaded);
        }).error(function (e) {
            console.log(JSON.stringify(e));
            errorHandle(false, tryCount, loaded);
        });
    }
    function errorHandle(timeout, tryCount, errorTimer) {
        if (!isChrome && !isFirefox) {
            $('.browser-warning#incompatible').removeClass('css-hidden');
            canvasBackup(errorTimer);
            if (isSafari) {
                bashApple();
            }
        }
        else {
            if (timeout && tryCount < 2) {
                loadStream(tryCount + 1);
            }
            else {
                $('.browser-warning#incompatible').removeClass('css-hidden');
                canvasBackup(errorTimer);
            }
        }
    }
    function feedRequest() {
        var code = $('#feedCode').val();
        uiSendFeed();
        if (code == feedOverride) {
            $('#feedCode').attr('data-code', feedOverride);
        }
        if (code === 'override' && $('#feedCode').attr('data-code') == feedOverride) {
            decode = Date.now();
        } else {
            decode = parseInt(code, 19);
        }
        $.ajax({
            url: "http://kywe665.dlinkddns.com:6547/feedTheBird?feedCode=" + decode + "&now=" + Date.now(),
            type: 'GET',
            success: function (data) {
                $('#feed-loader').addClass('css-hidden');
                feedResponse(data);
            },
            error: function (e) {
                console.log('error');
                console.log(e);
                $('#feed-loader').addClass('css-hidden');
                showMessage('feed-disconnected', true);
            }
        });
    }
    function feedResponse(data) {
        if (data.response == 200) {
            if (data.code == false) {
                showMessage('incorrect-code', true);
            }
            else if (data.fed == true) {
                showMessage('feed-success', true);
            }
            else {
                showMessage('something-bad', true);
            }
        }
        else {
            showMessage('bad-request', true);
        }
    }
    function uiSendFeed() {
        $('#feed-loader').removeClass('css-hidden');
        showMessage('feed-disconnected', false);
        showMessage('incorrect-code', false);
        showMessage('something-bad', false);
        showMessage('feed-success', false);
        showMessage('bad-request', false);
    }
    function canvasBackup(errorTimer) {
        //If the browser cannot stream mjpg, use canvas.
        clearTimeout(errorTimer);
        $('#canvasBackup').removeClass("css-hidden");
        $('#stream').addClass("css-hidden");
        var ctx = document.getElementById('canvasBackup').getContext('2d');
        var img = new Image();
        var count = 0;
        var errorCount = 0;
        img.onload = function () {
            console.log('draw');
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
        msg = 'This browser on your ' + deviceType + ' does not support some of the latest standards. Apple <a href="https://groups.google.com/a/chromium.org/forum/?fromgroups#!topic/chromium-dev/vYGxPx-tVKE" target="_blank">prevents the iOS Chrome app</a> from supporting the required technology and you must use Safari.';
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
    function showMessage(id, show) {
        if (show) {
            $('#' + id).removeClass('css-hidden');
            $('#feedCode').addClass('feed-failed');
        }
        else {
            $('#' + id).addClass('css-hidden');
            $('#feedCode').removeClass('feed-failed');
            $('#feedCode').removeClass('feed-success');
        }
        if (id === 'feed-success') {
            $('#feedCode').removeClass('feed-failed');
            $('#feedCode').addClass('feed-success');
        }
    }
})();