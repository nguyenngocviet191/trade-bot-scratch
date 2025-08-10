# from yaspin import yaspin
# import time

# with yaspin(text="Processing...", color="cyan") as spinner:
#     time.sleep(3)
#     # spinner.ok("✅ Done!") 
#     spinner.fail("💥 Failed") # hoặc spinner.fail("💥 Failed")

# from tqdm import tqdm
# import time

# for i in tqdm(range(100)):
#     time.sleep(0.05)    
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeRemainingColumn,TimeElapsedColumn
import time

# with Progress() as p:
#     t = p.add_task("Processing...", total=100)
#     while not p.finished:
#         p.update(t, advance=1)
#         time.sleep(0.05)


symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT"]

with Progress(
    SpinnerColumn(),
     TextColumn("{task.description}"),
    # BarColumn(),
    # TextColumn("{task.completed}/{task.total}"),
    TimeElapsedColumn(),
    # TextColumn("[bold blue]{task.fields[item]}"),
) as progress:

    t1 = progress.add_task("Processing",total=None,item="")
    # task = progress.add_task("Processing",  symbol="Starting...")
    # for sym in symbols:
    #     # Cập nhật label "symbol" hiện tại
    #     progress.update(t1, advance=1, symbol=f"Processing {sym}")
    progress
    time.sleep(2)     
    progress.update(t1,description="DONE")
    progress.stop_task(t1)


    