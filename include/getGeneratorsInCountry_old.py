import pypsa
import pandas as pd

def generators_in_country(network):
    #target_countries = ["EE", "LV", "LT", "PL", "DK", "DE", "NO", "SE", "FI"]
    target_countries = ["EE", "LV", "LT"]
    #prendo tutti i buses nella lista dei paesi
    buses_in_countries = network.buses[
        network.buses["country"].isin(target_countries)
    ]
    #filtro nel dataframe le colonne che mi interessano
    filtered_df = network.generators[['p_nom', 'carrier', 'bus']]
    generators_in_countries = filtered_df[
        network.generators["bus"].map(lambda bus: network.buses.loc[bus, "country"]).isin(target_countries)
    ]
    #raggruupo i generators per bus
    generators_per_bus_df = generators_in_countries.groupby('bus')
    #calcolo loads e generations
    buses_df = buses_in_countries.copy()
    buses_df["bus_name"] = buses_df.index  # Add bus names for reference
    # Step 2: Calculate total generation per bus
    # Filter and group generators by bus, then sum their nominal power
    generators_per_bus = network.generators.groupby("bus")["p_nom"].sum()
    # Step 3: Calculate total load per bus
    # Filter and group loads by bus, then sum their power setpoints
    loads_per_bus = network.loads.groupby("bus")["p_set"].sum()
    # Step 4: Merge the generation and load totals with the bus DataFrame
    buses_df["total_generation"] = buses_df["bus_name"].map(generators_per_bus).fillna(0)
    buses_df["total_load"] = buses_df["bus_name"].map(loads_per_bus).fillna(0)
    ######################################################################
    buses_values = network.buses_t.p.tail(1)
    ######################################################################LOST LOAD
    countries = network.buses.country.unique()
    countries = countries[:-1]
    lost_generators = network.generators.index[network.generators.index.str.contains("lost", case=False, na=False)]
    #print(lost_generators)
    result = {}
    for gen in lost_generators:
        power_output = network.generators_t.p[gen]
        total_energy = power_output.sum() / 1000
        
        if total_energy > 1:
            result[gen] = f"{total_energy}" #in  GWh
    #print(result)
    #buses_df["last_value"] = buses_values["bus_name"].map(generators_per_bus).fillna(0)
    #converto in pandas dataframe
    df1 = pd.DataFrame(buses_in_countries)
    df3 = pd.DataFrame(generators_per_bus_df)
    df4 = pd.DataFrame(buses_df)
    df5 = pd.DataFrame(buses_values)
    #converto in json
    json_data1b = df1.to_json()
    json_data3 = df3.to_json(orient="records")
    json_data4 = df4.to_json(orient="records")
    json_data5 = df5.to_json(orient="records")
    json_data6 = pd.Series(result).to_json()
    json_data = [json_data1b, json_data3, json_data4, json_data5, json_data6]

    return json_data

