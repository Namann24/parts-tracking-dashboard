import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { mockOrders, type Order, type OrderStatus, type TimelineEvent } from './data/mockOrders';
import { Hexagon, Bell, ChevronDown, Search, AlertCircle, PackageCheck, AlertTriangle, Activity, Package, Sparkles, Download } from 'lucide-react';
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

// --- Components ---

// Layer 1: Global App Bar
const GlobalAppBar = ({ 
  isStaffMode, 
  setIsStaffMode 
}: { 
  isStaffMode: boolean, 
  setIsStaffMode: (val: boolean) => void
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="global-app-bar">
      <div className="global-brand">
        <Hexagon className="brand-icon" size={16} />
        <span className="global-brand-text">Nexus Ops</span>
      </div>
      
      <nav className="central-nav hidden-mobile">
        <a href="#overview" className="nav-link interactive-scale">Overview</a>
        <a href="#orders" className="nav-link active interactive-scale">Orders</a>
        <a href="#inventory" className="nav-link interactive-scale">Inventory</a>
        <a href="#analytics" className="nav-link interactive-scale">Analytics</a>
        <a href="#settings" className="nav-link interactive-scale">Settings</a>
      </nav>
      
      <div className="global-actions">
        <div className="internal-ops-toggle-container">
          <div className={`segmented-control ${isStaffMode ? 'staff-mode' : 'customer-mode'}`} role="group" aria-label="View Mode">
            <div className="segmented-slider"></div>
            <button 
              className={`segment-btn interactive-scale ${!isStaffMode ? 'active' : ''}`}
              onClick={() => setIsStaffMode(false)}
            >
              Customer
            </button>
            <button 
              className={`segment-btn interactive-scale ${isStaffMode ? 'active' : ''}`}
              onClick={() => setIsStaffMode(true)}
            >
              Internal Ops
            </button>
          </div>
        </div>
        
        <span className="system-time hidden-mobile">{time}</span>
        
        <Bell className="action-icon interactive-scale hidden-mobile" size={16} />
        
        <div className="user-avatar-dark interactive-scale hidden-mobile" title="Namann Sharma">
          NS
        </div>
      </div>
    </header>
  );
};

// Layer 2: Workspace Header
const WorkspaceHeader = ({ onExportCSV }: { onExportCSV: () => void }) => (
  <div className="workspace-header">
    <div className="workspace-header-left">
      <div className="breadcrumbs">
        <span>Nexus Ops</span>
        <span className="breadcrumb-separator">/</span>
        <span>Orders</span>
        <span className="breadcrumb-separator">/</span>
        <span className="active">Active Tracking</span>
      </div>
      <div className="title-row">
        <h1 className="workspace-title">Manufacturing Order Tracking</h1>
        <div className="live-sync-badge">
          <span className="pulse-dot"></span>
          Live Sync
        </div>
      </div>
      <p className="workspace-subtitle">Monitor production progress, quality assurance, and shipment readiness.</p>
    </div>
    
    <div className="workspace-header-right hidden-mobile">
      <button 
        className="btn-secondary btn-sm interactive-scale" 
        onClick={onExportCSV}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
      >
        <Download size={14} />
        Export CSV
      </button>
    </div>
  </div>
);

const ExecutiveOverview = ({ orders, getDerivedStatus }: { orders: Order[], getDerivedStatus: (o: Order) => OrderStatus }) => {
  const activeCount = orders.filter(o => {
    const s = getDerivedStatus(o);
    return s === 'In Production' || s === 'Quality Check';
  }).length;
  
  const delayedCount = orders.filter(o => getDerivedStatus(o) === 'Delayed').length;
  const readyCount = orders.filter(o => getDerivedStatus(o) === 'Ready to Ship').length;
  const completedCount = orders.filter(o => getDerivedStatus(o) === 'Delivered').length;

  return (
    <div className="executive-overview">
      <div className="metric-card">
        <div className="metric-header">
          <Activity size={16} className="metric-icon text-sky-500" />
          <span className="metric-label">Active Orders</span>
        </div>
        <span className="metric-value">{activeCount}</span>
      </div>
      <div className="metric-card">
        <div className="metric-header">
          <AlertTriangle size={16} className="metric-icon text-red-500" />
          <span className="metric-label">Delayed Orders</span>
        </div>
        <span className="metric-value">{delayedCount}</span>
      </div>
      <div className="metric-card">
        <div className="metric-header">
          <Package size={16} className="metric-icon text-emerald-500" />
          <span className="metric-label">Ready To Ship</span>
        </div>
        <span className="metric-value">{readyCount}</span>
      </div>
      <div className="metric-card">
        <div className="metric-header">
          <PackageCheck size={16} className="metric-icon text-zinc-400" />
          <span className="metric-label">Completed</span>
        </div>
        <span className="metric-value">{completedCount}</span>
      </div>
    </div>
  );
};

const AIPortfolioInsights = ({ orders, getDerivedStatus }: { orders: Order[], getDerivedStatus: (o: Order) => OrderStatus }) => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsGenerated(true);
      setIsLoading(false);
    }, 600);
  };

  const activeCount = orders.filter(o => {
    const s = getDerivedStatus(o);
    return s === 'In Production' || s === 'Quality Check';
  }).length;
  
  const delayedCount = orders.filter(o => getDerivedStatus(o) === 'Delayed').length;
  const readyCount = orders.filter(o => getDerivedStatus(o) === 'Ready to Ship').length;

  const summaryText = `System Insights: There are currently ${activeCount} orders on track, ${delayedCount} order${delayedCount === 1 ? ' is' : 's are'} experiencing scheduling delays, and ${readyCount} batch${readyCount === 1 ? ' is' : 'es are'} ready for shipment cleanup.`;

  return (
    <div className="ai-insights-panel">
      <div className="ai-insights-header">
        <div className="ai-insights-title">
          <Sparkles size={16} className="text-zinc-900" />
          <span className="font-semibold text-zinc-900 text-sm">AI Portfolio Insights</span>
        </div>
        <button 
          className="btn-ai-generate interactive-scale" 
          onClick={handleGenerate} 
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : '✨ Generate Summary'}
        </button>
      </div>
      
      {(isGenerated || isLoading) && (
        <div className={`ai-insights-content ${isGenerated ? 'bitwise-fade-in' : ''}`}>
          {isLoading ? (
            <div className="skeleton-loader-inline" style={{ width: '100%', height: '20px', marginTop: '1rem' }}></div>
          ) : (
            <p className="ai-summary-text">
              {summaryText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const ProgressStepper = ({ order, currentStatus }: { order: Order, currentStatus: OrderStatus }) => {
  const stages = [
    { label: 'Production', index: 0 },
    { label: 'QA', index: 1 },
    { label: 'Ready', index: 2 },
    { label: 'Delivered', index: 3 }
  ];

  let computedStatus = currentStatus;
  const isDelayed = currentStatus === 'Delayed';

  if (isDelayed) {
    const lastActive = [...order.timeline].reverse().find(e => e.type === 'system' && e.status !== 'Delayed');
    if (lastActive) {
      computedStatus = lastActive.status;
    } else {
      computedStatus = 'In Production';
    }
  }

  let activeIndex = -1;
  if (computedStatus === 'In Production') activeIndex = 0;
  if (computedStatus === 'Quality Check') activeIndex = 1;
  if (computedStatus === 'Ready to Ship') activeIndex = 2;
  if (computedStatus === 'Delivered') activeIndex = 3;

  return (
    <div className={`progress-stepper ${isDelayed ? 'has-delay' : ''}`}>
      {stages.map((stage, idx) => {
        const isCompleted = idx < activeIndex;
        const isActive = idx === activeIndex;

        let stateClass = '';
        if (isCompleted) stateClass = 'completed';
        else if (isActive) stateClass = 'active';
        else stateClass = 'pending';

        return (
          <div key={stage.label} className={`step-item ${stateClass}`}>
            <div className="step-node-container">
              <div className="step-node"></div>
              <span className="step-label">{stage.label}</span>
            </div>
            {idx < stages.length - 1 && <div className="step-line"></div>}
          </div>
        );
      })}
    </div>
  );
};

const StatusDropdown = ({ value, onChange, options }: { value: OrderStatus, onChange: (v: OrderStatus) => void, options: OrderStatus[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="custom-dropdown-container" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button 
        className={`custom-dropdown-trigger interactive-scale ${getStatusClass(value)}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="dropdown-value-text">{value}</span>
        <ChevronDown size={14} className={`dropdown-icon ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map(opt => (
            <button 
              key={opt} 
              className={`dropdown-item ${opt === 'Delayed' ? 'item-delayed' : ''} ${value === opt ? 'selected' : ''}`}
              onClick={() => { onChange(opt); setIsOpen(false); }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
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
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as HTMLElement).classList.contains('order-card-summary')) {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };

  const latestSystemEvent = [...order.timeline].reverse().find(e => e.type === 'system');
  const displayStatus = latestSystemEvent ? latestSystemEvent.status : order.currentStatus;

  const statusOptions: OrderStatus[] = ['In Production', 'Quality Check', 'Ready to Ship', 'Delayed', 'Delivered'];

  // Calculate ETA formatting safely
  const etaDate = new Date(order.estimatedDelivery);
  const formattedETA = !isNaN(etaDate.getTime()) 
    ? etaDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'}) 
    : 'Pending';

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
        {/* Column 1: Identity */}
        <div className="col-identity">
          <span className="part-name" title={order.partName}>{order.partName}</span>
          <span className="order-id">{order.id}</span>
        </div>
        
        {/* Column 2: Progress */}
        <div className="col-progress justify-center">
           <ProgressStepper order={order} currentStatus={displayStatus} />
        </div>

        {/* Column 3: Qty */}
        <div className="col-qty">
          <div className="metric-group mobile-only-group">
            <span className="metric-label hidden-desktop">Qty</span>
            <span className="metric-value value-numeric">{order.quantity.toLocaleString()}</span>
          </div>
        </div>

        {/* Column 4: ETA */}
        <div className="col-eta">
          <div className="metric-group mobile-only-group">
            <span className="metric-label hidden-desktop">ETA</span>
            <span className="metric-value">{formattedETA}</span>
          </div>
        </div>

        {/* Column 5: Actions */}
        <div className="col-actions">
          {isStaffMode ? (
            <StatusDropdown 
              value={displayStatus} 
              onChange={(v) => onUpdateStatus(order.id, v)} 
              options={statusOptions}
            />
          ) : (
            <span className={`status-badge ${getStatusClass(displayStatus)}`}>
              {displayStatus}
            </span>
          )}
          <ChevronDown className={`expand-icon ${expanded ? 'expanded' : ''}`} size={16} />
        </div>
      </div>
      
      <div className={`timeline-container ${expanded ? 'expanded' : ''}`}>
        <div className="timeline-inner">
          <div className="timeline-header-row">
            <h4 className="timeline-title">Production History</h4>
            <span className="timeline-meta">Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="timeline">
            {order.timeline.map((event) => {
              const isManual = event.type === 'manual';
              return (
                <div key={event.id} className={`timeline-item node-${event.status.replace(/\s+/g, '-').toLowerCase()} ${isManual ? 'item-manual' : 'item-system'}`}>
                  <div className="timeline-node-wrapper">
                    <div className="timeline-node" />
                    <div className="timeline-line" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-event-header">
                      <span className="timeline-status">{isManual ? 'Operator Note' : event.status}</span>
                      {!isManual && (
                        <span className="timeline-system-badge">SYSTEM</span>
                      )}
                      <span className="timeline-time">
                        {new Date(event.timestamp).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {isManual ? (
                      <div className="manual-callout">
                        <div className="timeline-desc desc-manual">
                          {event.description}
                        </div>
                      </div>
                    ) : (
                      <div className="timeline-desc desc-system">
                        {event.description}
                      </div>
                    )}
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
                    className="timeline-text-input interactive-scale" 
                    placeholder="Add an operational manual update..."
                    value={newUpdateText}
                    onChange={e => setNewUpdateText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddUpdate(); }}
                  />
                  <button 
                    className="btn-secondary btn-sm interactive-scale" 
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

// --- Add Order Modal ---
const AddOrderModal = ({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreate: (name: string, qty: number, eta: string) => void;
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [eta, setEta] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && qty && eta) {
      onCreate(name, parseInt(qty, 10), eta);
      setName('');
      setQty('');
      setEta('');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-surface">
        <h2 className="modal-title">Add New Order</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Part Name</label>
            <input 
              type="text" 
              className="form-input interactive-scale" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Servo Motor Housing"
              autoFocus
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input 
              type="number" 
              className="form-input interactive-scale" 
              value={qty} 
              onChange={e => setQty(e.target.value)} 
              placeholder="e.g. 500"
              required 
              min="1"
            />
          </div>
          <div className="form-group">
            <label className="form-label">ETA Date</label>
            <input 
              type="date" 
              className="form-input interactive-scale" 
              value={eta} 
              onChange={e => setEta(e.target.value)} 
              required 
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel interactive-scale" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-modal-submit interactive-scale">Create Order</button>
          </div>
        </form>
      </div>
    </div>
  );
};

type FilterOption = OrderStatus | 'All';

function App() {
  const [filter, setFilter] = useState<FilterOption>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('parts-tracking-v7');
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
    localStorage.setItem('parts-tracking-v7', JSON.stringify(orders));
  }, [orders]);

  const getDerivedStatus = (o: Order): OrderStatus => {
      const latestSys = [...o.timeline].reverse().find(e => e.type === 'system');
      return latestSys ? latestSys.status : o.currentStatus;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;

      const latestSystemEvent = [...o.timeline].reverse().find(e => e.type === 'system');
      const activeStatus = latestSystemEvent ? latestSystemEvent.status : o.currentStatus;
      if (activeStatus === newStatus) return o;

      const canonicalWeights: Record<OrderStatus, number> = {
        'In Production': 0,
        'Quality Check': 1,
        'Ready to Ship': 2,
        'Delivered': 3,
        'Delayed': -1
      };
      
      const manualEvents = o.timeline.filter(e => e.type === 'manual');
      let systemEvents = o.timeline.filter(e => e.type === 'system');

      const targetWeight = canonicalWeights[newStatus];
      
      if (targetWeight !== -1) {
        systemEvents = systemEvents.filter(e => {
          const w = canonicalWeights[e.status];
          return w === -1 || w < targetWeight; 
        });
      } else if (newStatus === 'Delayed') {
        systemEvents = systemEvents.filter(e => e.status !== 'Delivered');
      }

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

  const handleCreateOrder = (name: string, qty: number, eta: string) => {
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}A`;
    const newOrder: Order = {
      id: newId,
      partName: name,
      quantity: qty,
      estimatedDelivery: eta,
      currentStatus: 'In Production',
      timeline: [
        {
          id: `sys-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'In Production',
          type: 'system',
          description: getSystemDescriptionForStatus('In Production')
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setIsAddModalOpen(false);
  };

  const filteredOrders = orders.filter(o => {
    const s = getDerivedStatus(o);
    if (filter !== 'All' && s !== filter) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.partName.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Part Name', 'Status', 'Quantity', 'ETA'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(o => {
        const status = getDerivedStatus(o);
        const etaDate = new Date(o.estimatedDelivery);
        const formattedETA = !isNaN(etaDate.getTime()) 
          ? etaDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'}) 
          : 'Pending';
        const name = `"${o.partName.replace(/"/g, '""')}"`;
        return `${o.id},${name},${status},${o.quantity},${formattedETA}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexus_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterOptions: FilterOption[] = ['All', 'In Production', 'Quality Check', 'Ready to Ship', 'Delayed', 'Delivered'];

  return (
    <div className="app-layout">
      <GlobalAppBar isStaffMode={isStaffMode} setIsStaffMode={setIsStaffMode} />
      
      <WorkspaceHeader onExportCSV={handleExportCSV} />
      
      <main className="app-container">

        <ExecutiveOverview orders={orders} getDerivedStatus={getDerivedStatus} />
        
        <AIPortfolioInsights orders={orders} getDerivedStatus={getDerivedStatus} />

        <div className="command-center-row">
          <div className="command-center-left">
            <div className="search-wrapper">
              <Search className="search-icon" size={15} />
              <input 
                type="text" 
                className="search-input interactive-scale" 
                placeholder="Search ID or Part Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-chips-wrapper">
              <div className="filter-chips">
                {filterOptions.map(option => (
                  <button
                    key={option}
                    className={`filter-chip interactive-scale ${filter === option ? 'active' : ''}`}
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
            <div className="command-center-right">
              <button 
                className="btn-add-order interactive-scale" 
                onClick={() => setIsAddModalOpen(true)}
              >
                + Add Order
              </button>
            </div>
          )}
        </div>
        
        <div className="order-list">
          {filteredOrders.length > 0 && (
            <div className="table-header-row hidden-mobile">
              <div className="header-cell">Order Details</div>
              <div className="header-cell justify-center">Production Progress</div>
              <div className="header-cell">Quantity</div>
              <div className="header-cell">Estimated ETA</div>
              <div className="header-cell justify-end">Actions</div>
            </div>
          )}

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
            <div className="empty-state">
              <AlertCircle size={32} className="empty-icon" />
              <h3>No records found</h3>
              <p>No operational manufacturing records match the search criteria or filter.</p>
              <button className="btn-secondary mt-2 interactive-scale" onClick={() => { setFilter('All'); setSearchQuery(''); }}>Clear Filters</button>
            </div>
          )}
        </div>
      </main>

      <AddOrderModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onCreate={handleCreateOrder} 
      />
    </div>
  );
}

export default App;
