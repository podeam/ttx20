import pandas as pd

def single_bus_links(bus_name, network):
    # Step 1: Find all links connected to the bus (either as bus0 or bus1)
    connected_links = network.links[
        (network.links["bus0"] == bus_name) | (network.links["bus1"] == bus_name)
    ]
    # Step 2: Extract the names of the connected links
    link_names = connected_links.index.tolist()

    # Step 3: Get the time series for the selected links
    # For power flow at the "from" side (bus0)
    timeseries_p0 = network.links_t["p0"][link_names]

    # For power flow at the "to" side (bus1)
    timeseries_p1 = network.links_t["p1"][link_names]

    # Optional: Combine the two for convenience
    link_timeseries = pd.concat(
        {"p0": timeseries_p0, "p1": timeseries_p1}, axis=1
    )

    # Display or save the DataFrame
    json_data = link_timeseries.to_json()
    return json_data


#single_bus_links("DE1 0")
