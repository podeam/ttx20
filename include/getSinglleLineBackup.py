import json

def get_line_info(n, line_index):
    """
    Given a PyPSA Network (n) and a line index, this function returns the line's capacity,
    average power flow per day, max/min flow, length, the two buses it connects, and the temporal series of the flow.

    Parameters:
    n (pypsa.Network): The PyPSA network object.
    line_index (str): The index of the line in the network.

    Returns:
    dict: A dictionary with the requested line information in JSON format.
    """

    # Retrieve the line data
    line = n.lines.loc[line_index]

    # Extracting the required information:
    capacity = line.s_nom  # Maximum capacity of the line (in MW)
    length = line.length  # Length of the line (in km)

    # Buses connected by the line
    bus_from = line.bus0
    bus_to = line.bus1

    # Power flow data for the line over time
    flow_series = n.lines_t.p0[line_index]  # Power flow (in MW) from bus0 to bus1

    # Average power flow per day (in MW)
    avg_flow_per_day = abs(flow_series).resample('D').mean().mean()  # Daily average flow

    # Maximum and minimum power flow (in MW)
    max_flow = abs(flow_series.max())
    min_flow = abs(flow_series.min())

    # Create the dictionary to return
    line_info = {
        "capacity": capacity,  # in MW
        "avg_flow_per_day": avg_flow_per_day,  # in MW
        "max_flow": max_flow,  # in MW
        "min_flow": min_flow,  # in MW
        "length": length,  # in km
        "buses": {
            "from": bus_from,
            "to": bus_to
        },
        "flow_series": flow_series.tolist()  # Temporal series of the flow (convert to list for JSON compatibility)
    }

    # Return as a JSON formatted string
    return json.dumps(line_info, indent=4)
