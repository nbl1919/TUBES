const SerialPort = require('serialport'); //import package
const portNumber = process.argv[2]; // ambil argument ke 2 di command
console.log("Port on" + portNumber); // nampilin port Number
const port = new SerialPort(portNumber, 
	
	{ baudRate: 57600
}); // buat object serial port

//parser biar ga nampilin buffer
const parsers = SerialPort.parsers;
const parser = new parsers.Readline({
	delimiter :'\r\n'
});
var fs = require('fs'); //manage file.
port.pipe(parser); // using parser 

// event yang dipanggil ketika serial port kebuka. pake 'open'
port.on('open', ()=>{
	console.log("Connected on" + portNumber);
	let timeOut = 3000; // 3detik
	setTimeout(()=>{
		// kirim command 1 ke arduino
		port.write('1', (err)=>{
			if(err) 
				console.log(err); // munculin error
			else
				console.log("Yeyayy you're connecting now..."); // kalo ga error kasih notif
			
		});
	}, timeOut);
});


parser.on('data', (data)=>{
	console.log(data);
	let hasilParsing=parsingRAWData(data, ",");
	console.log(hasilParsing);
});

// // event yang munculin data dari arduino. pake 'data'
// parser.on('data', (data)=> {
// 	//let hasilParsing = parsingRAWData(data, ",");
// 	//console.log(hasilParsing);
// 	//console.log(data);
// });

// EXPREES DAN SOCKET IO
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');

app.use(express.static(path.join(__dirname,'nabb')));
const portlisten = 1900;
server.listen(portlisten);


//buat socket event
let jumlahClient = 0;
io.on('connection' , (socket)=>{
	jumlahClient++;
	console.log('New Client Connected...\n' + "Total :" + jumlahClient);

	parser.on('data', (data)=>{
		//panggil si parsing
		let hasilParsing = parsingRAWData(data, ",");
		if(hasilParsing[0]=="OK"){
			socket.emit('socketData', {datahasil : hasilParsing});
			//console.log("send to client");
		}

	});

	socket.on('disconnect', ()=>{
		jumlahClient--;
		console.log('Client disconnect \n' + 'Total :' + jumlahClient)
	});
	socket.on('savingData' , function parsingRAWData(data,delimiter){

        console.log('Save Log')
        logger.write(result + '\r\n\n'); //save log

      });
});

let result;
// FUNCTION UNTUK PARSING
// argument 1 : data yang diparsing ex: 123 434 5334
// argument 2 : pemisah
// return array data [0] =123 [1] =434 [2] =5334
function parsingRAWData(data,delimeter){
	
	result = data.toString().replace(/(\r\n|\n|\r)/gm, "").split(delimeter);

	return result;
}
var logger = fs.createWriteStream('data.txt' , {
  flags : 'a'
});