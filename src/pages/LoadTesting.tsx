/**
 * Simple Load Testing Page
 * Clean, straightforward performance testing
 */

import React, { useState, useEffect } from "react";
import SimpleLoadTest from "../components/SimpleLoadTest";
import { Activity, AlertCircle } from "lucide-react";

interface SystemMetrics {
  memoryUsage: number;
  timestamp: number;
}

const LoadTesting: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memoryUsage: 0,
    timestamp: Date.now(),
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring) {
      interval = setInterval(() => {
        const memory = (performance as any).memory;
        setMetrics({
          memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0, // MB
          timestamp: Date.now(),
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoring]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Performance Load Testing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple performance testing for the current SDK implementation. Test
            with up to 2000 events to validate performance impact.
          </p>
        </div>

        {/* System Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Activity className="mr-2 text-green-600" />
              System Metrics
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isMonitoring
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Memory Usage
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {metrics.memoryUsage.toFixed(1)} MB
                  </p>
                </div>
                <div className="text-blue-600">📊</div>
              </div>
            </div>
          </div>
        </div>

        {/* Load Test Component */}
        <SimpleLoadTest />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📊 How to Measure Performance (Step by Step)
              </h3>
              <div className="text-blue-700 space-y-4">
                {/* Simple Method */}
                <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-800 mb-2">
                    🎯 SIMPLE METHOD (Recommended)
                  </p>
                  <div className="space-y-2">
                    <div>
                      <strong>Step 1:</strong> Click{" "}
                      <strong>"Start Monitoring"</strong> button above
                    </div>
                    <div>
                      <strong>Step 2:</strong> Click{" "}
                      <strong>"Standard Test"</strong> button (1,000 events)
                    </div>
                    <div>
                      <strong>Step 3:</strong> Wait for test to complete (1-2
                      minutes)
                    </div>
                    <div>
                      <strong>Step 4:</strong> Look for the big colored result
                      box:
                    </div>
                    <div className="ml-4 space-y-1 text-sm">
                      <div>
                        •{" "}
                        <span className="text-green-600 font-semibold">
                          🎉 EXCELLENT
                        </span>{" "}
                        = Current implementation works great!
                      </div>
                      <div>
                        •{" "}
                        <span className="text-yellow-600 font-semibold">
                          ⚠️ GOOD
                        </span>{" "}
                        = Current implementation works well
                      </div>
                      <div>
                        •{" "}
                        <span className="text-red-600 font-semibold">
                          ❌ POOR
                        </span>{" "}
                        = Consider Web Workers
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Method */}
                <div className="border-l-4 border-blue-300 pl-4">
                  <p className="font-semibold text-blue-800 mb-2">
                    🔬 ADVANCED METHOD (Optional - with DevTools)
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-semibold">🔧 Step 1: Prepare</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                          Press{" "}
                          <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">
                            F12
                          </kbd>{" "}
                          to open DevTools
                        </li>
                        <li>
                          Click the <strong>"Performance"</strong> tab in
                          DevTools
                        </li>
                        <li>
                          Click <strong>"Start Monitoring"</strong> button above
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold">🚀 Step 2: Run Test</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                          Click <strong>"Record"</strong> button (⭕) in
                          DevTools Performance tab
                        </li>
                        <li>
                          Click <strong>"Standard Test"</strong> button (1,000
                          events)
                        </li>
                        <li>Watch the progress bar complete (1-2 minutes)</li>
                        <li>
                          Click <strong>"Stop"</strong> in DevTools when test
                          finishes
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold">📈 Step 3: Check Results</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                          Look for the big colored box in the app (same as
                          simple method)
                        </li>
                        <li>
                          In DevTools: Look for gaps in timeline (good) vs solid
                          blocks (bad)
                        </li>
                        <li>
                          Memory should stay relatively flat, not keep climbing
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded">
                <p className="text-blue-800 font-semibold">
                  🎯 What Good Results Look Like:
                </p>
                <div className="text-blue-700 text-sm mt-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    • Events/Second: <strong>50+</strong>
                  </div>
                  <div>
                    • Memory Change: <strong>&lt;50MB</strong>
                  </div>
                  <div>
                    • Error Rate: <strong>&lt;1%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Expectations */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Expected Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Current Implementation Benefits
              </h4>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Event tracking doesn't block UI</li>
                <li>• Memory usage stays stable</li>
                <li>• Fast event processing (50+ events/sec)</li>
                <li>• Graceful error handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Decision Framework
              </h4>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>
                  • ✅ All tests pass → Current implementation is sufficient
                </li>
                <li>• ❌ Poor performance → Consider Web Workers</li>
                <li>• ⚠️ Memory issues → Review implementation</li>
                <li>• 🔄 High error rates → Check retry logic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadTesting;
