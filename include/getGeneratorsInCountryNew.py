import pypsa
import pandas as pd
import json


def network_to_json(network):
    # Load the network
    # network = pypsa.Network(nc_file)

    # Filter buses for EE LV and LT layers (assuming this info is in network.buses)
    # If you have specific layers or naming, adjust the filter accordingly.
    # For example, assuming network.buses has a 'layer' column or naming pattern:
    # Let's assume layer info is in network.buses["layer"] and EE LV LT are "EE", "LV", "LT"
    # You can adapt this if your data differs.
    layers_of_interest = ["EE", "LV", "LT"]
    buses = network.buses[network.buses.index.str.contains("|".join(layers_of_interest))]

    # Prepare a DataFrame with index = bus IDs
    df = pd.DataFrame(index=buses.index)

    # Add coordinates as string pairs (assuming network.buses has columns 'x' and 'y')
    df["coordinates"] = buses.apply(lambda row: (str(row.x), str(row.y)), axis=1)

    # Total load per bus: sum loads over time, grouped by load bus
    total_load_per_bus = network.loads_t.p_set.groupby(network.loads.bus, axis=1).sum().sum()
    load_values = total_load_per_bus.reindex(df.index).fillna(0)

    ray_load = 1 + 9 * (load_values - load_values.min()) / (
        load_values.max() - load_values.min() if load_values.max() != load_values.min() else 1)
    df["ray_load"] = ray_load.round().astype(int)

    # Total production per bus: sum generation over time grouped by gen bus
    gen_prod = network.generators_t.p.groupby(network.generators.bus, axis=1).sum().sum()
    prod_values = gen_prod.reindex(df.index).fillna(0)

    ray_prod = 1 + 9 * (prod_values - prod_values.min()) / (
        prod_values.max() - prod_values.min() if prod_values.max() != prod_values.min() else 1)
    df["ray_prod"] = ray_prod.round().astype(int)

    # Attackable: 'Y' if bus contains at least one generator with p_nom * p_max_pu > 200, else 'N'
    def check_attackable(bus_id):
        gens = network.generators[network.generators.bus == bus_id]
        if gens.empty:
            return "N"

        # Filter out any generator with 'lost-load' in its name or carrier
        gens_filtered = gens[~gens.index.str.contains("lost-load", case=False)]

        # If generator index doesnâ€™t contain the name, you can alternatively filter by carrier:
        # gens_filtered = gens[gens.carrier != "lost-load"]

        if not gens_filtered.empty:
            available_power = gens_filtered.p_nom * gens_filtered.p_max_pu
            if (available_power > 200).any():
                return "Y"
        return "N"

    df["attackable"] = df.index.to_series().apply(check_attackable)

    # Build JSON output with requested structure
    result = []
    for bus_id, row in df.iterrows():
        coord_x, coord_y = row["coordinates"]
        result.append({
            "Id_bus": bus_id,
            "coordinates": [coord_x, coord_y],
            "ray_load": str(row["ray_load"]),
            "ray_prod": str(row["ray_prod"]),
            "attackable": row["attackable"]
        })

    return json.dumps(result, indent=4)

# nc_file = "/trinity/home/ferfede/pypsa/net_files/elec_s_256_ec_lvopt_Ep_sinUA_lines_caps_loads_noaux_dsr_REDUCED.nc"
# json_str = network_to_json(nc_file)
# print(json_str)

