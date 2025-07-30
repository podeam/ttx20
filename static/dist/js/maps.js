let map, view, graphicsLayer, graphicsLayerColor;
function __init__(){
    sessionStorage.removeItem("buses");
    sessionStorage.removeItem("buses2");
    sessionStorage.removeItem("buses3");
    sessionStorage.removeItem("events");
    sessionStorage.removeItem("generators");
    sessionStorage.removeItem("lines");
    sessionStorage.removeItem("lostload");
    sessionStorage.removeItem("price");
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/GraphicsLayer",
      "esri/layers/FeatureLayer",
      "esri/Graphic", 
      "esri/core/reactiveUtils"
    ], function(Map, MapView, GraphicsLayer, FeatureLayer, Graphic, reactiveUtils) {
        map = new Map({
            basemap: "dark-gray"
            });
    
        view = new MapView({
            container: "myMap",
            map: map,
            center: [15, 55], // Longitude, latitude
            zoom: 4
        });
        graphicsLayer = new GraphicsLayer();
        graphicsLayer.popupTemplate = null; // Disables popups for this layer
    
        map.add(graphicsLayer);
        reactiveUtils
            .when(
              () => view.popup?.visible,
              () => {
                reactiveUtils.whenOnce(() => !view.popup.visible).then(() => {
                    console.log("Popup closed after opened");
                    $('#singleGeneratorWrapper').hide();
                    }
                );
              }
            )
        view.popup.autoOpenEnabled = false; // Disables popups globally
        view.on("click", function(event) {
            view.hitTest(event).then(function(response) {
            // Check if a graphic was clicked
            const graphic = response.results[0]?.graphic;
            if (graphic) {
                if(graphic.attributes && graphic.attributes.type === 'bus'){
                    getSingleBus(graphic.attributes.title, graphic.attributes.value);
                    }
                }
            });
        });
        view.on("pointer-move", function (event) { 
             view.hitTest(event).then(function (response) { 
               if (response.results.length) { 
                const graphic = response.results[0]?.graphic;
                if(graphic && graphic.attributes && graphic.attributes.type === 'line'){
                    //console.log("Graphic over:", graphic);
                    //console.log("Graphic over:", graphic.attributes);
                    showDetailsLine(graphic.attributes);
                    }
                }
             }); 
           });
        });
}
function addBusToMap(long, lat, name, description, value, lostloadvalue){
    //console.log(value);
    let color;
    if (value > 0){
        color = 'green';
    }
    else{
        color = 'orange';
    }
    if(parseFloat(lostloadvalue) > 0){
        color = 'red';
    }
    w = Math.abs(value) / 200;
    if( w < 1 ) { w = 1; }

    require(["esri/Graphic", "esri/layers/GraphicsLayer", "esri/core/reactiveUtils"], (Graphic, GraphicsLayer, reactiveUtils) => {
    const point = {
        //Create a point
        type: "point",
        longitude: long,
        latitude: lat
        };
    const simpleMarkerSymbol = {
        type: "simple-marker",
        color: color, //[226, 119, 40], // Orange
        outline: {
            color: color, // [255, 255, 255], // White
            width: w
        }
    };
    /*
    const singleBus = {
        title: name,
        id: name
    };
    const popupTemplate = {
        title: name,
        content: 'Power now: ' + value + ' MW',
        actions: [singleBus]
        };
    */
    const myBus = {
        type: 'bus',
        title: name,
        description: description,
        value: value
    }
    const pointGraphic = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol,
        /*popupTemplate: popupTemplate,*/
        attributes: myBus
        });
    graphicsLayer.add(pointGraphic);
    /*
    reactiveUtils
        .on(
            () => view.popup,
            "trigger-action",
            (event) => {
                if (event.action.id === name) {
                    str = getSingleBus(name);
                }
            })
            */
        })
}
function addLineToMap(pointA, pointB, color, name, name2, description, wl, type = 'line'){
    //console.log(name  + ' ' + name2 + ' ' + description + ' ' + wl);
    require(["esri/Graphic", "esri/layers/GraphicsLayer", "esri/core/reactiveUtils", "esri/symbols/CIMSymbol"], (Graphic, GraphicsLayer, reactiveUtils, CIMSymbol) => {
        //const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);
        // Create a line geometry
        const polyline = {
            type: "polyline",
            paths: [pointA, pointB]
            };
        // Step 4: Define the SimpleLineSymbol with arrow marker
        const lineSymbol = {
            type: "simple-line", // Symbol type
            color: color,       // Line color
            width: wl,            // Line width
            marker: {
                type: "line-marker",  // Must be "line-marker" for autocasting
                placement: "end",  // Arrow placement: "start", "end", "center", or "both"
                size: 10           // Arrow size
            }
        };
        //****************************************************************************************************************************
        const myLine = {
            type: type,
            title: name,
            description: description
        }
        const singleLine = {
            title: 'Attack',
            id: name2
        };
        const popupTemplate = {
            title: name,
            //content: description,
            content: function (feature, name2) {
                console.log(singleLine.id);
                // Create a container element
                const container = document.createElement("div");
                const containerInt = document.createElement("div");
                containerInt.innerHTML = myLine.description;
                /*
                const myLabel = document.createElement("label");
                myLabel.innerHTML = "<b>Date of attack:</b> ";
                const inputField = document.createElement("input");
                inputField.id = singleLine.id;
                inputField.type = "date";
                inputField.placeholder = "Enter new value";
                inputField.style.marginBottom = "8px";
                */
                container.appendChild(containerInt);
                /*
                container.appendChild(myLabel);
                container.appendChild(inputField);
                */
                return container;
            },
            actions: [singleLine]
            };
        const polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol,
            popupTemplate: popupTemplate,
            attributes: myLine
            });
        graphicsLayer.add(polylineGraphic);
        reactiveUtils
            .on(
                () => view.popup,
                "trigger-action",
                (event) => {
                    if (event.action.id === name2) {
                        str = getSingleLine(name2, type);
                    }
                });
        });
}
function addLineToMapNew(pointA, pointB, color, name, name2, description, wl, type = 'line'){
    require(["esri/Graphic", "esri/layers/GraphicsLayer", "esri/core/reactiveUtils", "esri/symbols/CIMSymbol"], (Graphic, GraphicsLayer, reactiveUtils, CIMSymbol) => {
        //console.log(typeof(pointA));
        //console.log(pointA + ' ' + pointB);
        mypaths = [pointA, pointB]
        //console.log(mypaths);
        //mypaths = [[25.0237, 58.5975],[24.1050, 56.9462]];
        map.add(graphicsLayer);
        // Create a line geometry
        const polyline = {
            type: "polyline",
            paths: [mypaths]
            };
        const lineSymbol = {
            type: "simple-line", // Symbol type
            color: color,       // Line color
            width: wl,            // Line width
            marker: {
                type: "line-marker",
                placement: "end",
                size: 15
            }
        };
        const myLine = {
            type: 'line',
            title: name,
            description: description
        }
        const polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol,
            attributes: myLine
            });
        graphicsLayer.add(polylineGraphic);
        });
}
function addPoligonToMapNew(polygon_ring, busname, color){
   require(["esri/Graphic"], (Graphic) => {
        var polygon = {
                name: busname,
                type: "polygon",
                rings: polygon_ring
            };
            var polygonSymbol = {
                type: "simple-fill",
                color: color,
                outline: {
                    color: color,
                    width: 2
                }
            };
            var polygonGraphic = new Graphic({
                geometry: polygon,
                symbol: polygonSymbol
            });
            graphicsLayer.add(polygonGraphic);
            });
    }
function addPoligonToMapNuts(polygon_ring, name, color, value, label){
    require(["esri/Graphic"], (Graphic) => {
        var polygon = {
                name: name,
                type: "polygon",
                rings: polygon_ring,
            };
        var polygonSymbol = {
            type: "simple-fill",
            color: color,
            outline: {
                color: [227, 139, 79, 0.8], // RGBA color (orange)
                width: 1
            }
        };
        var polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: polygonSymbol,
            attributes: {
                Name: name,
                Info: label + " " + value
            },
            popupTemplate: {
                title: "{Name}",
                content: "{Info}"
            }
        });
        
        graphicsLayer.add(polygonGraphic);
        view.on("click", function(event) {
            view.hitTest(event).then(function(response) {
                var results = response.results;
                if (results.length > 0) {
                    var graphic = results[0].graphic;
                    if (graphic) {
                        view.popup.open({
                            title: graphic.getAttribute("Name"),
                            content: graphic.getAttribute("Info"),
                            location: event.mapPoint
                        });
                    }
                }
            });
        });
        });
    }
function drawLines(lines, type){
    removeColorCountry();
    clearGraphics();
    lines.forEach(item => {
        //console.log(item);
        countries = ["EE", "LV", "LT"];
        p1 = item.bus0.substr(0,2);
        p2 = item.bus1.substr(0,2);
        if((countries.indexOf(p1) !== -1) || (countries.indexOf(p2) !== -1) || (p1 != p2)){
            d = true;
        }
        else{
            d = false;
        }
        /**********************************/
        bus0 = item.bus0_coordinates;
        bus1 = item.bus1_coordinates;
        //*********************************inversione dei punti per il segno
        if(item.line_flows > 0){
            pointA = [bus0.x, bus0.y];
            pointB = [bus1.x, bus1.y];
        }
        else{
            pointA = [bus1.x, bus1.y];
            pointB = [bus0.x, bus0.y];
        }
        coords = calculateOffsetPoint(pointA, pointB, 0.1);
        pointB = [coords[0], coords[1]];
        //console.log(pointB);

        name2 = item.line_name;
        //coordinates = [pointA, pointB];
        //console.log(pointA);
        //console.log(pointB);
        /*
        color =  [226, 119, 40]; // Orange
        if(type == 'peak') {
            if(item.peak_utilization > 0.70){
                color = 'red';
            }
        }
        if(type == 'average') {
            if ( Math.abs(item.average_utilization) > 0.50){
                color = 'red';
            }
            if ( Math.abs(item.average_utilization) == 0){
                color = 'gray';
            }
        }
        */
        percentage = ((Math.abs(item.average_utilization))*100);
        color = getColorByPercentage(percentage);

        wl = Math.round(item.capacity/1000);
        if(wl < 1){ wl = 1; }
        l = Math.round(item.length);
        c = Math.round(item.capacity);
        a = (Math.round(Math.abs(item.average_utilization) * 100));
        p = (Math.round(item.peak_utilization * 100));
        line_flow = Math.round(item.line_flows);
        line_flow = Math.abs(line_flow);
        const name = `<b>${item.bus0} - ${item.bus1}</b> ${name2}`;
        //const description = `<b>Power: ${line_flow} MW</b><br><b>Length: ${l} Km.</b><br><b>Capacity: ${c} MW.</b><br><b>Average: ${a}%</b><br><b>Peak: ${p}%</b><br><input type="date" id="${name2}">`;
        const description = `<b>Power: ${line_flow} MW</b><br><b>Length: ${l} Km.</b><br><b>Capacity: ${c} MW.</b><br><b>Average: ${a}%</b><br><b>Peak: ${p}%</b>`;
        if(d){
            addLineToMap(pointA, pointB, color, name, name2, description, wl);
        }
    });
}
function drawLines2(lines, index){
    graphicsLayer.removeAll();
    const buses = JSON.parse(sessionStorage.getItem("buses"));
    const generators = JSON.parse(sessionStorage.getItem("generators"));
    const buses2 = JSON.parse(sessionStorage.getItem("buses2"));
    const buses3 = JSON.parse(sessionStorage.getItem("buses3"));
    const lostload = JSON.parse(sessionStorage.getItem("lostload"));
    drawGenerators(buses, generators, buses2, buses3, lostload);
    countries = ["EE", "LV", "LT"];
    lines.forEach(item => {
        //console.log(item);
        p1 = item.bus0.substr(0,2);
        p2 = item.bus1.substr(0,2);
        if((countries.indexOf(p1) !== -1) || (countries.indexOf(p2) !== -1) || (p1 != p2)){
            d = true;
        }
        else{
            d = false;
        }
        
        bus0 = item.bus0_coordinates;
        bus1 = item.bus1_coordinates;
        //*********************************inversione dei punti per il segno
        if(item.line_flows > 0){
            pointA = [bus0.x, bus0.y];
            pointB = [bus1.x, bus1.y];
        }
        else{
            pointA = [bus1.x, bus1.y];
            pointB = [bus0.x, bus0.y];
        }
        coords = calculateOffsetPoint(pointA, pointB, 0.1);
        pointB = [coords[0], coords[1]];
        //console.log(pointB);

        name2 = item.line_name;
        //coordinates = [pointA, pointB];
        //console.log(pointA);
        //console.log(pointB);
        color =  [226, 119, 40]; // Orange
        value = item.line_flows_t[index];
        //test = item.capacity/value;
        //test = ((100*value)/item.capacity)/100;

/*
        if ( Math.abs(test) > 0.50){
            color = 'red';
        }
        if ( Math.abs(test) == 0){
            color = 'gray';
        }
*/
        percentage = ((100*value)/item.capacity);
        color = getColorByPercentage(percentage);
        if ( Math.abs(percentage) == 0){
            color = 'gray';
        }
        if(name2 == '306'){
            console.log(value);
            console.log(item.capacity);
            console.log(percentage);
        }


        wl = Math.round(item.capacity/1000);
        if(wl < 1){ wl = 1; }
        l = Math.round(item.length);
        c = Math.round(item.capacity);
        a = (Math.round(Math.abs(item.average_utilization) * 100));
        p = (Math.round(item.peak_utilization * 100));
        line_flow = Math.round(item.line_flows);
        line_flow = Math.abs(line_flow);
        const name = `<b>${item.bus0} - ${item.bus1}</b> ${name2}`;
        //const description = `<b>Power: ${line_flow} MW</b><br><b>Length: ${l} Km.</b><br><b>Capacity: ${c} MW.</b><br><b>Average: ${a}%</b><br><b>Peak: ${p}%</b><br><input type="date" id="${name2}">`;
        const description = `<b>Power: ${line_flow} MW</b><br><b>Length: ${l} Km.</b><br><b>Capacity: ${c} MW.</b><br><b>Average: ${a}%</b><br><b>Peak: ${p}%</b>`;
        if(d){
            addLineToMap(pointA, pointB, color, name, name2, description, wl);
        }
    });
}
function drawLinks(links1, links2, type){
    //console.log(links1);
    //console.log(links2);
    links1.forEach(item => {
        //console.log(item);
        bus0 = item.bus0;
        bus1 = item.bus1;
        points = item.geometry;
        name2 = item.Link;
        l = Math.round(item.length);
        //console.log(points);
        const name = bus0 + ' ' + bus1;
        let color =  [226, 119, 40]; // Orange
        
        description = '';
        links2.forEach(element => {
            if(item.Link == element.line_name){
                description = 'Carrier: ' + item.carrier + '<br>' + l + ' Km.<br>' + Math.round(element.line_flows) + '<br>' + item.Link;
                //console.log(element.line_flows);
                //console.log(parseFloat(item.x) + ' ' + parseFloat(item.y));
                //console.log(parseFloat(item.x_bus1) + ' ' + parseFloat(item.y_bus1));
                if(element.line_flows > 0){
                    pointA = [parseFloat(item.x), parseFloat(item.y)];
                    pointB = [parseFloat(item.x_bus1), parseFloat(item.y_bus1)];
                }
                else{
                    pointA = [parseFloat(item.x_bus1), parseFloat(item.y_bus1)];
                    pointB = [parseFloat(item.x), parseFloat(item.y)];
                }
                //console.log(pointA);
                //console.log(pointB);
                /*
                color =  [226, 119, 40]; // Orange
                if ( Math.abs(element.line_flows) > 0.50){
                    color = 'red';
                }
                if ( Math.abs(element.line_flows) == 0){
                    color = 'gray';
                }
                */
                percentage = (Math.abs(element.line_flows)/720);
                //item.p_nom:100=percentage:x
                percentage = Math.round((percentage*100)/item.p_nom);
                //console.log(percentage);
                //percentage = (Math.abs(element.line_flows)*100);
                color = getColorByPercentage(percentage);
                //console.log(color);
                if ( Math.abs(percentage) == 0){
                    color = 'gray';
                }
            }
        });
        addLineToMap(pointA, pointB, color, name, name2, description, 2, 'link');
    });
}
function drawGenerators(buses, generators, buses2, buses3, lostload){
    const jsonObject = buses.x;
    const jsonObjecty = buses.y;
    let x = 0;
    Object.keys(jsonObject).forEach(key => {
        if(generators[x][0] == key){
            if(lostload[key] != undefined){
                lostloadvalue = lostload[key];
            }
            else{
                lostloadvalue = 0;
            }
            //*******************************************
            strHtml = '<table id="t' + x + '"><tr><td>Carrier</td><td>P Nom</td></tr>';
            list = generators[x][1];
            list.forEach(el => {
                //console.log(el);
                if(el.carrier != ""){
                    strHtml += `<tr><td data-id="${key} ${el.carrier}"><a href="#" class="single-gen">${el.carrier}</a></td><td>${Math.round(el.p_nom)}</td></tr>`;
                }
            });
            strHtml += '</table>';
            arrayTable.push(strHtml);
            //*****************************************
            if (buses3 && buses3[0] && buses3[key]) {
                v = Math.round(buses3[0][key]);
            }
            else{
                v = 0;
            }
            addBusToMap(jsonObject[key], jsonObjecty[key], key, '', 0, lostloadvalue);
            x++;
            }
        else{
            // console.log(0);
            }
        });
}
function showDetailsLine(data){
    //console.log(data);
    const strHtml = '<h3>' + data.title + '</h3><div>' + data.description + '</div>';
    $('#singleLineWrapper2').html(strHtml);
}
function colorCountry(){  
    require([
        "esri/layers/GraphicsLayer",
        "esri/Graphic"
      ], function(GraphicsLayer, Graphic) {
        // Create a GraphicsLayer (No ArcGIS account required)
        graphicsLayerColor = new GraphicsLayer();
        map.add(graphicsLayerColor);
        const lostload = JSON.parse(sessionStorage.getItem("lostload"));
        //console.log(lostload);
        let lt = 0;
        let lv = 0;
        let ee = 0;
        Object.keys(lostload).forEach(key => {
            lostloadvalue = parseFloat(lostload[key]);
            if(key.substring(0, 2) == 'EE' && lostloadvalue != undefined){ 
                ee = ee + lostloadvalue; 
            }
            if(key.substring(0, 2) == 'LT' && lostloadvalue != undefined){ 
                lt = lt + lostloadvalue; 
            }
            if(key.substring(0, 2) == 'LV'  && lostloadvalue != undefined){ 
                lv = lv + lostloadvalue; 
            }
        });

        if(lt > 0){ ltcolor =  [255, 0, 0, 0.5]; }
        else{ ltcolor = [0, 0, 0, 0]; }
        if(lv > 0){ lvcolor =  [255, 0, 0, 0.5]; }
        else{ lvcolor = [0, 0, 0, 0]; }
        if(ee > 0){ eecolor =  [255, 0, 0, 0.5]; }
        else{ eecolor = [0, 0, 0, 0]; }
        // Define a graphic with a fill color
        const latviaGraphic = new Graphic({
          geometry: latviaPolygon,
          symbol: {
            type: "simple-fill",
            color: lvcolor,
            outline: { color: "black", width: 1 }
          }
        });
        const estoniaGraphic = new Graphic({
            geometry: estoniaPolygon,
            symbol: {
              type: "simple-fill",
              color: eecolor,
              outline: { color: "black", width: 1 }
            }
          });
          const lithuaniaGraphic = new Graphic({
            geometry: lithuaniaPolygon,
            symbol: {
              type: "simple-fill",
              color: ltcolor,
              outline: { color: "black", width: 1 }
            }
          });
        // Add the graphic to the layer
        graphicsLayerColor.add(latviaGraphic);
        graphicsLayerColor.add(estoniaGraphic);
        graphicsLayerColor.add(lithuaniaGraphic);
      });      
}
function borderCountry(){  
    require([
        "esri/layers/GraphicsLayer",
        "esri/Graphic"
        ], function(GraphicsLayer, Graphic) {
    graphicsLayerColor = new GraphicsLayer();
    map.add(graphicsLayerColor);
    const latviaGraphic = new Graphic({
        geometry: latviaPolygon,
        symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: { color: "orange", width: 2 }
        }
    });
    const estoniaGraphic = new Graphic({
        geometry: estoniaPolygon,
        symbol: {
            type: "simple-fill",
            color:  [0, 0, 0, 0],
            outline: { color: "orange", width: 2 }
        }
    });
    const lithuaniaGraphic = new Graphic({
        geometry: lithuaniaPolygon,
        symbol: {
            type: "simple-fill",
            color: [0, 0, 0, 0],
            outline: { color: "orange", width: 2 }
        }
    });
    graphicsLayerColor.add(latviaGraphic);
    graphicsLayerColor.add(estoniaGraphic);
    graphicsLayerColor.add(lithuaniaGraphic);
    });      
}
