
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../../web1/ui1.switch/innovaphone.ui1.switch.js" />
/// <reference path="../../web1/ui1.popup/innovaphone.ui1.popup.js" />
/// <reference path="../../web1/ui1.listview/innovaphone.ui1.listview.js" />

var Wecom = Wecom || {};
Wecom.dwcscheduler = Wecom.dwcscheduler || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var avatar = start.consumeApi("com.innovaphone.avatar");

    var colorSchemes = {
        dark: {
            "--bg": "url(bg.png)",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.dwcschedulerTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);
    var _colDireita;
    var list_availabilities = [];
    var list_schedules = [];
    var list_configs = [];
    var UIuserPicture;
    var UIuser;

    function app_connected(domain, user, dn, appdomain) {
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn;
        constructor();
        app.send({ api: "user", mt: "UserMessage" });
    }

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            console.log(obj.result);
            list_configs = JSON.parse(obj.result);
            makeDivGeral(_colDireita);
        }
        if (obj.api == "user" && obj.mt == "SelectAvailabilityMessageSuccess") {
            console.log(obj.result);
            list_availabilities = JSON.parse(obj.result);
            makeDivAvailabilities(_colDireita);
        }
        if (obj.api == "user" && obj.mt == "SelectSchedulesMessageSuccess") {
            console.log(obj.result);
            list_schedules = JSON.parse(obj.result);
            makeDivSchedules(_colDireita);
        }
        if (obj.api == "user" && obj.mt == "UserEventMessage") {

            console.log("makePopupDevice");
            var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
            var h = [20];
            var _popup = new innovaphone.ui1.Popup("position: absolute; display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap; width:400px; height:200px;", styles[0], h[0]);
            _popup.header.addText(texts.text("labelEventTitle"));

            var iptEventTitle = new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:20%; font-size:15px; text-align:center", texts.text("labelEvent"));
            var iptEventRequest = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:35%; font-size:15px; text-align:left", texts.text("labelEventRequest")+obj.name);
            var iptEventEmail = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:45%; font-size:15px; text-align:left", texts.text("labelEventEmail")+obj.email);
            var iptEventWhen = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:55%; font-size:15px; text-align:left", texts.text("labelEventWhen")+obj.time_start);

            //Bot�o Salvar
            var btnAckEvent = new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:70%; font-size:15px; text-align:center", null, "button-inn").addTranslation(texts, "btnOk").addEvent("click", function () {
                app.send({ api: "user", mt: "UserAckEventMessage"});
                _popup.close();
            });

            _popup.content.add(iptEventTitle);
            _popup.content.add(iptEventRequest);
            _popup.content.add(iptEventEmail);
            _popup.content.add(iptEventWhen);
            _popup.content.add(btnAckEvent);
        }
        if (obj.api == "user" && obj.mt == "UserEventHistoryMessage") {

            console.log("makePopupDevice");
            var styles = [new innovaphone.ui1.PopupStyles("popup-background", "popup-header", "popup-main", "popup-closer")];
            var h = [20];
            var _popup = new innovaphone.ui1.Popup("position: absolute; display: inline-flex; left:50px; top:50px; align-content: center; justify-content: center; flex-direction: row; flex-wrap: wrap; width:400px; height:200px;", styles[0], h[0]);
            _popup.header.addText(texts.text("labelEventTitle"));

            var iptEventTitle = new innovaphone.ui1.Div("position:absolute; left:0%; width:100%; top:20%; font-size:15px; text-align:center", texts.text("labelEventHistory"));
            var iptEventCount = new innovaphone.ui1.Div("position:absolute; left:1%; width:99%; top:50%; font-size:15px; text-align:left", texts.text("labelEventCount") + obj.count);
            //Bot�o Salvar
            var btnAckEvent = new innovaphone.ui1.Div("position:absolute; left:40%; width:20%; top:70%; font-size:15px; text-align:center", null, "button-inn").addTranslation(texts, "btnOk").addEvent("click", function () {
                app.send({ api: "user", mt: "UserAckEventMessage" });
                _popup.close();
            });

            _popup.content.add(iptEventTitle);
            _popup.content.add(iptEventCount);
            _popup.content.add(btnAckEvent);
        }
    }
    function constructor() {
        that.clear();
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        //T�tulo
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null));
        imglogo.setAttribute("src", "logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user")

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        var br = relatorios.add(new innovaphone.ui1.Node("br", null, null, null));

        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))

        var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgGeral"), null));
        Arelatorios1.setAttribute("id", "CfgGeral");
        var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgSchedules"), null));
        Arelatorios2.setAttribute("id", "CfgSchedules")
        var Arelatorios3 = lirelatorios3.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgAvailability"), null));
        Arelatorios3.setAttribute("id", "CfgAvailability")


        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "logo.png");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgGeral");
        a.addEventListener("click", function () { ChangeView("CfgGeral", colDireita) })

        var a = document.getElementById("CfgSchedules");
        a.addEventListener("click", function () { ChangeView("CfgSchedules", colDireita) })

        var a = document.getElementById("CfgAvailability");
        a.addEventListener("click", function () { ChangeView("CfgAvailability", colDireita) })

        _colDireita = colDireita;
    }
    function ChangeView(ex, colDireita) {

        if (ex == "CfgGeral") {
            makeDivGeral(colDireita);
        }
        if (ex == "CfgSchedules") {
            app.send({ api: "user", mt: "SelectSchedulesMessage" });
            waitConnection(colDireita);
        }
        if (ex == "CfgAvailability") {
            app.send({ api: "user", mt: "SelectAvailabilityMessage"});
            waitConnection(colDireita);
        }
    }
    function makeDivSchedules(t) {
        t.clear();

        //Bot�es Tabela de Agendamentos
        //t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAddAction").addEvent("click", function () {
        //    makeDivAddAction(t);
        //});
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
            var selected = ListView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(ListView.getRowData(s))
                console.log(selectedrows[0]);
                app.send({ api: "user", mt: "DelSchedulesMessage", id: parseInt(selectedrows[0]) });
            })
        });



        //T�tulo Tabela
        var labelTituloTabeaAcoes = t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:30%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloSchedules")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 5;
        var rows = list_schedules.length;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabe�alho
        for (i = 0; i < columns; i++) {
            ListView.addColumn(null, "text", texts.text("cabecalhoSchedules" + i), i, 10, false);
        }
        //Tabela    
        list_schedules.forEach(function (b) {
            var row = [];
            row.push(b.id);
            row.push(b.name);
            row.push(b.email);
            row.push(b.time_start);
            row.push(b.time_end);
            ListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
            
        })
        scroll_container.add(list);
        t.add(scroll_container);
    }
    function makeDivAvailabilities(t) {
        t.clear();

        //Bot�es Tabela de Disponibilidades
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnAdd").addEvent("click", function () {
            makeDivAddAvail(t);
        });
        t.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:10%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
            var selected = ListView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(ListView.getRowData(s))
                console.log(selectedrows[0]);
                app.send({ api: "user", mt: "DelAvailabilitiesMessage", id: parseInt(selectedrows[0]) });
            })
        });



        //T�tulo Tabela
        t.add(new innovaphone.ui1.Div("position:absolute; left:0%; width:30%; top:20%; font-size:17px; text-align:center; font-weight: bold", texts.text("labelTituloAvail")));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 3;
        var rows = list_availabilities.length;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabe�alho
        for (i = 0; i < columns; i++) {
            ListView.addColumn(null, "text", texts.text("cabecalhoAvailabilities" + i), i, 10, false);
        }
        //Tabela    
        list_availabilities.forEach(function (a) {
            var row = [];
            row.push(a.id);
            row.push(a.time_start);
            row.push(a.time_end);
            ListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
        })
        scroll_container.add(list);
        t.add(scroll_container);
    }
    function makeDivAddAvail(colDireita) {
        colDireita.clear();
        //var divFrom = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25%; left: 6%; font-weight: bold;", texts.text("labelFrom"), null));
        //var InputFrom = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "datetime-local", null).setAttribute("id", "dateFrom"));

        var divStart = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelStart"), null));
        var InputStart = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "datetime-local", null).setAttribute("id", "timeStart"));

        var divEnd = colDireita.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelEnd"), null));
        var InputEnd = colDireita.add(new innovaphone.ui1.Input("position: absolute;  top: 45%; left: 20%; height: 30px; width: 20%; border-radius: 10px; border: 2px solid; border-color:#02163F;", null, null, null, "datetime-local", null).setAttribute("id", "timeEnd"));
        // buttons
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            //var from = document.getElementById("dateFrom").value;
            var time_start = document.getElementById("timeStart").value;
            var time_end = document.getElementById("timeEnd").value;

            app.send({ api: "user", mt: "AddAvailabilityMessage", time_start: time_start, time_end: time_end });
            waitConnection(colDireita);
        });
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:35%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn-del")).addTranslation(texts, "btnCancel").addEvent("click", function () {
            constructor();
        });
    }

    function waitConnection(t) {
        t.clear();
        var bodywait = new innovaphone.ui1.Div("height: 100%; width: 100%; display: inline-flex; position: absolute;justify-content: center; background-color:rgba(100,100,100,0.5)", null, "bodywaitconnection")
        bodywait.addHTML('<svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="hsl(193,90%,55%)" /><stop offset="100%" stop-color="hsl(223,90%,55%)" /></linearGradient></defs>	<circle class="pl__ring" r="56" cx="64" cy="64" fill="none" stroke="hsla(0,10%,10%,0.1)" stroke-width="16" stroke-linecap="round" />	<path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10" /></svg >');
        t.add(bodywait);
    }
    function makeDivGeral(t){
        t.clear();
        //T�tulo
        try {
            var email_contato = list_configs[0].email_contato;
            var text_invite = list_configs[0].text_invite;
            var url_conference = list_configs[0].url_conference;
        } catch (e) {
            var email_contato = null;
            var text_invite = null;
            var url_conference = null;
        }
        t.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        var emailContato = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 25%; left: 6%; font-weight: bold;", texts.text("labelEmailContato"), null));
        var InputEmailContato = t.add(new innovaphone.ui1.Input("position: absolute;  top: 25%; left: 20%; height: 30px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", email_contato, null, null, "email", null).setAttribute("id", "InputEmailContato"));

        var divURLConference = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 35%; left: 6%; font-weight: bold;", texts.text("labelURLContato"), null));
        var InputURLConference = t.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 20%; height: 30px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", url_conference, null, null, "url", null).setAttribute("id", "InputURLConference"));

        var divTextInvite = t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelTxtInvite"), null));
        var InputTextInvite = t.add(new innovaphone.ui1.Node("textarea", "position: absolute;  top: 45%; left: 20%; height: 200px; rows=5; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", text_invite, null).setAttribute("id", "InputTxtInvite"));
        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:50%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            var email_contato = document.getElementById("InputEmailContato").value;
            var url_conference = document.getElementById("InputURLConference").value;
            var text_invite = document.getElementById("InputTxtInvite").value;

            app.send({ api: "user", mt: "UpdateConfigMessage", email: email_contato, url_conference: url_conference, text_invite: text_invite });
            waitConnection(t);
        });

    }
}

Wecom.dwcscheduler.prototype = innovaphone.ui1.nodePrototype;