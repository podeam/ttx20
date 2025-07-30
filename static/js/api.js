function getGenerators(){
    $.ajax({
        url: "/generators_in_country",
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                const buses = JSON.parse(response.data[0]);
                const generators = JSON.parse(response.data[1]);
                const buses2 = JSON.parse(response.data[2]);
                const buses3 = JSON.parse(response.data[3]);
                let lostload = JSON.parse(response.data[4]);
                sessionStorage.setItem("buses", response.data[0]);
                sessionStorage.setItem("generators", response.data[1]);
                sessionStorage.setItem("buses2", response.data[2]);
                sessionStorage.setItem("buses3", response.data[3]);
                lostload = removeStringFromKeys(lostload, 'lost-load');
                sessionStorage.setItem("lostload", JSON.stringify(lostload));
                drawGenerators(buses, generators, buses2, buses3, lostload);
            }

        },
        error: function(error) {
            console.log("An error occurred: " + error.responseJSON);
            }
    });
}
function getLines(){
    const timestamp = Date.now();  // Generate a unique timestamp
    $.ajax({
        url: `/lines_in_country?timestamp=${timestamp}`,
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                //const buses = JSON.parse(response.data[0]);
                //console.log(buses);
                sessionStorage.setItem("lines", response.data[0]);
                const lines = JSON.parse(response.data[0]);
                //console.log(lines);
                drawLines(lines, 'average');
                lostLoad();
                getLinks();
            }
        },
        error: function(error) {
            alert("An error occurred: " + error.responseJSON);
        }
    });
}
function getLinks(){
    $.ajax({
        url: "/links",
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                //console.log(response.data);
                const links1 = JSON.parse(response.data[0]);
                const links2 = JSON.parse(response.data[1]);
                //console.log(links1);
                //console.log(links2);
                drawLinks(links1, links2, 'average');
                //getLoads();
                getGenerators();
            }
        },
        error: function(error) {
            alert("An error occurred: " + error.responseJSON);
        }
    });
}
function getSingleBus(busId, value = 0){
    //console.log(busId);
    const data = 'bus_name=' + busId;
    $.ajax({
        url: "/single_bus_load",
        data: data,
        async: false,
        type: "POST",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                //console.log(response.data[3]);
                let data1 = JSON.parse(response.data[0]);
                let data2 = JSON.parse(response.data[1]);
                let data3 = JSON.parse(response.data[2]);
                let data4 = JSON.parse(response.data[3]);
                let data5 = JSON.parse(response.data[4]);
                let data6 = JSON.parse(response.data[5]);
                let data7 = JSON.parse(response.data[6]);
                // console.log(data5);
                // console.log(data6);
                // console.log(data7);
                
                data1 = data1[busId];
                $('#headBus').html('<h3>' + busId + '</h3><h3>Power: ' + value + ' MW</h3>');
                let strHtml = '<table class="table" id="singleGeneratorTable"></tr><thead><tr><td></td><th>Load</th><th>Generation</th></tr></thead>';
                for (const [key, value] of Object.entries(data1)) {
                //$.each(data, function(key, values){
                    values1 = Math.round(value);
                    values2 = Math.round(data2[key]);
                    strHtml += `<tr><td>${key}</td><td>${values1}</td><td>${values2}</td></tr>`
                //});
                }
                strHtml += '</table>';
                $('#singleGeneratorData').html(strHtml).hide();
                $('#singleGeneratorWrapper').show();
                createLineChart('singleGeneratorTable', 'singleGenerator', 'single bus generation + load');
                let serie = [
                    {
                        name: 'Load',
                        data: [data3[0].total_load]
                    },
                    {
                        name: 'Generation',
                        data: [data3[0].total_generation]
                    },
                ]
                let categories = [''];
                let target = 'balance';
                let title = 'Balance: ' + Math.round(parseFloat(data3[0].net_balance));
                createBarChart(serie, categories, target, title);
                
                let jsonArray = [];
                for (const [key, value] of Object.entries(data4)) {
                    if(key != '' && value > 0){
                        let item = { name: key, data: [value] }; 
                        jsonArray.push(item);
                    }
                };
                categories = [''];
                target = 'generation_x_carrier';
                title = 'Generation x carrier';
                createBarChart(jsonArray, categories, target, title);
                //***************************************line chart for lines
                jsonArray = [];
                for (const [key, value] of Object.entries(data5)) {
                    if(key != ''){
                        //console.log(value);
                        dataArray = [];
                        for (const [newkey, newvalue] of Object.entries(value)) {
                            dataArray.push(newvalue);
                            }
                        //console.log(dataArray);
                        let item = { name: key, data: dataArray }; 
                        jsonArray.push(item);
                    }
                };
                for (const [key, value] of Object.entries(data6)) {
                    if(key != ''){
                        //console.log(value);
                        dataArray = [];
                        for (const [newkey, newvalue] of Object.entries(value)) {
                            dataArray.push(newvalue);
                            }
                        //console.log(dataArray);
                        let item = { name: key, data: dataArray }; 
                        jsonArray.push(item);
                    }
                };
                createLineChartData(jsonArray, 'singleLineWrapper', title='')
                /**************************************************************generators list*/
                let strGen = '<table class="table"></tr><thead><tr><td>Carrier</td><th>P nom</th><th></th></tr></thead>';
                //$.each(data7, function(i, item){
                for (const [key, value] of Object.entries(data7.p_nom)) {
                    //console.log(item);
                    v = Math.round(value);
                    if(key != 'dsr' && key != '' && v > 0){ 
                        strGen += `<tr><td>${key}</td><td>${v}</td><td><input type="radio" name="gen_attack" value="${key}"></td></tr>`
                    }
                }
                //});
                strGen += '<tr><td colspan="3">';
                //strGen += '<input type="date" id="gen_attack_date">';
                strGen += '<button type="button" class="btn btn-info" onclick="singleGenAttack( \'' + busId + '\')" ">Attack</button></td></tr>';
                strGen += '</table>';
                $('#generators_list').html(strGen);
                
                $('#countryCarrier').hide();
                //getSingleBusLinks(bus_name);
            }
        }
    });
}
function getSingleLine(lineId, type){
    console.log(lineId);
    //const dataEvent = $('#' + lineId).val();
    //const data = 'type=line&carrier=0&name=' + lineId + '&dataEvent=' + dataEvent;
    const data = 'type=' + type + '&name=' + lineId;
    //addEventToTimeline(lineId, dataEvent);
    $.ajax({
        url: "/single_attack",
        data: data,
        async: false,
        type: "POST",
        dataType: "json",
        success: function(data) {
            console.log(data);
            if (data.error) {
                alert(data.error);
            } else {
                //let data = JSON.parse(response);
                //console.log(data.response);
                if(data.response == 'ok'){
                    //location.href = "?";
                    graphicsLayer.removeAll();
                    getLines();
                }
            }
        }
    });
}
function getSingleBusLoad(bus_name){
    const data = 'bus_name=' + bus_name;
    $.ajax({
        url: "/single_bus_load",
        data: data,
        type: "POST",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                //console.log(response.data);
                let data = JSON.parse(response.data);
                data = data[bus_name];
                //console.log(data);
                //console.log(typeof(data))
                //const dataValues = data[g];
                let strHtml = '<table class="table" id="singleGeneratorLoadTable"></tr>';
                for (const [key, value] of Object.entries(data)) {
                //$.each(data, function(key, values){
                    values = Math.round(value);
                    if(values > 0 && (key != '' && key != 'dsr')) {
                        strHtml += `<tr><td>${key}</td><td>${values}</td></tr>`;
                    }
                //});
                }
                strHtml += '</table>';
                $('#singleGeneratorLoad').html(strHtml);
                createLineChart('singleGeneratorLoadTable', 'singleGeneratorLoad', 'Single Bus Load');
                getSingleBusLinks(bus_name);
            }
        },
        error: function(error) {
            for (const key in error) {
                if (error.hasOwnProperty(key)) {
                    //console.log(`${key}: ${obj[key]}`);
                    }
                }
        }
    });
}
function getSingleBusLinks(bus_name){
    const data = 'bus_name=' + bus_name;
    $.ajax({
        url: "/single_bus_links",
        data: data,
        type: "POST",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                //console.log(response.data);
                let strHtml = '';
                let data = JSON.parse(response.data);
                for (const [key, value] of Object.entries(data)) {
                //Object.keys(data).forEach(key => {
                    strHtml += '<tr><th colspan="2">' + key + '</th></tr>';
                    console.log(key);
                    console.log(value);
                    //console.log(typeof(value));
                    for (const [key2, value2] of Object.entries(value)) {
                        strHtml += '<tr><td>' + key2 + '</td><td>' + Math.round(value2) + '</td></tr>';
                    }
                }
                $('.singleBusLinks').html(strHtml);
                //data = data[bus_name];
                //console.log(data);
                //console.log(typeof(data))
            }
        },
        error: function(error) {
            for (const key in error) {
                if (error.hasOwnProperty(key)) {
                    //console.log(`${key}: ${obj[key]}`);
                    }
                }
        }
    });
}
function bindSingleGenerator(e){
    $(".single-gen").on("click", function(e) {
        e.preventDefault();
        const g = $(this).parent().data('id');
        //console.log(g);
        const data = 'generator=' + g;
        $.ajax({
            url: "/single_generator",
            data: data,
            type: "POST",
            dataType: "json",
            success: function(response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    //console.log(response.data);
                    const data = JSON.parse(response.data);
                    const dataValues = data[g];
                    let strHtml = '<table class="table" id="singleGeneratorTable">';
                    let miadata;
                    $.each(dataValues, function(key, values){
                        values = Math.round(values);
                        /*
                        miadata = new Date(key);
                        const year = miadata.getFullYear();
                        const month = String(miadata.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
                        const day = String(miadata.getDate()).padStart(2, '0');
                        const hours = String(miadata.getHours()).padStart(2, '0');
                        const minutes = String(miadata.getMinutes()).padStart(2, '0');
                        const seconds = String(miadata.getSeconds()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                        */
                        strHtml += `<tr><td>${key}</td><td>${values}</td></tr>`
                    });
                    strHtml += '</table>';
                    $('#singleGenerator').html(strHtml);
                    createLineChart('singleGeneratorTable', 'singleGenerator');
                }
            },
            error: function(error) {
                //console.log("An error occurred: " + error.responseJSON);
                for (const key in error) {
                    if (error.hasOwnProperty(key)) {
                        //console.log(`${key}: ${obj[key]}`);
                        }
                    }
            }
        });
        /************************************************/
    });
}
function getGenerationCountryCarrier(){
    $('#countryCarrier').show();
    $.ajax({
        url: "/generation_country_carrier",
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                //console.log(response.data);
                let str = '[';
                let dataArray  = [];
                let data = JSON.parse(response.data);
                for (const [key, value] of Object.entries(data)) {
                    str += '{"name": " ' + key + ' ", "data": ['
                    for (const [key2, value2] of Object.entries(value)) {
                        dataArray.push(Math.round(value2/1000));
                    }
                    str += dataArray.toString() + ']},';
                    dataArray = [];
                }
                str = str.substring(0, (str.length-1));
                str += ']';
                //console.log(str);
                $.ajax({
                    url: "/hydro",
                    type: "GET",
                    dataType: "json",
                    success: function(response) {
                        dataNew = JSON.parse(str);
                        /*
                        console.log(response);
                        console.log(response.gen_hydro['EE']);
                        console.log(response.gen_hydro['LT']);
                        console.log(response.gen_hydro['LV']);
                        */
                        gen_hydro_ee = response.gen_hydro['EE'];
                        gen_hydro_lt = response.gen_hydro['LT'];
                        gen_hydro_lv = response.gen_hydro['LV'];
                        gen_hydro = { name: 'hydro', data: [gen_hydro_ee, gen_hydro_lt, gen_hydro_lv]};
                        dataNew.push(gen_hydro);
                        gen_phs_in_ee = response.phs_in['EE'];
                        gen_phs_in_lt = response.phs_in['LT'];
                        gen_phs_in_lv = response.phs_in['LV'];
                        gen_phs_in = { name: 'phs_in', data: [gen_phs_in_ee, gen_phs_in_lt, gen_phs_in_lv]};
                        dataNew.push(gen_phs_in);
                        gen_phs_out_ee = response.phs_out['EE'];
                        gen_phs_out_lt = response.phs_out['LT'];
                        gen_phs_out_lv = response.phs_out['LV'];
                        gen_phs_out = { name: 'phs_out', data: [gen_phs_out_ee, gen_phs_out_lt, gen_phs_out_lv]};
                        dataNew.push(gen_phs_out);
                        const filteredData = dataNew
                            .filter(item => item.name.trim() !== '')
                            .map(item => ({ ...item, name: item.name.trim() }));
                        //console.log(filteredData);
                        createBarChartStacked(filteredData);
                        }
                    });
            }    
            //getLines();
        },
        error: function(error) {
            console.log("An error occurred: " + error.responseJSON);
            for (const key in error) {
                if (error.hasOwnProperty(key)) {
                    console.log(`${key}: ${error[key]}`);
                    }
                }
            }
    });
}
function getFlowBetweenCountries(){
    clearGraphics();
    $.ajax({
        url: "/flow_between_countries",
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                //console.log(response.data);
                let str = '[';
                let dataArray  = [];
                let data = JSON.parse(response.data);
                let countries = data.countries;
                let flow = data.flow_from_to;
                //console.log(countries);                
                const array =[
                    {"DE": [10.4515, 51.1657]},
                    {"PL": [19.1451, 51.9194]},
                    {"DK": [9.5018, 56.2639] },
                    {"SE": [18.6435, 60.1282]}, 
                    {"EE": [25.0237, 58.5975]},
                    {"LV": [24.1050, 56.9462]},
                    {"FI": [24.9458, 60.1920]},
                    {"NO": [12.7522, 64.5830]},
                    {"LT": [25.2796, 54.6871]}
                ]
                let countryCode1, country1, coords1, countryCode2, country2, coords2;
                $.each(countries, (i, item)=>{
                    if(flow[i] > 0){
                        countryCode1 = item[0];
                        countryCode2 = item[1];
                        }
                    else{
                        countryCode1 = item[1];
                        countryCode2 = item[0];
                    }
                    
                    coords1 = [];
                    coords2 = [];

                    result1 = array.find(obj => obj.hasOwnProperty(countryCode1));
                    coords1 = result1 ? result1[countryCode1] : undefined;
                    result2 = array.find(obj => obj.hasOwnProperty(countryCode2));
                    coords2 = result2 ? result2[countryCode2] : undefined;
                    if(coords1 != undefined && coords2 != undefined){
                        myflow = Math.round(Math.abs(flow[i])/1000);
                        /*
                        if(i == 37){
                            console.log(countries[i] + ' ' + flow[i] + ' ' + myflow + ' ' + countryCode1 + ' ' + countryCode2);
                        }
                        */
                        color =  [226, 119, 40]; // Orange
                        nameline = countryCode1 + ' ' + countryCode2
                        description = ''
                        wl = Math.round(myflow/300);
                        if(wl == 0 && myflow > 0) { wl = 1; }
                        //console.log(name + ' ' + myflow + ' ' + flow[i]);
                        //coords1 = coords1.reverse().join(",");
                        //coords2 = coords2.reverse().join(",");
                        //console.log(coords1 + ' ' + coords2);
                        /*
                        if(i == 37){
                            console.log(nameline + ' ' + description + ' ' + wl);
                            }
                        */
                        coords = calculateOffsetPoint(coords1, coords2, 0.1);
                        coords2 = [coords[0], coords[1]];
                        addLineToMapNew(coords1, coords2, color, nameline, nameline, description, wl);
                        }
                });
            }    
            //getGenerationCountryCarrier();
        },
        error: function(error) {
            console.log("An error occurred: " + error.responseJSON);
            for (const key in error) {
                if (error.hasOwnProperty(key)) {
                    //console.log(`${key}: ${error[key]}`);
                    }
                }
            }
    });
    colorCountry();
}
function singleGenAttack(busId){
    const bus = busId;
    //const dataEvent = $('#gen_attack_date').val();
    const carrier = $('input[name="gen_attack"]:checked').val();
    console.log(bus);
    //console.log(dataEvent);
    console.log(carrier);
    //const data = 'type=gen&carrier=' + carrier + '&name=' + busId + '&dataEvent=' + dataEvent;
    const data = 'type=gen&name=' + carrier;
    //addEventToTimeline(busId, dataEvent);
    $.ajax({
        url: "/single_attack",
        data: data,
        async: false,
        type: "POST",
        dataType: "json",
        success: function(response) {
            console.log(0);                   
            graphicsLayer.removeAll();
            getLines();
        }
    });

}
function getPricesCountry(){
    $('#priceAvg').show();
    $.ajax({
        url: "/prices",
        type: "GET",
        dataType: "json",
        success: function(response) {
            const prices_avg = JSON.parse(response.data[0]);
            let strHtml = '';
            let data = [];
            price_EE = Math.round(prices_avg['EE']*100)/100;
            price_LT = Math.round(prices_avg['LT']*100)/100;
            price_LV = Math.round(prices_avg['LV']*100)/100;
            strHtml += '<tr><th>EE</th><td>' + price_EE + '&euro;</td><td id="max_EE"></td><td id="min_EE"></td></tr>';
            strHtml += '<tr><th>LT</th><td>' + price_LT + '&euro;</td><td id="max_LT"></td><td id="min_LT"></td></tr>';
            strHtml += '<tr><th>LV</th><td>' + price_LV + '&euro;</td><td id="max_LV"></td><td id="min_LV"></td></tr>';
            data.push(price_EE);
            data.push(price_LT);
            data.push(price_LV);
            $('#priceAvg table tbody').html(strHtml);
            if(sessionStorage.getItem('price') != undefined){
                oldData = JSON.parse(sessionStorage.getItem('price'));
                oldData.push({ name: '', data: data });
                data = oldData;
            }
            else{
                data = [{ name: '', data: data }];
            }
            if(data.length < 2){
                sessionStorage.setItem('price', JSON.stringify(data));
            }
            createBarChart(data, ['EE', 'LT', 'LV'], 'priceAvgChart', 'Average Price (EUR/MWh)');
            /************************************************************************************/
            /************************************************************************************/
            const prices_ts = JSON.parse(response.data[1]);
            console.log(prices_ts);
            /*********************************************************************************EE*/
            const prices_ts_ee = prices_ts['EE'];
            let data_ee = [];
            $.each(prices_ts_ee, function(key, value) {
                price = Math.round(value*100)/100;
                data_ee.push(price);
            });
            const maxValEE = Math.max(...data_ee);
            const minValEE = Math.min(...data_ee);
            if(sessionStorage.getItem('price_ts_ee') != undefined){
                oldData_ee = JSON.parse(sessionStorage.getItem('price_ts_ee'));
                oldData_ee.push({ name: 'price_ts_ee', data: data_ee });
                data = oldData_ee;
            }
            else{
                data_ee = { name: 'price_ts_ee', data: data_ee };
            }
            if(data_ee.length < 2){
                sessionStorage.setItem('price_ts_ee', JSON.stringify(data_ee));
            }
            /************************************************************************************/
            /*********************************************************************************LT*/
            const prices_ts_lt = prices_ts['LT'];
            let data_lt = [];
            $.each(prices_ts_lt, function(key, value) {
                price = Math.round(value*100)/100;
                data_lt.push(price);
            });
            const maxValLT = Math.max(...data_lt);
            const minValLT = Math.min(...data_lt);
            if(sessionStorage.getItem('price_ts_lt') != undefined){
                oldData_lt = JSON.parse(sessionStorage.getItem('price_ts_lt'));
                oldData_lt.push({ name: 'price_ts_lt', data: data_lt });
                data = oldData_lt;
            }
            else{
                data_lt = { name: 'price_ts_lt', data: data_lt };
            }
            if(data_lt.length < 2){
                sessionStorage.setItem('price_ts_lt', JSON.stringify(data_lt));
            }
            /************************************************************************************/
            /*********************************************************************************LV*/
            const prices_ts_lv = prices_ts['LV'];
            let data_lv = [];
            $.each(prices_ts_lv, function(key, value) {
                price = Math.round(value*100)/100;
                data_lv.push(price);
            });
            const maxValLV = Math.max(...data_lv);
            const minValLV = Math.min(...data_lv);
            if(sessionStorage.getItem('price_ts_lv') != undefined){
                oldData_lv = JSON.parse(sessionStorage.getItem('price_ts_lv'));
                oldData_lv.push({ name: 'price_ts_lv', data: data_lv });
                data = oldData_lv;
            }
            else{
                data_lv = { name: 'price_ts_lv', data: data_lv };
            }
            if(data_lv.length < 2){
                sessionStorage.setItem('price_ts_lv', JSON.stringify(data_lv));
            }
            /************************************************************************************/
            data = [data_ee, data_lt, data_lv];
            createLineChartData(data, 'priceAvgChartTs', 'Average Price TS (EUR/MWh)', ['EE', 'LT', 'LV']);
            setTimeout(() => {
                $('#max_EE').html(maxValEE + '&euro;');
                $('#min_EE').html(minValEE + '&euro;');
                $('#max_LT').html(maxValLT + '&euro;');
                $('#min_LT').html(minValLT + '&euro;');
                $('#max_LV').html(maxValLV + '&euro;');
                $('#min_LV').html(minValLV + '&euro;');
            }, 2000);
        }
    });
    /*
    $.ajax({
        url: "/prices_countries_ts",
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                console.log(response);
                //const prices = JSON.parse(response);
                const prices_ee = JSON.parse(response.data[0]);
                const prices_lt = JSON.parse(response.data[1]);
                const prices_lv = JSON.parse(response.data[2]);
                //**************************************************************EE 
                let data_ee = [];
                $.each(prices_ee, function(i, el){
                    price = Math.round(el['price']*100)/100;
                    data_ee.push(price);
                });
                const maxValEE = Math.max(...data_ee);
                const minValEE = Math.min(...data_ee);
                if(sessionStorage.getItem('price_ts_ee') != undefined){
                    oldData_ee = JSON.parse(sessionStorage.getItem('price_ts_ee'));
                    oldData_ee.push({ name: 'price_ts_ee', data: data_ee });
                    data = oldData_ee;
                }
                else{
                    data_ee = { name: 'price_ts_ee', data: data_ee };
                }
                if(data_ee.length < 2){
                    sessionStorage.setItem('price_ts_ee', JSON.stringify(data_ee));
                }
                //***************************************************************LT 
                let data_lt = [];
                $.each(prices_lt, function(i, el){
                    price = Math.round(el['price']*100)/100;
                    data_lt.push(price);
                });
                const maxValLT = Math.max(...data_lt);
                const minValLT = Math.min(...data_lt);
                if(sessionStorage.getItem('price_ts_lt') != undefined){
                    oldData_lt = JSON.parse(sessionStorage.getItem('price_ts_lt'));
                    oldData_lt.push({ name: 'price_ts_lt', data: data_lt });
                    data = oldData_lt;
                }
                else{
                    data_lt = { name: 'price_ts_lt', data: data_lt };
                }
                if(data_lt.length < 2){
                    sessionStorage.setItem('price_ts_lt', JSON.stringify(data_lt));
                }
                //***************************************************************LV 
                let data_lv = [];
                $.each(prices_lv, function(i, el){
                    price = Math.round(el['price']*100)/100;
                    data_lv.push(price);
                });
                const maxValLV = Math.max(...data_lv);
                const minValLV = Math.min(...data_lv);
                if(sessionStorage.getItem('price_ts_lv') != undefined){
                    oldData_lv = JSON.parse(sessionStorage.getItem('price_ts_lv'));
                    oldData_lv.push({ name: 'price_ts_lv', data: data_lv });
                    data = oldData_lv;
                }
                else{
                    data_lv = { name: 'price_ts_lv', data: data_lv };
                }
                if(data_lv.length < 2){
                    sessionStorage.setItem('price_ts_lv', JSON.stringify(data_lv));
                }
                //*************************************************************** 
                data = [data_ee, data_lt, data_lv];
                //data = [data_lv];
                //console.log(data_lv);
                //console.log(data);
                createLineChartData(data, 'priceAvgChartTs', 'Average Price TS (EUR/MWh)', ['EE', 'LT', 'LV']);
                //********************
                setTimeout(() => {
                    $('#max_EE').html(maxValEE + '&euro;');
                    $('#min_EE').html(minValEE + '&euro;');
                    $('#max_LT').html(maxValLT + '&euro;');
                    $('#min_LT').html(minValLT + '&euro;');
                    $('#max_LV').html(maxValLV + '&euro;');
                    $('#min_LV').html(minValLV + '&euro;');
                }, 2000);
            }
        },
        error: function(error) {
            alert("An error occurred: " + error.responseJSON);
        }
    });
    */
}
function lostLoad(){
    $.ajax({
        url: "/lost_load",
        type: "GET",
        dataType: "json",
        success: function(response) {
            //console.log(response);
            categories = [];
            LV_loads_data = [];
            LV_loads = JSON.parse(response.LV_loads);
            Object.keys(LV_loads).forEach(key => {
                categories.push(key);
                LV_loads_data.push(LV_loads[key]);
            });
            LT_loads_data = [];
            LT_loads = JSON.parse(response.LT_loads);
            Object.keys(LT_loads).forEach(key => {
                LT_loads_data.push(LT_loads[key]);
            });
            EE_loads_data = [];
            EE_loads = JSON.parse(response.EE_loads);
            Object.keys(EE_loads).forEach(key => {
                EE_loads_data.push(EE_loads[key]);
            });
            data = [
                {name: 'EE_lost_loads', data: response.EE_SummedValues}, 
                {name: 'LT_lost_loads', data: response.LT_SummedValues}, 
                {name: 'LV_lost_loads', data: response.LV_SummedValues},
                {name: 'LV_loads', data: LV_loads_data},
                {name: 'LT_loads', data: LT_loads_data},
                {name: 'EE_loads', data: EE_loads_data},
            ]
            createLineChartData(data, 'Lost_Load_Ts', title='Lost Load Timeseries', categories);
            /*************************/
            let minEnergy = 0;
            let maxEnergy = 0;
            LostEnergyData = response.LostEnergyData;
            console.log(LostEnergyData);
            const energyValues = LostEnergyData
                .map(item => parseFloat(item.Lost_Energy)) // Convert to numbers
                .filter(value => !isNaN(value)); // Remove invalid values
        
            if (energyValues.length > 0) {
                minEnergy = Math.min(...energyValues);
                maxEnergy = Math.max(...energyValues);
            }

            LostEnergyData.forEach((el) => {
                generator = el.Generator;
                lost_energy = el.Lost_Energy;
                let toRemove = "lost-load";
                let new_generator = generator.replace(toRemove, "")
                //console.log(`${new_generator}: ${lost_energy}`);
                if(lost_energy > 0){
                    //percentage = Math.round(lost_energy);
                    //if(percentage > 100) { percentage = 100;}
                    //console.log(lost_energy+ ' ' + percentage);
                    //color = getColorFromWhiteToRed(
                    color = getColorFromScale(Math.round(lost_energy), minEnergy, maxEnergy) ;
                    //console.log(Math.round(lost_energy) + ' ' + minEnergy + ' ' + maxEnergy);
                    $.each(voronoi_cells, (i, el) => {
                        busname = el.Name;
                        coords = el.Coordinates;
                        if(new_generator == busname){
                            addPoligonToMapNew(coords, busname, color);
                        }
                    });
                }
            });
        } 
    });
}
function getLoads(){
    $.ajax({
        url: "/loads",
        type: "GET",
        dataType: "json",
        success: function(response) {
            clearGraphics();
            $('#legendDiv').show();
            $('#legendDiv h4').html('Loads (Voronoi cells)');
            //console.log(response);
            response = JSON.parse(response.data);
            response.forEach((el) => {
                bus = el.bus;
                load = Math.round(el.total_load)/1000;
                if(load > 0){
                    color = getColorFromScale(load, 0, 200);
                    $.each(voronoi_cells, (i, el) => {
                        busname = el.Name;
                        coords = el.Coordinates;
                        if(bus == busname){
                            //console.log(load);
                            addPoligonToMapNew(coords, busname, color);
                        }
                    });
                }
            });
        } 
    });
}
function getPopulationData(t){
    $('#legendDiv').show();
    borderCountry();
    $.ajax({
        url: "static/js/baltic_states_eurostat_info.json",
        type: "GET",
        dataType: "json",
        success: function(data) {
            console.log(data);
            require(["esri/layers/GraphicsLayer"], (GraphicsLayer) => {
                const graphicsLayer = new GraphicsLayer();
                map.add(graphicsLayer);
            });
            const values = data.map(item => item[t]);
            const minPop = Math.min(...values);
            const maxPop = Math.max(...values);
            $.each(data, (i, el)=>{
                coords = el.geometry;
                /********************************************/
                //console.log(el[t] + ' | ' + minPop + ' | ' + maxPop);
                color = getColorFromScale(el[t], minPop, maxPop);
                addPoligonToMapNuts(coords, el.DATE, color, el[t], t);
                /********************************************/
            });
            $('#legendDiv h4').text(t);
        }
    });
}