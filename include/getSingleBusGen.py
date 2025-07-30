import pandas as pd

def single_bus_gen(bus_name, network):
    # Find loads connected to the current bus
    loads_at_bus = network.loads.index[network.loads['bus'] == bus_name]
    if not loads_at_bus.empty:
        # Get the time-varying load data for the loads
        loads_time_series = network.loads_t.p_set[loads_at_bus]
        # Get the time-series power output for these generators

    generators_at_target_bus = network.generators[network.generators["bus"] == bus_name]
    generation_time_series = network.generators_t.p[generators_at_target_bus.index]
    total_generation_at_bus = generation_time_series.sum(axis=1)

    total_generation_target_bus = generation_time_series.sum().sum()  # Sum of all generators over time
    total_load_target_bus = loads_time_series.sum().sum()  # Sum of all loads over time
    net_balance = total_generation_target_bus - total_load_target_bus
    df = pd.DataFrame(columns=["total_load", "total_generation", "net_balance"])
    df.loc[0] = [total_load_target_bus,total_generation_target_bus,net_balance]

    carrier_info = generators_at_target_bus["carrier"]
    generation_by_carrier = generation_time_series.groupby(carrier_info, axis=1).sum()  # Sum by carrier
    total_generation_by_carrier = generation_by_carrier.sum(axis=0)

    json_data = total_generation_by_carrier.to_json()
    #json_data = generators_at_target_bus.to_json()
    return(json_data)



