import pypsa
from optimization.rolling_horizon_ts_func import run

def attack_gen(gen_name, n):
    try:      
        n.generators.loc[gen_name, 'p_max_pu'] = 0.1
        n.generators.loc[gen_name, 'p_min_pu'] = 0
        opt_network = run(n)
        opt_network.export_to_netcdf("import/temporary.nc")
        return "ok"
    except Exception as e:
        print(f"Attack power plant generator function: {e}")
        return "error"

def attack_line(line_name, n):
    try:      
        n.lines.loc[line_name,'s_max_pu']=0.1
        #n.links.loc[line_name,'p_max_pu']=0.1
        #n.links.loc[line_name,'p_min_pu']=-0.1
        opt_network = run(n)
        opt_network.export_to_netcdf("import/temporary.nc")
        return "ok"
    except Exception as e:
        print(f"Attack Line function: {e}")
        return "error"