def generation_per_country_carrier(network):
    # Extract generator outputs (p_nom_opt for optimized generation or p_set for fixed generation)
    generation = network.generators_t.p.sum(axis=0)  # Total generation over the entire time period

    # Merge generation with generator attributes (country and carrier)
    gen_info = network.generators[["bus", "carrier"]]
    gen_info["generation"] = generation

    # Map buses to countries if the 'bus' attribute has country info
    selected_countries = ['EE', 'LV', 'LT']
    # bus_info = network.buses
    bus_info = network.buses[network.buses["country"].isin(selected_countries)]

    if "country" in bus_info.columns:
        gen_info["country"] = gen_info["bus"].map(bus_info["country"])
    else:
        print("No country information found in buses!")
        return None
    #print(gen_info)
    # Group by country and carrier
    #grouped = gen_info.groupby(["carrier","country"])["generation"].sum().unstack(fill_value=0)
    grouped = gen_info.groupby(["country","carrier"])["generation"].sum().unstack(fill_value=0)
    #print(grouped)
    json_data = grouped.to_json()
    return json_data

