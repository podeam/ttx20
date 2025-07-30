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

    # total load per country
    # selected_country = "EE"
    # country_buses_ee = n.buses[n.buses["country"] == selected_country].index
    # country_loads_ee = n.loads[n.loads["bus"].isin(country_buses_ee)]
    # country_load_timeseries_ee = n.loads_t.p_set[country_loads_ee.index]
    # total_load_timeseries_ee = country_load_timeseries_ee.sum(axis=1).squeeze()
    # total_load_timeseries_ee = total_load_timeseries_ee.to_json(date_format="iso")
    ee_loads = n.loads[n.loads.bus.str.startswith('EE')]
    ee_load_timeseries = n.loads_t.p_set[ee_loads.index]
    ee_total_load_per_snapshot = ee_load_timeseries.sum(axis=1)
    df = pd.DataFrame({
        "data": ee_total_load_per_snapshot.index,
        "EE_total_load": ee_total_load_per_snapshot.values
    })
    total_load_timeseries_ee = df.to_json(orient='records', date_format="iso")

    lt_loads = n.loads[n.loads.bus.str.startswith('LT')]
    lt_load_timeseries = n.loads_t.p_set[lt_loads.index]
    lt_total_load_per_snapshot = lt_load_timeseries.sum(axis=1)
    df = pd.DataFrame({
        "data": lt_total_load_per_snapshot.index,
        "LT_total_load": lt_total_load_per_snapshot.values
    })
    total_load_timeseries_lt = df.to_json(orient='records', date_format="iso")

    lv_loads = n.loads[n.loads.bus.str.startswith('LV')]
    lv_load_timeseries = n.loads_t.p_set[lv_loads.index]
    lv_total_load_per_snapshot = lv_load_timeseries.sum(axis=1)
    df = pd.DataFrame({
        "data": lv_total_load_per_snapshot.index,
        "LV_total_load": lv_total_load_per_snapshot.values
    })
    total_load_timeseries_lv = df.to_json(orient='records', date_format="iso")

    result_json = {
        "LostEnergyData": json.loads(json_data1),  # total lost load for single generator
        "LV_SummedValues": summed_values_lv,
        "LT_SummedValues": summed_values_lt,
        "EE_SummedValues": summed_values_ee,
        "EE_loads": json.loads(total_load_timeseries_ee),
        "LV_loads": json.loads(total_load_timeseries_lv),
        "LT_loads": json.loads(total_load_timeseries_lt)
    }

    return json.dumps(result_json, indent=4)
