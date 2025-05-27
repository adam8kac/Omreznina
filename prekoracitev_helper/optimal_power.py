import numpy as np
import pandas as pd
from time_block import TimeBlockBuilder

def process_file_optimal(file, agreed_power_map, step=0.1, min_power=4.6, max_delta=3):
    agreed_power_map = {str(k): v for k, v in agreed_power_map.items()}
    df = pd.read_excel(file) if file.endswith('xlsx') else pd.read_csv(file)
    df = df[["Leto", "Mesec", "Časovna značka", "P+ Prejeta delovna moč"]]
    df["timestamp"] = pd.to_datetime(df["Časovna značka"], errors='coerce')
    tbuilder = TimeBlockBuilder()
    df["block"] = None
    df["blockPrice"] = 0.0

    for idx, row in df.iterrows():
        block = tbuilder.get_block(row["timestamp"])
        if block:
            df.at[idx, "block"] = block.block_number
            df.at[idx, "blockPrice"] = block.price

    year_month_result = {}
    for (year, month), month_group in df.groupby(["Leto", "Mesec"]):
        year_str = str(year)
        month_str = f"{int(month):02d}"
        if year_str not in year_month_result:
            year_month_result[year_str] = {}
        if month_str not in year_month_result[year_str]:
            year_month_result[year_str][month_str] = {}

        monthly_total_price = 0  
        for block_num in sorted(month_group["block"].dropna().unique()):
            block_num_str = str(int(block_num))
            best_agreed_power = None
            min_total_price = float('inf')
            best_entries = None
            block_group = month_group[month_group["block"] == int(block_num)]
            orig_power = float(agreed_power_map.get(block_num_str, min_power))
            start_power = max(min_power, orig_power - max_delta)
            stop_power = orig_power + max_delta
            block_price = float(block_group["blockPrice"].iloc[0])

            for agreed_power in np.arange(start_power, stop_power + step, step):
                agreed_power = round(agreed_power, 2)
                total_price = 0
                entries = []
                overruns = block_group[block_group["P+ Prejeta delovna moč"] > agreed_power]
                agreed_power_price = agreed_power * block_price
                total_price += agreed_power_price

                if overruns.empty:
                    max_power_row = block_group.loc[block_group["P+ Prejeta delovna moč"].idxmax()]
                    max_power = round(max_power_row["P+ Prejeta delovna moč"], 2)
                    entries.append({
                        "block": block_num,
                        "blockPrice": block_price,
                        "agreedPower": agreed_power,
                        "timestamp": max_power_row["timestamp"].strftime("%d-%m %H:%M"),
                        "maxPowerRecieved": max_power,
                        "overrun_delta": 0.0,
                        "agreed_power_price": round(agreed_power_price, 2),
                        "penalty_price": 0.0
                    })
                else:
                    for _, row2 in overruns.iterrows():
                        power = round(row2["P+ Prejeta delovna moč"], 2)
                        delta = power - agreed_power
                        penalty_price = round(delta * block_price * 0.9, 2)
                        total_price += penalty_price
                        entries.append({
                            "block": block_num,
                            "blockPrice": block_price,
                            "agreedPower": agreed_power,
                            "timestamp": row2["timestamp"].strftime("%d-%m %H:%M"),
                            "maxPowerRecieved": power,
                            "overrun_delta": round(delta, 2),
                            "agreed_power_price": round(agreed_power_price, 2),
                            "penalty_price": penalty_price
                        })
                if total_price < min_total_price:
                    min_total_price = total_price
                    best_agreed_power = agreed_power
                    best_entries = entries

            year_month_result[year_str][month_str][block_num_str] = {
                "optimal agreed power": best_agreed_power,
                "data": best_entries,
                "total price": round(min_total_price, 2)
            }
            monthly_total_price += min_total_price  

        year_month_result[year_str][month_str]["total monthly price"] = round(monthly_total_price, 2)  

    return year_month_result
