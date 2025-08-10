#!/usr/bin/env python3
"""
Test Runner for Trade Bot Scratch Project
Runs all unit tests across Python, Node.js, and React components
"""

import unittest
import sys
import os
import subprocess
import time
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def run_python_tests():
    """Run all Python unit tests."""
    print("=" * 60)
    print("🧪 RUNNING PYTHON UNIT TESTS")
    print("=" * 60)
    
    # Discover and run Python tests
    test_loader = unittest.TestLoader()
    test_suite = unittest.TestSuite()
    
    # Add test files
    test_files = [
        'test/unit/test_base_adapter.py',
        'test/unit/test_cctx_adapter.py', 
        'test/unit/test_ccxt_service.py',
        'test/unit/test_utils.py'
    ]
    
    for test_file in test_files:
        if os.path.exists(test_file):
            try:
                # Load tests from file
                test_suite.addTests(test_loader.discover(
                    start_dir=os.path.dirname(test_file),
                    pattern=os.path.basename(test_file)
                ))
                print(f"✅ Loaded tests from: {test_file}")
            except Exception as e:
                print(f"❌ Failed to load tests from {test_file}: {e}")
        else:
            print(f"⚠️  Test file not found: {test_file}")
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful(), len(result.failures), len(result.errors)

def run_node_tests():
    """Run Node.js/TypeScript unit tests."""
    print("\n" + "=" * 60)
    print("🧪 RUNNING NODE.JS/TYPESCRIPT UNIT TESTS")
    print("=" * 60)
    
    try:
        # Check if package.json exists
        if not os.path.exists('package.json'):
            print("⚠️  package.json not found, skipping Node.js tests")
            return True, 0, 0
        
        # Check if Jest is installed
        result = subprocess.run(
            ['npm', 'list', 'jest'],
            capture_output=True,
            text=True,
            cwd=project_root
        )
        
        if 'jest@' not in result.stdout:
            print("⚠️  Jest not installed, installing...")
            subprocess.run(['npm', 'install', '--save-dev', 'jest', '@types/jest'], cwd=project_root)
        
        # Run Jest tests
        print("Running Jest tests...")
        result = subprocess.run(
            ['npm', 'test', '--', '--testPathPattern=test/unit', '--verbose'],
            capture_output=True,
            text=True,
            cwd=project_root
        )
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return result.returncode == 0, 0, 0
        
    except Exception as e:
        print(f"❌ Failed to run Node.js tests: {e}")
        return False, 1, 0

def run_react_tests():
    """Run React component tests."""
    print("\n" + "=" * 60)
    print("🧪 RUNNING REACT COMPONENT TESTS")
    print("=" * 60)
    
    try:
        # Check if client directory exists
        if not os.path.exists('client'):
            print("⚠️  client directory not found, skipping React tests")
            return True, 0, 0
        
        # Check if package.json exists in client
        if not os.path.exists('client/package.json'):
            print("⚠️  client/package.json not found, skipping React tests")
            return True, 0, 0
        
        # Check if testing libraries are installed
        result = subprocess.run(
            ['npm', 'list', '@testing-library/react'],
            capture_output=True,
            text=True,
            cwd='client'
        )
        
        if '@testing-library/react@' not in result.stdout:
            print("⚠️  React testing libraries not installed, installing...")
            subprocess.run([
                'npm', 'install', '--save-dev', 
                '@testing-library/react', 
                '@testing-library/jest-dom',
                '@testing-library/user-event'
            ], cwd='client')
        
        # Run React tests
        print("Running React component tests...")
        result = subprocess.run(
            ['npm', 'test', '--', '--testPathPattern=test/unit', '--verbose'],
            capture_output=True,
            text=True,
            cwd='client'
        )
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return result.returncode == 0, 0, 0
        
    except Exception as e:
        print(f"❌ Failed to run React tests: {e}")
        return False, 1, 0

def run_integration_tests():
    """Run integration tests."""
    print("\n" + "=" * 60)
    print("🧪 RUNNING INTEGRATION TESTS")
    print("=" * 60)
    
    try:
        # Run integration tests if they exist
        integration_test_files = [
            'test/integration/test_api_integration.py',
            'test/integration/test_database_integration.py'
        ]
        
        test_loader = unittest.TestLoader()
        test_suite = unittest.TestSuite()
        
        for test_file in integration_test_files:
            if os.path.exists(test_file):
                try:
                    test_suite.addTests(test_loader.discover(
                        start_dir=os.path.dirname(test_file),
                        pattern=os.path.basename(test_file)
                    ))
                    print(f"✅ Loaded integration tests from: {test_file}")
                except Exception as e:
                    print(f"❌ Failed to load integration tests from {test_file}: {e}")
            else:
                print(f"⚠️  Integration test file not found: {test_file}")
        
        if test_suite.countTestCases() > 0:
            runner = unittest.TextTestRunner(verbosity=2)
            result = runner.run(test_suite)
            return result.wasSuccessful(), len(result.failures), len(result.errors)
        else:
            print("⚠️  No integration tests found")
            return True, 0, 0
            
    except Exception as e:
        print(f"❌ Failed to run integration tests: {e}")
        return False, 1, 0

def generate_test_report(success, failures, errors, test_type):
    """Generate a test report."""
    total_tests = failures + errors
    if success:
        print(f"✅ {test_type} tests PASSED ({total_tests} failures/errors)")
    else:
        print(f"❌ {test_type} tests FAILED ({total_tests} failures/errors)")
    return success

def main():
    """Main test runner function."""
    print("🚀 TRADE BOT SCRATCH - UNIT TEST RUNNER")
    print("=" * 60)
    print(f"Project Root: {project_root}")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Track overall results
    all_tests_passed = True
    total_failures = 0
    total_errors = 0
    
    # Run Python tests
    python_success, python_failures, python_errors = run_python_tests()
    all_tests_passed &= python_success
    total_failures += python_failures
    total_errors += python_errors
    generate_test_report(python_success, python_failures, python_errors, "Python")
    
    # Run Node.js tests
    node_success, node_failures, node_errors = run_node_tests()
    all_tests_passed &= node_success
    total_failures += node_failures
    total_errors += node_errors
    generate_test_report(node_success, node_failures, node_errors, "Node.js/TypeScript")
    
    # Run React tests
    react_success, react_failures, react_errors = run_react_tests()
    all_tests_passed &= react_success
    total_failures += react_failures
    total_errors += react_errors
    generate_test_report(react_success, react_failures, react_errors, "React")
    
    # Run integration tests
    integration_success, integration_failures, integration_errors = run_integration_tests()
    all_tests_passed &= integration_success
    total_failures += integration_failures
    total_errors += integration_errors
    generate_test_report(integration_success, integration_failures, integration_errors, "Integration")
    
    # Final summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Total Failures: {total_failures}")
    print(f"Total Errors: {total_errors}")
    print(f"Overall Status: {'✅ PASSED' if all_tests_passed else '❌ FAILED'}")
    print("=" * 60)
    
    # Exit with appropriate code
    sys.exit(0 if all_tests_passed else 1)

if __name__ == '__main__':
    main()
