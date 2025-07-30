#mod finalmente
import pypsa
from optimization.rolling_horizon_ts_func import run

def attack(pp_name, n):
    try:
        start=n.snapshots[0]
        end=n.snapshots[-1]
        gen_cut=n.generators.filter(like='LT',axis=0).filter(like='CCGT',axis=0).p_nom.idxmax() #sselectin the largest gas gen in LT
        n.generators.loc[gen_cut,'p_max_pu']=0.1
        n.generators.loc[gen_cut,'p_min_pu']=0
        opt_network = run(n)
        opt_network.export_to_netcdf("import/temporary.nc")
        return "ok" #optimazion succesful
    except Exception as e:
        print("edit single line error")
        print(f"An error occurred: {e}")
        return "error"

# network = pypsa.Network("/app/import/case2_SE_LT_AND_PL_LT_red_red_1024_solved.nc")
# attack("asd", network)


