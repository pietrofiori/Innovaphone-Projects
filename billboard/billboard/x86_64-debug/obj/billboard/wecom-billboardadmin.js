
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.billboardAdmin = Wecom.billboardAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var UIuser;
    var list_tableUsers = [];
    var _colDireita;
    //license
    var licenseToken = null;
    var appInstall = null;
    var licenseFile = null;
    var licenseActive = null;
    var licenseInstallDate = null;
    var licenseUsed = 0;
    var avatar = start.consumeApi("com.innovaphone.avatar");

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
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

    var texts = new innovaphone.lib1.Languages(Wecom.billboardTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn
        app.send({ api: "admin", mt: "AdminMessage" });
        app.send({ api: "admin", mt: "TableUsers" });
        constructor();
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "AdminMessageResult") {
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "UpdateConfigLicenseMessageSuccess") {
            app.send({ api: "admin", mt: "ConfigLicense" });
           // waitConnection(colDireita);
            window.alert("Configurações Atualizadas com suecesso!");

        }
        if (obj.api == "admin" && obj.mt == "LicenseMessageResult") {
            try {
                licenseToken = obj.licenseToken;
                licenseFile = obj.licenseFile;
                licenseActive = obj.licenseActive;
                licenseInstallDate = obj.licenseInstallDate;
                licenseUsed = obj.licenseUsed;
                appInstall = obj.appInstallDate;
                console.log("LicenseMessageResult = Success + License File: " + licenseFile)

            } catch (e) {
                console.log("ERRO LicenseMessageResult:" + e)
            }
            makeDivLicense(_colDireita);
        }
    }
    function constructor() {
        that.clear();
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        colDireita.setAttribute("id","coldireita")
        //Título
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id","colesquerda")
        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null));
        imglogo.setAttribute("src", "./images/logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        //imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user");
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);

        var relatorios = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        var prelatorios = relatorios.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        var br = relatorios.add(new innovaphone.ui1.Node("br", null, null, null));

        var lirelatorios1 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        var lirelatorios2 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))
        // var lirelatorios3 = relatorios.add(new innovaphone.ui1.Node("li", "opacity: 0.9", null, "liOptions"))

        var Arelatorios1 = lirelatorios1.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgUsers"), null));
        Arelatorios1.setAttribute("id", "CfgUsers");
        // var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgGoogle"), null));
        // Arelatorios2.setAttribute("id", "CfgGoogle");
        var Arelatorios2 = lirelatorios2.add(new innovaphone.ui1.Node("a", null, texts.text("labelCfgLicense"), null));
        Arelatorios2.setAttribute("id", "CfgLicense");

        var divother = colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null));
        var divother2 = divother.add(new innovaphone.ui1.Div(null, null, "otherli"));

        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));

        var imgconfig = liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null));
        imgconfig.setAttribute("src", "./images/wecom-white.svg");
        //var Aconfig = liconfig.add(new innovaphone.ui1.Node("a", "display: flex; align-items: center; justify-content: center;", texts.text("labelConfig"), null));
        //Aconfig.setAttribute("href", "#");

        var a = document.getElementById("CfgUsers");
    a.addEventListener("click", function () { 
        ChangeView("CfgUsers", colDireita) 
    })

    var a = document.getElementById("CfgLicense");
    a.addEventListener("click", function () { 
        ChangeView("CfgLicense", colDireita) 
    })

        _colDireita = colDireita;
    }
    function ChangeView(ex, colDireita) {

        if (ex == "CfgUsers") {
           // app.send({ api: "admin", mt: "TableUsers" });
            makeDivUsers(colDireita,list_tableUsers);
        }
        if (ex == "CfgLicense") {
            app.send({ api: "admin", mt: "ConfigLicense"});
            //waitConnection(colDireita);
        }
    }
    function makeDivUsers(t,users){
       t.clear();
       var scrollcontainer = t.add(new innovaphone.ui1.Div(null,null,"list-box scrolltable"))
       var tableMain =  scrollcontainer.add(new innovaphone.ui1.Node("table",null,null,"table").setAttribute("id","local-table"));
       tableMain.add(new innovaphone.ui1.Node("th",null,"Nome",null));
       tableMain.add(new innovaphone.ui1.Node("th",null,"Pode Criar Departamento",null));
    
        users.forEach(function (user) {
            var html = `
          <tr>
            <td style="text-transform: capitalize; text-align: center;">${user.cn}</td>
            <td style="text-align: center;"><input type = "checkbox" id = "checkUser"></td>
          </tr>
        `;
            document.getElementById("local-table").innerHTML += html
        });

        scrollcontainer.add(new innovaphone.ui1.Node("button","height: 40px;width: 100px;position: relative;top: 90%;","Salvar",null)).addEvent("click",function(){
            console.log("Ok Funcionando")
            // <td>${user.guid}</td> , enviar o guid para o user
        })

   

        }
        
    function makeDivLicense(t) {
        t.clear();
        //Título

        // var imgMenu = t.add(new innovaphone.ui1.Node("img",null,null,"imgMenu"));
        // imgMenu.setAttribute("src","menu-icon.png");
        // imgMenu.setAttribute("id","imgmenu");
        //document.getElementById("imgmenu").addEventListener("click",openMenu);

        t.add(new innovaphone.ui1.Div(null, texts.text("labelTituloLicense"),"DivLicenseTitle"));

        t.add(new innovaphone.ui1.Div(null, texts.text("lblLicenseToken"), "DivLicenseTokenTitle"));
        t.add(new innovaphone.ui1.Div(null, licenseToken, "DivLicenseToken"));

        t.add(new innovaphone.ui1.Div(null, texts.text("labelLicenseFile"),"DivLicenseKey"));
        t.add(new innovaphone.ui1.Input("position: absolute;  top: 35%; left: 40%; height: 30px; padding:5px; width: 50%; border-radius: 10px; border: 2px solid; border-color:#02163F;", licenseFile, null, null, null, "DivLicenseIptKey").setAttribute("id", "InputLicenseFile"));
        var lic = "Temporária";
        if (licenseActive != "null") {
            lic = licenseActive
        }
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 6%; font-weight: bold;", texts.text("labelLicenseActive"),"DivLicenseActive"));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 45%; left: 40%; font-weight: bold;", lic, "DivLicenseSystem"));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 6%; font-weight: bold;", texts.text("labelAppInstallDate"), "DivAppDateTitle"));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 55%; left: 40%; font-weight: bold;", appInstall, "DivAppDate"));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 6%; font-weight: bold;", texts.text("labelLicenseInstallDate"),"DivLicenseDateTitle"));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 65%; left: 40%; font-weight: bold;", licenseInstallDate, "DivLicenseDate"));

        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 75%; left: 6%; font-weight: bold;", texts.text("labelLicenseUsed"), "DivLicenseInUse"));
        t.add(new innovaphone.ui1.Div("position: absolute; text-align: right; top: 75%; left: 40%; font-weight: bold;", String(licenseUsed), "DivLicenseUsed"));


        // buttons
        t.add(new innovaphone.ui1.Div("position:absolute; left:82%; width:15%; top:90%; font-size:12px; text-align:center;", null, "button-inn")).addTranslation(texts, "btnOk").addEvent("click", function () {
            licenseFile = document.getElementById("InputLicenseFile").value;
            if (licenseFile.length > 0) {
                app.send({ api: "admin", mt: "UpdateConfigLicenseMessage", licenseToken: licenseToken, licenseFile: licenseFile });
                //waitConnection(t);
            } else {
                window.alert("A chave de licença precisa ser informada!");
            }
            
        });

    }
}

Wecom.billboardAdmin.prototype = innovaphone.ui1.nodePrototype;
