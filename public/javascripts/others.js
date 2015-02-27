function denounceMsg(denuncia)
{
    var m = denuncia.split('<sep>');

    var a = $('a#denunciar');
    var divParaOcultar  = a.context.activeElement.parentElement.parentElement.id;
    var html = "";
    html += "<div class='input-field col s12'>";
    html += "<i class='tiny mdi-communication-dnd-on prefix'></i>";
    html += "<textarea id='descDenounce' class='materialize-textarea'></textarea>";
    html += "<label for='textarea1'>Descreva aqui o motivo da sua denuncia</label>";
    html += "</div>";
    html += '<button type="submit" class="btn btn-primary btn-large" onclick="javascript: sendDenounce(\''+divParaOcultar+'\',\''+denuncia+'\');">Enviar</button>';
    html += '<button type="button" class="btn btn-primary btn-large" style="float:right" onclick="javascript: $(\'#formModal\').closeModal();">Fechar</button>';
    showModal("Denunciar Mensagem", html, "false");
}

function sendDenounce(divParaOcultar, denuncia)
{
    if($('textarea#descDenounce').val() == "")
    {
        $("textarea#descDenounce").after("<div class='card-panel red accent-2'><i class='small mdi-action-report-problem' style=''></i> Descreva um motivo para a denúncia.</div>").focus();
        return;
    }
    socket.emit("senddenounce", $('textarea#descDenounce').val(), denuncia, divParaOcultar);
    $('textarea#descDenounce').val("");
}


function help()
{
    var html = "";
    html += "<div class='section'>";
    html += "<h5>Enviando Imagens</h5>";
    html += "<p><code>img::url_da_imagem</code></p>";
    html += "</div>";
    html += "<div class='divider'></div>";
    html += "<div class='section'>";
    html += "<h5>Enviando Videos</h5>";
    html += "<p><code>youtube::url_do_video</code></p>";
    html += "</div>";

    showModal("Ajuda", html, "true");
}

function bugReport()
{
    var html = "";
    html += "<div class='input-field col s12'>";
    html += "<i class='mdi-action-bug-report prefix'></i>";
    html += "<textarea id='descBug' class='materialize-textarea'></textarea>";
    html += "<label for='textarea1'>Report aqui o bug encontrado</label>";
    html += "</div>";
    html += '<button type="submit" class="btn btn-primary btn-large" onclick="javascript: sendBug();">Enviar</button>';
    html += '<button type="button" class="btn btn-primary btn-large" style="float:right" onclick="javascript: $(\'#formModal\').closeModal();">Fechar</button>';
    showModal("Reportar um bug", html, false);
}

function sendBug()
{
    if($('textarea#descBug').val() == "")
    {
        $("textarea#descBug").after("<div class='card-panel red accent-2'><i class='small mdi-action-report-problem' style=''></i> Descreva um bug para enviar.</div>").focus();
        return;
    }
    socket.emit("sendbug", $('textarea#descBug').val());
    $('textarea#descBug').val("");
}
