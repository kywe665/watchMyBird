(function () {
    var feedOverride = '665Override';
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
})();