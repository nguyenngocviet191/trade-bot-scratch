import sys
import os

# Add the project root to the Python path
path = sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))



from ultils.ultils import BarProgress, SpinnerProgress
import time
# barprogress =BarProgress()
# barprogress.start()
# t= barprogress.add_task("Processing", total=10, item="")
# for i in range(10):
#     barprogress.update(t, advance=1, item="")
#     time.sleep(0.1)  # Simulate some work being done

# barprogress.stop_task(t)  
# barprogress.update(t, description="DONE")  
# with SpinnerProgress() as barprogress:
#     barprogress.add_task("Processing",item="")
#     time.sleep(1)
#     barprogress.update(0,description="complete")
with SpinnerProgress() as barprogress:
    barprogress.add_task("Processing",total=100,item="")
    for i in range(100):
        barprogress.update(0, advance=1, item="")
        time.sleep(0.05)
    barprogress.update(0,description="complete")        

   