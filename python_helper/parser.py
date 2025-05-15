import pandas as pd
import os
from collections import defaultdict

def filter_files():
    files = os.listdir(".")
    FILE_ENDINGS = ["csv", "xlsx", "xlsm", "xlsb", "xltx", "xltm", "xls", "xlt", "xlw"]

    filtered_files = {
        "csv": [],
        "xlsx": []
    }

    for file in files:
        file_parsed = file.split(".")
        if len(file) > 1:
            extension = file_parsed[-1].lower()
            # print(extension)

            if extension in FILE_ENDINGS:
                if extension == "csv":
                    filtered_files["csv"].append(file)
                else:    
                    filtered_files["xlsx"].append(file)
    
    return read_files(filtered_files)

def read_files(files):
    results = []

    for key, values in files.items():
        for val in values:
            try:
                if key == "csv":
                    df = pd.read_csv(val)
                    df["Datum"] = pd.to_datetime(df["Datum"], dayfirst=False, errors="coerce").dt.date
                    df.set_index("Datum", inplace=True)
                    # print("\nCSV:\n", df)
                elif key == "xlsx":
                    df = pd.read_excel(val, engine="openpyxl")
                    df["Datum"] = pd.to_datetime(df["Datum"], dayfirst=False, errors="coerce").dt.date
                    df.set_index("Datum", inplace=True)
                    # print("\nEXCEL:\n", df)
                    
                result = process_file(df)
                results.append(result)
            except Exception as e:
                print(f"Napaka pri {val}: {e}")

    return results


def process_file(file: pd.DataFrame):
    df_copy = file.copy()
    first_index_month = str(file.index[0]).split("-")[1]
    # print("prvi mesec:", first_index_month)

    structured_obj = defaultdict(dict)
    
    delta_values = calulate_delta(df_copy)
    # print(delta_values)

    json_obj = {}
    for index, row in file.iterrows():
        index_split = str(index).split("-")
        year, month, day = index_split
        month_key = f"{year}-{month}"
       
        if month != first_index_month:
            continue

        if month_key not in json_obj:
            json_obj[month_key] = {}

        day_data = {}

        if index_split[1] != first_index_month:
            # print(index)
            file.drop(index=index, inplace=True)
        else:
            # print(index)
            for column_name in file.columns:
                value = row[column_name]
                # če hočemo odstranit vrendosti 0 pri prejeti/oddani energiji odkomentiraj(težave mogoče da če pride do nejasnosti podatkov da kje manjka kaka vrednost je lahko zaradi tega) ~ 3kb razlike v velikosti jsona če damo 0 stran
                # if isinstance(value, (int, float)) and value == 0:  
                #     continue
                day_data[column_name.lower()] = value

            for col_name, series in delta_values.items():
                delta = series.get(index)
                if delta is not None and not pd.isna(delta):
                    key = col_name.lower()
                    day_data[key] = round(delta, 3)

        json_obj[month_key][str(index)] = day_data

    return json_obj


def calulate_delta(df: pd.DataFrame):
    delta_values = {}
    columns = df.select_dtypes(include=["float64", "int64"]).columns

    for col in df.describe().columns:
        delta_values[f"delta {col}"] = df[col].diff().shift(-1).dropna()

    for i in range(0, len(columns) - 1, 2):
        col1_name = columns[i]
        col2_name = columns[i + 1]

        series1 = delta_values.get(f"delta {col1_name}")
        series2 = delta_values.get(f"delta {col2_name}")

        if series1 is not None and series2 is not None:
            new_col_name = col1_name.strip().split(" ")[-1].lower()  
            delta_values[f"poraba {new_col_name}"] = series1 - series2  #če je + poraba ppomeni da je poraba več kot oddaja(si ti v minus ker morš plačat)

    return delta_values