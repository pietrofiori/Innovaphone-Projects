
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolworkAdmin = Wecom.coolworkAdmin || function (start, args) {
    this.createNode("body");
    var that = this;
    var appdn = start.title;
    var UIuser;
    var leftbox;
    var dateStart; //agendamentos 
    var dateEnd;  // agendamentos 

    //var divPhones;  //db files variáveis

    var filesID = [];
    var ativos = [];  // vaiavel para controle dos devices de cada sala
    var imgBD; // db files variaveis
    var controlDB = false ; // db files variaveis
    var input; // db files variaveis
    var listbox; // db files variaveis
    var filesToUpload = []; // db files variaveis
    var phone_list = [] // todos os devices
    var listDeviceRoom = []; 
    var list_AllRoom = []
    var list_room = [];
    var list_RoomSchedule = []
    //var appointments = []
    var colDireita;
    var list_tableUsers = []
    var UIuserPicture;
    var divinputs; 
    var avatar = start.consumeApi("com.innovaphone.avatar");
    // var websocket = null

    // function send(obj) {
    //     if (obj && websocket) {
    //         var msg = JSON.stringify(obj);
    //         console.log("send to pbx (" + websocket.readyState + "): " + msg);
    //         websocket.send(msg);
    //         return true;
    //     }
    //     return false;
    // }

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

    var texts = new innovaphone.lib1.Languages(Wecom.coolworkTexts, start.lang);

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;
    waitConnection(that);
    var devicesApi; // revisar - importante 

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "admin", mt: "TableUsers" });
        app.send({ api: "admin", mt: "CheckAppointment" });
        controlDB = false
        UIuser = dn
        avatar = new innovaphone.Avatar(start, user, domain);
        UIuserPicture = avatar.url(user, 80, dn);
        devicesApi = start.consumeApi("com.innovaphone.devices");
        devicesApi.onmessage.attach(devicesApi_onmessage); // onmessage is called for responses from the API
        devicesApi.send({ mt: "GetPhones" }); // phonelist
        app.send({api:"admin", mt:"SelectAllRoom"})
         // revisar 04/10
        avatar = new innovaphone.Avatar(start, user, domain);
    }

    function devicesApi_onmessage(conn, obj) {
        console.log("devicesApi_onmessage: " + JSON.stringify(obj));
        if (obj.msg.mt == "GetPhonesResult") {
            var devices = obj.msg.phones;
            console.log("devicesApi_onmessage:GetPhonesResult " + JSON.stringify(devices));
            app.send({api:"admin", mt:"PhoneList", devices: devices})
        }
        
    }
    // setInterval(function(){
    //     devicesApi.send({ mt: "GetPhones" }); // controlador - revisar e fazer melhorias 
    // },5000)

    function app_message(obj) {
        if (obj.api === "admin" && obj.mt === "SelectDevicesResult") {
            phone_list = JSON.parse(obj.result)
        }
        if (obj.api === "admin" && obj.mt === "SelectAllRoomResult") {
            list_AllRoom = JSON.parse(obj.result)
            constructor(that)

        }
        if (obj.api === "admin" && obj.mt === "DeleteRoomSuccess") {
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if (obj.api === "admin" && obj.mt === "InsertRoomResult") {
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if (obj.api === "admin" && obj.mt === "SelectRoomResult") {
            list_room = JSON.parse(obj.rooms)
            list_RoomSchedule = JSON.parse(obj.schedules)
            listDeviceRoom = obj.dev
            makeDivRoom(_colDireita);            
        }
        if (obj.api === "admin" && obj.mt === "UpdateDevicesResult") {
            app.send({api:"admin", mt:"SelectAllRoom"})
        }
        if (obj.api == "admin" && obj.mt == "TableUsersResult") {
            list_tableUsers = JSON.parse(obj.result);
            
        }
        if (obj.api == "admin" && obj.mt == "CheckAppointmentResult") {
            appointments = obj.result;
        }
        if (obj.api == "admin" && obj.mt == "InsertAppointmentResult") {
            console.log("AGENDADO", JSON.parse(obj.result))
        }
    }
    function getDateNow() {
        // Cria uma nova data com a data e hora atuais em UTC
        var date = new Date();
        // Adiciona o deslocamento de GMT-3 às horas da data atual em UTC
        date.setUTCHours(date.getUTCHours() - 3);
    
        // Formata a data e hora em uma string ISO 8601 com o caractere "T"
        var dateString = date.toISOString();
    
        // Substitui o caractere "T" por um espaço
        //dateString = dateString.replace("T", " ");
    
        // Retorna a string no formato "AAAA-MM-DDTHH:mm:ss.sss"
        return dateString.slice(0, -5);
    }
    function constructor(t){
        controlDB = false
        t.clear()
        // col esquerda
        var colEsquerda = t.add(new innovaphone.ui1.Div(null, null, "colunaesquerda"));
        colEsquerda.setAttribute("id", "colesquerda")

        // col direita
        var colDireita = t.add(new innovaphone.ui1.Div(null, null, "colunadireita"));
        colDireita.setAttribute("id", "coldireita")


    
        var divList = colEsquerda.add(new innovaphone.ui1.Div(null, null, "divList"));
        var imglogo = divList.add(new innovaphone.ui1.Node("img", null, null, "logoimg").setAttribute("src", "./images/logo-wecom.png"));
        var spanreport = divList.add(new innovaphone.ui1.Div("font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", "WECOM", null));
        
        var user = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 10%; width: 100%; align-items: center; display: flex; border-bottom: 1px solid #4b545c"));
        var imguser = user.add(new innovaphone.ui1.Node("img", "max-height: 33px; position: absolute; left: 10px; border-radius: 50%;", null, null));
        imguser.setAttribute("src", UIuserPicture);
        var username = user.add(new innovaphone.ui1.Node("span", "font-size: 1.00rem; position: absolute; left: 43px; color:white; margin: 5px;", UIuser, null));
        username.setAttribute("id", "user");
        var liTables = colEsquerda.add(new innovaphone.ui1.Node("li",null, "Tabelas", "liTables").setAttribute("id", "liTables"));
        var appointments = liTables.add(new innovaphone.ui1.Node("li",null, "Tabela Agendamentos", "tableAppoint").setAttribute("id", "tableAppoint"));
        appointments.addEvent("click", function(){
            tableAppointments(colDireita)
        })

        var itens = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 20%; width: 100%; align-items: center; display: flex; justify-content: center; border-bottom: 1px solid #4b545c",texts.text("labelCreateRoom"),null))
        itens.addEvent("click",function(){
            
            makeDivCreateRoom(colDireita)
        })
        var labelRoom = colEsquerda.add(new innovaphone.ui1.Div("position: absolute; height: 10%; top: 30%; width: 100%; align-items: center; display: flex; justify-content:center;",texts.text("labelRooms") + "🔻" ,null))
        var rooms = colEsquerda.add(new innovaphone.ui1.Node("ul", "font-weight:bold; position: absolute; height: 20%; top: 40%; width: 100%; display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; padding:0", null, null).setAttribute("id", "roomList"));
        // parte de exibição das salas
         list_AllRoom.forEach(function(room) {
            var liRoom =  rooms.add(new innovaphone.ui1.Node("li", "width: 100%; align-items: center; display: flex;  border-bottom: 1px solid #4b545c; padding: 10px;", null, null).setAttribute("id",room.id).addEvent("click",function(){
                var clickedElement = document.getElementById(room.id)
                var clickedId = clickedElement.getAttribute("id")
                console.log('ID do elemento div clicado:', clickedId);
                app.send({api:"admin", mt:"SelectDevices"})
                app.send({ api: "admin", mt: "SelectRoom", id: clickedId });
            }));
            var imgRoom = liRoom.add(new innovaphone.ui1.Node("img", "width: 50px; height: 50px; margin-right: 10px;", null, null));
            imgRoom.setAttribute("src", room.img);
            liRoom.add(new innovaphone.ui1.Node("span", "font-weight: bold;", room.name, null));
            liRoom.add(new innovaphone.ui1.Node("div", "font-weight: bold; margin-left: 15px;", "🗑", "button").addEvent("click",function(){
                app.send({api: "admin" , mt: "DeleteRoom", id: room.id })
            }));
        });
        
        // col direita fora do list - box 

          ///////////////  SET PRESENCE ON INSERT  ///////////////////////////////
        //var divPresence = colDireita.add(new innovaphone.ui1.Div("width:100%;height:100%;text-align:center;display:flex;justify-content:center;align-items:center",null,null).setAttribute("id","userPresence"));
        // divPresence.add(new innovaphone.ui1.Node("span", "", "Presence PBX:", ""));
        // var inputPresence = divPresence.add(new innovaphone.ui1.Node("input", "", "", ""));
        // inputPresence.setAttribute("id", "pcinput").setAttribute("type", "text");
        // var pcInput = document.getElementById("pcinput")
        // var pcButton = divPresence.add(new innovaphone.ui1.Div(null, null, "button")
        //     .addText("Set Presence")
        //     .addEvent("click", function () { app.send({api: "admin", mt: "SetPresence", activity:"busy", note: pcInput.value})}, pcButton));
        ///////////////// END SET PRESENCE ON INSERT //////////////////////////
        var divAppointment = colDireita.add(new innovaphone.ui1.Div("width:100%;height:100%;text-align:center;display:flex;justify-content:center;flex-direction: column; align-items:center",null,null).setAttribute("id","userPresence"));
        divAppointment.add(new innovaphone.ui1.Node("span", "", "ID DA SALA:", ""));
        var inputRoom = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputRoom.setAttribute("id", "inputRoom").setAttribute("type", "text");
        var roomInput = document.getElementById("inputRoom");
        divAppointment.add(new innovaphone.ui1.Node("span", "", "HWID PHONE", ""));
        var inputPhone = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputPhone.setAttribute("id", "inputphone").setAttribute("type", "text");
        var phoneInput = document.getElementById("inputphone");
        divAppointment.add(new innovaphone.ui1.Node("span", "", "DATE START", ""));
        var inputDateStart = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputDateStart.setAttribute("id", "inputDateStart").setAttribute("type", "text");
        var dateStartInput = document.getElementById("inputDateStart")
        divAppointment.add(new innovaphone.ui1.Node("span", "", "DATE END", ""));
        var inputDateEnd = divAppointment.add(new innovaphone.ui1.Node("input", "", "", ""));
        inputDateEnd.setAttribute("id", "inputDateEnd").setAttribute("type", "text");
        var dateEndInput = document.getElementById("inputDateEnd")

        var pcButton = divAppointment.add(new innovaphone.ui1.Div(null, null, "button")
            .addText("Agendamento")
            .addEvent("click", function () { app.send({api: "admin", mt: "InsertAppointment", type:"hour", dateStart: dateStartInput.value, dateEnd: dateEndInput.value, device: phoneInput.value, deviceRoom: roomInput.value})}, pcButton));
        var rvButton = divAppointment.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Remove Telefone")
        .addEvent("click", function () { app.send({api: "admin", mt:"ReplicateUpdate"})}, rvButton));

        _colDireita = colDireita;
    }
    function tableAppointments(cRight){
        cRight.clear()
        var scrollcontainer = cRight.add((new innovaphone.ui1.Div(null, null, "list-box scrolltable")))
        scrollcontainer.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id","closewindow")).addEvent("click",function(){  // close 
            //t.rem(listbox)
            //waitConnection(that);
            //controlDB = false
            app.send({api:"admin", mt:"SelectAllRoom"})
            app.send({ api: "admin", mt: "CheckAppointment" });
        });
        var tableMain = scrollcontainer.add(new innovaphone.ui1.Node("table", null, null, "table").setAttribute("id", "local-table"));
        tableMain.add(new innovaphone.ui1.Node("th", null, "ID", null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelRoomName"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("periodType"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelScheduleDateStart"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelScheduleDateEnd"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelScheduleUser"), null));
        tableMain.add(new innovaphone.ui1.Node("th", null, texts.text("labelDevice"), null));

        console.log("FOREACH TABLE" + JSON.stringify(appointments))


        appointments.forEach(function (table) {
            var users = list_tableUsers.filter(function (user) {
                return table.user_guid === user.guid;
            })[0];
            console.log("dep" + JSON.stringify(table))

            var starDate = table.data_start;
            var endDate = table.data_end;
            var now = getDateNow();

            var roomName = table.name
            var typeRoom = table.type

            var html = `
                        <tr>
                        <td style="text-transform: capitalize; text-align: center;">${table.id}</td>
                        <td style="text-transform: capitalize; text-align: center;">${roomName}</td>
                        <td style="text-transform: capitalize; text-align: center;">${typeRoom}</td>
                        <td style="text-transform: capitalize; text-align: center;">${starDate}</td>
                        <td style="text-transform: capitalize; text-align: center;">${endDate}</td>
                        <td style="text-transform: capitalize; text-align: center;">${users.cn}</td>
                        <td style="text-transform: capitalize; text-align: center;">${table.device_id}</td>
                        </tr>
                    `;

            document.getElementById("local-table").innerHTML += html;
            // var userName = users.length > 0 ? users[0].cn : '';

            // if (post.deleted == null) {
            //     var postDel = texts.text("labelNo")
            // } else {
            //     var dateString = post.deleted;
            //     var date = new Date(dateString);
            //     var day = date.getDate();
            //     var month = date.getMonth() + 1;
            //     var year = date.getFullYear();
            //     var hours = date.getHours();
            //     var minutes = date.getMinutes();
            //     var formattedDate = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            //     var postDel = formattedDate
            // }
            // //var departDel = depart.deleted == null ? "Não" : formatDate();
            // if (post.deleted) {
            //     var statusPost = texts.text("labelPostDeleted");
            // } else if (starDate > now) {
            //     var statusPost = texts.text("labelPostFuture");
            // } else if (endDate < now) {
            //     var statusPost = texts.text("labelPostExpired");
            // } else {
            //     var statusPost = texts.text("labelPostActive");
            // }
            // if (post.date_start) {
            //     var dateString = post.date_start;
            //     var date = new Date(dateString);
            //     var day = date.getDate();
            //     var month = date.getMonth() + 1;
            //     var year = date.getFullYear();
            //     var hours = date.getHours();
            //     var minutes = date.getMinutes();
            //     var formattedDateStart = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            // }
            // if (post.date_end) {
            //     var dateString = post.date_end;
            //     var date = new Date(dateString);
            //     var day = date.getDate();
            //     var month = date.getMonth() + 1;
            //     var year = date.getFullYear();
            //     var hours = date.getHours();
            //     var minutes = date.getMinutes();
            //     var formattedDateEnd = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year + ' - ' + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            // }
        });
  
    }
    function formatDate(inputDate) {
        const date = new Date(inputDate);
    
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
    
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
        return formattedDate;
    }

    function makeDivRoom(t) {
        t.clear();
        list_room.forEach(function(room){
            //var insideDiv = t.add(new innovaphone.ui1.Div(null,null,"insideDiv"))
            listbox = t.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id",room.id))
            listbox.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id","closewindow"))
            listbox.add(new innovaphone.ui1.Node("h1","position:absolute;width:100%;top:5%; text-align:center",room.name))
            list_RoomSchedule.forEach(function(schedule){    // revisar isso na segunda 30/10
                var divDates = listbox.add(new innovaphone.ui1.Div("display:flex ; align-items:center ; width: 100%;position: absolute; justify-content: space-evenly;",null,null))
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;",texts.text("labelDateStart") + formatDate(schedule.data_start) ,null))
                divDates.add(new innovaphone.ui1.Div("font-weight:bold;",texts.text("labelDateEnd") + formatDate(schedule.data_end),null))
            })
            
            divPhones = listbox.add(new innovaphone.ui1.Div("position: absolute;width: 40%; height:70%; display: flex;left: 3%; justify-content: center;top: 20%;",null,null).setAttribute("id","divPhones"))
           var imgRoom =  listbox.add(new innovaphone.ui1.Node("div","position: absolute;width: 60%; left:40%; height:65%; display: flex;align-items: center; justify-content: center;top: 20%;",null,null).setAttribute("id","imgBD"))
           imgRoom.add(new innovaphone.ui1.Node("img","position:absolute;width:100%;height:100%").setAttribute("src",room.img))
           makePhoneButtons(phone_list);

           if(listDeviceRoom.length > 0){
            listDeviceRoom.forEach(function(dev){
                var userPicture = avatar.url(dev.sip ,80)
                var html = `<div style = "top: ${dev.topoffset + "px"}; left: ${dev.leftoffset + "px"}; position:absolute;" class="StatusPhone${dev.online} phoneButtons" id="${dev.hwid}">
                <div class="user-info">
                    <img class="imgProfile" src="${userPicture}">
                    <div class="user-name">${dev.cn}</div>
                </div>
                <div class="product-name">${dev.product}</div>
                 </div>    `
                
                 document.getElementById("imgBD").innerHTML += html
           })
           
           }
           var phoneElements = document.querySelectorAll(".phoneButtons");
           phoneElements.forEach(function (phoneElement) {
               phoneElement.draggable = true;
            
               phoneElement.addEventListener("dragstart",drag,true)

               
           });
           document.getElementById("closewindow").addEventListener("click",function(){  // close 
               //t.rem(listbox)
               waitConnection(that);
                controlDB = false
                app.send({api:"admin", mt:"SelectAllRoom"})

        })
        listbox.add(new innovaphone.ui1.Node("button", "position:absolute;top:90%;height:30px;width:90px;text-align:center;font-weight:bold;left:80%", "Salvar", null).addEvent("click", function () {
            console.log("Salvando");

            var activeDevices = document.querySelectorAll(".DeviceActive");
            var updatedDevices = [];

            activeDevices.forEach(function (dev) {
                updatedDevices.push({
                    hwid: dev.id, 
                    room_id: room.id, 
                    topoffset: parseFloat(dev.style.top), 
                    leftoffset: parseFloat(dev.style.left) 
                });
            });
            updatedDevices = updatedDevices.concat(listDeviceRoom)
            console.log("updated" + JSON.stringify(updatedDevices));
            app.send({ api: "admin", mt: "UpdateDeviceRoom", room: room.id, devices: updatedDevices });
        }));
    })      // listeners dentro ou fora do forEach()???
            document.getElementById("divPhones").addEventListener("dragover",allowDrop,true)
            document.getElementById("divPhones").addEventListener("drop",resetPhonesDrop,true)
            document.getElementById("imgBD").addEventListener("dragover",allowDrop,true)
         document.getElementById("imgBD").addEventListener("drop", function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text");
        var draggedElement = document.getElementById(data);
    
        // Obtenha as coordenadas do cursor do mouse no momento do evento de soltura
        var mouseX = ev.clientX;
        var mouseY = ev.clientY;
    
        // Obtenha as coordenadas da div "imgBD"
        var imgBD = document.getElementById("imgBD");
        var imgBDBounds = imgBD.getBoundingClientRect();
    
        // Obtenha as coordenadas do elemento arrastado em relação à div "imgBD"
        var draggedElementBounds = draggedElement.getBoundingClientRect();

        // Calcule as coordenadas finais onde o elemento deve ser posicionado
        var leftOffset = mouseX - (imgBDBounds.left + draggedElementBounds.width / 2);
        var topOffset = mouseY - (imgBDBounds.top + draggedElementBounds.height / 2);
    
        // Atualize a posição do elemento arrastado
        draggedElement.style.left = leftOffset + "px";
        draggedElement.style.top = topOffset + "px";
        
        draggedElement.classList.add("DeviceActive")
        
        // Defina o z-index para garantir que o elemento seja exibido na frente de outros elementos
        draggedElement.style.zIndex = "2000";
    
        // Defina a posição como absoluta para garantir o posicionamento correto
        draggedElement.style.position = "absolute";
            
        ativos = [];

        var activeDevices = document.querySelectorAll(".DeviceActive");
        
        if (activeDevices) {
            activeDevices.forEach(function(dev){
                var dispositivosAtivos = phone_list.filter(function (item) {
                    return item.hwid == dev.id;
                });
                ativos = ativos.concat(dispositivosAtivos);
            });

            console.log("ativos" + JSON.stringify(ativos));
        }
        // Anexe o elemento à div "imgBD"
        //draggedElement.setAttribute("id",room.id)
        imgBD.appendChild(draggedElement);
    })
    }

    function makeSchedule(t, optType) {
        t.clear();
        
        var btnSave = t.add(new innovaphone.ui1.Node("button", "width:90px;height:35px;display:flex;justify-content:center;align-items:center;top:1%;left:75%;position:absolute;", texts.text("labelCreateRoom"), null).setAttribute("id", "btnSaveRoom"))

        if (optType == "periodType") {
            var recurrentTimeDiv = t.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))

            var recurrentTimeDiv = t.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))

            t.add(new innovaphone.ui1.Div("position:absolute;top:10%", null, null).setAttribute("id", "calendar"))
            $(document).ready(function () {
                $.fullCalendar.locale('pt-br');
                // var id = $.urlParam('id');
                $('#calendar').fullCalendar('destroy');
                $('#calendar').fullCalendar({

                    header: {
                        left: 'today',
                        center: 'title , month', //agendaWeek,
                        right: 'prev,next'
                    },
                    buttonText: {
                        today: 'Hoje',
                        month: 'Mês',
                        week: 'Semana',
                        day: 'Dia'
                    },
                    monthNames: [
                        'Janeiro',
                        'Fevereiro',
                        'Março',
                        'Abril',
                        'Maio',
                        'Junho',
                        'Julho',
                        'Agosto',
                        'Setembro',
                        'Outubro',
                        'Novembro',
                        'Dezembro'
                    ],
                    defaultView: 'month',
                    slotDuration: '01:00:00',
                    minTime: '00:00:00',
                    maxTime: '24:00:00',
                    selectable: true,
                    selectLongPressDelay: 0,

                    selectHelper: true,
                    select: function (start, end, jsEvent, view) {
                        selectstart = start.format('YYYY-MM-DD[T]HH:mm:ss');
                        selectend = end.format('YYYY-MM-DD[T]HH:mm:ss');

                        if (view.name === 'month') {
                            console.log("View: Month");
                            var clickedElement = jsEvent.target;

                            console.log(" Elemento clicado " + clickedElement);
                            var clickedDate = start.format('YYYY-MM-DD');
                            console.log("Data do elemento clicado:", clickedDate);

                            var startHour = document.getElementById("startIpt").value;
                            var endHour = document.getElementById("endIpt").value;

                            var startHourParts = startHour.split(':');
                            var endHourParts = endHour.split(':');


                            var startHourParts = startHour.split(':');
                            var endHourParts = endHour.split(':');


                            var clickedDateWithoutSeconds = clickedDate.replace(/:00:00Z$/, '');


                            var dateStartISO = new Date(clickedDateWithoutSeconds);


                            dateStartISO.setHours(parseInt(startHourParts[0], 10));
                            dateStartISO.setMinutes(parseInt(startHourParts[1], 10));

                            var dateEndISO = new Date(clickedDateWithoutSeconds);


                            dateEndISO.setHours(parseInt(endHourParts[0], 10));
                            dateEndISO.setMinutes(parseInt(endHourParts[1], 10));


                            var dateStartISOString = dateStartISO.toISOString();
                            var dateEndISOString = dateEndISO.toISOString();

                            // REVISAR FORMATAÇÃO DE DATA
                            console.log("dateStart" + dateStartISOString + "dateEnd" + dateEndISOString);




                            // if (optType == "dayModule") {
                            //    
                            // } else {
                            //     $('#calendar').fullCalendar('changeView', 'agendaDay');
                            //     $('#calendar').fullCalendar('gotoDate', start);
                            // }

                            $('#calendar').fullCalendar('unselect');
                        }

                        else if (view.name === 'agendaWeek') {
                            console.log("View: " + "Week");

                            var clickedElement = jsEvent.target
                            console.log(" Elemento clicado " + clickedElement);
                            var clickedDate = start.format('YYYY-MM-DD');
                            console.log("Data do elemento clicado:", clickedDate);
                            var teste = false;

                        }
                        else {
                            console.log("View: " + "day");
                            // data inicio em iso string 
                            dateStart = "";
                            dateStart = new Date(start);
                            console.log("data de início " + dateStart.toISOString())
                            // data fim
                            dateEnd = "";
                            dateEnd = new Date(end);
                            console.log("data de término " + dateEnd.toISOString())


                        }
                    },
                    editable: false,
                    eventLimit: true,
                    events: [],
                    eventRender: function (event, element) { },

                    viewRender: function (view, element) {

                        if (view.name === 'month') {
                            console.log('View: Modo mês');
                        }
                        else if (view.name === 'agendaWeek') {
                            console.log("View Modo Semana")
                        }
                        else {
                            dayName = view.title
                            console.log("View title result = " + dayName)
                            var dateParts = dayName.split(" de "); // Divide a string em partes separadas por " de "
                            // Obtém os valores do dia, mês e ano
                            var day = String(dateParts[0]).padStart(2, '0');
                            var month = getMonthIndex(dateParts[1]);
                            var year = dateParts[2];

                            // Função auxiliar para obter o índice do mês com base no nome do mês
                            function getMonthIndex(monthName) {
                                var months = [
                                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                                ];
                                var index = months.indexOf(monthName) + 1;

                                return String(index).padStart(2, '0');
                            }
                            // setTimeout(function() {
                            //    UpdateDayAvailability(dataTime_start, dataTime_end, dataavailability, dataschedules, day, month, year)
                            // }, 100);
                        }
                    },
                });

            });

        }
        if (optType == "recurrentType") {
            var recurrentCalendar = t.add(new innovaphone.ui1.Div(null, null, "recurrentCalendar"));
            //Segundas feiras
            var mondayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
            mondayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelMondayDiv"), "day"))
            var columnRecurrentTimeDiv = mondayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))
            
            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))
            //var mondayChk = mondayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "mondayChk").setAttribute("id", "mondayChk"))

            //Terças feiras
            var tuesdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
            tuesdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labeltuesdayDiv"), "day"))
            var columnRecurrentTimeDiv = tuesdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))
            
            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))
            //var tuesdayChk = tuesdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "tuesdayChk").setAttribute("id", "tuesdayChk"))

            //Quartas feiras
            var wednesdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
            wednesdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelwednesdayDiv"), "day"))
            var columnRecurrentTimeDiv = wednesdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))
            //var wednesdayChk = wednesdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "wednesdayChk").setAttribute("id", "wednesdayChk"))

            //Quintas feiras
            var tursdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
            tursdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labeltursdayDiv"), "day"))
            var columnRecurrentTimeDiv = tursdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))
            
            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))
            //var tursdayChk = tursdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "tursdayChk").setAttribute("id", "tursdayChk"))

            //Sextas feiras
            var fridayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
            fridayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelfridayDiv"), "day"))
            var columnRecurrentTimeDiv = fridayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))
            //var fridayChk = fridayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "fridayChk").setAttribute("id", "fridayChk"))

            //Sabados
            var saturdayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
            saturdayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelsaturdayDiv"), "day"))
            var columnRecurrentTimeDiv = saturdayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))

            
            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))
            //var saturdayChk = saturdayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "saturdayChk").setAttribute("id", "saturdayChk"))

            //Domingos
            var sundayDiv = recurrentCalendar.add(new innovaphone.ui1.Div(null, null, "dayDiv"))
            sundayDiv.add(new innovaphone.ui1.Div(null, texts.text("labelsundayDiv"), "day"))
            var columnRecurrentTimeDiv = sundayDiv.add(new innovaphone.ui1.Div(null, null, "columnRecurrentTimeDiv"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divStartHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divStartHour"), "divStartHour"))
            var hourStart = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "startIpt").setAttribute("id", "startIpt"))

            var recurrentTimeDiv = columnRecurrentTimeDiv.add(new innovaphone.ui1.Div(null, null, "recurrentTimeDiv"))
            var divEndHour = recurrentTimeDiv.add(new innovaphone.ui1.Div(null, texts.text("divEndHour"), "divEndHour"))
            var hourEnd = recurrentTimeDiv.add(new innovaphone.ui1.Input(null, null, null, null, "time", "endIpt").setAttribute("id", "endIpt"))
            //var sundayChk = sundayDiv.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "sundayChk").setAttribute("id", "sundayChk"))
        }
        document.getElementById("btnSaveRoom").addEventListener("click", function () {
            var editor = [];
            var viewer = [];
            var selectType = document.getElementById("selectType");
            var optType = selectType.options[selectType.selectedIndex].id;
            var selectModule = document.getElementById("selectModule")
            var optModule = selectModule.options[selectModule.selectedIndex].id;

            var nameRoom = document.getElementById("iptRoomName").value
            var imagem = document.getElementById('imgBDFile')
            var srcDaImagem = imagem.src;

            if (nameRoom === "" || dateStart === "" || dateEnd === "") {
                console.log("Favor Completar todos os campos")
            } else {
                editor = [];
                viewer = [];

                list_tableUsers.forEach(function (user) {
                    var editorCheckbox = document.getElementById("editcheckbox_" + user.guid);
                    var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);

                    if (editorCheckbox.checked) {
                        editor.push(user.guid);
                    }

                    if (viewerCheckbox.checked) {
                        viewer.push(user.guid);
                    }
                });

                app.send({ api: "admin", mt: "InsertRoom", name: nameRoom, img: srcDaImagem, dateStart: dateStart, dateEnd: dateEnd, type: optType, schedule: optModule, editor: editor, viewer: viewer });

            }

        })
        
    }
    function makeDivCreateRoom(t){
        t.clear();
        filesID = [];  // para não excluir os arquivos corretos da DB files ; 
        console.log("FILES ID "  + filesID)
        //var insideDiv = t.add(new innovaphone.ui1.Div(null, null, "insideDiv"));
    
        var leftbox = t.add(new innovaphone.ui1.Node("div", null, null, "list-box scrolltable").setAttribute("id", "left-box"));
    
        leftbox.add(new innovaphone.ui1.Div(null, null, "closewindow").setAttribute("id", "closewindow"));
    
        var topButtons = leftbox.add(new innovaphone.ui1.Div("position:absolute;width:80%;", null, null).setAttribute("id", "top-bottons"));
        topButtons.add(new innovaphone.ui1.Node("ul", null, null, null)).add(new innovaphone.ui1.Node("a", "width: 100%;", texts.text("labelGeral"), null).setAttribute("id", "list-geral"));
        topButtons.add(new innovaphone.ui1.Node("ul", null, null, null)).add(new innovaphone.ui1.Node("a", "width: 100%;", texts.text("labelUsers"), null).setAttribute("id", "list-users"));
        topButtons.add(new innovaphone.ui1.Node("ul",null,null,null)).add(new innovaphone.ui1.Node("a","width: 100%;",texts.text("labelSchedule"),null).setAttribute("id","list-schedule"))

        divinputs = leftbox.add(new innovaphone.ui1.Div("position:absolute;top:20%;width:100%; height:80%; display: flex; justify-content: center;", null, null));
        var divGeral = divinputs.add(new innovaphone.ui1.Div("position: absolute; width:100%;height:100%; display: flex; flex-direction: column; ", null, null).setAttribute("id", "div-geral"));
        divGeral.add(new innovaphone.ui1.Div(null, texts.text("labelName"), null));
        divGeral.add(new innovaphone.ui1.Input("height: 13.5px; width: 130px; margin-right:100px; margin-left:10px;", null, null, 100, "text", null).setAttribute("id", "iptRoomName"));
        input = divGeral.add(new innovaphone.ui1.Node("input", "height:25px;", "", ""));
        input.setAttribute("id", "fileinput").setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.container.addEventListener('change', onSelectFile, false);

        divGeral.add(new innovaphone.ui1.Div(null, texts.text("labelTypeRoom"), null))
        var selectTypeRoom = divGeral.add(new innovaphone.ui1.Node("select","height:50px; width: 100px;",null,null).setAttribute("id","selectType"))
        selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("recurrentType"),null).setAttribute("id","recurrentType"))
        selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("periodType"),null).setAttribute("id","periodType"))
        
        divGeral.add(new innovaphone.ui1.Div(null, texts.text("labelModuleRoom"), null))
        var selectTypeRoom = divGeral.add(new innovaphone.ui1.Node("select","height:50px; width: 100px;",null,null).setAttribute("id","selectModule"))
        selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("hourModule"),null).setAttribute("id","hourModule"))
        selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("dayModule"),null).setAttribute("id","dayModule"))
        selectTypeRoom.add(new innovaphone.ui1.Node("option", null, texts.text("periodModule"),null).setAttribute("id","periodModule"))

        // divPhones = leftbox.add(new innovaphone.ui1.Div("position: absolute;width: 40%; height:70%; display: flex;left: 3%; justify-content: center;top: 20%;",null,null).setAttribute("id","divPhones"))
        imgBD = divGeral.add(new innovaphone.ui1.Node("div","position: absolute;width: 90%; height:47%; display: flex;align-items: center; justify-content: center; top: 50%;",null,null).setAttribute("id","imgBD"))
        app.sendSrc({ mt: "SqlInsert", statement: "insert-folder", args: { name: "myFolder" }} , folderAdded);

        var divUsers = divinputs.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;display:none ;justify-content:center;align-items:center").setAttribute("id","div-users"))
        var rightDiv = divUsers.add(new innovaphone.ui1.Node("div", null, null, "right-box scrolltable tableusers").setAttribute("id","list-box"))
        var userTable = createUsersDepartmentsGrid();
        rightDiv.add(userTable)
        
        var divScheduleInn = divinputs.add(new innovaphone.ui1.Div("position:absolute;width:100%;height:100%;display:none").setAttribute("id","div-schedule"))
        //var divStartHour = divSchedule.add(new innovaphone.ui1.Div(null,texts.text("labelHourOpening"),"divStartHour"))
        //var divEndHour = divSchedule.add(new innovaphone.ui1.Div(null,texts.text("labelHourClosing"),"divEndHour"))
        //var hourStart = divSchedule.add(new innovaphone.ui1.Input(null,null,null,null,"time","startIpt").setAttribute("id","startIpt"))
        //var hourEnd = divSchedule.add(new innovaphone.ui1.Input(null,null,null,null,"time","endIpt").setAttribute("id","endIpt"))
        //var btnSave = divSchedule.add(new innovaphone.ui1.Node("button","width:90px;height:35px;display:flex;justify-content:center;align-items:center;top:1%;left:75%;position:absolute;",texts.text("labelCreateRoom"),null).setAttribute("id","btnSaveRoom")) 
        //divSchedule.add(new innovaphone.ui1.Div("position:absolute;top:10%",null,null).setAttribute("id","calendar"))

        var divGeral = document.getElementById("div-geral");
        var divUsers = document.getElementById("div-users");
        var divSchedule = document.getElementById("div-schedule");

        document.getElementById("list-geral").addEventListener("click", function () {
        
            divGeral.style.display = "flex";
            divUsers.style.display = "none";
            divSchedule.style.display = "none";
        });

        document.getElementById("list-users").addEventListener("click", function () {
            
            divGeral.style.display = "none";
            divUsers.style.display = "flex";
            divSchedule.style.display = "none";
        });

        var a = document.getElementById("list-schedule");
        a.addEventListener("click", function () {
            divGeral.style.display = "none";
            divUsers.style.display = "none";
            divSchedule.style.display = "block";
    
            var selectType = document.getElementById("selectType");
            var optType = selectType.options[selectType.selectedIndex].id;
            // set checkbox conforme oq for selecionado
            makeSchedule(divScheduleInn, optType);
        });

        
        // setTimeout(function(){                 //arrumar e usar promisses para limpar o FilesID e dps fechar a janela
        //     filesID = [];                      // setTimeout muito coisa de Junior 
        //     filesID = "vazio";   
        // },2000)
        document.getElementById("closewindow").addEventListener("click",function(){
            // console.log("FILES ID "  + filesID)
            // if(filesID ){                                      
            //     console.log("FILES ID "  + filesID)
            //    deleteFile(filesID)
            // }
            setTimeout(function () {
                //insideDiv.clear()
                //t.rem(insideDiv)
                //controlDB = false // controle da DB files
            
                //app.send({ api: "admin", mt: "SelectAllRoom" })
            },500) // arrumar para carregar isso apos o termino da requisição 
            leftbox.clear()
            t.rem(leftbox)
            controlDB = false // controle da DB files

            app.send({ api: "admin", mt: "SelectAllRoom" })
            waitConnection(that);
        })
    


    }
    function createUsersDepartmentsGrid() {
        var usersListDiv = new innovaphone.ui1.Node("div", null, null, "userlist").setAttribute("id", "userslist")

        var table = usersListDiv.add(new innovaphone.ui1.Node("table", null, null, "table"))

        var headerRow = table.add(new innovaphone.ui1.Node("tr", null, null, "row"))

        var nameCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelUser"), "column"))

        var editorCol = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelEditor"), "column"))

        var viewerColTitle = headerRow.add(new innovaphone.ui1.Node("th", null, texts.text("labelViewer"), "column"))

        list_tableUsers.forEach(function (user) {

            // var userV = list_viewers_departments.filter(function (item) {
            //     return item.viewer_guid === user.guid;
            // })[0];
            // var userE = list_editors_departments.filter(function (item) {
            //     return item.editor_guid === user.guid;
            // })[0];

            var row = table.add(new innovaphone.ui1.Node("tr", null, null, "row"))

            var nameCol = row.add(new innovaphone.ui1.Node("td", null, user.cn, "column"))

            var editorCol = row.add(new innovaphone.ui1.Node("td", null, null, "column"))

            var viewerCol = row.add(new innovaphone.ui1.Node("td", null, null, "column"))


            var viewerCheckbox = viewerCol.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "checkbox viewercheckbox").setAttribute("id", "viewercheckbox_" + user.guid));
            viewerCheckbox.setAttribute("name", "viewerDepartments");
            viewerCheckbox.setAttribute("value", user.guid)

            var editorCheckbox = editorCol.add(new innovaphone.ui1.Input(null, null, null, null, "checkbox", "checkbox editorcheckbox").setAttribute("id", "editcheckbox_" + user.guid));
            editorCheckbox.setAttribute("name", "editorDepartments");
            editorCheckbox.setAttribute("value", user.guid)

            editorCheckbox.addEvent('click', function () {
                var viewerCheckbox = document.getElementById("viewercheckbox_" + user.guid);
                viewerCheckbox.checked = true


            });
            var marked = false
            viewerColTitle.addEvent('click', function () {
                //  console.log("Elemento viewerCol foi CLICADO")
                if (!marked) {
                    var _clickViewer = document.querySelectorAll('.viewercheckbox')
                    _clickViewer.forEach(function (view) {
                        view.checked = true
                    });
                    marked = true
                } else {
                    var _clickViewer = document.querySelectorAll('.viewercheckbox')
                    _clickViewer.forEach(function (view) {
                        view.checked = false
                    });
                    marked = false
                }


            });

        });


        //usersListDiv.add(table);
        return usersListDiv;
    }
   
    function allowDrop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
    }
    function resetPhonesDrop(ev){
        ev.stopPropagation();
        ev.preventDefault();

        var data = ev.dataTransfer.getData("text");
        var draggedElement = document.getElementById(data);
        var divPhones = document.getElementById("divPhones");

        document.getElementById("imgBD").removeChild(draggedElement)
        draggedElement.style.position = 'static'
        draggedElement.name = '';
        draggedElement.classList.remove("DeviceActive")
        draggedElement.classList.add("DeviceRemoved")
        
        // Remova o dispositivo da lista de dispositivos ativos
    var deviceId = draggedElement.id; // Supondo que o ID do dispositivo corresponda ao ID na lista de dispositivos ativos
    var indexToRemove = -1;

    for (var i = 0; i < ativos.length; i++) {
        if (ativos[i].hwid === deviceId) {
            indexToRemove = i;
            break;
        }
    }

    if (indexToRemove >= 0) {
        ativos.splice(indexToRemove, 1);
    }

    for (var i = 0; i < listDeviceRoom.length; i++) {
        if (listDeviceRoom[i].hwid === deviceId) {
            indexToRemove = i;
            break;
        }
    }

    if (indexToRemove >= 0) {
        listDeviceRoom.splice(indexToRemove, 1);
    }
    app.send({api:"admin", mt:"DeleteDeviceFromRoom" , hwid: String(deviceId)})

    console.log("DEVICES QUE ESTÃO ATIVOS" + JSON.stringify(listDeviceRoom))
        console.log("ativos after reset " + JSON.stringify(ativos))
        divPhones.appendChild(draggedElement);

    }
    function drag(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
        ev.dataTransfer.dropEffect = 'copy';
    }

    function makePhoneButtons(obj){
        
        obj.forEach(function (phone) {
            var userPicture = avatar.url(phone.sip ,80)
            // console.log("SIP DO CARA" + phone.sip)
            var phoneHTML = `
            <div class="StatusPhone${phone.online} phoneButtons" id="${phone.hwid}">
            <div class="user-info">
                <img class="imgProfile" src="${userPicture}">
                <div class="user-name">${phone.cn}</div>
            </div>
            <div class="product-name">${phone.product}</div>
             </div>
            `;
             document.getElementById("divPhones").innerHTML += phoneHTML;
        });
    }
    // construtor 
    // db files

    var folder = null;

    function onSelectFile() {
        // if(filesID){
        //     deleteFile(filesID)
        // }
            console.log("Evento do Input File")
            controlDB = true
            postFile(input.container.files[0]);
        
       
    }

    function startfileUpload() {
        if (filesToUpload.length > 0) {
            postFile(filesToUpload.pop());
        }
    }

    function postFile(file) {
        if (!file) return;
        //dialog.container.showModal();
        sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());

        fetch('?dbfiles=myfiles&folder=' + folder + '&name=' + encodeURI(file.name) + '&key=' + sessionKey,
            {
                method: 'POST',
                headers: {},
                body: file
            }).then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            }).then(data => {
                console.log("Success");
                //dialog.container.close();
                console.log(data);
                listFolder(folder);
                startfileUpload();
            }).catch(error => {
                //dialog.container.close();
                if (typeof error.json === "function") {
                    error.json().then(jsonError => {
                        console.log("JSON error from API");
                        console.log(jsonError);
                    }).catch(genericError => {
                        console.log("Generic error from API");
                        console.log(error.statusText);
                    });
                } else {
                    console.log("Fetch error");
                    console.log(error);
                }
            });
    }

    function deleteFile(id) {
        controlDB = false
        if (!id) return;
       // dialog.container.showModal();
        sessionKey = innovaphone.crypto.sha256("generic-dbfiles:" + app.key());

        fetch('?dbfiles=myfiles&folder=' + folder + '&del=' + id + '&key=' + sessionKey,
            {
                method: 'POST',
                headers: {}
            }).then(response => {
                if (!response.ok) {
                    return Promise.reject(response);
                }
                return response.json();
            }).then(data => {
                console.log("Success");
                //dialog.container.close();
                console.log(data);
                document.getElementById("imgBD").innerHTML = '';
                listFolder(folder);
            }).catch(error => {
                //dialog.container.close();
                if (typeof error.json === "function") {
                    error.json().then(jsonError => {
                        console.log("JSON error from API");
                        console.log(jsonError);
                    }).catch(genericError => {
                        console.log("Generic error from API");
                        console.log(error.statusText);
                    });
                } else {
                    console.log("Fetch error");
                    console.log(error);
                }
            });
    }
    function insertRoom(msg){
        console.log("InsertRoom" + msg)
        app.send({api: "admin" , mt: "InsertRoomSchedule" })
    }
    function folderAdded(msg) {
        console.log("FOLDER" + msg)
        folder = msg.id;
        listFolder(folder);
    }

    function listFolder(id) {
       // fileList.clear();
        app.sendSrcMore({ mt: "DbFilesList", name: "myfiles", folder: id }, listFolderResult);
    }

    function listFolderResult(msg) {
        if ("files" in msg && msg.files.length > 0) {
            msg.files.forEach(file => addFileToFileList(file));
        }
    }

    function addFileToFileList(file) {
        filesID = file.id

        if(controlDB){
            document.getElementById("imgBD").innerHTML = ''
            var imgFile = imgBD.add(new innovaphone.ui1.Node("img","width:100%;height:200px",null,null).setAttribute("id","imgBDFile"))
            imgFile.setAttribute("src",start.originalUrl + "/files/" + file.id)
            var delButton = new innovaphone.ui1.Div(null, null, "button")
            .addText("\uD83D\uDDD1")
            .addEvent("click", function () { deleteFile(file.id) }, delButton);
        imgBD.add(delButton)
        }else{
            document.getElementById("imgBD").innerHTML = ''
        }
    }
    //Função para apresentar Loader, chamado quando o App está desconectado ou aguardando algum processo.
    function waitConnection(div) {
        div.clear();
        var div1 = div.add(new innovaphone.ui1.Div(null, null, "preloader").setAttribute("id", "preloader"))
        var div2 = div1.add(new innovaphone.ui1.Div(null, null, "inner"))
        var div3 = div2.add(new innovaphone.ui1.Div(null, null, "loading"))
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
        div3.add(new innovaphone.ui1.Node("span", null, null, "circle"));
    }
}

Wecom.coolworkAdmin.prototype = innovaphone.ui1.nodePrototype;
