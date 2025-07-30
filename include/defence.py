import pypsa
import json
import random

from optimization import rolling_horizon_ts_func

def run_defence(n, data_list):

    # data_list = json.loads(data)
    
    for data in data_list:
    # 1 protextion / surveillance
        if data["def_type"] == "protect":
            try:      
                n.generators.loc[data["gen"], 'p_min_pu']=int(data["userdata"])*0.01
            except Exception as e:
                print(f"Defence function (protection) error: {e}")
                return "error defence function"
            
        # 2 enable backup
        if data["def_type"] == "enable":
            try:
                if data.get("gen"):
                    n.generators.loc[data["gen"], 'p_max_pu'] = 1
                elif data.get("link"):
                    n.links.loc[data["link"], 'p_max_pu'] = 1
                elif data.get("line"):
                    n.lines.loc[data["line"], 's_max_pu'] = 1
            except Exception as e:
                print(f"Defence function (enable backup) error: {e}")
                return "error defence function"
        
        #3 increase line capacity
        if data["def_type"] == "increse-line":
            try:      
                pre_s_nom= n.lines.loc[data["line"], 's_nom']
                n.lines.loc[data["line"], 's_nom'] = pre_s_nom*(1+int(data["userdata"]))
            except Exception as e:
                print(f"Defence function (increase line capacity) error: {e}")
                return "error defence function"
            
            
            #4 limit demamd
        if data["def_type"] == "limit-demand":
            try:      
                n.loads_t.p_set.loc[:, n.loads.bus.map(n.buses.country) == data["country"]] *= int(data["userdata"])*0.01
            except Exception as e:
                print(f"Defence function (limit demamd) error: {e}")
                return "error defence function"
            
        #     #5 Repair 
        # if data["def_type"] == "repair":
        #     try:      
        #         n.links.loc[index,'p_max_pu']=0.1
        #         n.links.loc[index,'p_min_pu']=-0.1
        #     except Exception as e:
        #         print(f"Defence function (Repair) error: {e}")
        #         return "error defence function"
            
            #6 Build new generator     
        if data["def_type"] == "build-gen":
            try:      
                n.add("Generator",
                name="custom_gen_" + str(random.random()),
                bus=data["bus"],
                p_nom=int(data["userdata"]),
                carrier=data["carrier"],
                p_nom_min=0,
                p_max_pu=1.0,
                p_min_pu=0.0)
            except Exception as e:
                print(f"Defence function (Build new generator) error: {e}")
                return "error defence function"
            
            #7 add line 
        # if data["def_type"] == "add-line":
        #     try:      
        #         n.links.loc[index,'p_max_pu']=0.1
        #         n.links.loc[index,'p_min_pu']=-0.1
        #     except Exception as e:
        #         print(f"Defence function (add line ) error: {e}")
        #         return "error defence function"
    n=rolling_horizon_ts_func.run(n)

    # update the status json
    json_path = 'simex_map/public/status.json'
    # json_path = 'react/simex_map/public/status.json'
    with open(json_path, 'r') as file:
        data = json.load(file)
        # Update values
        turn_n = data['turn_n'] + 1
        if(data['turn'] == 'A'):
            turn = 'D'
        else:
            turn = 'A'
        filename = "import/network_" + str(turn_n) + "_" + turn + ".nc"
        data['nc_file'] = filename
        data['turn'] = turn
        data['turn_n'] = turn_n
        data['actions_attack'] = data['actions_attack']
        data['actions_defence'].append(data_list)
        data['credit_attack'] = 1000
        data['credit_defence'] = 1000

        # Write updated JSON back to file
        with open(json_path, 'w') as file:
            json.dump(data, file, indent=2)

    n.export_to_netcdf(filename)

# pippo = '''[
#   { 
#     "def_type": "protect",
#     "bus": "AL0 0",
#     "link": "TYNDP2020_1",
#     "line": "6",
#     "gen": "AL0 0 offwind-ac",
#     "country": "EE",
#     "carrier": "offwind",
#     "userdata": "30"
#   },
#   { 
#     "def_type": "enable",
#     "bus": "AL0 0",
#     "link": "TYNDP2020_1",
#     "line": "",
#     "gen": "",
#     "country": "LV",
#     "carrier": "",
#     "userdata": "30"
#   }
# ]'''
'''
data = [
    {
        "def_type": "protect",
        "bus": "LV0 0",
        "link": "",
        "line": "",
        "gen": "LV0 0 CCGT",
        "country": "",
        "carrier": " CCGT",
        "userdata": 10
    }
]
'''
# input_n="../import/elec_s_256_ec_lvopt_Ep_sinUA_lines_caps_loads_noaux_dsr_REDUCED.nc"
# n = pypsa.Network(input_n)
# run_defence(n,data)