function denounceMsg(p)
{
    var m = p.split('<sep>');
    showModal("Denunciar Mensagem", p, "true");
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
    showModal("Reportar um bug", html, "true");
}
