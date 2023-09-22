
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.coolwork = Wecom.coolwork || function (start, args) {
    this.createNode("body");
    var that = this;

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
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    var filesToUpload = [];

    var dialog = this.add(new innovaphone.ui1.Node("dialog", "", "", ""));
    dialog.add(new innovaphone.ui1.Node("span", "", "Processing...", ""));

    var dropArea = this.add(new innovaphone.ui1.Div("border: 5px solid blue; width: 200px; height: 100px;", "", "droparea"));
    dropArea.add(new innovaphone.ui1.Node("p", "", "Drag one or more PDF files to this drop zone.", ""));
    dropArea.container.addEventListener('drop', dropHandler, true);
    dropArea.container.addEventListener('dragover', dragOverHandler, true);

    function dropHandler(ev) {
        console.log("File(s) dropped");

        // Prevent default behavior (Prevent file from being opened)
        ev.stopPropagation();
        ev.preventDefault();

        if (ev.dataTransfer && ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...ev.dataTransfer.items].forEach((item) => {
                // If dropped items aren't files, reject them
                if (item.kind === "file") {
                    const file = item.getAsFile(); // If the drag data item is a file, a File object is returned; otherwise null is returned.
                    filesToUpload.push(file);
                }
            });
            startfileUpload();
        } else {
            // Use DataTransfer interface to access the file(s)
            [...ev.dataTransfer.files].forEach((file, i) => {
                console.log(`... file[${i}].name = ${file.name}`);
                filesToUpload.push(file);
            });
            startfileUpload();
        }
    }

    function dragOverHandler(ev) {
        console.log("File(s) in drop zone");

        // Prevent default behavior (Prevent file from being opened)
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
        //dataTransfer e dropEffect propriedades nativas do JS 
        //drag and drop API nativas do JS
    }

    var input = this.add(new innovaphone.ui1.Node("input", "", "", ""));
    input.setAttribute("id", "fileinput").setAttribute("type", "file");
    input.setAttribute("accept", "application/pdf");
    input.container.addEventListener('change', onSelectFile, false);

    var fileList = this.add(new innovaphone.ui1.Div("", "", "filelist"));

    var folder = null;


    this.add(new innovaphone.ui1.Node("span", "", "MAC do Telefone:", ""));

    var inputHW = this.add(new innovaphone.ui1.Node("input", "", "", ""));
    inputHW.setAttribute("id", "hwinput").setAttribute("type", "text");

    var loginButton = this.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Login")
        .addEvent("click", function () { app.send({ api: "user", mt: "LoginPhone", hw: inputHW.value }); }, loginButton));
    var logoutButton = this.add(new innovaphone.ui1.Div(null, null, "button")
        .addText("Logout")
        .addEvent("click", function () { app.send({ api: "user", mt: "LogoutPhone", hw: inputHW.value });}, logoutButton));

    function app_connected(domain, user, dn, appdomain) {
        app.sendSrc({ mt: "SqlInsert", statement: "insert-folder", args: { name: "myFolder" } }, folderAdded);
    }

    function app_message(obj) {
        if (obj.api === "user" && obj.mt === "UserMessageResult") {
            // placeholder for JsonApi handling
        }
    }

    function onSelectFile() {
        postFile(input.container.files[0]);
    }

    function startfileUpload() {
        if (filesToUpload.length > 0) {
            postFile(filesToUpload.pop());
        }else{
            console.log("Sem Arquivos,favor adicionar algum!")
        }
    }

    function postFile(file) {
        if (!file) return; // se n conter nada , encerra a função 
        dialog.container.showModal();
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
                dialog.container.close();
                console.log(data);
                listFolder(folder);
                startfileUpload();
            }).catch(error => {
                dialog.container.close();
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
        if (!id) return;
        dialog.container.showModal();
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
                dialog.container.close();
                console.log(data);
                listFolder(folder);
            }).catch(error => {
                dialog.container.close();
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
    function folderAdded(msg) {
        folder = msg.id;
        listFolder(folder);
    }

    function listFolder(id) {
        fileList.clear();
        app.sendSrcMore({ mt: "DbFilesList", name: "myfiles", folder: id }, listFolderResult);
    }

    function listFolderResult(msg) {
        if ("files" in msg && msg.files.length > 0) {
            msg.files.forEach(file => addFileToFileList(file));
        }
    }

    function addFileToFileList(file) {
        var entry = fileList.add(new innovaphone.ui1.Div("", "", "fileentry"));
        entry.add(new innovaphone.ui1.Div("", "", "fileid").addText(file.id));

        var nameContainer = entry.add(new innovaphone.ui1.Div("", "", "filename"));
        nameContainer.add(new innovaphone.ui1.Node("span", "", file.name, ""));

        var sizeContainer = entry.add(new innovaphone.ui1.Div("", "", "filesize"));
        sizeContainer.add(new innovaphone.ui1.Node("span", "", formatBytes(file.size), ""));

        // in-session download link, available only as long the user is logged in
        var linkcontainerPrivate = entry.add(new innovaphone.ui1.Div("", "", "private"));
        var linkPrivate = linkcontainerPrivate.add(new innovaphone.ui1.Node("a", "", "", "").addText("Private Link"));
        linkPrivate.setAttribute("href", file.url);
        linkPrivate.setAttribute("target", "_blank");

        var iframetest = fileList.add(new innovaphone.ui1.Node("iframe","position:absolute; width: 50% ; height: 40%",null,null))
        iframetest.setAttribute("src",file.url)
        // share file download link, avilable via URL
        var linkcontainerPublic = entry.add(new innovaphone.ui1.Div("", "", "public"));
        var linkPublic = linkcontainerPublic.add(new innovaphone.ui1.Node("a", "", "", "").addText("Public Link"));
        linkPublic.setAttribute("href", start.originalUrl + "/files/" + file.id);
        linkPublic.setAttribute("target", "_blank");

        var delButton = entry.add(new innovaphone.ui1.Div(null, null, "button")
            .addText("\uD83D\uDDD1")
            .addEvent("click", function () { deleteFile(file.id) }, delButton));
    }

    function addLine(text) {
        fileList.add(new innovaphone.ui1.Div("", "", "")).addText(text);
    }

    function formatBytes(bytes) {
        if (bytes === 0) return "0 Bytes";
        const units = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const k = 1024;
        const i = Math.max(0, Math.floor(Math.log(bytes) / Math.log(k)) - 1);
        const size = Math.round(bytes / Math.pow(k, i));
        const numberWithPeriods = size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return numberWithPeriods + " " + units[i];
    }
}

Wecom.coolwork.prototype = innovaphone.ui1.nodePrototype;
