var express = require("express"),
http = require("http"),
app = express(),
server = http.createServer(app),
path = require('path'),
fs = require('fs');;

app.use(express.static(path.join(__dirname, 'public')));

app.set("views",__dirname + "/views");
app.configure(function(){
	app.use(express.static(__dirname));
});

app.get("/", function(req,res){
	//res.render("index.jade", {title : "Chat"});
  // para testar o de cima em index.jade deve conter apenas
  // include index.html
  res.sendfile("view/index2.html");
});

server.listen(5000);

// objeto para armazenar na sessão do soquete para o qual você vai se conectar
var usuariosOnline = {};

var io = require("socket.io").listen(server);

function DataHora()
{
	var Hoje = new Date();
	var dia = Hoje.getFullYear() + '-' + (Hoje.getMonth() + 1) + '-' + Hoje.getDate();
	return dia + " " + Hoje.getHours() + ":" + Hoje.getMinutes() + ":" + Hoje.getSeconds();
}

function fts_antixss(string1)
{
  tam = string1.length;

  string2 = string1.replace(/</g,"&#60");
  string3 = string2.replace(/>/g,"&#62");
  string1 = string2.replace(/'/g,"&#39");

  return string1;
}

// Para conectar um usuário || socket, este evento é predefinido pelo socketio
io.sockets.on('connection', function(socket)
{
  // Quando o usuário se conecta a conversar verificar se você está conectado
  // parâmetro é a sessão de login armazenados com sessionStorage
	socket.on("loginUser", function(username, ip)
	{
    // Se existor o nome de usuário no bate-papo
		if(usuariosOnline[username])
		{
			socket.username = username+"_" + Math.floor((Math.random() * Date.now()) + 1);
		}
		else if(username == "Eu" || username == "eu")
		{
			socket.username = username+"_" + Math.floor((Math.random() * Date.now()) + 1);
		}
		else
    	{
			// Salva o nome do usuário na sessão para esta tomada de cliente
			socket.username = username;
		}
		socket.ip = ip;
    // Adicionar o usuário para a lista global onde os usuários loja
		usuariosOnline[socket.username] = socket.username;
    // Mostra o cliente que está conectado
		socket.emit("refreshChat", "eu", "Bem vindo " + socket.username + ".");
    // Mostra a nível global para todos os usuários de um usuário
    // Basta ligar para conversar
		socket.broadcast.emit("refreshChat", "conectado", "O usuário " + socket.username + " entrou no chat.");
    // Atualiza a lista de usuários no lado do cliente de bate-papo
		io.sockets.emit("updateSidebarUsers", usuariosOnline);

		var msg = socket.username +" ("+ ip + ")||" + DataHora() +" In\n";

	  	fs.readFile('logs/inout.log', function(err, data){
			if(err){ throw err; }
		    else
		    {
		      fs.writeFile('logs/inout.log', data + msg, function(err){
		        if(err){ throw err; }
		      });
		    }
	  	});
	});

  // Quando um usuário envia uma nova mensagem, o parâmetro é o
  // Mensagem escrita na caixa
	socket.on('addNewMessage', function(message)
	{
		var m = message.split('::');
		var msgFinal = "";
	    if(m[0] == "img")
			msgFinal = "<img src='"+fts_antixss(m[1])+"'>";
	    else if(m[0] == "youtube")
			msgFinal = "<iframe width='420' height='315' src='"+fts_antixss(m[1].replace('watch?v=', 'embed/'))+"?rel=0&controls=0&showinfo=0' frameborder='0' allowfullscreen></iframe>";
		else if(m[0] == "background")
			msgFinal = "<style>#containerMessages{background: url('"+fts_antixss(m[1])+"');}</style>";
		else if(m[0] == "alert")
			msgFinal = "<script>alert('"+fts_antixss(m[1])+"');</script>";
	    else
			msgFinal = fts_antixss(message);


		socket.emit("refreshChat", "msg", "Eu<sep>"+ DataHora() + "<sep>" + msgFinal);
    // Com socket.broadcast.emit, é para outros usuários
		socket.broadcast.emit("refreshChat", "msg", socket.username + "<sep>" + DataHora() + "<sep>" + msgFinal + "<sep>" + socket.ip);

		var msg = socket.username +" ("+ socket.ip + ")||" + DataHora() +" diz: " + msgFinal + "  ENDMSG\n";
		fs.readFile('logs/messages.log', function(err, data){
		    if(err){ throw err; }
		    else
		    {
		      fs.writeFile('logs/messages.log', data + msg, function(err){
		        if(err){ throw err; }
		      });
		    }
	  	});
	});

  // Quando o usuário fecha o navegador ou atualização
	socket.on("disconnect", function()
	{
    // Se o usuário, por exemplo, sem estar conectado legal
    // página, o nome de usuário tomada typeof é indefinido, ea mensagem seria Undefined
    // O usuário foi desconectado do bate-papo, com isso, evitar
		if(typeof(socket.username) == "undefined")
		{
			return;
		}
    // Caso contrário, remova o usuário evite
		delete usuariosOnline[socket.username];
    // Atualiza a lista de usuários na área de cliente de chat
		io.sockets.emit("updateSidebarUsers", usuariosOnline);
    // Emitir mensagem global para todos os que estão ligados com as transmissões
		socket.broadcast.emit("refreshChat", "desconectado", "O usuário " + socket.username + " saiu do chat.");

		var msg = socket.username +" ("+ socket.ip + ")||" + DataHora() +" Out\n";

	  	fs.readFile('logs/inout.log', function(err, data){
		    if(err){ throw err; }
		    else
		    {
		      fs.writeFile('logs/inout.log', data + msg, function(err){
		        if(err){ throw err; }
		      });
		    }
		});
	});

	socket.on("sendbug", function(message){
		var msg = socket.username + "(" + socket.ip + ")||" + DataHora() + " " + fts_antixss(message) + " ENDBUG\n";
		fs.readFile('logs/bugs.log', function(err, data){
			if(err){ socket.emit("sentBug", false); }
			else
			{
				fs.writeFile('logs/bugs.log', data + msg, function(err){
					if(err){
						socket.emit("sentBug", false);
						//throw err;
					}
					socket.emit("sentBug", true);
				});
			}
		});
	});

	socket.on("senddenounce", function(desc, msgDenunciada, div){
		var msg = socket.username + "(" + socket.ip + ")||" + DataHora() + " " + fts_antixss(desc) + " || " + msgDenunciada + " ENDDENOUNCE\n";
		fs.readFile('logs/denounce.log', function(err, data){
			if(err){ socket.emit("sentDenounce", false, ""); }
			else
			{
				fs.writeFile('logs/denounce.log', data + msg, function(err){
					if(err){
						socket.emit("sentDenounce", false, "");
						//throw err;
					}
					socket.emit("sentDenounce", true, div);
				});
			}
		});
	});
});
