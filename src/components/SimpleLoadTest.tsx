/**
 * Simple Load Testing Component
 * Straightforward performance testing without complexity
 */

import React, { useState } from "react";
import { hydraService } from "../services/hydraService";
import { Play, Square, BarChart3 } from "lucide-react";

interface TestStats {
  eventsGenerated: number;
  startTime: number;
  endTime: number;
  memoryStart: number;
  memoryEnd: number;
  errors: number;
}

const SimpleLoadTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [progress, setProgress] = useState(0);

  const getMemoryUsage = (): number => {
    const memory = (performance as any).memory;
    return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0; // MB
  };

  const runSimpleTest = async (eventCount: number, description: string) => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);

    const startTime = Date.now();
    const memoryStart = getMemoryUsage();
    let errors = 0;

    console.log(`🚀 Starting ${description} - ${eventCount} events`);

    try {
      // Initialize SDK if not already done
      if (!hydraService.isInitialized()) {
        hydraService.initialize();
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for init
      }

      // Generate events in batches to avoid blocking
      const batchSize = 50;
      const batches = Math.ceil(eventCount / batchSize);

      for (let batch = 0; batch < batches; batch++) {
        const batchStart = batch * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, eventCount);

        // Generate batch of events
        for (let i = batchStart; i < batchEnd; i++) {
          try {
            const eventType = i % 4;

            switch (eventType) {
              case 0:
                hydraService.trackEvent("page_view", {
                  page: "/dashboard",
                  eventIndex: i,
                  timestamp: Date.now(),
                });
                break;
              case 1:
                hydraService.trackEvent("scroll_event", {
                  position: Math.floor(Math.random() * 1000),
                  eventIndex: i,
                  timestamp: Date.now(),
                });
                break;
              case 2:
                hydraService.trackEvent("button_click", {
                  buttonId: `btn-${i}`,
                  eventIndex: i,
                  timestamp: Date.now(),
                });
                break;
              case 3:
                hydraService.trackEvent("user_interaction", {
                  action: "click",
                  element: `element-${i}`,
                  eventIndex: i,
                  timestamp: Date.now(),
                });
                break;
            }
          } catch (error) {
            errors++;
            console.warn(`Event ${i} failed:`, error);
          }
        }

        // Update progress
        setProgress(((batch + 1) / batches) * 100);

        // Small delay between batches to prevent blocking
        if (batch < batches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      const endTime = Date.now();
      const memoryEnd = getMemoryUsage();

      const finalStats: TestStats = {
        eventsGenerated: eventCount,
        startTime,
        endTime,
        memoryStart,
        memoryEnd,
        errors,
      };

      setStats(finalStats);
      console.log("✅ Load test completed", finalStats);
    } catch (error) {
      console.error("❌ Load test failed:", error);
      errors++;
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const stopTest = () => {
    setIsRunning(false);
    setProgress(0);
    console.log("🛑 Test stopped");
  };

  const clearResults = () => {
    setStats(null);
    setProgress(0);
  };

  const formatDuration = (ms: number): string => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const calculateEventsPerSecond = (stats: TestStats): number => {
    const duration = (stats.endTime - stats.startTime) / 1000;
    return stats.eventsGenerated / duration;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="mr-2 text-blue-600" />
          Simple Load Testing
        </h2>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Results
        </button>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => runSimpleTest(100, "Quick Test")}
          disabled={isRunning}
          className="flex flex-col items-center p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-8 h-8 text-green-600 mb-2" />
          <span className="font-semibold text-green-800">Quick Test</span>
          <span className="text-sm text-green-600">100 events</span>
        </button>

        <button
          onClick={() => runSimpleTest(1000, "Standard Test")}
          disabled={isRunning}
          className="flex flex-col items-center p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-8 h-8 text-blue-600 mb-2" />
          <span className="font-semibold text-blue-800">Standard Test</span>
          <span className="text-sm text-blue-600">1,000 events</span>
        </button>

        <button
          onClick={() => runSimpleTest(2000, "Stress Test")}
          disabled={isRunning}
          className="flex flex-col items-center p-6 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-8 h-8 text-red-600 mb-2" />
          <span className="font-semibold text-red-800">Stress Test</span>
          <span className="text-sm text-red-600">2,000 events</span>
        </button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Test Progress
            </span>
            <span className="text-sm text-gray-500">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={stopTest}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="mr-2 w-4 h-4" />
              Stop Test
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Test Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.eventsGenerated}
              </p>
              <p className="text-sm text-gray-600">Events Generated</p>
            </div>

            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {calculateEventsPerSecond(stats).toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Events/Second</p>
            </div>

            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatDuration(stats.endTime - stats.startTime)}
              </p>
              <p className="text-sm text-gray-600">Duration</p>
            </div>

            <div className="bg-white p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-600">
                {stats.memoryEnd.toFixed(1)} MB
              </p>
              <p className="text-sm text-gray-600">Memory Usage</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                Performance Metrics
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Memory Start: {stats.memoryStart.toFixed(1)} MB</li>
                <li>• Memory End: {stats.memoryEnd.toFixed(1)} MB</li>
                <li>
                  • Memory Change:{" "}
                  {(stats.memoryEnd - stats.memoryStart).toFixed(1)} MB
                </li>
                <li>• Errors: {stats.errors}</li>
                <li>
                  • Error Rate:{" "}
                  {((stats.errors / stats.eventsGenerated) * 100).toFixed(2)}%
                </li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                Performance Assessment
              </h4>
              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between text-sm ${
                    calculateEventsPerSecond(stats) > 50
                      ? "text-green-600"
                      : calculateEventsPerSecond(stats) > 20
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-lg">
                      {calculateEventsPerSecond(stats) > 50
                        ? "✅"
                        : calculateEventsPerSecond(stats) > 20
                        ? "⚠️"
                        : "❌"}
                    </span>
                    Event Processing Speed
                  </span>
                  <span className="font-semibold">
                    {calculateEventsPerSecond(stats) > 50
                      ? "EXCELLENT"
                      : calculateEventsPerSecond(stats) > 20
                      ? "OKAY"
                      : "POOR"}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between text-sm ${
                    stats.memoryEnd - stats.memoryStart < 50
                      ? "text-green-600"
                      : stats.memoryEnd - stats.memoryStart < 100
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-lg">
                      {stats.memoryEnd - stats.memoryStart < 50
                        ? "✅"
                        : stats.memoryEnd - stats.memoryStart < 100
                        ? "⚠️"
                        : "❌"}
                    </span>
                    Memory Usage
                  </span>
                  <span className="font-semibold">
                    {stats.memoryEnd - stats.memoryStart < 50
                      ? "EXCELLENT"
                      : stats.memoryEnd - stats.memoryStart < 100
                      ? "OKAY"
                      : "POOR"}
                  </span>
                </div>

                <div
                  className={`flex items-center justify-between text-sm ${
                    stats.errors / stats.eventsGenerated < 0.01
                      ? "text-green-600"
                      : stats.errors / stats.eventsGenerated < 0.05
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-lg">
                      {stats.errors / stats.eventsGenerated < 0.01
                        ? "✅"
                        : stats.errors / stats.eventsGenerated < 0.05
                        ? "⚠️"
                        : "❌"}
                    </span>
                    Error Rate
                  </span>
                  <span className="font-semibold">
                    {stats.errors / stats.eventsGenerated < 0.01
                      ? "EXCELLENT"
                      : stats.errors / stats.eventsGenerated < 0.05
                      ? "OKAY"
                      : "POOR"}
                  </span>
                </div>

                {/* Overall Assessment */}
                <div className="border-t pt-3 mt-3">
                  {(() => {
                    const eventsGood = calculateEventsPerSecond(stats) > 50;
                    const memoryGood = stats.memoryEnd - stats.memoryStart < 50;
                    const errorsGood =
                      stats.errors / stats.eventsGenerated < 0.01;
                    const goodCount = [
                      eventsGood,
                      memoryGood,
                      errorsGood,
                    ].filter(Boolean).length;

                    if (goodCount === 3) {
                      return (
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-green-800 font-bold text-lg">
                            🎉 EXCELLENT PERFORMANCE!
                          </div>
                          <div className="text-green-700 text-sm mt-1">
                            Current implementation is working perfectly. No need
                            for Web Workers!
                          </div>
                        </div>
                      );
                    } else if (goodCount === 2) {
                      return (
                        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-yellow-800 font-bold text-lg">
                            ⚠️ GOOD PERFORMANCE
                          </div>
                          <div className="text-yellow-700 text-sm mt-1">
                            Current implementation is working well. Consider
                            minor optimizations.
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-red-800 font-bold text-lg">
                            ❌ POOR PERFORMANCE
                          </div>
                          <div className="text-red-700 text-sm mt-1">
                            Consider implementing Web Workers for better
                            performance.
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          How to Test
        </h3>
        <ol className="text-blue-700 space-y-1 text-sm list-decimal list-inside">
          <li>Open browser DevTools (F12) → Performance tab</li>
          <li>Click "Quick Test" for basic validation (100 events)</li>
          <li>Click "Standard Test" for 1000+ events as requested</li>
          <li>Click "Stress Test" for maximum load (2000 events)</li>
          <li>Monitor memory usage and UI responsiveness</li>
          <li>Check results for performance assessment</li>
        </ol>

        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-blue-800 font-medium">Expected Results:</p>
          <p className="text-blue-700 text-sm">
            Current implementation should show fast event processing (50+
            events/sec), stable memory usage (&lt; 50MB increase), and low error
            rates (&lt; 1%).
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoadTest;
