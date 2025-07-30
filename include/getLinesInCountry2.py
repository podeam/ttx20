import pandas as pd

def lines_in_country2(network):
    #target_countries = ["EE", "LV", "LT", "PL", "DK", "NO", "SE", "FI"]
    target_countries = ["EE", "LV", "LT"]
    #prendo tutti i buses nella lista dei paesi
    buses_in_countries = network.buses[
        network.buses["country"].isin(target_countries)
    ]

    buses_in_countries = network.buses[network.buses["country"].isin(target_countries)].index
    # Filter lines by buses in selected countries
    lines_in_countries = network.lines[
        (network.lines["bus0"].isin(buses_in_countries)) |
        (network.lines["bus1"].isin(buses_in_countries))
    ].index

    # Calculate effective utilization of lines
    # line_flows = abs(network.lines_t.p0)  # Power flow on bus0 side of the line
    # line_capacities = network.lines.s_nom  # Line nominal capacities
    # line_utilization = line_flows.div(line_capacities, axis=0) * 100  # Utilization in %
    # Extract peak utilization (maximum over all snapshots)
    # peak_utilization = line_utilization.max(axis=0)

    line_flows = network.lines_t.p0  # Power flows on lines
    line_capacities = network.lines.s_nom  # Nominal capacities
    if line_flows.empty:
        line_utilization = 0
        line_utilization_2 = []
        peak_utilization = []
        average_utilization = []
        line_utilization_2 = []
    else:
        line_utilization = abs(line_flows) / line_capacities
        peak_utilization = round(line_utilization.max(axis=0),2)
        average_utilization = round(line_utilization.mean(axis=0),2)
        line_utilization_2 = round(line_flows.sum(axis=0))
    # Extract coordinates for the line endpoints (bus0 and bus1)
    line_data = []
    for line in lines_in_countries:
        bus0 = network.lines.at[line, "bus0"]
        bus1 = network.lines.at[line, "bus1"]
        if line_flows.empty:
            lf = []
            lf_t = []
            pu = 0
            au = 0
            saturation_percent = 0
        else:
            lf = line_utilization_2[line]
            lf_t = line_flows[line]
            pu = peak_utilization[line]
            au = average_utilization[line]

            line_flow_series = network.lines_t.p0[line]
            abs_flows = line_flow_series.abs()
            #max_abs_flow = abs_flows.max()
            line_capacity = network.lines.loc[line, 's_nom']
            saturation_percent_series = (abs_flows / abs_flows.max()) * 100
            #saturation_percent_series = (abs_flows / line_capacity) * 100
            saturation_percent = saturation_percent_series.mean()

        line_data.append({
            "line_name": line,
            "line_flows": lf,
            "line_flows_t": lf_t,
            "bus0": bus0,
            "bus1": bus1,
            "bus0_coordinates": {
                "x": network.buses.at[bus0, "x"],
                "y": network.buses.at[bus0, "y"]
            },
            "bus1_coordinates": {
                "x": network.buses.at[bus1, "x"],
                "y": network.buses.at[bus1, "y"]
            },
            "peak_utilization": pu,  # Peak effective utilization (%)
            "average_utilization": au, # Average utilization (%)
            "capacity": network.lines.at[line, "s_nom"],  # Line capacity (MW)
            "length": network.lines.at[line, "length"],   # Line length (km)
            "saturation_percent": saturation_percent
        })
    #converto in pandas dataframe
    #df1 = pd.DataFrame(buses_in_countries)
    df2 = pd.DataFrame(line_data)
    #converto in json
    #json_data1 = df1.to_json()
    json_data2 = df2.to_json(orient="records")

    #print(json_data1)

    #json_data = [json_data1, json_data2]
    json_data = [json_data2]
    return(json_data)
