import React, { useState, useEffect, useRef } from 'react';
import { mockOrders, type Order, type OrderStatus, type TimelineEvent } from './data/mockOrders';
import { Hexagon, Bell, ChevronDown, Search, PackageCheck, AlertTriangle, Activity, Package, Sparkles, Download, RefreshCw, Inbox, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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
  setIsStaffMode,
  onReset
}: { 
  isStaffMode: boolean, 
  setIsStaffMode: (val: boolean) => void,
  onReset: () => void
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
        <div className="brand-icon-wrapper">
          <Hexagon className="brand-icon" size={16} />
        </div>
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
              className={`segment-btn ${!isStaffMode ? 'active' : ''}`}
              onClick={() => setIsStaffMode(false)}
            >
              Customer
            </button>
            <button 
              className={`segment-btn ${isStaffMode ? 'active' : ''}`}
              onClick={() => setIsStaffMode(true)}
            >
              Internal Ops
            </button>
          </div>
        </div>
        
        <span className="system-time hidden-mobile">{time}</span>
        
        <button className="action-btn-clean interactive-scale hidden-mobile" title="Reset System Data" onClick={onReset}>
          <RefreshCw size={16} className="transition-colors" />
        </button>
        
        <Bell className="action-icon interactive-scale hidden-mobile" size={16} />
        
        <div className="avatar-wrapper hidden-mobile" title="Namann Sharma">
          <div className="user-avatar-dark">
            NS
          </div>
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

const ExecutiveOverview = ({ orders, getDerivedStatus, filter, setFilter }: { 
  orders: Order[], 
  getDerivedStatus: (o: Order) => OrderStatus,
  filter: FilterOption,
  setFilter: (f: FilterOption) => void
}) => {
  const activeCount = orders.filter(o => {
    const s = getDerivedStatus(o);
    return s === 'In Production' || s === 'Quality Check';
  }).length;
  
  const delayedCount = orders.filter(o => getDerivedStatus(o) === 'Delayed').length;
  const readyCount = orders.filter(o => getDerivedStatus(o) === 'Ready to Ship').length;
  const completedCount = orders.filter(o => getDerivedStatus(o) === 'Delivered').length;

  return (
    <div className="executive-overview">
      <div 
        className={`metric-card cursor-pointer transition-all duration-200 hover:border-zinc-300 hover:shadow-md active:scale-[0.98] ${filter === 'Active' ? 'ring-2 ring-sky-500/50' : ''}`}
        onClick={() => setFilter('Active')}
      >
        <div className="metric-header">
          <Activity size={16} className="metric-icon text-sky-500" />
          <span className="metric-label">Active Orders</span>
        </div>
        <span className="metric-value">{activeCount}</span>
      </div>
      <div 
        className={`metric-card cursor-pointer transition-all duration-200 hover:border-zinc-300 hover:shadow-md active:scale-[0.98] ${filter === 'Delayed' ? 'ring-2 ring-red-500/50' : ''}`}
        style={{ backgroundColor: 'rgba(254, 226, 226, 0.4)', borderColor: 'rgba(252, 165, 165, 0.6)' }}
        onClick={() => setFilter('Delayed')}
      >
        <div className="metric-header">
          <AlertTriangle size={16} className="metric-icon text-red-500" />
          <span className="metric-label">Delayed Orders</span>
        </div>
        <span className="metric-value">{delayedCount}</span>
      </div>
      <div 
        className={`metric-card cursor-pointer transition-all duration-200 hover:border-zinc-300 hover:shadow-md active:scale-[0.98] ${filter === 'Ready to Ship' ? 'ring-2 ring-emerald-500/50' : ''}`}
        onClick={() => setFilter('Ready to Ship')}
      >
        <div className="metric-header">
          <Package size={16} className="metric-icon text-emerald-500" />
          <span className="metric-label">Ready To Ship</span>
        </div>
        <span className="metric-value">{readyCount}</span>
      </div>
      <div 
        className={`metric-card cursor-pointer transition-all duration-200 hover:border-zinc-300 hover:shadow-md active:scale-[0.98] ${filter === 'Delivered' ? 'ring-2 ring-zinc-400/50' : ''}`}
        onClick={() => setFilter('Delivered')}
      >
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

  const summaryText = `Pipeline Health: ${activeCount} orders on track, ${delayedCount} delayed, and ${readyCount} ready to ship.`;

  return (
    <div className="ai-insights-panel">
      <div className="ai-insights-header">
        <div className="ai-insights-title">
          <Sparkles size={16} className="text-zinc-900" />
          <span className="font-semibold text-zinc-900 text-sm">AI Portfolio Insights</span>
          <span className="text-xs text-zinc-500 hidden sm:inline-block ml-3 border-l border-zinc-300 pl-3 font-medium">
            Analyze your manufacturing pipeline instantly
          </span>
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

        const stageClass = `stage-${stage.label.toLowerCase()}`;

        return (
          <div key={stage.label} className={`step-item ${stateClass} ${stageClass}`}>
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

const StatusDropdown = ({ value, onChange, options, disabled, isOpen, onToggle }: { value: OrderStatus, onChange: (v: OrderStatus) => void, options: OrderStatus[], disabled?: boolean, isOpen?: boolean, onToggle?: (isOpen: boolean) => void }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const actualIsOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (onToggle) onToggle(false);
        else setInternalIsOpen(false);
      }
    };
    if (actualIsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actualIsOpen, onToggle]);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!actualIsOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 200);
    }
    if (onToggle) onToggle(!actualIsOpen);
    else setInternalIsOpen(!actualIsOpen);
  };

  return (
    <div className="custom-dropdown-container" ref={ref} onClick={(e) => { if(!disabled) e.stopPropagation(); }}>
      <button 
        className={`custom-dropdown-trigger interactive-scale ${getStatusClass(value)}`} 
        onClick={toggleDropdown}
        aria-expanded={actualIsOpen}
        disabled={disabled}
      >
        <span className="dropdown-value-text">{value}</span>
        <ChevronDown size={14} className={`dropdown-icon ${actualIsOpen ? 'open' : ''}`} />
      </button>
      {actualIsOpen && !disabled && (
        <div className={`custom-dropdown-menu ${openUpwards ? 'open-upwards' : ''}`}>
          {options.map(opt => (
            <button 
              key={opt} 
              className={`dropdown-item ${opt === 'Delayed' ? 'item-delayed' : ''} ${value === opt ? 'selected' : ''}`}
              onClick={() => { onChange(opt); if (onToggle) onToggle(false); else setInternalIsOpen(false); }}
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
  isLoading,
  onUpdateStatus, 
  onAddUpdate,
  index,
  isDropdownOpen,
  onToggleDropdown
}: { 
  order: Order; 
  isStaffMode: boolean; 
  isLoading: boolean;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onAddUpdate: (id: string, message: string, type: 'system' | 'manual') => void;
  index: number;
  isDropdownOpen?: boolean;
  onToggleDropdown?: (isOpen: boolean) => void;
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [newUpdateText, setNewUpdateText] = useState<string>("");

  const handleAddUpdate = () => {
    if (newUpdateText.trim()) {
      onAddUpdate(order.id, newUpdateText.trim(), 'manual');
      setNewUpdateText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    <div 
      className={`order-card animate-fade-in ${getCardBorderClass(displayStatus)} ${expanded ? 'expanded' : ''} ${isLoading ? 'is-loading' : ''}`}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both', zIndex: isDropdownOpen ? 999 : 100 - index, position: 'relative' }}
    >
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
          <div className="metric-group mobile-only-group" style={{ alignItems: 'center' }}>
            <span className="metric-label hidden-desktop">Qty</span>
            <span className="metric-value value-numeric">{order.quantity.toLocaleString()}</span>
          </div>
        </div>

        {/* Column 4: ETA */}
        <div className="col-eta">
          <div className="metric-group mobile-only-group" style={{ alignItems: 'center' }}>
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
              disabled={isLoading}
              isOpen={isDropdownOpen}
              onToggle={onToggleDropdown}
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
              const isActiveStage = !isManual && latestSystemEvent && event.id === latestSystemEvent.id;
              return (
                <div key={event.id} className={`timeline-item node-${event.status.replace(/\s+/g, '-').toLowerCase()} ${isManual ? 'item-manual' : 'item-system'}`}>
                  <div className="timeline-node-wrapper">
                    <div className="timeline-node" />
                    <div className="timeline-line" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-event-header">
                      <span className="timeline-status" style={{ fontWeight: isActiveStage ? 700 : undefined }}>
                        {isManual ? 'Operator Note' : event.status}
                      </span>
                      {!isManual && (
                        <span className="timeline-system-badge">SYSTEM</span>
                      )}
                      {isActiveStage && (
                        <span className="active-stage-badge">CURRENT</span>
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
                    disabled={isLoading}
                  />
                  <button 
                    className="btn-secondary btn-sm interactive-scale" 
                    onClick={handleAddUpdate}
                    disabled={!newUpdateText.trim() || isLoading}
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
const PremiumCalendar = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Track the month currently being viewed (not necessarily the selected month)
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Blank days at start
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center p-1"></div>);
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = new Date(year, month, d).toLocaleDateString('en-CA'); // gets YYYY-MM-DD
      const isSelected = value === dateStr;
      const isToday = todayStr === dateStr;
      
      days.push(
        <button
          key={d}
          type="button"
          onClick={() => { onChange(dateStr); setIsOpen(false); }}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
        >
          {d}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="custom-dropdown-container" ref={ref} style={{ width: '100%' }}>
      <button 
        type="button"
        className="form-input interactive-scale" 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', cursor: 'pointer', textAlign: 'left' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'}) : 'mm/dd/yyyy'}
        </span>
        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
      </button>
      {isOpen && (
        <div className="premium-calendar animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={handlePrevMonth} style={{ padding: '0.2rem', cursor: 'pointer', borderRadius: '4px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-bg-hover">
                <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <button type="button" onClick={handleNextMonth} style={{ padding: '0.2rem', cursor: 'pointer', borderRadius: '4px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-bg-hover">
                <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

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

  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

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
    <div className={`modal-backdrop ${isClosing ? 'animate-fade-out' : ''}`} onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={`modal-surface ${isClosing ? 'animate-fade-out-down' : 'animate-fade-in'}`}>
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
            <PremiumCalendar value={eta} onChange={setEta} />
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

type FilterOption = OrderStatus | 'All' | 'Active';

type ToastMessage = {
  id: string;
  message: string;
  onUndo?: () => void;
};

function App() {
  const [filter, setFilter] = useState<FilterOption>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [sortField, setSortField] = useState<'qty' | 'eta' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('nexus_orders');
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
    localStorage.setItem('nexus_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (message: string, onUndo?: () => void) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, onUndo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
    return id;
  };

  const handleResetSystem = () => {
    localStorage.removeItem('nexus_orders');
    setOrders(mockOrders);
    addToast("🔄 System data has been reset to factory defaults.");
  };

  const getDerivedStatus = (o: Order): OrderStatus => {
      const latestSys = [...o.timeline].reverse().find(e => e.type === 'system');
      return latestSys ? latestSys.status : o.currentStatus;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;
    
    const latestSystemEvent = [...orderToUpdate.timeline].reverse().find(e => e.type === 'system');
    const activeStatus = latestSystemEvent ? latestSystemEvent.status : orderToUpdate.currentStatus;
    if (activeStatus === newStatus) return;

    // Deep copy for rollback
    const oldOrder = JSON.parse(JSON.stringify(orderToUpdate));

    // Optimistic UI update
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;

      const canonicalWeights = new Map<OrderStatus, number>([
        ['In Production', 0],
        ['Quality Check', 1],
        ['Ready to Ship', 2],
        ['Delivered', 3],
        ['Delayed', -1]
      ]);
      
      const manualEvents = o.timeline.filter(e => e.type === 'manual');
      let systemEvents = o.timeline.filter(e => e.type === 'system');

      const targetWeight = canonicalWeights.get(newStatus) ?? -1;
      
      if (targetWeight !== -1) {
        systemEvents = systemEvents.filter(e => {
          const w = canonicalWeights.get(e.status) ?? -1;
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

    let toastId = '';
    const handleUndo = () => {
      setOrders(prev => prev.map(o => o.id === orderId ? oldOrder : o));
      setToasts(prev => prev.filter(t => t.id !== toastId));
      addToast("↩️ Status reverted");
    };

    toastId = addToast(`✅ Order updated to ${newStatus}`, handleUndo);
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
    addToast(`✅ Operational note added to ${orderId}.`);
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
    addToast(`✅ New order ${newId} created successfully.`);
  };

  const filteredOrders = orders.filter(o => {
    const s = getDerivedStatus(o);
    if (filter === 'Active') {
      if (s !== 'In Production' && s !== 'Quality Check') return false;
    } else if (filter !== 'All' && s !== filter) {
      return false;
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.partName.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortField) return 0;
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'qty') {
      return (a.quantity - b.quantity) * modifier;
    } else if (sortField === 'eta') {
      const dateA = new Date(a.estimatedDelivery).getTime();
      const dateB = new Date(b.estimatedDelivery).getTime();
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return (dateA - dateB) * modifier;
    }
    return 0;
  });

  const handleSort = (field: 'qty' | 'eta') => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else setSortField(null);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Part Name', 'Status', 'Quantity', 'ETA'];
    const csvContent = [
      headers.join(','),
      ...sortedOrders.map(o => {
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
    
    addToast("✅ CSV Export downloaded successfully.");
  };

  const filterOptions: FilterOption[] = ['All', 'Active', 'In Production', 'Quality Check', 'Ready to Ship', 'Delayed', 'Delivered'];

  return (
    <div className="app-layout">
      <GlobalAppBar isStaffMode={isStaffMode} setIsStaffMode={setIsStaffMode} onReset={handleResetSystem} />
      
      <WorkspaceHeader onExportCSV={handleExportCSV} />
      
      <main className="app-container">

        <ExecutiveOverview orders={orders} getDerivedStatus={getDerivedStatus} filter={filter} setFilter={setFilter} />
        
        <AIPortfolioInsights orders={orders} getDerivedStatus={getDerivedStatus} />

        <div className="command-center-row">
          <div className="command-center-left">
            <div className="search-wrapper">
              <Search className="search-icon" size={15} />
              <input 
                ref={searchInputRef}
                type="text" 
                className="search-input interactive-scale" 
                placeholder="Search ID or Part Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="search-shortcut hidden-mobile">
                <span className="search-shortcut-key">/</span>
              </div>
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
                    {option === 'Active' && <span className="chip-count">{orders.filter(o => {
                      const st = getDerivedStatus(o);
                      return st === 'In Production' || st === 'Quality Check';
                    }).length}</span>}
                    {option !== 'All' && option !== 'Active' && <span className="chip-count">{orders.filter(o => getDerivedStatus(o) === option).length}</span>}
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
          {sortedOrders.length > 0 && (
            <div className="table-header-row hidden-mobile">
              <div className="header-cell">Order Details</div>
              <div className="header-cell justify-center">Production Progress</div>
              <div 
                className="header-cell justify-center cursor-pointer hover-text-primary"
                onClick={() => handleSort('qty')}
                style={{ userSelect: 'none' }}
              >
                Quantity {sortField === 'qty' ? (sortDirection === 'asc' ? ' \u2191' : ' \u2193') : ''}
              </div>
              <div 
                className="header-cell justify-center cursor-pointer hover-text-primary"
                onClick={() => handleSort('eta')}
                style={{ userSelect: 'none' }}
              >
                Estimated ETA {sortField === 'eta' ? (sortDirection === 'asc' ? ' \u2191' : ' \u2193') : ''}
              </div>
              <div className="header-cell justify-end">Actions</div>
            </div>
          )}

          {sortedOrders.length > 0 ? (
            sortedOrders.map((order, index) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                isStaffMode={isStaffMode}
                isLoading={false}
                onUpdateStatus={updateOrderStatus}
                onAddUpdate={addTimelineEvent}
                index={index}
                isDropdownOpen={activeDropdownId === order.id}
                onToggleDropdown={(isOpen) => setActiveDropdownId(isOpen ? order.id : null)}
              />
            ))
          ) : (
            <div className="empty-state">
              <Inbox size={48} className="empty-icon text-zinc-300 mb-2" />
              <h3 className="text-lg font-semibold text-zinc-800">No Orders Found</h3>
              <p className="text-sm text-zinc-500 max-w-md mx-auto">No manufacturing orders match your active search or filters.</p>
              <button 
                className="btn-secondary mt-4 interactive-scale" 
                onClick={() => { setFilter('All'); setSearchQuery(''); }}
              >
                Clear Active Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <AddOrderModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onCreate={handleCreateOrder} 
      />

      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-notification">
            <span>{toast.message}</span>
            {toast.onUndo && (
              <button 
                className="ml-auto text-xs font-bold text-zinc-900 bg-white/50 px-2 py-1 rounded hover:bg-white transition-colors"
                onClick={() => toast.onUndo && toast.onUndo()}
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

