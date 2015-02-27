var socket = io.connect('http://'+location.host);

$(document).ready(function()
{
    manageSessions.unset("login");

    var height = $(window).height() - 200 + "px";
    $('#containerMainMsg, .msg-wrap').css('height', height);
    //console.warn(height);
    $(window).resize(function(){
        //console.log(height);
        height = $(window).height() - 200 + "px";
        $('#containerMainMsg, .msg-wrap').css('height', height);
    });
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
    showModal("Newchat",renderForm());
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
        if($(".username").val().trim().replace(' ','_').length < 2)
        {
            $(".errorMsg").hide();
            $(".username").after("<div class='card-panel red accent-2'><i class='small mdi-action-report-problem' style=''></i> Insira um nome para entrar.</div>").focus();
            return;
        }
        manageSessions.set("login", $(".username").val().trim().replace(' ','_'));
        manageSessions.set("ip", myIP());

        socket.emit("loginUser", manageSessions.get("login"),manageSessions.get("ip"));

        $("#formModal").closeModal();
        animateScroll();
    });

    socket.on("userInUse", function()
    {
        showModal();
        manageSessions.unset("login");
        $(".errorMsg").hide();
        $(".username").after("<div class='card-panel red accent-2'><i class='small mdi-action-report-problem' style=''></i> Nome de Usuário em uso.</div>").focus();
        return;
    });

    socket.on("refreshChat", function(action, message)
    {
        if(action == "conectado")
        {
            $("#chatMsgs").append("<div class='card-panel teal accent-3'>" + message + "</div>");
        }
        else if(action == "desconectado")
        {
            $("#chatMsgs").append("<div class='card-panel red accent-2'>" + message + "</div>");
        }
        else if(action == "msg")
        {
            if(message.split('<sep>')[0] == "Eu")
            {
                $("#chatMsgs").append("<div class='card-panel blue-grey lighten-5'> " +
                        "<div class='media-body'>" +
                            "<h6 class='media-heading'>" + message.split('<sep>')[0] + " <small class='pull-right time'><i class='fa fa-clock-o'></i> " + message.split('<sep>')[1] + "</small></h6>" +
                            "<small class='col-lg-10'>" + message.split('<sep>')[2] + "</small>" +
                        "</div>" +
                    "</div>");
            }
            else
            {
                $("#chatMsgs").append("<div id='"+Math.floor((Math.random() * Date.now()) + 1)+"' class='card-panel orange lighten-5'>" +
                "<div class='media-body'>" +
                "<h6 class='media-heading'>" + message.split('<sep>')[0] + " <small class='pull-right time'><i class='fa fa-clock-o'></i> " + message.split('<sep>')[1] + "</small></h6>" +
                "<small class='col-lg-10'>" + message.split('<sep>')[2] + "</small>" +
                "<a href='javascript: denounceMsg(\""+message.replace(/'/g,"")+"\")' title='Denunciar Mensagem'><small style='float: right; color:#b71c1c;'><i class='tiny mdi-communication-dnd-on' style=''></i></small></a>" +
                "</div>" +
                "</div>");
            }
        }
        else if(action == "eu")
        {
            $("#chatMsgs").append("<div class='card-panel teal lighten-2'>" + message + "</div>");
        }
        animateScroll();
    });

    socket.on("updateSidebarUsers", function(usersOnline)
    {
        $(".chatUsers").html('');
        if(!isEmptyObject(usersOnline))
        {
            var uOnline = 0;
            $.each(usersOnline, function(key, val)
            {
                $(".chatUsers").append('<li id="liUsers" class="media conversation bold"> ' +
                        '<a class="pull-left" href="#">' +
                        '</a>' +
                        '<div class="media-body">' +
                            '<h6 class="media-heading">' + key + '</h6>' +
                        '</div>' +
                    '</li>');
                uOnline++;
            });
            $('h5#usersOn').html(uOnline);
        }
    });

    socket.on("sentBug", function(status){
        if(status)
        {
            $("textarea#descBug").after("<div class='card-panel green'><i class='small mdi-action-done' style=''></i> Obrigado por nos ajudar.</div>").focus();
        }
        else
        {
            $("textarea#descBug").after("<div class='card-panel red accent-2'><i class='small mdi-action-report-problem' style=''></i> Erro ao tentar enviar.</div>").focus();
        }
    });

    socket.on("sentDenounce", function(status, divId){
        if(status)
        {
            $("#"+divId).remove();
            $("textarea#descDenounce").after("<div class='card-panel green'><i class='small mdi-action-done' style=''></i> Mensagem denunciada.</div>").focus();
        }
        else
        {
            $("textarea#descDenounce").after("<div class='card-panel red accent-2'><i class='small mdi-action-report-problem' style=''></i> Erro ao tentar enviar.</div>").focus();
        }
    });

    $('.sendMsg').on("click", function()
    {
        SendMessage();
    });

    $('.message').on('keypress', function(e) {
        if ( e.which == 13 ) {
            SendMessage();
        }
    });
});



function SendMessage()
{
    var message = $(".message").val();
    if(message.length >= 2)
    {
        socket.emit("addNewMessage", message);
        $(".message").val("");
    }
    else
    {
        showModal("Erro","<p class='card-panel red accent-2'><i class='small mdi-action-report-problem' style=''></i> A mensagem deve conter pelo menos 2 caracteres.</p>", "true");
    }
    animateScroll();
}

function showModal(title,message,showClose)
{
    //console.log(showClose)
    $("h2.title-modal").text(title).css({"text-align":"center"});
    $("p.formModal").html(message);
    if(showClose == "true")
    {
        $(".modal-footer").html('<a href="javascript: $(\'#formModal\').closeModal();" class="btn btn-danger">Fechar</a>');
        //$("#formModal").modal({show:true});
        $("#formModal").openModal({
          dismissible: false, // Modal can be dismissed by clicking outside of the modal
          opacity: .5
        });
    }
    else
    {
        //$("#formModal").modal({show:true, backdrop: 'static', keyboard: true });
        $(".modal-footer").html("");
        $("#formModal").openModal({
          dismissible: false, // Modal can be dismissed by clicking outside of the modal
          opacity: .5
        }
      );
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
