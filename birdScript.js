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
        $('#stream').attr('src', 'http://bit.ly/1ccY67W').load(function () {
            //stream working
        }).error(function (e) {
            console.log(JSON.stringify(e));
            alert(JSON.stringify(e));
            if (!isChrome && !isFirefox) {
                canvasBackup();
            }
        });
    });
    function feedRequest() {
        var code = $('#feedCode').val();
        if (code != feedOverride) {
            decode = parseInt(code, 19);
        } else {
            decode = Date.now();
        }
        $.get("http://67.170.74.247:6547/feedTheBird?feedCode=" + decode + "&now=" + Date.now(), function (data, status) {
            console.log(status);
            console.log(data);
        });
    }
    function canvasBackup() {
        //If the browser cannot stream mjpg, use canvas.
        $('#canvasBackup').removeClass("css-hidden");
        $('#stream').addClass("css-hidden");
        var ctx = document.getElementById('canvasBackup').getContext('2d');
        var img = new Image();
        var count = 0;
        img.onload = function () {
            console.log('draw');
            //TODO FIX CANVAS SIZE
            ctx.drawImage(img, 0, 0, 534,400);
        };
        setInterval(function () {
            console.log('again');
            img.src = "http://kywe665.com/feedMyBird/birdStatus" + (count % 3 + 1) + ".jpg";
            count++;
        }, 450);
    }
})();