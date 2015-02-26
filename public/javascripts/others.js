function denounceMsg(p)
{
    var m = p.split('<sep>');
    showModal("Denunciar Mensagem", p, "true");
}

function help()
{
    var html = "";
    showModal("Ajuda", html, "true");
}

function bugReport()
{
    var html = "";
    showModal("Reportar um bug", html, "true");
}
