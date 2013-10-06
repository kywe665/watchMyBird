(function () {
    $(document).ready(function () {
        $('.js-feed').on('click', function () {
            var code = $('#feedCode').val();
            console.log(code);
            decode = parseInt(code, 19);
            $.get("http://67.170.74.247:6547/feedTheBird?feedCode=" + decode + "&now=" + Date.now(), function (data, status) {
                console.log(status);
                console.log(data);
            });
        });
        $('#feedCode').on('keypress', function (evt) {
            console.log('key');
            var keycode = evt.keyCode || evt.which;
            if (keycode === 75 && evt.shiftKey) {
                $('#feedCode').val(Date.now().toString(19));
            }
        });
    });
})();