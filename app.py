from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import pypsa
import json
###############################################
from include.editSingleLine import single_line_attack
###############################################
from include.getSingleGenerator import single_generator
from include.getLinesInCountry2 import lines_in_country2
from include.getGeneratorsInCountry import generators_in_country
from include.getGeneratorsInCountryNew import network_to_json
from include.getGeneratorsBackup import generators_backup
from include.getSingleBusGen import single_bus_gen
from include.getSingleBusGenEasy import single_bus_gen_easy
from include.getGenerationLoadPerBus import single_bus_gen_load
from include.getSingleBusLoad import single_bus_load
from include.getSingleLink import single_bus_links
from include.getLinks import get_links
from include.getFlowBetweenCountries import compute_flows_between_countries
from include.getGenerationCountryCarrier import generation_per_country_carrier
from include.getPricesCountry import prices_in_country
# from include.attack.attack_element import attack_element
from include.lostload2json import getLostLoad
from include.getEnergyBalanceCost import total_energy_balance
from include.voronoi import get_voronoi_polygons
from include.avg_cost import calculate_price
from include.getLoads import loads
from include.getSingleGeneratorTS import get_single_generator_timeseries
from include.getSingleLine import get_line_info
from include.getSingleLinkNew import get_link_info
from include.defence import run_defence
from include.attack import run_attack

app = Flask(__name__, static_folder='static/dist', static_url_path='')
CORS(app)

# network_path = "import/case2_SE_LT_AND_PL_LT_red_red_1024_solved.nc"
# network_path = "import/base_s_512_elec_lvopt_Ep_pypsa-eur_solved.nc"
# network_path = "import/network_adapted_capacities_loads_dsr_2024_gas33_coal15_Ep60_12m_256_solved_lines_out_as_per_initial.nc"
# network_path = "import/network_adapted_capacities_loads_dsr_2024_gas33_coal15_Ep60_12m_256_no_TYNDP_7feb_solved.nc"
# network_path = "import/base_network_256.nc"
# network_path = "import/base_network_256_solved.nc"
# network_path = "import/cut_EE_FI_1_256_solved.nc"
# network_path = "import/cut_LVnode_256_ts_solved.nc"
# network_path = "import/elec_s_256_ec_lvopt_Ep_sinUA_lines_caps_loads_noaux_dsr_REDUCED.nc"
network_path_start = "import/elec_s_256_ec_lvopt_Ep_sinUA_lines_caps_loads_noaux_dsr_REDUCED_final.nc"
network_path = "import/elec_s_256_ec_lvopt_Ep_sinUA_lines_caps_loads_noaux_dsr_REDUCED_final.nc"

if not os.path.isfile(network_path):
    print("error: File not found")
try:
    # Load the PyPSA network
    network = pypsa.Network(network_path)
except Exception as e:
    # return jsonify({"error": str(e)}), 500
    print(str(e))


@app.route("/")
@app.route('/<path:path>')
def index(path=''):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # fallback to index.html for SPA routing
        return send_from_directory(app.static_folder, 'index.html')
    #return render_template("index.html")


# restituisce la lista dei generators per buses e per country
@app.route("/generators_in_country", methods=["GET"])
def generatorsInCountry():
    try:
        json_data = generators_in_country(network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generators_in_country_attack", methods=["GET"])
def generatorsInCountryAttack():
    try:
        json_data = network_to_json(network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# restituisce la lista dei generators per buses e per country di backup
@app.route("/generators_backup", methods=["GET"])
def generatorsBackup():
    try:
        json_data = generators_backup(network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# restituisce la lista dei generators per buses e per coutry
@app.route("/lost_load", methods=["GET"])
def getLostLoadPy():
    try:
        json_data = getLostLoad(network)
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# restituisce la lista delle lines
@app.route("/lines_in_country", methods=["GET"])
def linesInCountry():
    try:
        json_data = lines_in_country2(network)
        # json_data = lines_in_country()
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# restituisce la lista dei links
@app.route("/links", methods=["GET"])
def links():
    try:
        json_data = get_links(network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/loads", methods=["GET"])
def loadsInCountry():
    try:
        json_data = loads(network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# restituisce il singolo generator
@app.route("/single_generator", methods=["POST"])
def singleGenerator():
    try:
        # leggo il parametro passato in POST dalla pagina web
        generator_name = request.form.get("generator")
        json_data = single_generator(generator_name, network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/single_bus_load", methods=["POST"])
def singleBusLoad():
    try:
        # leggo il parametro passato in POST dalla pagina web
        bus_name = request.form.get("bus_name")
        print(bus_name)
        json_data = single_bus_load(bus_name, network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/single_bus_gen", methods=["POST"])
def singleBusGen():
    try:
        # leggo il parametro passato in POST dalla pagina web
        bus_name = request.form.get("bus_name")
        print(bus_name)
        json_data = single_bus_gen(bus_name, network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/single_bus_gen_easy", methods=["POST"])
def singleBusGenEasy():
    try:
        # leggo il parametro passato in POST dalla pagina web
        bus_name = request.form.get("bus_name")
        print(bus_name)
        json_data = single_bus_gen_easy(bus_name, network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/single_bus_gen_load", methods=["POST"])
def singleBusGenLoad():
    try:
        # leggo il parametro passato in POST dalla pagina web
        bus_name = request.form.get("bus_name")
        print(bus_name)
        json_data = single_bus_gen_load(bus_name, network)
        return {"data": json_data}
        # return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/single_bus_links", methods=["POST"])
def singleBusLinks():
    try:
        # leggo il parametro passato in POST dalla pagina web
        bus_name = request.form.get("bus_name")
        json_data = single_bus_links(bus_name, network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generation_country_carrier", methods=["GET"])
def generationCountryCarrier():
    try:
        json_data = generation_per_country_carrier(network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/flow_between_countries", methods=["GET"])
def getFlowBetweenCountries():
    try:
        # json_data = {"data": "json_data"}
        json_data = compute_flows_between_countries(network)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


'''
@app.route("/prices_countries", methods=["GET"])
def getPricesCountries():
    try:
        json_data = calculate_average_price(network)
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/prices_countries_ts", methods=["GET"])
def getPricesCountriesTs():
    try:
        json_data = price_trend(network, '')
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500
'''


@app.route("/prices", methods=["GET"])
def getPrices():
    try:
        json_data = calculate_price(network)
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/hydro", methods=["GET"])
def totalEnergyBalance():
    try:
        json_data = total_energy_balance(network)
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/voronoi", methods=["GET"])
def getVoronoiPolygins():
    try:
        json_data = get_voronoi_polygons(network)
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_data_statistics", methods=["GET"])
def getDataStatistics():
    try:
        json_data = []  # get_voronoi_polygons(network)
        return json_data
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get_single_generator_timeseries", methods=["POST"])
def getSingleGeneratorTimeseries():
    try:
        bus_name = request.form.get("bus_name")
        carrier = request.form.get("carrier")
        json_data = get_single_generator_timeseries(network, bus_name, carrier)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_single_line", methods=["POST"])
def getSingleLine():
    try:
        line_name = request.form.get("line_name")
        json_data = get_line_info(network, line_name)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_single_link", methods=["POST"])
def getSingleLink():
    try:
        link_name = request.form.get("link_name")
        json_data = get_link_info(network, link_name)
        return jsonify({"data": json_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#################################################
'''
@app.route("/single_attack_test", methods=["GET"])
def singleAttackTest():
    try:
        global network
        network_path = "import/cut_LVnode_256_ts_solved.nc"
        network = pypsa.Network(network_path)
        json_data = {"response": "ok"}
        return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/optimize", methods=["GET"])
def optimize():
    try:
        global network
        network_path = "import/cut_LVnode_256_ts_solved.nc"
        network = pypsa.Network(network_path)
        json_data = {"response": "ok"}
        return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/attackxxx", methods=["POST"])
def attackxxx():
    try:
        global network
        network_path = "import/cut_LVnode_256_ts_solved.nc"
        network = pypsa.Network(network_path)
        json_data = {"response": "ok"}
        return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
'''
@app.route("/attack", methods=["POST"])
def attack():
    try:
        global network
        data = request.get_json()
        print(data)
        json_data = {"response": "ok"}
        response = run_attack(network, data)
        json_path = 'simex_map/public/status.json'
        # json_path = 'react/simex_map/public/status.json'
        with open(json_path, 'r') as file:
            jdata = json.load(file)
            network_path = jdata['nc_file']
            network = pypsa.Network(network_path)
            return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/defence", methods=["POST"])
def defence():
    try:
        global network
        data = request.get_json()
        print(data)
        json_data = {"response": "ok"}
        response = run_defence(network, data)
        json_path = 'simex_map/public/status.json'
        # json_path = 'react/simex_map/public/status.json'
        with open(json_path, 'r') as file:
            jdata = json.load(file)
            network_path = jdata['nc_file']
            network = pypsa.Network(network_path)
            return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/restart_a", methods=["GET"])
def restart_a():
    try:
        global network
        network_path = network_path_start
        network = pypsa.Network(network_path)
        print(network_path)
        json_data = {"response": "ok"}
        source_file = 'simex_map/public/status_new.json'
        target_file = 'simex_map/public/status.json'
        # Load JSON data from source file
        with open(source_file, 'r') as src:
            data = json.load(src)
            print('read')
        # Overwrite target file with source file's JSON content
        with open(target_file, 'w') as tgt:
            json.dump(data, tgt, indent=4)
            print('write')
        return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

