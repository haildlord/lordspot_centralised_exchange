/**
 * Chart slot. Empty on purpose.
 *
 * TODO(tradingview): mount the TradingView widget inside this panel. The border,
 * radius and grid slot (.t-chart in globals.css) stay as they are.
 */
export function ChartPanel() {
  return <section aria-label="Chart" className="panel h-full min-h-0 overflow-hidden" />;
}
