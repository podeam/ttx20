
def get_single_generator_timeseries(network, bus_name, carrier):
    # Step 1: Filter generators by bus and carrier
    matching_generators = network.generators[
        (network.generators['bus'] == bus_name) &
        (network.generators['carrier'] == carrier)
    ]

    if matching_generators.empty:
        return None

    result = {}

    for gen_name in matching_generators.index:
        # Convert all static data to string
        static_data = {k: str(v) for k, v in matching_generators.loc[gen_name].items()}

        # Convert time series timestamps to string keys
        timeseries_data = network.generators_t.p[gen_name]
        timeseries_dict = {str(k): v for k, v in timeseries_data.items()}

        result[gen_name] = {
            "static": static_data,
            "time_series": timeseries_dict
        }

    return result

