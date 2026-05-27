import { useState, useEffect } from 'react';
import { mockOrders, type Order, type OrderStatus } from './data/mockOrders';
import { Factory, Sparkles, ChevronDown, Settings, User, Clock } from 'lucide-react';
import './index.css';

const getStatusClass = (status: OrderStatus) => {
  switch (status) {
    case 'In Production': return 'status-in-production';
    case 'Quality Check': return 'status-quality-check';
    case 'Ready to Ship': return 'status-ready-to-ship';
    case 'Delivered': return 'status-delivered';
    case 'Delayed': return 'status-delayed';
    default: return '';
  }
};

const getCardBorderClass = (status: OrderStatus) => {
  switch (status) {
    case 'Delayed': return 'is-delayed';
    case 'In Production':
    case 'Quality Check':
    case 'Ready to Ship': return 'is-active';
    case 'Delivered': return 'is-completed';
    default: return '';
  }
}

const Header = () => (
  <header className="header">
    <div className="header-logo">
      <Factory className="logo-icon" />
      <span>Nexus Manufacturing Ops</span>
    </div>
    <div className="header-actions">
      <div className="header-meta">
        <Clock size={14} />
        <span>System Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <div className="header-icons">
        <Settings size={18} className="icon-btn" />
        <User size={18} className="icon-btn" />
      </div>
    </div>
  </header>
);

const AISummaryPanel = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const generateSummary = () => {
    setLoading(true);
    setSummary(null);
    setTimeout(() => {
      setSummary("2 orders on track · 1 delayed in QC · 1 ready for shipment");
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="ai-summary-panel">
      <div className="ai-summary-content-wrapper">
        <div className="ai-summary-title">
          <Sparkles size={16} className="ai-icon" />
          <span>AI Ops Insights</span>
        </div>
        
        <div className="ai-summary-text-area">
          {loading ? (
            <span className="ai-summary-loading loading-pulse">Synthesizing operational telemetry...</span>
          ) : summary ? (
            <span className="ai-summary-result">{summary}</span>
          ) : (
            <span className="ai-summary-placeholder">Run AI analysis for a quick operational overview.</span>
          )}
        </div>
      </div>
      <button 
        className="btn-primary btn-sm" 
        onClick={generateSummary}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Generate AI Summary'}
      </button>
    </div>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`order-card ${getCardBorderClass(order.currentStatus)} ${expanded ? 'expanded' : ''}`}>
      <div className="order-card-summary" onClick={() => setExpanded(!expanded)}>
        <div className="order-col col-id">
          <span className="order-col-label">Order ID</span>
          <span className="order-col-value order-id">{order.id}</span>
        </div>
        <div className="order-col col-name">
          <span className="order-col-label">Part Name</span>
          <span className="order-col-value part-name" title={order.partName}>{order.partName}</span>
        </div>
        <div className="order-col col-qty">
          <span className="order-col-label">Qty</span>
          <span className="order-col-value value-numeric">{order.quantity.toLocaleString()}</span>
        </div>
        <div className="order-col col-status">
          <span className="order-col-label">Status</span>
          <span className={`status-badge ${getStatusClass(order.currentStatus)}`}>
            {order.currentStatus}
          </span>
        </div>
        <div className="order-col col-date">
          <span className="order-col-label">Est. Delivery</span>
          <span className="order-col-value">{new Date(order.estimatedDelivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
        </div>
        <div className="order-col col-action">
          <ChevronDown className={`expand-icon ${expanded ? 'expanded' : ''}`} size={18} />
        </div>
      </div>
      
      <div className={`timeline-container ${expanded ? 'expanded' : ''}`}>
        <div className="timeline-inner">
          <div className="timeline-header-row">
            <h4 className="timeline-title">Production History</h4>
            <span className="timeline-meta">Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="timeline">
            {order.timeline.map((event) => (
              <div key={event.id} className={`timeline-item node-${event.status.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="timeline-node-wrapper">
                  <div className="timeline-node" />
                  <div className="timeline-line" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-event-header">
                    <span className="timeline-status">{event.status}</span>
                    <span className="timeline-time">
                      {new Date(event.timestamp).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="timeline-desc">{event.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

type FilterOption = OrderStatus | 'All';

function App() {
  const [filter, setFilter] = useState<FilterOption>('All');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const filteredOrders = filter === 'All' 
    ? mockOrders 
    : mockOrders.filter(o => o.currentStatus === filter);

  const filterOptions: FilterOption[] = ['All', 'In Production', 'Quality Check', 'Ready to Ship', 'Delayed', 'Delivered'];

  // Simulate a data refresh update
  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-layout">
      <Header />
      
      <main className="app-container">
        <AISummaryPanel />
        
        <div className="workspace-header">
          <div className="workspace-title-area">
            <h1 className="workspace-title">Active Operations</h1>
            <span className="workspace-subtitle">Live tracking of active manufacturing batches</span>
          </div>
          
          <div className="workspace-meta">
            <span className="meta-label">Data Sync:</span>
            <span className="meta-value">{lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-label">Filter by Status:</div>
          <div className="filter-chips">
            {filterOptions.map(option => (
              <button
                key={option}
                className={`filter-chip ${filter === option ? 'active' : ''}`}
                onClick={() => setFilter(option)}
              >
                {option}
                {option === 'All' && <span className="chip-count">{mockOrders.length}</span>}
                {option !== 'All' && <span className="chip-count">{mockOrders.filter(o => o.currentStatus === option).length}</span>}
              </button>
            ))}
          </div>
        </div>
        
        <div className="order-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <div className="no-orders-message">
              <div className="no-orders-content">
                <p>No orders found for the selected status.</p>
                <button className="btn-text" onClick={() => setFilter('All')}>Clear filter</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
