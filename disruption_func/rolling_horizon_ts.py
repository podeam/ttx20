import pandas as pd
import numpy as np 
import pypsa
from pypsa.descriptors import get_switchable_as_dense as as_dense
import datetime

#variable initialization
nc_path="/nc_files/case2_SE_LT_AND_PL_LT_red_red_1024_solved.nc"
n = pypsa.Network(nc_path)
hydro_initial_level=pd.Series({
    'BA':    1.500000e+06,
    'BE':    2.000000e+05,
    'BG':    3.400000e+06,
    'CH':    8.432302e+06,
    'CZ':    1.500000e+06,
    'DE':    3.000000e+05,
    'ES':    1.640000e+07,
    'FI':    3.016621e+05,
    'FR':    7.655433e+06,
    'GB':    2.000000e+05,
    'GR':    2.300000e+06,
    'HR':    2.800000e+06,
    'HU':    2.000000e+05,
    'IT':    7.212265e+06,
    'NO':    4.388338e+07,
    'PL':    0.200000e+06,
    'PT':    2.000000e+06,
    'RO':    1.210000e+07,
    'RS':    3.030000e+05,
    'SE':    2.280000e+07,
    'SI':    1.200000e+06,
    'SK':    1.000000e+06
    })

def replace_su(network, su_to_replace):
    #Replace the storage unit su_to_replace with a bus for the energy
    #carrier, two links for the conversion of the energy carrier to and from electricity,
    #a store to keep track of the depletion of the energy carrier and its
    #CO2 emissions, and a variable generator for the storage inflow.
    #Because the energy size and power size are linked in the storage unit by the max_hours,
    #extra functionality must be added to the LOPF to implement this constraint.

    su = network.storage_units.loc[su_to_replace]

    bus_name = "{} {}".format(su["bus"], su["carrier"])
    link_1_name = "{} converter {} to AC".format(su_to_replace, su["carrier"])
    link_2_name = "{} converter AC to {}".format(su_to_replace, su["carrier"])
    store_name = "{} store {}".format(su_to_replace, su["carrier"])
    gen_name = "{} inflow".format(su_to_replace)

    if bus_name not in network.buses.index:
        network.add("Bus", bus_name, carrier=su["carrier"])

    # dispatch link
    network.add(
        "Link",
        link_1_name,
        bus0=bus_name,
        bus1=su["bus"],
        capital_cost=su["capital_cost"] * su["efficiency_dispatch"],
        p_nom=su["p_nom"] / su["efficiency_dispatch"],
        p_nom_extendable=su["p_nom_extendable"],
        p_nom_max=su["p_nom_max"] / su["efficiency_dispatch"],
        p_nom_min=su["p_nom_min"] / su["efficiency_dispatch"],
        p_max_pu=su["p_max_pu"],
        marginal_cost=su["marginal_cost"] * su["efficiency_dispatch"],
        efficiency=su["efficiency_dispatch"],
    )

    # store link
    network.add(
        "Link",
        link_2_name,
        bus1=bus_name,
        bus0=su["bus"],
        p_nom=su["p_nom"],
        p_nom_extendable=su["p_nom_extendable"],
        p_nom_max=su["p_nom_max"],
        p_nom_min=su["p_nom_min"],
        p_max_pu=-su["p_min_pu"],
        efficiency=su["efficiency_store"],
    )

    if (
        su_to_replace in network.storage_units_t.state_of_charge_set.columns
        and (
            ~pd.isnull(network.storage_units_t.state_of_charge_set[su_to_replace])
        ).any()# PD IS NULL??? how is this structure built? if there exists su_to_replace and this is True (any?? )
    ):
        e_max_pu = pd.Series(data=1.0, index=network.snapshots)
        e_min_pu = pd.Series(data=0.0, index=network.snapshots)
        non_null = ~pd.isnull(
            network.storage_units_t.state_of_charge_set[su_to_replace]
        ) #which is the output from pd.isnull (True or False? or the index?)
        e_max_pu[non_null] = network.storage_units_t.state_of_charge_set[su_to_replace][
            non_null
        ]
        e_min_pu[non_null] = network.storage_units_t.state_of_charge_set[su_to_replace][
            non_null
        ]
    else:
        e_max_pu = 1.0
        e_min_pu = 0.0

    network.add(
        "Store",
        store_name,
        bus=bus_name,
        e_nom=su["p_nom"] * su["max_hours"],
        e_nom_min=su["p_nom_min"] / su["efficiency_dispatch"] * su["max_hours"],
        e_nom_max=su["p_nom_max"] / su["efficiency_dispatch"] * su["max_hours"],
        e_nom_extendable=su["p_nom_extendable"],
        e_max_pu=e_max_pu,
        e_min_pu=e_min_pu,
        standing_loss=su["standing_loss"],
        e_cyclic=su["cyclic_state_of_charge"],
        e_initial=su["state_of_charge_initial"],
    )


    # inflow from a variable generator, which can be curtailed (i.e. spilled)
    inflow_max = as_dense(network, "StorageUnit", "inflow").max()[su_to_replace]

    print()
    if inflow_max == 0.0:
        inflow_pu = 0.0
    else:
        inflow_pu = network.storage_units_t.inflow[su_to_replace] / inflow_max

    if inflow_max >0:
        network.add(
            "Generator",
            gen_name,
            bus=bus_name,
            carrier="rain",
            p_nom=inflow_max,
            p_max_pu=inflow_pu,
        )
        
    network.add(
        "Generator",
        gen_name + " loss-of-charge",
        bus=bus_name,
        carrier="storage-content",
        p_nom=su["p_nom"] * su["max_hours"],
        marginal_cost = 20000
        )

    network.remove("StorageUnit", su_to_replace)

    #return bus_name, link_1_name, link_2_name, store_name, gen_name, extra_functionality
def solve_rolling_horizon(m, o, time_aggregation, horizon):
    
    o.storage_units.cyclic_state_of_charge=False
    o.stores.e_cyclic=False
    
    o.stores_t.e_min_pu = (
        (m.stores_t.e/(m.stores.e_nom+0.00001))
        .shift(1)
        .resample(time_aggregation).asfreq()
        .shift(-1) #aqui lo que hace es cambia a shift (1) para resample (timeaggregation) y vuelve a cambiar. El quid es e/enom
        .fillna(0)
    ).clip(upper=.999, lower =0.).reindex(o.snapshots).fillna(0)

    o.stores.e_initial = n.stores.e_initial
    #o.stores.e_initial = m.stores_t.e.iloc[-1] #coge el punto anterior, como inicial

    o.madd("Generator", 
           o.buses.query("carrier == 'AC'").index + "lost-load", 
           bus = o.buses.query("carrier == 'AC'").index, 
           p_nom = 1e6, 
           marginal_cost = 10e3
          )
    
    for i in range(len(o.snapshots)//horizon):

        start= i* horizon
        end = min((i+1)*horizon, len(o.snapshots))
        
        print("optimizing time period between " + str(o.snapshots[start]) + " and " + str(o.snapshots[end-1]))
        
        snapshots = o.snapshots[start:end]
        
        o.optimize(solver_name="highs",
                   snapshots = snapshots,
                   solver= "ipm",
                   run_crossover= "off",
                   small_matrix_value= 1e-6,
                   large_matrix_value= 1e9,
                   primal_feasibility_tolerance= 1e-5,
                   dual_feasibility_tolerance= 1e-5,
                   ipm_optimality_tolerance= 1e-4,
                   parallel= "on",
                   random_seed= 123
              )
        
        o.stores.e_initial = o.stores_t.e.loc[snapshots].iloc[-1]
def average_every_nhours(n, offset):#average of 1 day, / timeraange
    m = n.copy(with_time=False)

    snapshot_weightings = n.snapshot_weightings.resample(offset).sum()
    m.set_snapshots(snapshot_weightings.index)
    m.snapshot_weightings = snapshot_weightings

    for c in n.iterate_components():
        pnl = getattr(m, c.list_name + "_t")
        for k, df in c.pnl.items():
            if not df.empty:
                pnl[k] = df.resample(offset).mean()

    return m
def add_load_shed_nc(o): #generator at very high costs
    #se ha creado una nueva matriz de buses, solo nombrando nc_buses (q esta vacio), y adjudicandoles los indices de HP y EV (index.to_list())
    nc_buses = o.buses.filter(like="HP",axis=0).index.to_list() + o.buses.filter(like="EV",axis=0).index.to_list()
    #luego les anhade otros parametros en Generator, de manera que"o" tiene ya buses+lost-load, con una potencia, un bus asociado, y un coste marginal
    o.madd("Generator", [i + " lost-load" for i in nc_buses], bus = nc_buses, p_nom = 1e5, marginal_cost= 10e3)
    o.madd("Generator", [i + " lost-gen" for i in nc_buses], bus = nc_buses, p_nom = 1e5, marginal_cost= -10e3, 
           p_min_pu = -1, p_max_pu = 0)
    
    return o
def average_every_nhours(n, offset):#average of 1 day, / timeraange
    m = n.copy(with_time=False)

    snapshot_weightings = n.snapshot_weightings.resample(offset).sum()
    m.set_snapshots(snapshot_weightings.index)
    m.snapshot_weightings = snapshot_weightings

    for c in n.iterate_components():
        pnl = getattr(m, c.list_name + "_t")
        for k, df in c.pnl.items():
            if not df.empty:
                pnl[k] = df.resample(offset).mean()

    return m

#main
time_aggregations = pd.Series([168]) #[168,24, 1]
time_aggregations = pd.Series([str(i) + "h" for i in time_aggregations.values])

#1 trasnform
for su in n.storage_units.index:
    replace_su(n, su);
stores_idx=n.stores.filter(like="hydro", axis=0).filter(regex='BA|BE|BG|CH|CZ|DE|ES|FI|FR|GB|GR|HR|HU|IT|NO|PL|PT|RO|RS|SE|SI|SK', axis=0).index
country_stores= n.stores.loc[stores_idx].bus.str[0:2]
def normed(s): return s/s.sum()
n.stores.e_initial= n.stores.e_nom.groupby(country_stores).transform(lambda s: normed(s)*hydro_initial_level[s.name]).where(lambda s: s>0.1,0.).fillna(0)

if len(n.snapshots)<8000:
    n.stores.e_cyclic=False

#increase water in NO by 34500 -32800= 1700 MW. Below links had lost load previously (NO2 22 hydro inflow, NO2 11 hydro inflow)
n.links.loc['NO2 22 hydro converter hydro to AC','p_nom']= n.links.loc['NO2 22 hydro converter hydro to AC','p_nom']+400
n.links.loc['NO2 11 hydro converter hydro to AC','p_nom']= n.links.loc['NO2 11 hydro converter hydro to AC','p_nom']+1300

n = add_load_shed_nc(n)
m = average_every_nhours(n, time_aggregations[0])
m.madd("Generator", m.buses.index + " load", bus = m.buses.index, p_nom = 1e9, marginal_cost = 10e3)
m.madd("Generator", m.buses.index + " gen",  bus = m.buses.index, p_nom=1e9, p_min_pu = -1, p_max_pu=0, marginal_cost = -10e3)

m.optimize(solver_name="highs")

iterations = pd.Series(dtype=object, index=[0])

iterations[0] = m

for i in range(1, len(time_aggregations)):
    horizon = (
        len(pd.Series(index = pd.date_range(freq=time_aggregations[i-1], 
                                            start=iterations[i-1].snapshots[0], 
                                            periods=2))
            .resample(time_aggregations[i]).asfreq()) 
        -1
    )

    time_aggregation = time_aggregations[i]

    print("\nstart with " + time_aggregation + " run \n")

    iterations[i] = average_every_nhours(n, time_aggregation)
    solve_rolling_horizon(iterations[i-1], 
                          iterations[i], 
                          time_aggregation, 
                          horizon
                         )

iterations.iloc[-1].export_to_netcdf("/nc_files/output.nc")
