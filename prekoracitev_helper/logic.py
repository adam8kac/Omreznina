import pandas as pd

def process_file(file):
	if file.endswith("xlsx"):
		df = pd.read_excel(file, engine="openpyxl")
	elif file.endswith("csv"):
		df = pd.read_csv(file)
	else:
		return {"error": "Unsupported file type"}

	dataframe = df[["Leto", "Mesec", "Časovna značka", "P+ Prejeta delovna moč"]]
	unique_year = dataframe["Leto"].unique()
	unique_months = dataframe["Mesec"].unique()
	# print(dataframe, unique_months, unique_year)

	year_month_max_P = {}

	for year in unique_year:
		year_str = str(year)
		df_current: pd.DataFrame = dataframe[dataframe["Leto"] == year]
		if year not in year_month_max_P:
			year_month_max_P[year_str] = {}

		for month in unique_months:
			df_current_month: pd.DataFrame = df_current[df_current["Mesec"] == month]
			new_month_value = f"{int(month):02d}"
			if new_month_value not in year_month_max_P[year_str]:
				year_month_max_P[year_str][new_month_value] = {}

			current_row_with_max_val: pd.DataFrame = df_current_month[df_current_month["P+ Prejeta delovna moč"] == df_current_month["P+ Prejeta delovna moč"].max()]
			max_val = round(current_row_with_max_val["P+ Prejeta delovna moč"].values[0], 2)
			timestamp = pd.to_datetime(current_row_with_max_val["Časovna značka"].values[0])
			timestamp_str = timestamp.strftime("%H:%M")

			year_month_max_P[year_str][new_month_value] = {
				"timestamp": timestamp_str,
				"maxPowerRecieved": max_val
				}

	# print(year_month_max_P)
	return year_month_max_P

