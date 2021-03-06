var socket = io.connect('http://192.168.1.6:3000');

$(document).ready(function()
{
    manageSessions.unset("login");
});

function myIP() {
    if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
    else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.open("GET","http://api.hostip.info/get_html.php",false);
    xmlhttp.send();

    hostipInfo = xmlhttp.responseText.split("\n");

    for (i=0; hostipInfo.length >= i; i++) {
        ipAddress = hostipInfo[i].split(":");
        if ( ipAddress[0] == "IP" ) return ipAddress[1];
    }

    return false;
}

function animateScroll()
{
    var container = $('#containerMessages');
    container.animate({"scrollTop": $('#containerMessages')[0].scrollHeight}, "slow");
}

$(function()
{
    animateScroll();
    showModal("Formulario de início de sessão",renderForm());
    $("#containerSendMessages, #containerSendMessages input").on("focus click", function(e)
    {
        e.preventDefault();
        if(!manageSessions.get("login"))
        {
            showModal("Formulario de início de sessão",renderForm(), false);
        }
    });

    $("#loginBtn").on("click", function(e)
    {
        e.preventDefault();
        if($(".username").val().length < 2)
        {
            $(".errorMsg").hide();
            $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>Insira um nome para entrar no chat.</div>").focus();
            return;
        }
        manageSessions.set("login", $(".username").val());
        manageSessions.set("ip", myIP());

        socket.emit("loginUser", manageSessions.get("login"),manageSessions.get("ip"));

        $("#formModal").modal("hide");
        animateScroll();
    });

    socket.on("userInUse", function()
    {
        $("#formModal").modal("show");
        manageSessions.unset("login");
        $(".errorMsg").hide();
        $(".username").after("<div class='col-md-12 alert alert-danger errorMsg'>Nome de Usuário em uso.</div>").focus();
        return;
    });

    socket.on("refreshChat", function(action, message)
    {
        if(action == "conectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-info'>" + message + "</p>");
        }
        else if(action == "desconectado")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-danger'>" + message + "</p>");
        }
        else if(action == "msg")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-warning'>" + message + "</p>");
        }
        else if(action == "eu")
        {
            $("#chatMsgs").append("<p class='col-md-12 alert-success'>" + message + "</p>");
        }
        animateScroll();
    });

    socket.on("updateSidebarUsers", function(usersOnline)
    {
        $("#chatUsers").html("");
        if(!isEmptyObject(usersOnline))
        {
            $.each(usersOnline, function(key, val)
            {
                $("#chatUsers").append("<p class='col-md-12 alert-info'>" + key + "</p>");
            })
        }
    });

    $('.sendMsg').on("click", function()
    {
        SendMessage("texto");
    });

    $('.sendImg').on("click", function()
    {
        SendMessage("img");
    });

    $('.sendVideo').on("click", function()
    {
        SendMessage("video");
    });

    $('.message').on('keypress', function(e) {
        if ( e.which == 13 ) {
            SendMessage("texto");
        }
    });
    $('.messageImg').on('keypress', function(e) {
        if ( e.which == 13 ) {
            SendMessage("img");
        }
    });
    $('.messageVideo').on('keypress', function(e) {
        if ( e.which == 13 ) {
            SendMessage("video");
        }
    });

});

function fts_antixss(string1)
{
  tam = string1.length;

  string2 = string1.replace(/</g,"&#60");
  string1 = string2.replace(/>/g,"&#62");

  return string1;
}

function SendMessage(p)
{
    var message = "";
    if(p == "img")
        message = "<img src='"+fts_antixss($(".messageImg").val())+"'>";
    else if(p == "video")
        message = "<iframe width='420' height='315' src='"+fts_antixss($(".messageVideo").val().replace('watch?v=', 'embed/'))+"?rel=0&controls=0&showinfo=0' frameborder='0' allowfullscreen></iframe>";
    else
        message = fts_antixss($(".message").val());

    if(message.length >= 2)
    {
        socket.emit("addNewMessage", message);
        if(p == "img")
            $(".messageImg").val("");
        else if(p == "video")
            $(".messageVideo").val("");
        else
            $(".message").val("");
    }
    else
    {
        showModal("Erro","<p class='alert alert-danger'>A mensagem deve conter pelo menos 2 caracteres.</p>", "true");
    }
    animateScroll();
}

function showModal(title,message,showClose)
{
    console.log(showClose)
    $("h2.title-modal").text(title).css({"text-align":"center"});
    $("p.formModal").html(message);
    if(showClose == "true")
    {
        $(".modal-footer").html('<a data-dismiss="modal" aria-hidden="true" class="btn btn-danger">Fechar</a>');
        $("#formModal").modal({show:true});
    }
    else
    {
        $("#formModal").modal({show:true, backdrop: 'static', keyboard: true });
    }
}

function renderForm()
{
    var html = "";
    html += '<div class="form-group" id="formLogin">';
    html += '<input type="text" id="username" class="form-control username" placeholder="Insira um nome de Usuário">';
    html += '</div>';
    html += '<button type="submit" class="btn btn-primary btn-large" id="loginBtn">Entrar</button>';
    return html;
}

var manageSessions = {
    get: function(key) {
        return sessionStorage.getItem(key);
    },
    set: function(key, val) {
        return sessionStorage.setItem(key, val);
    },
    unset: function(key) {
        return sessionStorage.removeItem(key);
    }
};

function isEmptyObject(obj)
{
    var name;
    for (name in obj)
    {
        return false;
    }
    return true;
}
