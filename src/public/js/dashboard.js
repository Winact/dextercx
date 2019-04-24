$('#myTab a').on('click', function (e) {
    e.preventDefault()
    $(this).tab('show')
});

function download() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`{
"DestinationType": "ImageUploader",
"RequestMethod": "POST",
"RequestURL": "https://dexter.cx/api/upload",
"Headers": {
    "authorization": "${variables.token}"
},
"Body": "MultipartFormData",
"FileFormName": "file",
"URL": "$json:url$",
"ThumbnailURL": "$json:url$",
"DeletionURL": "$json:delete_url$"
}`));
    element.setAttribute('download', 'dextercx.sxcu');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

window.onload = function () {
    var socket = io.connect(variables.websocketUrl);

    socket.on('connect', function () {
        socket.emit('authentication', { token: variables.token });
        socket.on('authenticated', (authData) => { });

        socket.on('imageUploads', (data) => {
            var alerts = document.getElementById('alerts');
            alerts.innerHTML = `
                <div class="alert alert-dark" role="alert">
                    Image <strong><a href="${data.url}">${data.id}</a></strong> was just uploaded.
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `
        });
    });
}