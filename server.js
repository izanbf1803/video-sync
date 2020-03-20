let app = require("express")();
let http = require("http").createServer(app);
let io = require("socket.io")(http);

const PORT = 443;
const DEBUG = true;

let rooms = {};
let socket_room = {};

io.on("connection", socket => {
	if (DEBUG) console.log(`${socket.id} connected`);

	socket.on("disconnect", () => {
		if (DEBUG) console.log(`${socket.id} disconnected`);
		let code = socket_room[socket.id];
		if (rooms.hasOwnProperty(code)) {
			let room = rooms[code];
			if (room.creator == socket.id) {
				io.to(code).emit("die");
				delete rooms[code];
			}
		}
		delete socket_room[socket.id];
	});

	socket.on("join", code => {
		socket_room[socket.id] = code;
		socket.join(code);
		if (DEBUG) console.log(`${socket.id} joined ${code}`);
		if (DEBUG) io.to(code).emit("debug", `${socket.id} joined ${code}`);

		if (!rooms.hasOwnProperty(code)) {
			rooms[code] = {};
			let room = rooms[code];
			room.time = 0;
			room.paused = true;
			room.creator = socket.id;
			room.code = code;
		}

		if (DEBUG) console.log(rooms[code]);
	});

	socket.on("sync", data => {
		let code = data.code;
		if (rooms.hasOwnProperty(code)) {
			let room = rooms[code];
			if (socket.id == room.creator) {
				room.time = data.time;
				room.paused = data.paused;
			}
			else {
				socket.emit("sync", room);
			}
		}
	});
});

http.listen(PORT, () => {
	console.log("listening on *:" + PORT);
});