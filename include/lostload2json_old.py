import pandas as pd
import numpy as np
import json

def getLostLoad(n):
    lost_generators = n.generators.index[n.generators.index.str.contains("lost", case=False, na=False)]
    
    result1 = {}
    result2 = {}

    for gen in lost_generators:
        power_output = n.generators_t.p[gen]
        total_energy = power_output.sum() / 1000
        if total_energy > 1:
            result1[gen] = total_energy
            result2[gen] = power_output.tolist()  # Ensure values are JSON serializable

    if not result1:
        return json.dumps({})  # Return an empty JSON object instead of a string "{}"

    # Create DataFrames
    df1 = pd.DataFrame(list(result1.items()), columns=['Generator', 'Lost_Energy'])
    df2 = pd.DataFrame.from_dict(result2, orient="index").reset_index().rename(columns={"index": "Generator"})
    json_data1 = df1.to_json(orient='records')

    filtered_values_lv = [row[1:] for _, row in df2.iterrows() if "LV" in row["Generator"]]
    filtered_values_lt = [row[1:] for _, row in df2.iterrows() if "LT" in row["Generator"]]
    filtered_values_ee = [row[1:] for _, row in df2.iterrows() if "EE" in row["Generator"]]

    if filtered_values_lv:
        summed_values_lv = np.sum(filtered_values_lv, axis=0).tolist()
    else:
        summed_values_lv = []

    if filtered_values_lt:
        summed_values_lt = np.sum(filtered_values_lt, axis=0).tolist()
    else:
        summed_values_lt = []

    if filtered_values_ee:
        summed_values_ee = np.sum(filtered_values_ee, axis=0).tolist()
    else:
        summed_values_ee = []

    selected_country = "EE"  
    selected_country = "EE"
    country_buses_ee = n.buses[n.buses["country"] == selected_country].index
    country_loads_ee = n.loads[n.loads["bus"].isin(country_buses_ee)]
    country_load_timeseries_ee = n.loads_t.p_set[country_loads_ee.index]
    total_load_timeseries_ee = country_load_timeseries_ee.sum(axis=1).squeeze()
    total_load_timeseries_ee = total_load_timeseries_ee.to_json(date_format="iso")

    selected_country = "LT"
    country_buses_lt = n.buses[n.buses["country"] == selected_country].index
    country_loads_lt = n.loads[n.loads["bus"].isin(country_buses_lt)]
    country_load_timeseries_lt = n.loads_t.p_set[country_loads_lt.index]
    total_load_timeseries_lt = country_load_timeseries_lt.sum(axis=1).squeeze()
    total_load_timeseries_lt = total_load_timeseries_lt.to_json()

    selected_country = "LV"
    country_buses_lv = n.buses[n.buses["country"] == selected_country].index
    country_loads_lv = n.loads[n.loads["bus"].isin(country_buses_lv)]
    country_load_timeseries_lv = n.loads_t.p_set[country_loads_lv.index]
    total_load_timeseries_lv = country_load_timeseries_lv.sum(axis=1).squeeze()
    total_load_timeseries_lv = total_load_timeseries_lv.to_json()

    result_json = {
        "LostEnergyData": json.loads(json_data1),
        "LV_SummedValues": summed_values_lv,
        "LT_SummedValues": summed_values_lt,
        "EE_SummedValues": summed_values_ee,
        "EE_loads": total_load_timeseries_ee,
        "LV_loads": total_load_timeseries_lv,
        "LT_loads": total_load_timeseries_lt,
    }

    return json.dumps(result_json, indent=4)

