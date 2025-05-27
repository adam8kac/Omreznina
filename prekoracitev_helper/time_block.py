from datetime import time

HOLIDAYS = [
    "01-01", "01-02", "02-08", "04-20", "04-21", "04-27", "05-01", "05-02",
    "06-08", "06-25", "08-15", "10-31", "11-01", "12-25", "12-26"
]

def is_holiday(dt):
    key = dt.strftime("%m-%d")
    return key in HOLIDAYS

def is_weekend(dt):
    return dt.weekday() >= 5

def get_day_type(dt):
    return "WEEKEND" if is_weekend(dt) or is_holiday(dt) else "WORKDAY"

def get_season(dt):
    return "HIGH" if dt.month in [11, 12, 1, 2] else "LOW"

class TimeRange:
    def __init__(self, start, end):
        self.start = time.fromisoformat(start)
        self.end = time.fromisoformat(end)
    def contains(self, t):
        if self.start < self.end:
            return self.start <= t < self.end
        else:
            return t >= self.start or t < self.end

class TimeBlock:
    def __init__(self, season, daytype, block_number, time_ranges):
        self.season = season
        self.daytype = daytype
        self.block_number = block_number
        self.time_ranges = [TimeRange(start, end) for start, end in time_ranges]
        self.price = self.set_price(block_number)
    def set_price(self, block):
        if block == 1:
            return 3.42250
        elif block == 2:
            return 0.91224
        elif block == 3:
            return 0.16297
        elif block == 4:
            return 0.00407
        else:
            return 0.00
    def __str__(self):
        ranges = ', '.join([f"{tr.start.strftime('%H:%M')}-{tr.end.strftime('%H:%M')}" for tr in self.time_ranges])
        return f"Block {self.block_number} | {self.season} | {self.daytype} | Ranges: {ranges} | Price: {self.price}"
    __repr__ = __str__     

class TimeBlockBuilder:
    def __init__(self):
        self.blocks = []
        firstTimeRange  = [("07:00", "14:00"), ("16:00", "20:00")]
        secondTimeRange = [("06:00", "07:00"), ("14:00", "16:00"), ("20:00", "22:00")]
        thirdTimeRange  = [("00:00", "06:00"), ("22:00", "00:00")]

        self.blocks.append(TimeBlock("HIGH", "WORKDAY", 1, firstTimeRange))
        self.blocks.append(TimeBlock("HIGH", "WORKDAY", 2, secondTimeRange))
        self.blocks.append(TimeBlock("HIGH", "WORKDAY", 3, thirdTimeRange))

        self.blocks.append(TimeBlock("HIGH", "WEEKEND", 2, firstTimeRange))
        self.blocks.append(TimeBlock("HIGH", "WEEKEND", 3, secondTimeRange))
        self.blocks.append(TimeBlock("HIGH", "WEEKEND", 4, thirdTimeRange))

        self.blocks.append(TimeBlock("LOW", "WORKDAY", 2, firstTimeRange))
        self.blocks.append(TimeBlock("LOW", "WORKDAY", 3, secondTimeRange))
        self.blocks.append(TimeBlock("LOW", "WORKDAY", 4, thirdTimeRange))

        self.blocks.append(TimeBlock("LOW", "WEEKEND", 3, firstTimeRange))
        self.blocks.append(TimeBlock("LOW", "WEEKEND", 4, secondTimeRange))
        self.blocks.append(TimeBlock("LOW", "WEEKEND", 5, thirdTimeRange))

    def get_block(self, dt):
        t = dt.time()
        season = get_season(dt)
        daytype = get_day_type(dt)
        for block in self.blocks:
            if block.season == season and block.daytype == daytype:
                for rng in block.time_ranges:
                    if rng.contains(t):
                        return block

        return None