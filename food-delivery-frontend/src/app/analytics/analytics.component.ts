import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil, startWith, forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';

// ─── INTERFACES ───────────────────────────────────────────────────────────────

export interface SalesDataPoint    { day: string; food: number; beverages: number; }
export interface ActivityDataPoint { day: string; customers: number; }
export interface TopItem           { name: string; orders: number; revenue: number; emoji: string; }

export interface RecentOrder {
  id: string;
  customerName: string;
  initials: string;
  items: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Processing';
  time: string;
  avatarColor: string;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {

  private destroy$      = new Subject<void>();
  private POLL_INTERVAL = 30000;

  // ── Auth ───────────────────────────────────────────────────────────────────
  user: any               = {};
  restaurantId: number | null = null;

  // ── UI State ───────────────────────────────────────────────────────────────
  isLoading    = true;
  isRefreshing = false;
  isLive       = true;
  lastUpdated  = new Date();
  errorMessage = '';

  // ── Date Range ─────────────────────────────────────────────────────────────
  selectedRange    = 'today';
  customFrom       = '';
  customTo         = '';
  showCustomPicker = false;

  dateRanges = [
    { value: 'today',  label: 'Today'      },
    { value: 'week',   label: 'This Week'  },
    { value: 'month',  label: 'This Month' },
    { value: 'custom', label: 'Custom'     }
  ];

  // ── Computed Stats ─────────────────────────────────────────────────────────
  stats = {
    ordersToday:     0,
    totalCustomers:  0,
    totalRevenue:    0,
    completedOrders: 0,
    ordersTrend:     0,
    customersTrend:  0,
    revenueTrend:    0,
    completedTrend:  0
  };

  // ── Chart Data ─────────────────────────────────────────────────────────────
  salesData:    SalesDataPoint[]    = [];
  activityData: ActivityDataPoint[] = [];
  topItems:     TopItem[]           = [];
  recentOrders: RecentOrder[]       = [];

  // ── Chart Scales ───────────────────────────────────────────────────────────
  salesMax    = 100;
  activityMax = 10;
  activityMin = 0;

  // ── Donut ──────────────────────────────────────────────────────────────────
  donutStats: {
    label: string; value: number | string;
    prefix?: string; circumference: number; offset: number;
  }[] = [];

  readonly DONUT_R = 42;
  readonly DONUT_C = 2 * Math.PI * 42;

  // ── Order Filter ───────────────────────────────────────────────────────────
  activeOrderFilter = 'all';
  orderFilters      = ['all', 'Completed', 'Pending', 'Cancelled', 'Processing'];

  // ── Raw cache for re-filter without re-fetch ───────────────────────────────
  private allRawOrders: any[] = [];

  private avatarColors = [
    '#e67e22','#8e44ad','#16a085','#c0392b',
    '#2980b9','#27ae60','#d35400','#2c3e50'
  ];

  constructor(
    private router:      Router,
    private ngZone:      NgZone,
    private authService: AuthService,
    private httpService: HttpService
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const p  = JSON.parse(raw);
          this.user = p?.data?.user || p?.user || p || {};
        }
      } catch { this.user = {}; }
    }

    this.restaurantId =
      this.user?.restaurantId   ||
      this.user?.restaurant?.id ||
      null;

    if (!this.restaurantId && this.user?.id) {
      this.httpService.getMyRestaurant(this.user.id)
        .pipe(catchError(() => of(null)), takeUntil(this.destroy$))
        .subscribe((r: any) => {
          const data         = r?.data || r;
          this.restaurantId = data?.id || data?.restaurantId || null;
          console.log("✅ restaurantId resolved:", this.restaurantId, "raw:", JSON.stringify(data));
          this.startPolling();
        });
    } else {
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Polling ────────────────────────────────────────────────────────────────
  private startPolling() {
    interval(this.POLL_INTERVAL)
      .pipe(startWith(0), takeUntil(this.destroy$))
      .subscribe(() => this.loadAll());
  }

  // ── Load All Real Data ─────────────────────────────────────────────────────
  private loadAll() {
    if (!this.restaurantId) {
      this.errorMessage = 'Restaurant not found for your account.';
      this.isLoading    = false;
      this.isRefreshing = false;
      return;
    }

    forkJoin({
      orders: this.httpService
        .getRestaurantOrdersByRestaurantId(this.restaurantId)
        .pipe(catchError(() => of([]))),
      menu: this.httpService
        .getMenuByRestaurant(this.restaurantId)
        .pipe(catchError(() => of([])))
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ orders, menu }) => {
        this.ngZone.run(() => {
          const rawOrders: any[] = this.unwrapList(orders);
          const rawMenu:   any[] = this.unwrapList(menu);
          this.allRawOrders      = rawOrders;

          const filtered = this.filterByRange(rawOrders);

          this.computeStats(filtered);
          this.computeSalesChart(filtered);
          this.computeActivityChart(filtered);
          this.computeTopItems(filtered, rawMenu);
          this.buildRecentOrders(filtered);
          this.buildDonutStats();

          this.lastUpdated  = new Date();
          this.isLoading    = false;
          this.isRefreshing = false;
          this.errorMessage = '';
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.errorMessage = 'Failed to load analytics. Retrying in 30s.';
          this.isLoading    = false;
          this.isRefreshing = false;
        });
      }
    });
  }

  // ── Unwrap Backend Response ────────────────────────────────────────────────
  private unwrapList(res: any): any[] {
    if (Array.isArray(res))           return res;
    if (Array.isArray(res?.data))     return res.data;
    if (Array.isArray(res?.content))  return res.content; // Spring Page<T>
    if (Array.isArray(res?.orders))   return res.orders;
    if (Array.isArray(res?.items))    return res.items;
    return [];
  }

  // ── Date Range Filter ──────────────────────────────────────────────────────
  private filterByRange(orders: any[]): any[] {
    const now     = new Date();
    const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    return orders.filter(o => {
      const raw = o.createdAt || o.orderDate || o.date || o.placedAt;
      if (!raw) return true;
      const d = new Date(raw);

      if (this.selectedRange === 'today') {
        return d >= startOf(now);
      }
      if (this.selectedRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 6);
        return d >= startOf(weekAgo);
      }
      if (this.selectedRange === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (this.selectedRange === 'custom' && this.customFrom && this.customTo) {
        const from = new Date(this.customFrom);
        const to   = new Date(this.customTo);
        to.setHours(23, 59, 59);
        return d >= from && d <= to;
      }
      return true;
    });
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  private computeStats(orders: any[]) {
    const now      = new Date();
    const todayStr = now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toDateString();

    const todayOrders     = orders.filter(o => {
      const raw = o.createdAt || o.orderDate || o.date;
      return raw && new Date(raw).toDateString() === todayStr;
    });
    const yesterdayOrders = this.allRawOrders.filter(o => {
      const raw = o.createdAt || o.orderDate || o.date;
      return raw && new Date(raw).toDateString() === yStr;
    });

    const totalRevenue    = orders.reduce((s, o) => s + (o.totalAmount || o.totalPrice || o.amount || 0), 0);
    const yRevenue        = yesterdayOrders.reduce((s, o) => s + (o.totalAmount || o.totalPrice || o.amount || 0), 0);
    const completedOrders = orders.filter(o => this.normaliseStatus(o) === 'Completed').length;
    const yCompleted      = yesterdayOrders.filter(o => this.normaliseStatus(o) === 'Completed').length;

    const custSet  = new Set(orders.map(o => o.customerId || o.customer?.id || o.userId || o.user?.id).filter(Boolean));
    const yCustSet = new Set(yesterdayOrders.map(o => o.customerId || o.customer?.id || o.userId || o.user?.id).filter(Boolean));

    const trend = (curr: number, prev: number) =>
      prev === 0 ? 0 : +((( curr - prev) / prev) * 100).toFixed(1);

    this.stats = {
      ordersToday:     todayOrders.length,
      totalCustomers:  custSet.size,
      totalRevenue:    Math.round(totalRevenue),
      completedOrders,
      ordersTrend:     trend(todayOrders.length, yesterdayOrders.length),
      customersTrend:  trend(custSet.size, yCustSet.size),
      revenueTrend:    trend(totalRevenue, yRevenue),
      completedTrend:  trend(completedOrders, yCompleted)
    };
  }

  // ── Sales Chart ────────────────────────────────────────────────────────────
  private computeSalesChart(orders: any[]) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const map  = new Map<string, { food: number; beverages: number }>();
    days.forEach(d => map.set(d, { food: 0, beverages: 0 }));

    const bevKeywords = ['drink','juice','coke','lassi','water','tea','coffee','soda','shake','lemonade','smoothie'];

    orders.forEach(order => {
      const raw = order.createdAt || order.orderDate || order.date;
      if (!raw) return;
      const di  = new Date(raw).getDay();
      const day = days[di === 0 ? 6 : di - 1];
      const slot = map.get(day)!;
      const amt  = order.totalAmount || order.totalPrice || order.amount || 0;

      const isBev = (order.items || order.orderItems || []).some((i: any) => {
        const name = (i.name || i.itemName || i.menuItemName || '').toLowerCase();
        return bevKeywords.some(k => name.includes(k));
      });

      if (isBev) slot.beverages += amt;
      else        slot.food      += amt;
    });

    this.salesData = days.map(d => ({ day: d, ...map.get(d)! }));
    this.salesMax  = Math.max(...this.salesData.map(d => Math.max(d.food, d.beverages)), 100) * 1.2;
  }

  // ── Activity Chart ─────────────────────────────────────────────────────────
  private computeActivityChart(orders: any[]) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const map  = new Map<string, Set<any>>();
    days.forEach(d => map.set(d, new Set()));

    orders.forEach(order => {
      const raw = order.createdAt || order.orderDate || order.date;
      if (!raw) return;
      const di  = new Date(raw).getDay();
      const day = days[di === 0 ? 6 : di - 1];
      const cid = order.customerId || order.customer?.id || order.userId || order.user?.id || Math.random();
      map.get(day)!.add(cid);
    });

    this.activityData = days.map(d => ({ day: d, customers: map.get(d)!.size }));
    const vals        = this.activityData.map(d => d.customers);
    this.activityMax  = Math.max(...vals, 1) * 1.15;
    this.activityMin  = Math.min(...vals, 0);
  }

  // ── Top Items ──────────────────────────────────────────────────────────────
  private computeTopItems(orders: any[], menu: any[]) {
    const countMap = new Map<string, { count: number; revenue: number }>();

    orders.forEach(order => {
      const items = order.items || order.orderItems || [];
      items.forEach((item: any) => {
        const name    = item.name || item.itemName || item.menuItemName || 'Unknown Item';
        const price   = item.price || item.totalPrice || item.itemPrice || 0;
        const qty     = item.quantity || 1;
        const revenue = price * qty;
        const prev    = countMap.get(name) || { count: 0, revenue: 0 };
        countMap.set(name, { count: prev.count + qty, revenue: prev.revenue + revenue });
      });
    });

    const emojiMap: Record<string, string> = {
      pizza:'🍕', burger:'🍔', pasta:'🍝', salad:'🥗', rice:'🍚',
      chicken:'🍗', biryani:'🍛', noodle:'🍜', soup:'🥣', bread:'🥖',
      sandwich:'🥪', taco:'🌮', wrap:'🌯', sushi:'🍱', cake:'🎂',
      ice:'🍦', juice:'🧃', coffee:'☕', tea:'🍵', lassi:'🥭', paneer:'🧀'
    };

    const getEmoji = (name: string) => {
      const lower = name.toLowerCase();
      for (const [k, e] of Object.entries(emojiMap)) {
        if (lower.includes(k)) return e;
      }
      return '🍽️';
    };

    this.topItems = Array.from(countMap.entries())
      .map(([name, { count, revenue }]) => ({
        name, orders: count, revenue: Math.round(revenue), emoji: getEmoji(name)
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Fallback: show menu with 0 if no order-item data
    if (this.topItems.length === 0 && menu.length > 0) {
      this.topItems = menu.slice(0, 5).map((m: any) => ({
        name:    m.name || m.itemName || 'Menu Item',
        orders:  0,
        revenue: 0,
        emoji:   getEmoji(m.name || '')
      }));
    }
  }

  // ── Recent Orders ──────────────────────────────────────────────────────────
  private buildRecentOrders(orders: any[]) {
    const sorted = [...orders].sort((a, b) => {
      const da = new Date(a.createdAt || a.orderDate || 0).getTime();
      const db = new Date(b.createdAt || b.orderDate || 0).getTime();
      return db - da;
    });

    this.recentOrders = sorted.slice(0, 10).map((o, idx) => {
      const custName  = o.customerName || o.customer?.name || o.user?.name || o.userName || 'Customer';
      const initials  = custName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
      const itemList  = (o.items || o.orderItems || [])
        .map((i: any) => i.name || i.itemName || i.menuItemName || '')
        .filter(Boolean).join(', ') || 'Order items';
      const raw  = o.createdAt || o.orderDate || o.date;
      const time = raw ? this.timeAgo(new Date(raw)) : 'Recently';

      return {
        id:           '#' + (o.id || o.orderId || (1000 + idx)),
        customerName: custName,
        initials,
        items:        itemList.length > 40 ? itemList.slice(0, 37) + '…' : itemList,
        amount:       o.totalAmount || o.totalPrice || o.amount || 0,
        status:       this.normaliseStatus(o),
        time,
        avatarColor:  this.avatarColors[idx % this.avatarColors.length]
      };
    });
  }

  // ── Donut Stats ────────────────────────────────────────────────────────────
  private buildDonutStats() {
    const makeOffset = (val: number, max: number) =>
      this.DONUT_C * (1 - Math.min(val / (max || 1), 1));

    this.donutStats = [
      { label: 'ORDERS TODAY',  value: this.stats.ordersToday,
        circumference: this.DONUT_C, offset: makeOffset(this.stats.ordersToday, 500) },
      { label: 'CUSTOMERS',     value: this.stats.totalCustomers,
        circumference: this.DONUT_C, offset: makeOffset(this.stats.totalCustomers, 3000) },
      { label: 'TOTAL REVENUE', value: this.stats.totalRevenue, prefix: '₹',
        circumference: this.DONUT_C, offset: makeOffset(this.stats.totalRevenue, 50000) },
      { label: 'COMPLETED',     value: this.stats.completedOrders,
        circumference: this.DONUT_C, offset: makeOffset(this.stats.completedOrders, 500) }
    ];
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private normaliseStatus(o: any): 'Completed' | 'Pending' | 'Cancelled' | 'Processing' {
    const s = (o.status || o.orderStatus || '').toLowerCase();
    if (s.includes('deliver') || s.includes('complet')) return 'Completed';
    if (s.includes('cancel'))                           return 'Cancelled';
    if (s.includes('pending') || s.includes('placed'))  return 'Pending';
    return 'Processing';
  }

  private timeAgo(date: Date): string {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 60)    return `${secs}s ago`;
    if (secs < 3600)  return `${Math.floor(secs / 60)} min ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  }

  // ── Chart Helpers ──────────────────────────────────────────────────────────
  getBarHeight(value: number): number {
    return this.salesMax ? Math.round((value / this.salesMax) * 100) : 0;
  }

  getActivityPath(): string {
    if (!this.activityData.length) return '';
    const w = 460, h = 160;
    const range = (this.activityMax - this.activityMin) || 1;
    const pts   = this.activityData.map((d, i) => ({
      x: (i / (this.activityData.length - 1)) * w,
      y: h - ((d.customers - this.activityMin) / range) * h
    }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cpx = (pts[i-1].x + pts[i].x) / 2;
      path += ` C ${cpx} ${pts[i-1].y} ${cpx} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
    return path;
  }

  getAreaPath(): string {
    const line = this.getActivityPath();
    return line ? `${line} L 460 160 L 0 160 Z` : '';
  }

  getActivityDots(): { x: number; y: number; val: number }[] {
    if (!this.activityData.length) return [];
    const w = 460, h = 160;
    const range = (this.activityMax - this.activityMin) || 1;
    return this.activityData.map((d, i) => ({
      x:   (i / (this.activityData.length - 1)) * w,
      y:   h - ((d.customers - this.activityMin) / range) * h,
      val: d.customers
    }));
  }

  getTopItemWidth(orders: number): number {
    const max = Math.max(...this.topItems.map(t => t.orders), 1);
    return Math.round((orders / max) * 100);
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  get filteredOrders(): RecentOrder[] {
    if (this.activeOrderFilter === 'all') return this.recentOrders;
    return this.recentOrders.filter(o => o.status === this.activeOrderFilter);
  }

  onRangeChange() {
    this.showCustomPicker = this.selectedRange === 'custom';
    if (this.selectedRange !== 'custom') this.refresh();
  }

  applyCustomRange() {
    if (!this.customFrom || !this.customTo) return;
    this.showCustomPicker = false;
    this.refresh();
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  refresh() {
    this.isRefreshing = true;
    this.loadAll();
  }

  getStatusClass(s: string): string {
    if (s === 'Completed')  return 'badge--completed';
    if (s === 'Pending')    return 'badge--pending';
    if (s === 'Cancelled')  return 'badge--cancelled';
    return 'badge--processing';
  }

  getTrendClass(trend: number): string {
    return trend >= 0 ? 'trend--up' : 'trend--down';
  }

  formatValue(v: number | string, prefix = ''): string {
    if (typeof v === 'string') return v;
    if (v >= 1000) return prefix + (v / 1000).toFixed(1) + 'k';
    return prefix + v.toString();
  }

  goBack() { this.router.navigate(['/orders']); }
}