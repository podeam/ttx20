import pandas as pd
import pypsa
from optimization.network_prepartion_functions import replace_su

def run(n):
    
    def normed(s): return s/s.sum()

    # no need to keep stores consistent (cyclic) if network length is less than 1 year

    for su in n.storage_units.index:
        replace_su.run(n, su)
        
    n.generators.p_nom_extendable = False
    n.lines.s_nom_extendable=False
    n.links.p_nom_extendable=False
    n.storage_units.p_nom_extendable= False
    n.stores.e_nom_extendable= False        
    if len(n.snapshots)<8000:
        n.stores.e_cyclic=False
        
   #set hydro initial levels per country (energy values)
    hydro_initial_level=pd.Series({
'AT':    3.000000e+06,  #NEW

        'BA':    1.500000e+06,

        'BE':    1.5000000e+05,

        'BG':    3.400000e+06,

        'CH':    8.032302e+06,

       # 'CZ':    1.500000e+06,

        'DE':    3.000000e+05,

        'ES':    1.640000e+07,

        'FI':    3.016621e+06,

        'FR':    7.655433e+06,

        'GB':    1.500000e+05,

        'GR':    1.800000e+06,

        'HR':    2.800000e+06,  #2.8e6

        'HU':    1.500000e+05,

        'IE':    1.500000e+05,  #NEW

        'IT':    7.212265e+06,

        'NO':    4.388338e+07,

        'PL':    0.800000e+06,

        'PT':    2.000000e+06,

        'RO':    0.90000e+07,

        'RS':    3.030000e+05,

        'SE':    2.280000e+07,

        'SI':    1.200000e+06,

        'SK':    1.000000e+06,

        'XK':    150
 
    })

    hydro_initial_level=hydro_initial_level*0.85


    stores_idx=n.stores.filter(like="hydro", axis=0).filter(regex='BA|BE|BG|CH|CZ|DE|ES|FI|FR|GB|GR|HR|HU|IT|NO|PL|PT|RO|RS|SE|SI|SK', axis=0).index
    country_stores= n.stores.loc[stores_idx].bus.str[0:2]

    n.stores.e_initial= n.stores.e_nom.groupby(country_stores).transform(lambda s: normed(s)*hydro_initial_level[s.name]).where(lambda s: s>0.1,0.).fillna(0)

    n.madd("Generator", 
                n.buses.query("carrier == 'AC'").index + "lost-load", 
                bus = n.buses.query("carrier == 'AC'").index, 
                p_nom = 1e6, 
                marginal_cost = 5e3
                )
    n.madd("Generator", 
                n.buses.query("carrier == 'AC'").index + " lost-gen",  
                bus = n.buses.query("carrier == 'AC'").index, 
                p_nom=1e6, 
                p_min_pu = -1,
                p_max_pu=0, 
                marginal_cost = 0
                )

    config = {
        "solver": "ipm",  # Keep using interior point method
        "presolve": "on",  # Keep presolve on
        "parallel": "choose",  # Auto-select number of threads
        "ranging": "off",  # Skip sensitivity analysis
        "infinite_cost": 1e+20,  #default: 1e+20
        "infinite_bound": 1e+20, #default: 1e+20
        "ipm_optimality_tol": 1e-9,  # **Tighten optimality tolerance**
        "crossover": "on",  # Ensure crossover is used for precision
        "primal_feasibility_tolerance": 1e-9,  # **Tighten feasibility tolerance**
        "dual_feasibility_tolerance": 1e-9   # **Tighten dual feasibility**
    }

    n.optimize.optimize_with_rolling_horizon(
            n.snapshots, 
            horizon=24, 
            overlap=2, 
            solver_name="highs", 
            solver_options=config
        )
    
    return n
    
