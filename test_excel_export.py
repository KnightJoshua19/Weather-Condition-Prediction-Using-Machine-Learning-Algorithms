#!/usr/bin/env python
"""Test script to verify Excel export functionality"""

from policy_model import AlgorithmMetricsRecorder
import numpy as np

print('[TEST] Testing AlgorithmMetricsRecorder with Excel export...')

recorder = AlgorithmMetricsRecorder('test_metrics.json')

# Create sample predictions
y_true = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 1])
y_pred = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 0])

# Calculate metrics
metrics = recorder.calculate_performance_metrics(y_true, y_pred, 'Test Algorithm')

# Add complexity analysis
metrics = recorder.add_complexity_analysis(
    metrics,
    input_dim=9,
    hidden_layers=[9, 64, 32, 16, 1],
    epochs=50,
    batch_size=32
)

# Save to JSON and Excel
recorder.save_metrics(metrics)
recorder.save_to_excel('test_metrics.xlsx')

print('[SUCCESS] Excel export functionality verified')
print('[OUTPUT] Created: test_metrics.xlsx')
