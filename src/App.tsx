import { useState, useEffect, type KeyboardEvent } from 'react';
import { mockOrders, type Order, type OrderStatus, type TimelineEvent } from './data/mockOrders';
import { Factory, BarChart2, ChevronDown, Settings, User, Clock, ShieldCheck, Shield, Search, RefreshCw, Plus } from 'lucide-react';
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

const getSystemDescriptionForStatus = (status: OrderStatus) => {
  switch (status) {
    case 'In Production': return "Batch routing initiated. Production line state reset to active manufacturing.";
    case 'Quality Check': return "Batch transitioned to QA Lab for dimensional tolerance and specification verification.";
    case 'Ready to Ship': return "Quality sign-off complete. Component packaged and transferred to logistics queue.";
    case 'Delivered': return "Shipment received and signed for at customer dock. Final delivery logged.";
    case 'Delayed': return "Operational hold placed on batch. Assessing logistics or supply chain constraints.";
    default: return "System status updated.";
  }
};

const Header = ({ 
  isStaffMode, 
  setIsStaffMode, 
  onReset 
}: { 
  isStaffMode: boolean, 
  setIsStaffMode: (val: boolean) => void,
  onReset: () => void 
}) => (
  <header className="header">
    <div className="header-logo">
      <Factory className="logo-icon" />
      <span>Nexus Manufacturing Ops</span>
    </div>
    
    <div className="header-actions">
      <div className="view-switcher">
        <button 
          className={`view-btn ${!isStaffMode ? 'active' : ''}`}
          onClick={() => setIsStaffMode(false)}
          title="Customer View (Read-Only)"
        >
          Customer View
        </button>
        <button 
          className={`view-btn ${isStaffMode ? 'active' : ''}`}
          onClick={() => setIsStaffMode(true)}
          title="Internal Ops View (Edit Data)"
        >
          <Shield size={14} />
          Internal Ops
        </button>
      </div>

      <div className="header-meta">
        <Clock size={14} />
        <span>System Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        <span className="header-divider">|</span>
        <button className="reset-btn" onClick={onReset} title="Reset to original mock data">
          <RefreshCw size={12} className="reset-icon"/>
          <span>Reset System Data</span>
        </button>
      </div>
      <div className="header-icons">
        <button className="icon-btn" aria-label="Settings"><Settings size={18} /></button>
        <button className="icon-btn" aria-label="User Profile"><User size={18} /></button>
      </div>
    </div>
  </header>
);

const CreateOrderModal = ({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void, 
  onCreate: (order: { id: string, partName: string, quantity: number, estimatedDelivery: string }) => void 
}) => {
  const [partName, setPartName] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partName.trim()) return;
    
    const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    const id = `ORD-${randomHex}`;
    
    onCreate({
      id,
      partName,
      quantity: parseInt(quantity) || 0,
      estimatedDelivery
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Create New Manufacturing Batch</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Part Name / Assembly</label>
            <input 
              type="text" 
              value={partName} 
              onChange={e => setPartName(e.target.value)} 
              placeholder="e.g. Carbon Fiber Strut"
              required 
              autoFocus
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Estimated Delivery</label>
              <input 
                type="date" 
                value={estimatedDelivery} 
                onChange={e => setEstimatedDelivery(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create Order</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AISummaryPanel = ({ orders }: { orders: Order[] }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const getDerivedStatus = (order: Order): OrderStatus => {
    const latestSys = [...order.timeline].reverse().find(e => e.type === 'system');
    return latestSys ? latestSys.status : order.currentStatus;
  };

  const generateText = () => {
    const onTrack = orders.filter(o => {
      const s = getDerivedStatus(o);
      return s === 'In Production' || s === 'Quality Check';
    }).length;
    
    const delayed = orders.filter(o => getDerivedStatus(o) === 'Delayed').length;
    const ready = orders.filter(o => getDerivedStatus(o) === 'Ready to Ship').length;
    
    let parts = [];
    if (onTrack > 0) parts.push(`${onTrack} order${onTrack > 1 ? 's' : ''} on track`);
    if (delayed > 0) parts.push(`${delayed} delayed${delayed > 1 ? ' in QC/Production' : ''}`);
    if (ready > 0) parts.push(`${ready} ready for shipment`);
    
    if (parts.length === 0) return "All tracked orders have been delivered.";
    return parts.join(' · ');
  };

  useEffect(() => {
    if (summary && !loading) {
      setSummary(generateText());
    }
  }, [orders]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setSummary(generateText());
      setLoading(false);
    }, 800);
  };

  return (
    <div className="ai-summary-panel">
      <div className="ai-summary-content-wrapper">
        <div className="ai-summary-title">
          <BarChart2 size={16} className="ai-icon" />
          <span>Operations Insights</span>
        </div>
        
        <div className="ai-summary-text-area">
          {loading ? (
            <span className="ai-summary-loading loading-pulse">Synthesizing operational telemetry...</span>
          ) : summary ? (
            <span className="ai-summary-result">{summary}</span>
          ) : (
            <span className="ai-summary-placeholder">Run analysis for a quick operational overview.</span>
          )}
        </div>
      </div>
      <button 
        className="btn-primary btn-sm" 
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Generate Summary'}
      </button>
    </div>
  );
};

const OrderCard = ({ 
  order, 
  isStaffMode, 
  onUpdateStatus, 
  onAddUpdate 
}: { 
  order: Order; 
  isStaffMode: boolean; 
  onUpdateStatus: (id: string, s: OrderStatus) => void;
  onAddUpdate: (id: string, desc: string, type: 'system' | 'manual') => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState("");

  const handleAddUpdate = () => {
    if (newUpdateText.trim()) {
      onAddUpdate(order.id, newUpdateText.trim(), 'manual');
      setNewUpdateText("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  // Derive authoritative status from timeline
  const latestSystemEvent = [...order.timeline].reverse().find(e => e.type === 'system');
  const displayStatus = latestSystemEvent ? latestSystemEvent.status : order.currentStatus;

  const statusOptions: OrderStatus[] = ['In Production', 'Quality Check', 'Ready to Ship', 'Delayed', 'Delivered'];

  return (
    <div className={`order-card ${getCardBorderClass(displayStatus)} ${expanded ? 'expanded' : ''}`}>
      <div 
        className="order-card-summary" 
        onClick={() => setExpanded(!expanded)}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        onKeyDown={handleKeyDown}
      >
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
          {isStaffMode ? (
            <select 
              className={`status-select ${getStatusClass(displayStatus)}`}
              value={displayStatus}
              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
              onClick={(e) => e.stopPropagation()}
            >
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <span className={`status-badge ${getStatusClass(displayStatus)}`}>
              {displayStatus}
            </span>
          )}
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
            {order.timeline.map((event, index) => {
              const isSameAsPrev = index > 0 && order.timeline[index - 1].status === event.status;
              
              return (
              <div key={event.id} className={`timeline-item node-${event.status.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="timeline-node-wrapper">
                  {!isSameAsPrev && <div className="timeline-node" />}
                  <div className="timeline-line" />
                </div>
                <div className="timeline-content">
                  <div className="timeline-event-header">
                    {!isSameAsPrev && <span className="timeline-status">{event.status}</span>}
                    {event.type === 'system' && (
                      <span className="timeline-system-badge">SYSTEM</span>
                    )}
                    <span className="timeline-time">
                      {new Date(event.timestamp).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={`timeline-desc ${event.type === 'system' ? 'desc-system' : ''}`}>
                    {event.description}
                  </div>
                </div>
              </div>
              );
            })}
            
            {isStaffMode && (
              <div className="timeline-item timeline-input-row">
                <div className="timeline-node-wrapper">
                  <div className="timeline-node node-input" />
                </div>
                <div className="timeline-content timeline-input-content">
                  <input 
                    type="text" 
                    className="timeline-text-input" 
                    placeholder="Add an operational manual update..."
                    value={newUpdateText}
                    onChange={e => setNewUpdateText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddUpdate(); }}
                  />
                  <button 
                    className="btn-secondary btn-sm" 
                    onClick={handleAddUpdate}
                    disabled={!newUpdateText.trim()}
                  >
                    Add Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

type FilterOption = OrderStatus | 'All';

function App() {
  const [filter, setFilter] = useState<FilterOption>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('parts-tracking-v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockOrders;
      }
    }
    return mockOrders;
  });

  useEffect(() => {
    localStorage.setItem('parts-tracking-v4', JSON.stringify(orders));
  }, [orders]);

  const handleResetSystemData = () => {
    localStorage.removeItem('parts-tracking-v4');
    setOrders(mockOrders);
    setFilter('All');
    setSearchQuery('');
  };

  const handleCreateOrder = (data: { id: string, partName: string, quantity: number, estimatedDelivery: string }) => {
    const newOrder: Order = {
      ...data,
      currentStatus: 'In Production',
      timeline: [{
        id: `sys-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'In Production',
        description: 'Batch routing initiated. Production line state reset to active manufacturing.',
        type: 'system'
      }]
    };
    setOrders(prev => [newOrder, ...prev]);
    setIsCreatingOrder(false);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;

      // A. Idempotency Guard
      const latestSystemEvent = [...o.timeline].reverse().find(e => e.type === 'system');
      const activeStatus = latestSystemEvent ? latestSystemEvent.status : o.currentStatus;
      if (activeStatus === newStatus) return o;

      // B. Map Canonical Weights & Isolate Notes
      const canonicalWeights: Record<OrderStatus, number> = {
        'In Production': 0,
        'Quality Check': 1,
        'Ready to Ship': 2,
        'Delivered': 3,
        'Delayed': -1
      };
      
      const manualEvents = o.timeline.filter(e => e.type === 'manual');
      let systemEvents = o.timeline.filter(e => e.type === 'system');

      // C. Execute State Pruning
      const targetWeight = canonicalWeights[newStatus];
      
      if (targetWeight !== -1) {
        // Aggressively filter out ANY system events with a weight >= new target index
        systemEvents = systemEvents.filter(e => {
          const w = canonicalWeights[e.status];
          return w === -1 || w < targetWeight; // Keep Delayed and strictly earlier canonical states
        });
      } else if (newStatus === 'Delayed') {
        // Explicitly strip any prior 'Delivered' system events out of the history array
        systemEvents = systemEvents.filter(e => e.status !== 'Delivered');
      }

      // D. Reassembly & Sort
      const newSystemEvent: TimelineEvent = {
        id: `sys-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: newStatus,
        type: 'system',
        description: getSystemDescriptionForStatus(newStatus)
      };

      const finalTimeline = [...systemEvents, ...manualEvents, newSystemEvent].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return { ...o, currentStatus: newStatus, timeline: finalTimeline };
    }));
  };

  const addTimelineEvent = (orderId: string, description: string, type: 'system' | 'manual') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const latestSys = [...o.timeline].reverse().find(e => e.type === 'system');
        const currentDerivedStatus = latestSys ? latestSys.status : o.currentStatus;
        
        const newEvent: TimelineEvent = {
          id: `ev-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: currentDerivedStatus, 
          type,
          description
        };
        return { ...o, timeline: [...o.timeline, newEvent] };
      }
      return o;
    }));
  };
  
  const getDerivedStatus = (o: Order): OrderStatus => {
      const latestSys = [...o.timeline].reverse().find(e => e.type === 'system');
      return latestSys ? latestSys.status : o.currentStatus;
  };

  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    const s = getDerivedStatus(o);
    if (filter !== 'All' && s !== filter) return false;
    
    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.partName.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  const filterOptions: FilterOption[] = ['All', 'In Production', 'Quality Check', 'Ready to Ship', 'Delayed', 'Delivered'];

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-layout">
      <Header isStaffMode={isStaffMode} setIsStaffMode={setIsStaffMode} onReset={handleResetSystemData} />
      
      <main className="app-container">
        <AISummaryPanel orders={orders} />
        
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

        <div className="controls-row">
          <div className="controls-left">
            <div className="search-wrapper">
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search ID or Part Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                    {option === 'All' && <span className="chip-count">{orders.length}</span>}
                    {option !== 'All' && <span className="chip-count">{orders.filter(o => getDerivedStatus(o) === option).length}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {isStaffMode && (
            <div className="controls-right">
              <button className="btn-primary" onClick={() => setIsCreatingOrder(true)}>
                <Plus size={16} />
                Create New Batch
              </button>
            </div>
          )}
        </div>
        
        <div className="order-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                isStaffMode={isStaffMode}
                onUpdateStatus={updateOrderStatus}
                onAddUpdate={addTimelineEvent}
              />
            ))
          ) : (
            <div className="no-orders-message">
              <div className="no-orders-content">
                <p>No operational manufacturing records match the search criteria.</p>
                <button className="btn-text" onClick={() => { setFilter('All'); setSearchQuery(''); }}>Clear filters</button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {isCreatingOrder && (
        <CreateOrderModal 
          onClose={() => setIsCreatingOrder(false)} 
          onCreate={handleCreateOrder} 
        />
      )}
    </div>
  );
}

export default App;
