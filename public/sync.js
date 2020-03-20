$(document).ready(() => {
    const IP = "localhost";
    const PORT = 443;

    const timeTolerance = 300 / 1000;
    const syncDelay = 500;

    let fileDiv = $("#choose-file");
    let videoDiv = $("#video-player");
    videoDiv.hide();
    let player = $("#my-video")[0];
    let socket = io(`${IP}:${PORT}`);

    let syncSetup = code => {
        socket.on("debug", msg => {
            console.log(`DEBUG: ${msg}`);
        });

        socket.on("die", () => {
            alert("El creador de la sala se ha desconectado");
            location.reload();
        });

        socket.on("sync", room => {
            console.log(room);
            if (room.paused && !player.paused) {
                player.pause();
            }
            if (!room.paused && player.paused) {
                player.play();
            }
            if (Math.abs(room.time - player.currentTime) > timeTolerance) {
                player.currentTime = room.time;
            }
        });

        socket.emit("join", code);

        setInterval(() => {
            socket.emit("sync", {
                code: code,
                time: player.currentTime,
                paused: player.paused
            });
        }, syncDelay);
    };

    $("#file-form").submit(event => {
        event.preventDefault();
        let file = $("#file-input").prop("files")[0];
        let code = $("#code-input").val();
        player.src = URL.createObjectURL(file);
        fileDiv.hide();
        videoDiv.fadeIn(500);
        setTimeout(() => {
            syncSetup(code);
        }, 500);
    });
});