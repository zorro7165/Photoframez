'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Eye,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  bestSellers: Array<{
    frameId: string;
    title: string;
    salesCount: number;
    revenue: number;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    orders: number;
    rate: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
  }>;
}

interface OrderItem {
  id: string;
  frameId: string;
  selectedSize: string;
  selectedMaterial: string;
  selectedGlass: string;
  selectedBorder: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface FrameImage {
  id: string;
  frameId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string;
  createdAt: string;
}

interface NotificationLog {
  id: string;
  orderId: string;
  type: 'EMAIL' | 'WHATSAPP';
  recipient: string;
  status: string;
  content: string;
  createdAt: string;
}

type TabType = 'analytics' | 'orders' | 'inventory' | 'notifications';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [isLoading, setIsLoading] = useState(true);

  // Loaded DB data states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [frames, setFrames] = useState<FrameImage[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Search queries
  const [orderSearch, setOrderSearch] = useState('');
  const [frameSearch, setFrameSearch] = useState('');

  // Expandable notifications
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // New Frame form inputs state
  const [newFrameForm, setNewFrameForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'General',
    tags: ''
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Check auth session and fetch initial data
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/admin');
          return;
        }
        await refreshAllData();
      } catch (err) {
        console.error('Session validation error:', err);
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const refreshAllData = async () => {
    try {
      const [analyticsRes, ordersRes, framesRes, notificationsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/orders'),
        fetch('/api/frames'),
        fetch('/api/admin/notifications')
      ]);

      const analyticsData = await analyticsRes.json();
      const ordersData = await ordersRes.json();
      const framesData = await framesRes.json();
      const notificationsData = await notificationsRes.json();

      setAnalytics(analyticsData);
      setOrders(ordersData);
      setFrames(framesData);
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (res.ok) {
        // Refresh local data state
        setOrders(prevOrders =>
          prevOrders.map(o => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        refreshAllData(); // reload notifications outbox log
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleAddFrameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess(false);

    try {
      const res = await fetch('/api/frames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFrameForm)
      });

      if (res.ok) {
        setFormSuccess(true);
        setNewFrameForm({
          title: '',
          description: '',
          imageUrl: '',
          category: 'General',
          tags: ''
        });
        await refreshAllData();
        setTimeout(() => setFormSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to add frame:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    // We clear the cookie by overriding it or clearing locally. In Next.js api handler we can do logout,
    // or just clear the session cookie on client. We'll make a POST or let the client clear it.
    // For simplicity, a simple cookie clear and reload
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin');
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredFrames = frames.filter(
    (f) =>
      f.frameId.toLowerCase().includes(frameSearch.toLowerCase()) ||
      f.title.toLowerCase().includes(frameSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(frameSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
      
      {/* Header bar */}
      <header className="bg-neutral-950 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent font-outfit">
            RITWIKA&apos;S CUSTOM ADMIN
          </span>
          <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px] font-bold text-neutral-400">Dashboard</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={refreshAllData}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-red-900 text-neutral-300 hover:text-white text-xs font-bold px-3 py-2 rounded-lg transition"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-neutral-950/40 border-r border-neutral-800 p-6 space-y-2 flex-shrink-0">
          {[
            { id: 'analytics', name: 'Analytics View', icon: TrendingUp },
            { id: 'orders', name: 'Order Logs', icon: ShoppingBag, count: orders.length },
            { id: 'inventory', name: 'Frame Catalog', icon: ImageIcon, count: frames.length },
            { id: 'notifications', name: 'Outbox Alert Logs', icon: Mail, count: notifications.length }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold transition-all duration-150
                ${activeTab === item.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10'
                  : 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} />
                {item.name}
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black
                  ${activeTab === item.id ? 'bg-amber-800 text-white' : 'bg-neutral-800 text-neutral-300'}
                `}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Revenue card */}
                <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total Sales Revenue</span>
                    <h4 className="text-2xl font-black text-white">₹{analytics.totalRevenue.toLocaleString('en-IN')}</h4>
                  </div>
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                </div>

                {/* Orders count */}
                <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Total Orders Placed</span>
                    <h4 className="text-2xl font-black text-white">{analytics.totalOrders}</h4>
                  </div>
                  <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                {/* AOV card */}
                <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Average Order Value</span>
                    <h4 className="text-2xl font-black text-white">₹{analytics.averageOrderValue.toLocaleString('en-IN')}</h4>
                  </div>
                  <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                </div>

                {/* Conversion card */}
                <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Conversion Rate</span>
                    <h4 className="text-2xl font-black text-white">{analytics.conversionRate}%</h4>
                  </div>
                  <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                </div>
              </div>

              {/* Secondary lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Best Sellers */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400 mb-4">Top Customizer Prints</h3>
                  <div className="space-y-4">
                    {analytics.bestSellers.length === 0 ? (
                      <p className="text-xs text-neutral-500">No print sales recorded yet.</p>
                    ) : (
                      analytics.bestSellers.map((item, idx) => (
                        <div key={item.frameId} className="flex items-center justify-between text-xs border-b border-neutral-900 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-amber-500">#{idx + 1}</span>
                            <div>
                              <span className="font-bold block text-neutral-200">{item.title}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">Frame ID: {item.frameId}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold block text-neutral-350">{item.salesCount} custom frames</span>
                            <span className="text-[10px] text-amber-500">₹{item.revenue.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Traffic sources */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400 mb-4">Instagram & Search Traffic</h3>
                  <div className="space-y-4">
                    {analytics.trafficSources.map((src) => (
                      <div key={src.source} className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-neutral-300">
                          <span>{src.source}</span>
                          <span className="font-bold">{src.visits} visits ({src.orders} orders)</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 rounded-full"
                            style={{ width: `${(src.visits / 2450) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-lg font-bold font-outfit text-white">Order Tracking Registry</h2>
                {/* Search */}
                <div className="relative flex items-center w-full sm:w-64">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search name, phone, or ORD-..."
                    className="w-full pl-3 pr-9 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white font-semibold"
                  />
                  <Search size={14} className="absolute right-3.5 text-neutral-500" />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                  No orders matched the current query.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-xs space-y-4"
                    >
                      {/* Order top banner */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-900 pb-3 gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white font-mono">{order.orderNumber}</span>
                            <span className="text-[10px] text-neutral-500">
                              {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-400">{order.customerName} ({order.email})</span>
                        </div>

                        {/* Status controllers */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] text-neutral-500 uppercase font-bold">Total Paid</span>
                            <span className="text-sm font-black text-amber-500">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                          
                          {/* Dropdown status selector */}
                          <div className="relative">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="bg-neutral-900 text-xs font-semibold px-3 py-2 border border-neutral-800 rounded-lg focus:border-amber-500 outline-hidden text-neutral-200 cursor-pointer pr-8 appearance-none"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Printing">Printing</option>
                              <option value="Framing">Framing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Items details and address */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-400">
                        {/* Address */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Shipping Destination</span>
                          <p className="leading-relaxed text-neutral-300">
                            {order.address},<br />
                            {order.city}, {order.state} - {order.pincode}<br />
                            Phone: <strong className="text-white font-mono">{order.phone}</strong>
                          </p>
                        </div>

                        {/* Configured details */}
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Customized Items</span>
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-start gap-4 text-neutral-300">
                                <div>
                                  <span className="font-bold text-white block">Custom Frame ({item.frameId})</span>
                                  <span className="text-[10px] text-neutral-500">
                                    Qty: {item.quantity} | Size: {item.selectedSize} | Frame: {item.selectedMaterial.replace('-', ' ')}
                                  </span>
                                </div>
                                <span className="font-bold text-neutral-300">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVENTORY CATALOG */}
          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Add New Image Form (5 cols) */}
                <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-6 rounded-2xl shadow-xs space-y-6">
                  <div>
                    <h3 className="text-base font-bold font-outfit text-white flex items-center gap-2">
                      <Plus size={18} className="text-amber-500" />
                      Add New Design
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Upload canvas artwork. Frame ID will automatically generate sequentially.</p>
                  </div>

                  {formSuccess && (
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle size={16} />
                      Design uploaded and seeded successfully!
                    </div>
                  )}

                  <form onSubmit={handleAddFrameSubmit} className="space-y-4 text-xs text-neutral-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Artwork Title</label>
                      <input
                        required
                        type="text"
                        value={newFrameForm.title}
                        onChange={(e) => setNewFrameForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Sunset Silhouette"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">HD Image URL</label>
                      <input
                        required
                        type="url"
                        value={newFrameForm.imageUrl}
                        onChange={(e) => setNewFrameForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="Unsplash / Cloudinary image link"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Category</label>
                      <input
                        required
                        type="text"
                        value={newFrameForm.category}
                        onChange={(e) => setNewFrameForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g. Nature, Abstract"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Search Tags (Comma-separated)</label>
                      <input
                        type="text"
                        value={newFrameForm.tags}
                        onChange={(e) => setNewFrameForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="e.g. sunset, orange, nature"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Description</label>
                      <textarea
                        rows={3}
                        value={newFrameForm.description}
                        onChange={(e) => setNewFrameForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Write a marketing description detailing color tones and styles."
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-850 text-white font-bold rounded-lg shadow-md transition"
                    >
                      {formLoading ? 'Saving...' : 'Add Artwork'}
                    </button>
                  </form>
                </div>

                {/* Right: Existing Catalog list (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400">Current Catalog</h3>
                    
                    {/* Search */}
                    <div className="relative flex items-center w-full sm:w-64">
                      <input
                        type="text"
                        value={frameSearch}
                        onChange={(e) => setFrameSearch(e.target.value)}
                        placeholder="Search frame ID, title..."
                        className="w-full pl-3 pr-9 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white font-semibold"
                      />
                      <Search size={14} className="absolute right-3.5 text-neutral-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFrames.map((frame) => (
                      <div
                        key={frame.id}
                        className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex gap-3 text-xs"
                      >
                        {/* Thumbnail */}
                        <div className="h-16 w-16 bg-neutral-900 border border-neutral-800 overflow-hidden rounded-md flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={frame.imageUrl} alt={frame.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{frame.frameId}</span>
                          <h4 className="font-bold text-white line-clamp-1 mt-0.5">{frame.title}</h4>
                          <span className="text-[10px] text-neutral-500 block capitalize">{frame.category}</span>
                          <a
                            href={`/frame/${frame.frameId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-[10px] text-amber-500 font-bold hover:underline flex items-center gap-1.5"
                          >
                            View Live Customize Page
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATION OUTBOX LOGS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold font-outfit text-white">Outbound Communications</h2>
                <p className="text-xs text-neutral-500 mt-1">Audit trail of SMS (WhatsApp) and emails dispatched during order status updates.</p>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
                  No alerts recorded. Try placing an order or updating a status.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((log) => (
                    <div
                      key={log.id}
                      className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden text-xs"
                    >
                      {/* Log top bar header */}
                      <div
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        className="px-5 py-3.5 hover:bg-neutral-900 flex items-center justify-between gap-4 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-4">
                          {log.type === 'EMAIL' ? (
                            <div className="h-7 w-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                              <Mail size={14} />
                            </div>
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                              <MessageSquare size={14} />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-200">{log.recipient}</span>
                              <span className="text-[9px] text-neutral-500 font-mono">Order ID: {log.orderId.substring(0, 8)}...</span>
                            </div>
                            <span className="text-[10px] text-neutral-500">
                              {new Date(log.createdAt).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase
                            ${log.status === 'SENT' || log.status === 'SENT_MOCK' 
                              ? 'bg-emerald-950 text-emerald-400' 
                              : 'bg-red-950 text-red-400'
                            }
                          `}>
                            {log.status}
                          </span>
                          <Eye size={14} className="text-neutral-400" />
                        </div>
                      </div>

                      {/* Expandable Preview */}
                      {expandedLogId === log.id && (
                        <div className="px-5 py-4 bg-neutral-950 border-t border-neutral-900 text-neutral-400 leading-relaxed max-h-[300px] overflow-y-auto font-mono text-[10px]">
                          {log.type === 'EMAIL' ? (
                            <div className="bg-white text-black p-4 rounded-lg overflow-x-auto" dangerouslySetInnerHTML={{ __html: log.content }} />
                          ) : (
                            <pre className="whitespace-pre-wrap font-mono p-4 bg-neutral-900 border border-neutral-850 rounded-lg text-emerald-400">
                              {log.content}
                            </pre>
                          )}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
