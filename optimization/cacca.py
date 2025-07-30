import pypsa
import pandas as pd
from optimization.network_prepartion_functions import  replace_su

n = pypsa.Network("/app/import/cut_LTpp_256_solved.nc")

# include hydro
hydro_to_AC=-n.links_t.p1.filter(like="hydro to AC").sum().sum()/1000
# list[:-1]
# #
countries=n.buses.country.unique()
countries=countries[:-1]

def mw_to_gwh(mw):
    return mw.sum() / 1000

total_generation = mw_to_gwh(n.generators_t.p.groupby(n.generators.bus.map(n.buses.country),axis=1).sum().loc[:,countries].sum().sum())

total_load = mw_to_gwh(n.loads_t.p.sum())


diff_gen_load = total_generation + hydro_to_AC - total_load

print(f"Total Generation: {total_generation:.2f} GWh")
print(f"Total Load: {total_load:.2f} GWh")
print(f"Differential (Gen + hydro - Load): {diff_gen_load:.2f} GWh")



lost_generators = n.generators.index[n.generators.index.str.contains("lost", case=False, na=False)]

for gen in lost_generators:
    # Get the power output for this generator across all time steps
    power_output = n.generators_t.p[gen]
    
    # Calculate the total energy by summing the power output over all time steps
    total_energy = power_output.sum()/1000  # This assumes the time steps are in consistent units (e.g., hours)
    
    # If the total energy is greater than zero, print the generator name and its total energy
    if total_energy > 1:
        print(f"Generator '{gen}' total energy: {total_energy} GWh")




