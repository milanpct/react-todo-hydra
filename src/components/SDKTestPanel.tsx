import React, { useState } from "react";
import { hydraService } from "../services/hydraService";
import { useAuth } from "../contexts/AuthContext";

export const SDKTestPanel: React.FC = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [
      `[${timestamp}] ${message}`,
      ...prev.slice(0, 19),
    ]);
  };

  // Test 1: All Success (5 events)
  const testAllSuccess = async () => {
    if (!user) {
      addLog("❌ Please login first to test all success");
      return;
    }

    setIsGenerating(true);
    addLog("🚀 Starting all success test - generating 5 events...");

    try {
      const promises = [];
      for (let i = 1; i <= 5; i++) {
        promises.push(
          hydraService.trackEvent(`success_test_event_${i}`, {
            test_success: true,
            event_number: i,
            timestamp: Date.now(),
            user_id: user.id,
          })
        );
      }

      await Promise.all(promises);
      addLog("✅ Generated 5 events - all should succeed");
      addLog("📊 Expected: All events stored successfully");
    } catch (error) {
      addLog(`❌ All success test failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Test 2: Partial Success (10 events)
  const testPartialSuccess = async () => {
    if (!user) {
      addLog("❌ Please login first to test partial success");
      return;
    }

    setIsGenerating(true);
    addLog("🚀 Starting partial success test - generating 10 events...");

    try {
      const promises = [];
      for (let i = 1; i <= 10; i++) {
        promises.push(
          hydraService.trackEvent(`partial_test_event_${i}`, {
            test_partial: true,
            event_number: i,
            timestamp: Date.now(),
            user_id: user.id,
          })
        );
      }

      await Promise.all(promises);
      addLog(
        "✅ Generated 10 events - first 7 should succeed, last 3 should fail"
      );
      addLog("📊 Expected: Only first 7 events stored");
    } catch (error) {
      addLog(`❌ Partial success test failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Test 4: Large Batch Test (120 events - multiple batches)
  const testLargeBatch = async () => {
    if (!user) {
      addLog("❌ Please login first to test large batch");
      return;
    }

    setIsGenerating(true);
    addLog("🚀 Starting large batch test - generating 120 events...");
    addLog("📊 Expected: Events split into 3 batches (50 + 50 + 20)");

    try {
      const promises = [];
      for (let i = 1; i <= 120; i++) {
        promises.push(
          hydraService.trackEvent(`large_batch_event_${i}`, {
            test_large_batch: true,
            event_number: i,
            batch_group: Math.ceil(i / 40), // Group for easier tracking
            timestamp: Date.now(),
            user_id: user.id,
          })
        );
      }

      await Promise.all(promises);
      addLog("✅ Generated 120 events - should see 3 separate API calls");
      addLog("📡 Each batch respects 50-event limit");
      addLog("⏱️ Batches processed sequentially (not simultaneously)");
    } catch (error) {
      addLog(`❌ Large batch test failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Test 5: Retry Logic Test (simulates network failures)
  const testRetryLogic = async () => {
    if (!user) {
      addLog("❌ Please login first to test retry logic");
      return;
    }

    setIsGenerating(true);
    addLog("🚀 Starting retry logic test - generating 8 events...");
    addLog("📊 Expected: Events will fail initially, then retry with exponential backoff");
    addLog("🔄 Mock server will simulate: Fail → Fail → Success pattern");

    try {
      const promises = [];
      for (let i = 1; i <= 8; i++) {
        promises.push(
          hydraService.trackEvent(`retry_test_event_${i}`, {
            test_retry: true,
            event_number: i,
            retry_attempt: 1, // Track which attempt this is
            timestamp: Date.now(),
            user_id: user.id,
          })
        );
      }

      await Promise.all(promises);
      addLog("✅ Generated 8 retry test events");
      addLog("⏳ Watch console for retry attempts over next 30 seconds");
      addLog("🎯 Events should eventually succeed after 2-3 retries");
    } catch (error) {
      addLog(`❌ Retry test failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setTestResults([]);
    addLog("🧹 Logs cleared");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🧪 WebSDK Test Panel
      </h2>

      {!user && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Please login to test SDK features</p>
        </div>
      )}

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testAllSuccess}
          disabled={!user || isGenerating}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          ✅ All Success (5 events)
        </button>

        <button
          onClick={testPartialSuccess}
          disabled={!user || isGenerating}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          ⚠️ Partial Success (10 events)
        </button>

        <button
          onClick={testLargeBatch}
          disabled={!user || isGenerating}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          🎯 Large Batch (120 events)
        </button>

        <button
          onClick={testRetryLogic}
          disabled={!user || isGenerating}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          🔄 Retry Logic (8 events)
        </button>
      </div>

      {/* Test Results Log */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-700">📋 Test Results</h3>
          <button
            onClick={clearLogs}
            className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
          {testResults.length === 0 ? (
            <div className="text-gray-500">
              No test results yet. Run a test to see logs...
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">🔍 How to Monitor Batch Tests</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Network Tab:</strong> Watch for multiple batch requests to /mapp/events</li>
          <li>• <strong>Batch Size:</strong> Max 50 events per API call</li>
          <li>• <strong>Sequential Processing:</strong> Batches sent one after another, not simultaneously</li>
          <li>• <strong>Console Logs:</strong> Look for "Starting queue processing" messages</li>
        </ul>
      </div>

      {/* Test Scenarios */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-700 mb-2">📊 Test Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>✅ All Success (5 events):</strong> Single batch, all events stored
          </div>
          <div>
            <strong>⚠️ Partial Success (10 events):</strong> Single batch, 7 succeed + 3 retry
          </div>
          <div>
            <strong>🎯 Large Batch (120 events):</strong> 3 batches (50 + 50 + 20 events)
          </div>
          <div>
            <strong>🔄 Retry Logic (8 events):</strong> Simulates failures with exponential backoff retries
          </div>
        </div>
      </div>

      {/* Current Configuration */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <strong>SDK Configuration:</strong> Batch Size: 50 events | Max Retries:
        Unless event get success, it will be retried indefinitely | Retry Codes:
        408, 429, 500, 502, 503, 504, 401
      </div>
    </div>
  );
};

export default SDKTestPanel;
