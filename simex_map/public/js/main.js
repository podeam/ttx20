let arrayTable = [];
__init__();
$(document).ready(function(){
    $('#attack').on('click', ()=>{
        $.ajax({
            url: "/single_attack_test",
            type: "GET",
            dataType: "json",
            success: function(data) {
                if(data.response == 'ok'){
                    getLines();
                }
            }
        });
    });

    $('#changeMap').on('click', ()=>{
        let type = $('#mapType').val();
        if(type == 'detail'){
            getGenerationCountryCarrier();
            getLines();
            $('#mapType').val('country');
        }
        if(type == 'country'){
            getFlowBetweenCountries();
            getPricesCountry();
            getGenerationCountryCarrier();
            $('#mapType').val('detail');
        }
    });

    $('.chargeNuts').on('click', function(){
        clearGraphics();
        const t = $(this).data("id");
        $('#priceAvg').hide();
        $('#countryCarrier').hide();
        getPopulationData(t);
    });
    $('#test').on('click', ()=>{
        let c = parseInt($('#contatore').val());
        c = c + 72;
        if( c > 720 ){ c = 0; }
        $('#contatore').val(c);
        let lines = sessionStorage.getItem("lines");
        lines = JSON.parse(lines);
        drawLines2(lines, c);
    });
    $('#optimize').on('click', ()=>{
        $.ajax({
            url: "/optimize",
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log(0);                   
                graphicsLayer.removeAll();
                getLines();
            }
        });
    });
    $('#loads').on('click', ()=>{
        getLoads();
    });

    $('#changeMap').trigger('click');
});


