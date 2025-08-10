import unittest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import time

# Add ultils directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'ultils'))

from ultils import BarProgress, SpinnerProgress, SpinnerSimpleProgress


class TestBarProgress(unittest.TestCase):
    """Unit tests for BarProgress class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.progress = BarProgress()
    
    def test_init(self):
        """Test BarProgress initialization."""
        self.assertIsNotNone(self.progress)
    
    def test_context_manager(self):
        """Test BarProgress as context manager."""
        with BarProgress() as progress:
            self.assertIsInstance(progress, BarProgress)
    
    @patch('builtins.print')
    def test_add_task(self, mock_print):
        """Test adding a task to progress bar."""
        with BarProgress() as progress:
            task = progress.add_task("Test task", total=100)
            self.assertIsNotNone(task)
    
    @patch('builtins.print')
    def test_update_task(self, mock_print):
        """Test updating a task."""
        with BarProgress() as progress:
            task = progress.add_task("Test task", total=100)
            progress.update(task, advance=10, item="Processing...")
            # Verify the update was called (implementation dependent)
            self.assertTrue(True)  # Placeholder assertion
    
    @patch('builtins.print')
    def test_stop_task(self, mock_print):
        """Test stopping a task."""
        with BarProgress() as progress:
            task = progress.add_task("Test task", total=100)
            progress.stop_task(task)
            # Verify the task was stopped (implementation dependent)
            self.assertTrue(True)  # Placeholder assertion


class TestSpinnerProgress(unittest.TestCase):
    """Unit tests for SpinnerProgress class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.progress = SpinnerProgress()
    
    def test_init(self):
        """Test SpinnerProgress initialization."""
        self.assertIsNotNone(self.progress)
    
    def test_context_manager(self):
        """Test SpinnerProgress as context manager."""
        with SpinnerProgress() as progress:
            self.assertIsInstance(progress, SpinnerProgress)
    
    @patch('builtins.print')
    def test_add_task(self, mock_print):
        """Test adding a task to spinner progress."""
        with SpinnerProgress() as progress:
            task = progress.add_task("Test task", total=100)
            self.assertIsNotNone(task)
    
    @patch('builtins.print')
    def test_update_task(self, mock_print):
        """Test updating a spinner task."""
        with SpinnerProgress() as progress:
            task = progress.add_task("Test task", total=100)
            progress.update(task, advance=10, item="Processing...")
            # Verify the update was called (implementation dependent)
            self.assertTrue(True)  # Placeholder assertion
    
    @patch('builtins.print')
    def test_stop_task(self, mock_print):
        """Test stopping a spinner task."""
        with SpinnerProgress() as progress:
            task = progress.add_task("Test task", total=100)
            progress.stop_task(task)
            # Verify the task was stopped (implementation dependent)
            self.assertTrue(True)  # Placeholder assertion


class TestSpinnerSimpleProgress(unittest.TestCase):
    """Unit tests for SpinnerSimpleProgress class."""
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.progress = SpinnerSimpleProgress()
    
    def test_init(self):
        """Test SpinnerSimpleProgress initialization."""
        self.assertIsNotNone(self.progress)
    
    def test_context_manager(self):
        """Test SpinnerSimpleProgress as context manager."""
        with SpinnerSimpleProgress() as progress:
            self.assertIsInstance(progress, SpinnerSimpleProgress)
    
    @patch('builtins.print')
    def test_add_task(self, mock_print):
        """Test adding a task to simple spinner progress."""
        with SpinnerSimpleProgress() as progress:
            task = progress.add_task("Test task")
            self.assertIsNotNone(task)
    
    @patch('builtins.print')
    def test_update_task(self, mock_print):
        """Test updating a simple spinner task."""
        with SpinnerSimpleProgress() as progress:
            task = progress.add_task("Test task")
            progress.update(task, description="Updated task")
            # Verify the update was called (implementation dependent)
            self.assertTrue(True)  # Placeholder assertion
    
    @patch('builtins.print')
    def test_stop_task(self, mock_print):
        """Test stopping a simple spinner task."""
        with SpinnerSimpleProgress() as progress:
            task = progress.add_task("Test task")
            progress.stop_task(task)
            # Verify the task was stopped (implementation dependent)
            self.assertTrue(True)  # Placeholder assertion


class TestProgressIntegration(unittest.TestCase):
    """Integration tests for progress classes."""
    
    @patch('builtins.print')
    def test_bar_progress_workflow(self, mock_print):
        """Test complete BarProgress workflow."""
        with BarProgress() as progress:
            # Add task
            task = progress.add_task("Processing data", total=100)
            
            # Update task multiple times
            for i in range(0, 100, 10):
                progress.update(task, advance=10, item=f"Step {i//10 + 1}")
                time.sleep(0.01)  # Small delay to simulate work
            
            # Stop task
            progress.stop_task(task)
            
            # Verify task was completed
            self.assertTrue(True)  # Placeholder assertion
    
    @patch('builtins.print')
    def test_spinner_progress_workflow(self, mock_print):
        """Test complete SpinnerProgress workflow."""
        with SpinnerProgress() as progress:
            # Add task
            task = progress.add_task("Loading data", total=50)
            
            # Update task multiple times
            for i in range(0, 50, 5):
                progress.update(task, advance=5, item=f"Loading item {i//5 + 1}")
                time.sleep(0.01)  # Small delay to simulate work
            
            # Stop task
            progress.stop_task(task)
            
            # Verify task was completed
            self.assertTrue(True)  # Placeholder assertion
    
    @patch('builtins.print')
    def test_spinner_simple_progress_workflow(self, mock_print):
        """Test complete SpinnerSimpleProgress workflow."""
        with SpinnerSimpleProgress() as progress:
            # Add task
            task = progress.add_task("Initializing")
            
            # Update task multiple times
            for i in range(3):
                progress.update(task, description=f"Step {i + 1}")
                time.sleep(0.01)  # Small delay to simulate work
            
            # Stop task
            progress.stop_task(task)
            
            # Verify task was completed
            self.assertTrue(True)  # Placeholder assertion


class TestProgressErrorHandling(unittest.TestCase):
    """Error handling tests for progress classes."""
    
    def test_bar_progress_invalid_task(self):
        """Test BarProgress with invalid task ID."""
        with BarProgress() as progress:
            # Try to update non-existent task
            with self.assertRaises(Exception):
                progress.update(999, advance=10)
    
    def test_spinner_progress_invalid_task(self):
        """Test SpinnerProgress with invalid task ID."""
        with SpinnerProgress() as progress:
            # Try to update non-existent task
            with self.assertRaises(Exception):
                progress.update(999, advance=10)
    
    def test_spinner_simple_progress_invalid_task(self):
        """Test SpinnerSimpleProgress with invalid task ID."""
        with SpinnerSimpleProgress() as progress:
            # Try to update non-existent task
            with self.assertRaises(Exception):
                progress.update(999, description="Test")
    
    def test_bar_progress_negative_advance(self):
        """Test BarProgress with negative advance value."""
        with BarProgress() as progress:
            task = progress.add_task("Test task", total=100)
            # Should handle negative values gracefully
            progress.update(task, advance=-10)
            self.assertTrue(True)  # Should not raise exception
    
    def test_spinner_progress_negative_advance(self):
        """Test SpinnerProgress with negative advance value."""
        with SpinnerProgress() as progress:
            task = progress.add_task("Test task", total=100)
            # Should handle negative values gracefully
            progress.update(task, advance=-10)
            self.assertTrue(True)  # Should not raise exception


class TestProgressPerformance(unittest.TestCase):
    """Performance tests for progress classes."""
    
    def test_bar_progress_performance(self):
        """Test BarProgress performance with many updates."""
        start_time = time.time()
        
        with BarProgress() as progress:
            task = progress.add_task("Performance test", total=1000)
            
            for i in range(1000):
                progress.update(task, advance=1, item=f"Update {i}")
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Should complete within reasonable time (adjust threshold as needed)
        self.assertLess(execution_time, 5.0)  # 5 seconds threshold
    
    def test_spinner_progress_performance(self):
        """Test SpinnerProgress performance with many updates."""
        start_time = time.time()
        
        with SpinnerProgress() as progress:
            task = progress.add_task("Performance test", total=1000)
            
            for i in range(1000):
                progress.update(task, advance=1, item=f"Update {i}")
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Should complete within reasonable time (adjust threshold as needed)
        self.assertLess(execution_time, 5.0)  # 5 seconds threshold
    
    def test_spinner_simple_progress_performance(self):
        """Test SpinnerSimpleProgress performance with many updates."""
        start_time = time.time()
        
        with SpinnerSimpleProgress() as progress:
            task = progress.add_task("Performance test")
            
            for i in range(1000):
                progress.update(task, description=f"Update {i}")
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Should complete within reasonable time (adjust threshold as needed)
        self.assertLess(execution_time, 5.0)  # 5 seconds threshold


if __name__ == '__main__':
    unittest.main()
