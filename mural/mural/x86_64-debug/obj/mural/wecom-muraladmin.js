
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.muralAdmin = Wecom.muralAdmin || function (start, args) {
    this.createNode("body");
    var that = this;

    var list_users = [];
    var list_tableUsers = [];
    var list_departments = [];
    var _colDireita;
    var UIuserPicture;
    var UIuser;
    var appdn = start.title;

    var colorSchemes = {
        dark: {
            "--bg": "url('./images/bg.png')",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
        },
        light: {
            "--bg": "url('./images/bg.png')",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () { schemes.activate(start.scheme) });

    var texts = new innovaphone.lib1.Languages(Wecom.muralTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    app.onclosed = waitConnection(that);
    app.onerror = waitConnection(that);


    waitConnection(that);

    function app_connected(domain, user, dn, appdomain) {
        //avatar
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        UIuser = dn;
        constructor();

        app.send({ api: "admin", mt: "TableUsers" });
    }

    function app_message(obj) {
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
        }
        if (obj.api == "admin" && obj.mt == "InsertDepartmentSuccess") { 
            app.send({api: "admin", mt: "SelectDepartments"})
            window.alert("Departamento Inserido com Sucesso")
        }
        if (obj.api == "admin" && obj.mt == "SelectDepartmentsResult") { 
            list_departments = JSON.parse(obj.result);
            makeDivDepartments(_colDireita)
             // pop up depois
        }
        if (obj.api == "admin" && obj.mt == "SelectUsersResult") { 
            list_users = JSON.parse(obj.result);
             makedivUsers(_colDireita)  
        }
        if (obj.api == "admin" && obj.mt == "InsertUserSuccess") { 
            app.send({api: "admin", mt: "SelectUsers"})
            window.alert("Usuário Inserido com Sucesso")
        }
    }

    function constructor() {
        that.clear();
        // col direita
        var colDireita = that.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        colDireita.setAttribute("id", "coldireita")
        //Titulo
        colDireita.add(new innovaphone.ui1.Div("position:absolute; left:0px; width:100%; top:5%; font-size:25px; text-align:center", texts.text("labelTituloAdmin")));

        // col Esquerda
        var colEsquerda = that.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id", "colesquerda")

        var divreport = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; border-bottom: 1px solid #4b545c; border-width: 100%; height: 10%; width: 100%; background-color: #02163F;  display: flex; align-items: center;", null, null));
        var imglogo = divreport.add(new innovaphone.ui1.Node("img", "max-height: 33px; opacity: 0.8;", null, null));
        imglogo.setAttribute("src", "./images/logo-wecom.png");
        var spanreport = divreport.add(new innovaphone.ui1.Div("font-size: 1.00rem; color:white; margin : 5px;", appdn, null));
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 0.75rem; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user")



        var divMenu = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 24%; height: 40%;"));
        divMenu.add(new innovaphone.ui1.Node("p", "text-align: center; font-size: 20px;", texts.text("labelAdmin"), null));
        divMenu.add(new innovaphone.ui1.Node("br", null, null, null));

        var li1 = new innovaphone.ui1.Node("li", "opacity: 0.9", new innovaphone.ui1.Node("a", null, texts.text("labelCfgUsers"), null).setAttribute("id", "CfgUsers"), "liOptions");
        divMenu.add(li1);
        var li2 = new innovaphone.ui1.Node("li", "opacity: 0.9", new innovaphone.ui1.Node("a", null, texts.text("labelCfgDepartments"), null).setAttribute("id", "CfgDepartments"), "liOptions");
        divMenu.add(li2);
        var li3 = new innovaphone.ui1.Node("li", "opacity: 0.9", new innovaphone.ui1.Node("a", null, texts.text("labelCfgSkills"), null).setAttribute("id", "CfgSkills"), "liOptions");
        divMenu.add(li3);


        colEsquerda.add(new innovaphone.ui1.Div("text-align: left; position: absolute; top:59%;", null, null).add(new innovaphone.ui1.Div(null, null, "otherli")));
        var config = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; top: 90%;", null, null));
        var liconfig = config.add(new innovaphone.ui1.Node("li", "display:flex; aligns-items: center", null, "config"));
        liconfig.add(new innovaphone.ui1.Node("img", "width: 100%; opacity: 0.9; margin: 2px; ", null, null).setAttribute("src", "./images/logo.png"));

        var a = document.getElementById("CfgDepartments");
        a.addEventListener("click", function(){ 
            ChangeView("CfgDepartments", colDireita)
        })
        var a = document.getElementById("CfgUsers");
        a.addEventListener("click", function () {
            ChangeView("CfgUsers", colDireita)
        })

        _colDireita = colDireita;
    }

    function waitConnection(div) {
        div.clear();
        var div1 = div.add(new innovaphone.ui1.Div(null, null, "preloader").setAttribute("id","preloader"))
        var div2 = div1.add(new innovaphone.ui1.Div(null, null, "inner"))
        var div3 = div2.add(new innovaphone.ui1.Div(null, null, "loading"))
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
    }
    function ChangeView(ex, colDireita) {

        if (ex == "CfgDepartments") {
            app.send({ api: "admin", mt: "SelectDepartments" })
            waitConnection(_colDireita);
        }
        if (ex == "CfgUsers") {
            app.send({ api: "admin", mt: "SelectUsers" })
            waitConnection(_colDireita);
        }
    }
    function makeDivDepartments(t){
        t.clear();

       var divmain = t.add(new innovaphone.ui1.Div(null,null,null))
       divmain.add(new innovaphone.ui1.Node("button",null,texts.text("labelAdd"),"btnAddDepart")).addEvent("click", function () {
        makeDivAddDepartments(t)     
        });  
        divmain.add(new innovaphone.ui1.Div(null, null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
            var selected = ListView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(ListView.getRowData(s))
                
            })
            selectedrows.forEach(function (row) {
                console.log(row);
                app.send({ api: "admin", mt: "DeleteDepartments", id: parseInt(row) });
            })
            waitConnection(t);
            app.send({ api: "admin", mt: "SelectDepartments" });
        });

        //Titulo Tabela
        t.add(new innovaphone.ui1.Div("text-align:center", texts.text("labelTitleDepartmentsTable"),"TituloTable"));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 2;
        var rows = list_departments.length;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            ListView.addColumn("column", "text_cabecalho", texts.text("cabecalhoDepartment" + i), i, 10, false);
        }
        //Tabela    
        list_departments.forEach(function (dep) {
            var row = [];
            row.push(dep.id);
            row.push(dep.name);
            ListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
        })
        scroll_container.add(list);
        t.add(scroll_container);
    }
    function makedivUsers(t) {
        t.clear();

        var divmain = t.add(new innovaphone.ui1.Div(null, null, null))
        divmain.add(new innovaphone.ui1.Node("button", null, texts.text("labelAdd"), "btnAddUser")).addEvent("click", function () {
            makeDivAddUsers(t)
        });
        divmain.add(new innovaphone.ui1.Div(null, null, "button-inn-del")).addTranslation(texts, "btnDel").addEvent("click", function () {
            var selected = ListView.getSelectedRows();
            console.log(selected);
            var selectedrows = [];

            selected.forEach(function (s) {
                console.log(s);
                selectedrows.push(ListView.getRowData(s))

            })
            selectedrows.forEach(function (row) {
                console.log(row);
                app.send({ api: "admin", mt: "DeleteUsers", id: parseInt(row) });
            })
            waitConnection(t);
            app.send({ api: "admin", mt: "SelectUsers" });
        });

        //Titulo Tabela
        t.add(new innovaphone.ui1.Div("text-align:center", texts.text("labelTitleUsersTable"), "TituloTable"));

        var scroll_container = new innovaphone.ui1.Node("scroll-container", "overflow-y: auto; position: absolute; left:1%; top:25%; right:1%; width:98%; height:-webkit-fill-available;", null, "scroll-container-table");

        var list = new innovaphone.ui1.Div(null, null, "");
        var columns = 4;
        var rows = list_users.length;
        var ListView = new innovaphone.ui1.ListView(list, 50, "headercl", "arrow", false);
        //Cabeçalho
        for (i = 0; i < columns; i++) {
            ListView.addColumn("column", "text_cabecalho", texts.text("cabecalhoUser" + i), i, 10, false);
        }
        //Tabela 

        list_users.forEach(function (user) {
            var row = [];
            row.push(user.id);
            var match_user = list_tableUsers.find(function (tbl) { return tbl.guid === user.guid });
            var user_name = match_user ? match_user.cn : '';
            row.push(user_name);

            var match_dep = list_departments.find(function (dep) { return dep.id === user.editor });
            console.log("match_Dep ", match_dep)
            var dep_name = match_dep ? match_dep.name : 'CARALHO';
            row.push(dep_name);

            var list_viewer = [];
            var viewerArray = Array.from(user.viewer)

            viewerArray.forEach(function (v) {
                var match_dep = list_departments.find(function (dep) { return dep.id === v.id });
                var dep_name = match_dep ? match_dep.name : 'CARALHO';
                list_viewer.push(dep_name);
            });

            row.push(list_viewer);
        
            ListView.addRow(i, row, "rowaction", "#A0A0A0", "#82CAE2");
        });
        scroll_container.add(list);
        t.add(scroll_container);

    }
    function makeDivAddUsers(t) {
        t.clear();
        var divMain = t.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;text-align:center", null, null))
        divMain.add(new innovaphone.ui1.Div(null, null, "divTitle")).add(new innovaphone.ui1.Node("h1", null, texts.text("labelUsersTitle"), null))

        divMain.add(new innovaphone.ui1.Node("for",null,texts.text("labelSelectUser"),"forSelectUser"));
        divMain.add(new innovaphone.ui1.Node("select",null,null,"SelectUsers").setAttribute("id","userSelect"));
        divMain.add(new innovaphone.ui1.Node("h2",null,texts.text("labelDepartments"),"h2Departments"))
        divMain.add(new innovaphone.ui1.Div(null,null,null).setAttribute("id","departmentsGrid"))
        //divMain.add(new innovaphone.ui1.Node("h3", null, texts.text("labelAddUser"), "divAddUsers"))
        //divMain.add(new innovaphone.ui1.Input(null, null, texts.text("labelAddUser"), 100, "text", "IptAddUsers").setAttribute("id", "IptAddUsers"))

        divMain.add(new innovaphone.ui1.Node("button", null, texts.text("labelAdd"), "btnAdd")).setAttribute("id","saveButton").addEvent("click", function () {

            var userId = document.getElementById('userSelect').value;
            var editorDepartments = getSelectedDepartments('editor');
            var viewerDepartments = getSelectedDepartments('viewer');
            app.send({ api: "admin", mt: "InsertUser", guid: userId, editor: editorDepartments, viewer: viewerDepartments  });
            waitConnection(t);
        });
        // Preencha o select de usuários e crie os checkboxes dos departamentos
        fillUserSelect();

        // Função para criar o grid
        createDepartmentsGrid();

    }

    function makeDivAddDepartments(t){
        t.clear();
        var divMain = t.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;text-align:center",null,null))
        divMain.add(new innovaphone.ui1.Div(null,null,"divTitle")).add(new innovaphone.ui1.Node("h1",null,texts.text("labelDepartsTitle"),null))

        divMain.add(new innovaphone.ui1.Node("h3", null, texts.text("labelAddDepart"), "divAddDepart"))
        divMain.add(new innovaphone.ui1.Input(null,null,texts.text("labelAddDepart"),100,"text","IptAddDepart").setAttribute("id","IptAddDepart"))
        divMain.add(new innovaphone.ui1.Node("button",null,texts.text("labelAdd"),"btnAddDepart")).addEvent("click", function () {
            
             var department = document.getElementById("IptAddDepart").value;
            app.send({ api: "admin", mt: "InsertDepartment", name: department});
            waitConnection(t);
        });
    }
    function fillUserSelect() {
        var userSelect = document.getElementById('userSelect');
      
        list_tableUsers.forEach(function (user) {
          var option = document.createElement('option');
          option.value = user.guid;
          option.text = user.cn;
          userSelect.appendChild(option);
        });
    }
    // Função para obter os departamentos selecionados para editor e visualizador
    function getSelectedDepartments(departmentType) {
        var checkboxes = document.getElementsByName(departmentType + 'Departments');
        var selectedDepartments = Array.prototype.slice.call(checkboxes)
          .filter(function (checkbox) {
            return checkbox.checked;
          })
          .map(function (checkbox) {
            return checkbox.value;
          });
      
        return selectedDepartments;
      }  
    // Função para criar o grid com as informações dos departamentos
    function createDepartmentsGrid() {
        var departmentsGrid = document.getElementById('departmentsGrid');
      
        // Criar a primeira linha para os cabeçalhos das colunas
        var headerRow = document.createElement('div');
        headerRow.classList.add('row');
      
        var nameCol = document.createElement('div');
        nameCol.classList.add('column');
        nameCol.textContent = 'Nome do Departamento';
      
        var editorCol = document.createElement('div');
        editorCol.classList.add('column');
        editorCol.textContent = 'Editor';
      
        var viewerCol = document.createElement('div');
        viewerCol.classList.add('column');
        viewerCol.textContent = 'Visualizador';
      
        headerRow.appendChild(nameCol);
        headerRow.appendChild(editorCol);
        headerRow.appendChild(viewerCol);
      
        departmentsGrid.appendChild(headerRow);
      
        // Criar as demais linhas com os dados dos departamentos
        list_departments.forEach(function (department) {
          var row = document.createElement('div');
          row.classList.add('row');
      
          var nameCol = document.createElement('div');
          nameCol.classList.add('column');
          nameCol.textContent = department.name;
      
          var editorCol = document.createElement('div');
          editorCol.classList.add('column');
          var editorCheckbox = document.createElement('input');
          editorCheckbox.type = 'checkbox';
          editorCheckbox.name = 'editorDepartments';
          editorCheckbox.value = department.id;
          editorCol.appendChild(editorCheckbox);
      
          var viewerCol = document.createElement('div');
          viewerCol.classList.add('column');
          var viewerCheckbox = document.createElement('input');
          viewerCheckbox.type = 'checkbox';
          viewerCheckbox.name = 'viewerDepartments';
          viewerCheckbox.value = department.id;
          viewerCol.appendChild(viewerCheckbox);
      
          row.appendChild(nameCol);
          row.appendChild(editorCol);
          row.appendChild(viewerCol);
      
          departmentsGrid.appendChild(row);
        });
      }  

      
}

Wecom.muralAdmin.prototype = innovaphone.ui1.nodePrototype;
