import pypsa

def attack_element(n, category, index):
    #1 generetor attack
    if category == "gen":
        try:      
            n.generators.loc[index, 'p_max_pu'] = 0.1
            n.generators.loc[index, 'p_min_pu'] = 0
            n.export_to_netcdf("/app/import/temporary.nc")
            return "ok"
        except Exception as e:
            print(f"Attack power plant generator function: {e}")
            return "error attack generator"
        
    #2 line attack
    if category == "line":
        try:      
            n.lines.loc[index,'s_max_pu']=0.1
            n.export_to_netcdf("/app/import/temporary.nc")
            return "ok"
        except Exception as e:
            print(f"Attack Line function: {e}")
            return "error attack line"
    
    #3 link attack
    if category == "link":
        try:      
            n.links.loc[index,'p_max_pu']=0.1
            n.links.loc[index,'p_min_pu']=-0.1
            n.export_to_netcdf("/app/import/temporary.nc")
            return "ok"
        except Exception as e:
            print(f"Attack link function: {e}")
            return "error attack link"