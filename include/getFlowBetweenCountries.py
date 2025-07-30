import pandas as pd
import json
from collections import defaultdict
 
# Function to compute flow between countries
def compute_flows_between_countries(network):
    # Initialize a dictionary to group flows by country pairs
    country_flows = defaultdict(lambda: {"flow_from_to": 0.0, "flow_to_from": 0.0})

    # Loop through all lines in the network
    for line_name, line in network.lines.iterrows():
        # Extract origin and destination buses
        bus0 = line["bus0"]
        bus1 = line["bus1"]

        # Get the countries of the origin and destination buses
        country0 = network.buses.loc[bus0, "country"]
        country1 = network.buses.loc[bus1, "country"]

        # Skip if the countries are the same (no cross-border flow)
        if country0 == country1:
            continue

        # Calculate the total flow over the line (sum over all snapshots)
        flow_from_to = network.lines_t.p0.loc[:, line_name].sum()  # Flow from bus0 to bus1
        flow_to_from = network.lines_t.p1.loc[:, line_name].sum()  # Flow from bus1 to bus0

        # Sort the countries to ensure consistent pairing (e.g., "FR-DE" is the same as "DE-FR")
        country_pair = tuple(sorted((country0, country1)))

        # Aggregate flows in the dictionary
        country_flows[country_pair]["flow_from_to"] += flow_from_to
        country_flows[country_pair]["flow_to_from"] += flow_to_from

    # Process **link flows** (DC connections, interconnectors)
    for link_name, link in network.links.iterrows():
        bus0, bus1 = link["bus0"], link["bus1"]
        country0, country1 = network.buses.loc[bus0, "country"], network.buses.loc[bus1, "country"]

        if country0 != country1:  # Only cross-border links
            flow_from_to = network.links_t.p0.loc[:, link_name].sum()  # Bus0 → Bus1
            flow_to_from = -network.links_t.p0.loc[:, link_name].sum()  # Bus1 → Bus0 (negative sign for reverse direction)
            country_pair = tuple(sorted((country0, country1)))
            country_flows[country_pair]["flow_from_to"] += flow_from_to
            country_flows[country_pair]["flow_to_from"] += flow_to_from

    # Convert the grouped flows into a JSON-friendly format
    grouped_flows = [
        {
            "countries": pair,
            "flow_from_to": flows["flow_from_to"],
            "flow_to_from": flows["flow_to_from"]
        }
        for pair, flows in country_flows.items()
    ]

    # Convert grouped flows to JSON
    # print(type(grouped_flows))
    #grouped_flows_json = json.dumps(grouped_flows, indent=4)
    # Print the JSON result
    # print(type(grouped_flows_json))
    df = pd.DataFrame(grouped_flows)
    # print(type(df))
    json_data = df.to_json()
    #json_data = [{"data": "json_data"}]
    return json_data

