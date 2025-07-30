import json

def get_link_info(n, link_index):
    """
    Given a PyPSA Network (n) and a link index, this function returns the link's capacity,
    average power flow per day, max/min flow, length (if defined), the two buses it connects, and the temporal series of the flow
    along with the relative timestamps.
    Parameters:
    n (pypsa.Network): The PyPSA network object.
    link_index (str): The index of the link in the network.
    Returns:
    str: A JSON formatted string with the requested link information.
    """
    # Retrieve the link data
    link = n.links.loc[link_index]
    # Extracting the required information:
    capacity = link.p_nom  # Nominal power capacity of the link (in MW)
    length = link.get("length", None)  # Length if available, otherwise None
    # Buses connected by the link
    bus_from = link.bus0
    bus_to = link.bus1
    # Power flow data for the link over time
    flow_series = n.links_t.p0[link_index]  # Power flow (in MW) from bus0 to bus1
    # Average power flow per day (in MW)
    avg_flow_per_day = abs(flow_series).resample('D').mean().mean()
    # Maximum and minimum power flow (in MW)
    max_flow = abs(flow_series.max())
    min_flow = abs(flow_series.min())
    # Extract timestamps as ISO format strings for JSON serialization
    timestamps = flow_series.index.to_pydatetime()
    timestamps_str = [ts.isoformat() for ts in timestamps]
    # Create the dictionary to return
    link_info = {
        "capacity": capacity,
        "avg_flow_per_day": avg_flow_per_day,
        "max_flow": max_flow,
        "min_flow": min_flow,
        "length": length,
        "buses": {
            "from": bus_from,
            "to": bus_to
        },
        "flow_series": flow_series.tolist(),
        "timestamps": timestamps_str
    }
    return json.dumps(link_info, indent=4)