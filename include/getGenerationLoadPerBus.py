import pypsa


def single_bus_gen_load(bus_name, n):
    # 1. Energy per carrier at the specified bus
    energy_by_carrier = {}

    # Find all components connected to the bus
    connected_generators = n.generators[n.generators.bus == bus_name]

    # Sum energy over time for each carrier
    for _, gen in connected_generators.iterrows():
        p = n.generators_t.p[gen.name]
        energy_by_carrier.setdefault(gen.carrier, 0)
        energy_by_carrier[gen.carrier] += p.sum()

    # 2. Total load at the bus
    connected_loads = n.loads[n.loads.bus == bus_name]
    load_time_series = n.loads_t.p[connected_loads.index].sum(axis=1)
    total_load_sum = load_time_series.sum()

    # 3. Total lost load over time

    lost_load = n.generators_t.p.filter(like='lost-load', axis=1).groupby(n.generators.bus, axis=1).sum()
    lost_load_series = lost_load[bus_name]
    lost_load_series = lost_load_series.to_json()

    print(type(lost_load_series))
    # 4. Write to JSON
    json = {
        "bus": bus_name,
        "energy_by_carrier_MWh": {k: round(v, 2) for k, v in energy_by_carrier.items()},
        "total_load_MWh": round(total_load_sum, 2),
        "lost_load_time_series_MW": lost_load_series
        # "lost_load_time_series_MW": lost_load_series.round(2).to_dict()
    }

    return json