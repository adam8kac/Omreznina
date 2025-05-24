import pandas as pd

def process_file(file, agreed_power_map: dict):
    if file.endswith("xlsx"):
        df = pd.read_excel(file, engine="openpyxl")
    elif file.endswith("csv"):
        df = pd.read_csv(file)
    else:
        return {"error": "Unsupported file type"}

    df = df[["Leto", "Mesec", "Časovna značka", "P+ Prejeta delovna moč"]]
    year_month_max_P = {}

    for (year, month), group in df.groupby(["Leto", "Mesec"]):
        year_str = str(year)
        month_str = f"{int(month):02d}"

        dogovorjena_moc = float(agreed_power_map[month_str])

        if year_str not in year_month_max_P:
            year_month_max_P[year_str] = {}

        over_threshold = group[group["P+ Prejeta delovna moč"] > dogovorjena_moc]

        entries = []

        if not over_threshold.empty:
            for _, row in over_threshold.iterrows():
                timestamp = pd.to_datetime(row["Časovna značka"]).strftime("%d-%m %H:%M")
                power = round(row["P+ Prejeta delovna moč"], 2)
                entries.append({
                    "agreedPower": dogovorjena_moc,
                    "timestamp": timestamp,
                    "maxPowerRecieved": power
                })
        else:
            max_row = group.loc[group["P+ Prejeta delovna moč"].idxmax()]
            timestamp = pd.to_datetime(max_row["Časovna značka"]).strftime("%d-%m %H:%M")
            max_val = round(max_row["P+ Prejeta delovna moč"], 2)
            entries.append({
                "agreedPower": dogovorjena_moc,
                "timestamp": timestamp,
                "maxPowerRecieved": max_val
            })

        year_month_max_P[year_str][month_str] = { "data": entries }

    return year_month_max_P
