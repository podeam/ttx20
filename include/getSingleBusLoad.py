import pandas as pd

def single_bus_load(bus_name, network):
    # Find loads connected to the current bus
    loads_at_bus = network.loads.index[network.loads['bus'] == bus_name]
    loads_at_bus = network.loads.index[network.loads['bus'] == bus_name]
    loads_time_series = (
        network.loads_t.p_set[loads_at_bus] if not loads_at_bus.empty else pd.DataFrame()
    )

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
    ##########################################################lines connected
    # Find lines connected to the bus
    connected_lines_1 = network.lines[(network.lines['bus0'] == bus_name)]
    connected_lines_2 = network.lines[(network.lines['bus1'] == bus_name)]
    connected_lines_indices_1 = connected_lines_1.index
    connected_lines_indices_2 = connected_lines_2.index
    # print(connected_lines_indices)
    # Extract time series of power flows
    line_timeseries_p0 = network.lines_t.p0[connected_lines_indices_1]
    line_timeseries_p1 = network.lines_t.p1[connected_lines_indices_2]

    json_data1 = loads_time_series.to_json()
    json_data2 = total_generation_at_bus.to_json()
    json_data3 = df.to_json(orient="records")
    json_data4 = total_generation_by_carrier.to_json()
    json_data5 = line_timeseries_p0.to_json()
    json_data6 = line_timeseries_p1.to_json()
    json_data7 = generators_at_target_bus.to_json()
    #json_data7 = generators_at_target_bus.to_json(orient="records")

    json_data = [json_data1, json_data2, json_data3, json_data4, json_data5, json_data6, json_data7]
    return(json_data)



