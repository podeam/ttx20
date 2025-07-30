
def run(m, o, time_aggregation, horizon):
        #here m is already solved, o still to be solvced
        o.storage_units.cyclic_state_of_charge=False
        o.stores.e_cyclic=False
       
       #step for contraining and facilitating optimization step#######PLEASE CLARIFY HERE 
        o.stores_t.e_min_pu = ( #e_min_pu is a model constraint, if I fix it the optimization cannot go beyond this limit
            (m.stores_t.e/(m.stores.e_nom+0.00001)) #creating a local variable with per unit starge level (from 0 to 1)
            .shift(1) #unclear why i'm shifting in time  below of 1 point
            .resample(time_aggregation).asfreq()
            .shift(-1) #aqui lo que hace es cambia a shift (1) para resample (timeaggregation) y vuelve a cambiar. El quid es e/enom
            .fillna(0)
        ).clip(upper=.999, lower =0.).reindex(o.snapshots).fillna(0)

        #o.stores.e_initial = m.stores_t.e.iloc[-1] #just in case of cyclic

        o.madd("Generator", 
            o.buses.query("carrier == 'AC'").index + "lost-load", 
            bus = o.buses.query("carrier == 'AC'").index, 
            p_nom = 1e6, 
            marginal_cost = 10e3
            )
        
        for i in range(len(o.snapshots)//horizon): #len(n)/time_aggragation[1]/horizon. e.g. if len(n) = 720 ->720/24=30 round(30/7)=4
            #let us determine the new snapshot moving window for optimization
            start= i* horizon
            end = min((i+1)*horizon, len(o.snapshots))
            
            print("optimizing time period between " + str(o.snapshots[start]) + " and " + str(o.snapshots[end-1]))
            
            snapshots = o.snapshots[start:end]
            
            o.optimize(solver_name="highs",
                    snapshots = snapshots,
                    solver= "ipm",
                    run_crossover= "off",
                    small_matrix_value= 1e-6,
                    large_matrix_value= 1e9,
                    primal_feasibility_tolerance= 1e-5,
                    dual_feasibility_tolerance= 1e-5,
                    ipm_optimality_tolerance= 1e-4,
                    parallel= "on",
                    random_seed= 123
                )
            
            
            o.stores.e_initial = o.stores_t.e.loc[snapshots].iloc[-1] 