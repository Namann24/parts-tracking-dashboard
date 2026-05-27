export type OrderStatus = 'In Production' | 'Quality Check' | 'Ready to Ship' | 'Delivered' | 'Delayed';

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string
  status: OrderStatus;
  description: string;
}

export interface Order {
  id: string;
  partName: string;
  quantity: number;
  currentStatus: OrderStatus;
  estimatedDelivery: string;
  timeline: TimelineEvent[];
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-9012A',
    partName: 'Machined Aluminum Housing (Rev B)',
    quantity: 250,
    currentStatus: 'In Production',
    estimatedDelivery: '2026-06-02',
    timeline: [
      {
        id: 'ev-1',
        timestamp: '2026-05-25T08:30:00Z',
        status: 'In Production',
        description: 'Raw materials received (Batch #Al-2024-T3). CNC machining initiated on Haas VF-4 (Machine ID: M-12).',
      }
    ]
  },
  {
    id: 'ORD-8821C',
    partName: 'Titanium Fastener Assembly Kit',
    quantity: 1200,
    currentStatus: 'Quality Check',
    estimatedDelivery: '2026-05-29',
    timeline: [
      {
        id: 'ev-2',
        timestamp: '2026-05-24T10:00:00Z',
        status: 'In Production',
        description: 'Cold heading and thread rolling complete (Operator: J. Smith).',
      },
      {
        id: 'ev-3',
        timestamp: '2026-05-26T14:15:00Z',
        status: 'Quality Check',
        description: 'Transferred to QA Lab 2 for optical comparator inspection. Pending dimensional tolerance report.',
      }
    ]
  },
  {
    id: 'ORD-7734D',
    partName: 'Carbon Fiber Strut Assembly',
    quantity: 50,
    currentStatus: 'Delayed',
    estimatedDelivery: '2026-06-15',
    timeline: [
      {
        id: 'ev-4',
        timestamp: '2026-05-20T09:00:00Z',
        status: 'In Production',
        description: 'Pre-preg layup process completed. Loaded into Autoclave #3 for curing cycle.',
      },
      {
        id: 'ev-5',
        timestamp: '2026-05-22T16:30:00Z',
        status: 'Delayed',
        description: 'Autoclave #3 temperature anomaly detected during hold phase. Curing cycle extended for re-verification (Ref: INC-409).',
      }
    ]
  },
  {
    id: 'ORD-6549E',
    partName: 'Polymer Injection Molded Enclosure',
    quantity: 5000,
    currentStatus: 'Ready to Ship',
    estimatedDelivery: '2026-05-28',
    timeline: [
      {
        id: 'ev-6',
        timestamp: '2026-05-23T08:00:00Z',
        status: 'In Production',
        description: 'Injection molding run complete using Tooling #T-984. Shot consistency verified.',
      },
      {
        id: 'ev-7',
        timestamp: '2026-05-25T11:00:00Z',
        status: 'Quality Check',
        description: 'Batch passed visual and structural inspection (CMM Report #CMM-88).',
      },
      {
        id: 'ev-8',
        timestamp: '2026-05-27T09:30:00Z',
        status: 'Ready to Ship',
        description: 'Palletized (Pallet IDs: P1-P4), shrink-wrapped, and staged at Loading Bay 4 for pickup.',
      }
    ]
  },
  {
    id: 'ORD-5511B',
    partName: 'High-Temp Silicone Gasket',
    quantity: 10000,
    currentStatus: 'Delivered',
    estimatedDelivery: '2026-05-26',
    timeline: [
      {
        id: 'ev-9',
        timestamp: '2026-05-21T07:45:00Z',
        status: 'In Production',
        description: 'Extrusion line #2 and post-cure baking completed.',
      },
      {
        id: 'ev-10',
        timestamp: '2026-05-22T13:20:00Z',
        status: 'Quality Check',
        description: 'Durometer testing (Shore A 70) and flash inspection passed.',
      },
      {
        id: 'ev-11',
        timestamp: '2026-05-24T10:15:00Z',
        status: 'Ready to Ship',
        description: 'Boxed into standard shipping cartons and handed over to logistics partner (Waybill #WB-990).',
      },
      {
        id: 'ev-12',
        timestamp: '2026-05-26T15:45:00Z',
        status: 'Delivered',
        description: 'Received and signed for by customer receiving dock. Proof of delivery filed.',
      }
    ]
  }
];
