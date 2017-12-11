function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function TableFromArray(cl, caption, header, data){
    var html = '<table class="' + cl + '">';
    html += '<caption>' + caption + '</caption>';
    html += '<tr>';
    //Header
    for(var i=0;i<header.length;i++){
        html += '<th>' + header[i] + '</th>';
    }
    html += '</tr>';

    //Data
    for(var i=0;i<data.length;i++){
        html += '<tr>';
        for(var j=0;j<data[i].length;j++){
            html += '<td>' + data[i][j] + '</td>';
        }
        html += '</tr>';
    }

    html += '</table>';
    return html;

}

function SetResults(id, inputs, expected, outputs){
    var n = document.getElementById(id);
    var header = ["I1","I0","T","E","S"];
    var data = [];

    for(var i=0;i<outputs.length;i++){
        data[i] = [];

        //Inputs
        var sInputs = '';
        for(var j=0;j<inputs[i].length;j++){
            data[i][j] = inputs[i][j];
            sInputs += inputs[i][j] + ',';
        }

        sInputs = sInputs.slice(0,-1);

        var nButton = '<input type="button" onClick="TestNetwork(\'' + id + '\',gNetworks[\'' + id + '\'], [' + sInputs + '])" />';

        data[i][inputs[i].length] = nButton;

        var offset = inputs[i].length + 1;

        //Expected
        for(var j=0;j<outputs[i].length;j++){
            data[i][offset+j] = expected[i][j].toFixed(2);
        }

        offset += outputs[i].length;

        //Outputs
         for(var j=0;j<outputs[i].length;j++){
            data[i][offset + j] = outputs[i][j].toFixed(2);
        }
    }

    n.innerHTML = TableFromArray('results', id.toUpperCase(), header,data);
}

function AddCanvas(id, width, height){
    var n = document.getElementById(id);
    var c = '<canvas id="canvas' + id + '" width="' + width + '" height="' + height + '" style="border:1px solid #000000;"></canvas>';
    n.innerHTML += c;
}