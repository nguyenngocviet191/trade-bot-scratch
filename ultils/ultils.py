from functools import wraps
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
import time

# def timed(func):
#     def wrapper(*args, **kwargs):
#         start = time.time()
#         result = func(*args, **kwargs)
#         end = time.time()
#         print(f"Thời gian thực thi: {end - start:.4f} giây")
#         return result
#     return wrapper

# from time import time
# from contextlib import contextmanager

# @contextmanager
# def timer(name=""):
#     start = time()
#     yield
#     end = time()
#     print(f"{name} - Thời gian thực thi: {end - start:.4f} giây")
class BarProgress(Progress):
    def __init__(self):
        super().__init__(
            SpinnerColumn(),
            TextColumn("{task.description}"),
            BarColumn(),
            TextColumn("{task.completed}/{task.total}"),
            TimeElapsedColumn(),
            TextColumn("[bold blue]{task.fields[item]}"),
            refresh_per_second=5,
        )
    # def stop_start(self, description="Complete"):
    #     self.update(0,description=description)
    #     time.sleep(0.5)
    #     self.stop_task(0)
    #     super().stop() 
class SpinnerProgress(Progress):
    def __init__(self):
        super().__init__(
            SpinnerColumn(), 
            TextColumn("{task.description}"),
          
            TextColumn("{task.completed}/{task.total}"),
            TextColumn("({task.percentage:>3.1f}%)"),
            TimeElapsedColumn(),
            TextColumn("[bold blue]{task.fields[item]}"),
             refresh_per_second=5,
        )
class SpinnerSimpleProgress(Progress):
    def __init__(self):
        super().__init__(
            SpinnerColumn(), 
            TextColumn("{task.description}"),      
            TimeElapsedColumn(),
             refresh_per_second=5,
        )        
    # def stop(self, description="Complete"):
    #     self.update(0,description=description)
    #     time.sleep(0.5)
    #     self.stop_task(0)
    #     super().stop() 
# Tạo progress bar (dùng chung)
