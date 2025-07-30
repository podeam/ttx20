import pypsa
import json
from optimization import rolling_horizon_ts_func
 
# data = {
#   "def_type": "gen","line", "link",
#   "index": "AL0 0",
# }
 
def run_attack(n, data):
    # data = json.loads(data)
    data = data[0]
    #1 generetor attack
    if data["def_type"] == "gen":
        try:
            # if index:
            # #is in proteced list then set to value and skip
           
            #     n.export_to_netcdf("/app/import/temporary.nc")
            # else:
            #     n.generators.loc[data["index"], 'p_max_pu'] = 0.1
            #     n.generators.loc[data["index"], 'p_min_pu'] = 0
            #     n.export_to_netcdf("/ttxsim/tmp/temporary.nc")
            n.generators.loc[data["index"], 'p_max_pu'] = 0
            n.generators.loc[data["index"], 'p_min_pu'] = 0
            # if len(n.generators_t.p_min_pu.loc[:,data["index"]])>1:
            #     n.generators_t.p_min_pu.loc[:,data["index"]] = 0
            # n.export_to_netcdf("/trinity/home/ferfede/pypsa/net_files/temporary.nc")
        except Exception as e:
            print(f"Attack power plant generator function: {e}")
            return "error attack generator"
       
    #2 line attack
    if data["def_type"] == "line":
        try:      
            n.lines.loc[data["index"].strip(),'s_max_pu']=0
            # n.export_to_netcdf("/trinity/home/ferfede/pypsa/net_files/temporary.nc")
        except Exception as e:
            print(f"Attack Line function: {e}")
            return "error attack line"
   
    #3 link attack
    if data["def_type"] == "link":
        try:      
            n.links.loc[data["index"].strip(),'p_max_pu']=0.1
            n.links.loc[data["index"].strip(),'p_min_pu']=-0.1
            # n.export_to_netcdf("/trinity/home/ferfede/pypsa/net_files/temporary.nc")
        except Exception as e:
            print(f"Attack link function: {e}")
            return "error attack link"
    n=rolling_horizon_ts_func.run(n)
    # update the status json
    json_path = 'simex_map/public/status.json'
    # json_path = 'react/simex_map/public/status.json'
    with open(json_path, 'r') as file:
        jdata = json.load(file)
        # Update values
        turn_n = jdata['turn_n']
        if(jdata['turn'] == 'A'):
            turn = 'D'
        else:
            turn = 'A'
        filename = "import/network_" + str(turn_n) + "_" + turn + ".nc"

        jdata['nc_file'] = filename
        jdata['turn'] = turn
        jdata['turn_n'] = jdata['turn_n']
        jdata['actions_attack'].append(data)
        jdata['credit_attack'] = 1000
        jdata['credit_defence'] = 1000

        # Write updated JSON back to file
        with open(json_path, 'w') as file:
            json.dump(jdata, file, indent=2)

    n.export_to_netcdf(filename)
    #n.export_to_netcdf("../import/temporary.nc")