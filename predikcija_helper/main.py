from fastapi import FastAPI, Request
import pandas as pd
from collections import Counter
import requests
import datetime

app = FastAPI()

def get_weather_month(lat, lon, year, month):
    start_date = f"{year}-{int(month):02d}-01"
    if int(month) == 12:
        end_date = f"{int(year) + 1}-01-01"
    else:
        end_date = f"{year}-{int(month) + 1:02d}-01"
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean",
        "timezone": "Europe/Ljubljana"
    }
    r = requests.get(url, params=params)
    if r.status_code == 200:
        data = r.json()
        return pd.DataFrame({
            "date": data["daily"]["time"],
            "temp_max": data["daily"]["temperature_2m_max"],
            "temp_min": data["daily"]["temperature_2m_min"],
            "temp_mean": data["daily"]["temperature_2m_mean"]
        })
    return None

def get_weather_forecast(lat, lon, year, month):
    today = datetime.date.today()
    first_of_month = datetime.date(int(year), int(month), 1)
    if first_of_month >= today:
        start_date = first_of_month.isoformat()
        end_date = min(
            (first_of_month + datetime.timedelta(days=27)),  # max 28 dni v mesecu
            today + datetime.timedelta(days=16)
        ).isoformat()
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean",
            "timezone": "Europe/Ljubljana"
        }
        r = requests.get(url, params=params)
        if r.status_code == 200:
            data = r.json()
            if "daily" in data and "temperature_2m_mean" in data["daily"]:
                temps = data["daily"]["temperature_2m_mean"]
                if len(temps) > 0:
                    mean_temp = sum(temps) / len(temps)
                    return round(mean_temp, 1)
    return None

def parse_data(data):
    rows = []
    for block, v in data.items():
        agreed = None
        if isinstance(v, dict) and "data" in v:
            for d in v["data"]:
                agreed = d.get("agreedPower", agreed)
                peak = d.get("maxPowerRecieved")
                penalty = d.get("penalty_price", 0)
                timestamp = d.get("timestamp")
                block_num = d.get("block", block)
                rows.append({
                    "block": int(block_num),
                    "agreedPower": float(agreed) if agreed else None,
                    "maxPowerRecieved": float(peak) if peak else None,
                    "penalty_price": float(penalty),
                    "timestamp": timestamp
                })
    return rows

@app.post("/detailed_stats")
async def detailed_stats(request: Request):
    req = await request.json()
    lat = req.get("lat")
    lon = req.get("lon")
    year = int(req.get("year"))
    month = int(req.get("month"))
    data = req.get("data")

    rows = parse_data(data)
    df = pd.DataFrame(rows)
    if df.empty:
        return {"error": "Ni podatkov za ta mesec."}

    avg_temp = None
    if lat and lon and year and month:
        weather = get_weather_month(lat, lon, year, month)
        avg_temp = weather["temp_mean"].mean() if weather is not None else None

    forecasted_avg_temp = None
    today = datetime.date.today()
    first_of_month = datetime.date(year, month, 1)
    if lat and lon and (first_of_month >= today):
        forecasted_avg_temp = get_weather_forecast(lat, lon, year, month)

    overruns = df[df["maxPowerRecieved"] > df["agreedPower"]]
    overruns_count = len(overruns)
    avg_penalty = overruns["penalty_price"].mean() if overruns_count else 0
    max_penalty = overruns["penalty_price"].max() if overruns_count else 0
    avg_peak = df["maxPowerRecieved"].mean()
    max_peak = df["maxPowerRecieved"].max()
    frac_over_85 = ((df["maxPowerRecieved"] > 0.85 * df["agreedPower"]).sum() / len(df))
    block_stats = df.groupby("block").agg(
        avg_peak=("maxPowerRecieved", "mean"),
        max_peak=("maxPowerRecieved", "max"),
        avg_penalty=("penalty_price", "mean"),
        count=("block", "count")
    ).reset_index().to_dict(orient="records")

    dow_counter = Counter()
    hour_counter = Counter()
    dom_counter = Counter()
    for t in overruns["timestamp"]:
        try:
            dt = datetime.datetime.strptime(t, "%d-%m %H:%M")
            dow_counter[dt.weekday()] += 1
            hour_counter[dt.hour] += 1
            dom_counter[dt.day] += 1
        except:
            pass

    most_common_day = max(dow_counter, key=dow_counter.get) if dow_counter else None
    most_common_hour = max(hour_counter, key=hour_counter.get) if hour_counter else None
    most_common_dom = max(dom_counter, key=dom_counter.get) if dom_counter else None
    day_map = ['pon', 'tor', 'sre', 'čet', 'pet', 'sob', 'ned']

    probability_overrun = 0
    if len(df) > 0:
        probability_overrun = min(1.0, round((overruns_count / len(df)) + 0.25 * frac_over_85, 2)) # basic heuristic

    return {
        "stats": {
            "overruns_count": overruns_count,
            "avg_penalty": round(avg_penalty, 2),
            "max_penalty": round(max_penalty, 2),
            "avg_peak": round(avg_peak, 2),
            "max_peak": round(max_peak, 2),
            "frac_over_85": round(frac_over_85, 2),
            "avg_temp": round(avg_temp, 1) if avg_temp is not None else None,
            "forecasted_avg_temp": forecasted_avg_temp,
            "most_common_overrun_day": day_map[most_common_day] if most_common_day is not None else None,
            "most_common_overrun_hour": int(most_common_hour) if most_common_hour is not None else None,
            "most_common_overrun_day_in_month": int(most_common_dom) if most_common_dom is not None else None,
            "probability_overrun": probability_overrun
        },
        "block_stats": block_stats,
        "overruns_by_day": dict(dow_counter),
        "overruns_by_hour": dict(hour_counter),
        "overruns_by_day_in_month": dict(dom_counter)
    }