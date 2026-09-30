import yfinance as yf
import json
import math

tickers = ["NVDA", "AAPL", "MSFT", "AVGO", "MU", "ORCL", "CRM", "AMD", "CSCO", "ACN", "ADBE", "INTU", "QCOM", "SPY", "QQQ"]
results = {}

for ticker in tickers:
    try:
        t = yf.Ticker(ticker)
        # Fetch 1 year of daily data
        df = t.history(period="1y")
        if df.empty:
            continue
            
        history = []
        for index, row in df.iterrows():
            history.append({
                "date": index.strftime("%Y-%m-%d"),
                "close": round(row["Close"], 4)
            })
            
        results[ticker] = history
    except Exception as e:
        print(f"Failed for {ticker}: {e}")

with open('/home/bashistha/Desktop/deriva/historical_data.json', 'w') as f:
    json.dump(results, f)
print("Saved to historical_data.json")
