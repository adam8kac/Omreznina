import pandas as pd
from time_block import TimeBlockBuilder

def process_file(file, agreed_power_map):
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
            if block_num_str not in agreed_power_map:
                continue
            block_group = month_group[month_group["block"] == int(block_num)]
            agreed_power = float(agreed_power_map[block_num_str])
            block_price = float(block_group["blockPrice"].iloc[0])
            entries = []

            max_power_row = block_group.loc[block_group["P+ Prejeta delovna moč"].idxmax()]
            max_power = round(max_power_row["P+ Prejeta delovna moč"], 2)
            agreed_power_price = round(agreed_power * block_price, 2)

            if max_power <= agreed_power:
                penalty_price = 0.0
                total_price = agreed_power_price
            else:
                delta = round(max_power - agreed_power, 2)
                penalty_price = round(delta * block_price * 0.9, 2)
                total_price = agreed_power_price + penalty_price

            entries.append({
                "block": block_num,
                "blockPrice": block_price,
                "agreedPower": agreed_power,
                "timestamp": max_power_row["timestamp"].strftime("%d-%m %H:%M"),
                "maxPowerRecieved": max_power,
                "delta power": round(max_power - agreed_power, 2),
                "agreed_power_price": agreed_power_price,
                "penalty_price": penalty_price
            })

            year_month_result[year_str][month_str][block_num_str] = {
                "data": entries,
                "total price": round(total_price, 2)
            }
            monthly_total_price += total_price

        year_month_result[year_str][month_str]["total monthly price"] = round(monthly_total_price, 2)

    return year_month_result
