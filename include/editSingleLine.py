#mod finalmente
import sys
sys.path.append("/app")
from optimization.rolling_horizon_ts_func import run

def single_line_attack(line_name, network):
    try:
        if line_name in network.lines.index:
            network.lines.loc[line_name, "s_nom"] = 0
            print(f"Transmission line '{line_name}' has been removed.")
        opt_network = run(network)
        opt_network.export_to_netcdf("import/temporary.nc")
        return "ok" #optimazion succesful
    except:
        print("edit single line error")
        return "error"



