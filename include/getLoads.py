import pandas as pd
'''
def loads(network):
    target_countries = ["EE", "LV", "LT"]
    #prendo tutti i buses nella lista dei paesi
    buses_in_countries = network.buses[
        network.buses["country"].isin(target_countries)
    ]
    # Iterate over the list of buses
    result = {}
    for bus_name in buses_in_countries.index:
        # Find loads connected to the current bus
        loads_at_bus = network.loads.index[network.loads['bus'] == bus_name]
        print(f"\nBus: {bus_name}")
        if not loads_at_bus.empty:
            # Time series data for this bus
            load_timeseries_for_bus = network.loads_t.p_set[loads_at_bus]
            # Convert the DataFrame to a dictionary and add it under the bus key
            result[bus_name] = load_timeseries_for_bus.to_dict(orient="index")
        else:
            # If no loads are connected, return an empty dictionary for the bus
            result[bus_name] = {}
    print(result)
    df = pd.DataFrame(result)
    #print(df)
    json_data = df.to_json(orient="records")
    return(json_data)
'''
import pandas as pd

def loads(network):
    target_countries = ["EE", "LV", "LT"]
    buses_in_countries = network.buses[
        network.buses["country"].isin(target_countries)
    ]
    total_load_per_bus = {}
    for bus_name in buses_in_countries.index:
        loads_at_bus = network.loads.index[network.loads['bus'] == bus_name]
        if not loads_at_bus.empty:
            total_load_per_bus[bus_name] = network.loads_t.p_set[loads_at_bus].sum().sum()
        else:
            total_load_per_bus[bus_name] = 0
    df = pd.DataFrame(list(total_load_per_bus.items()), columns=["bus", "total_load"])
    json_data = df.to_json(orient="records")

    return json_data

