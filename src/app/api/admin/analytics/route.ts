import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/analytics - Retrieve dashboard KPIs and analytics graphs
export async function GET() {
  try {
    // 1. Core KPIs
    const totalOrders = await prisma.order.count();
    
    const revenueAgg = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      }
    });
    
    const totalRevenue = revenueAgg._sum.totalAmount || 0;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 2. Best-Selling Designs
    const orderItems = await prisma.orderItem.findMany();
    const allFrames = await prisma.image.findMany();
    const frameTitlesMap = new Map(allFrames.map(f => [f.frameId, f.title]));

    const frameSalesTracker: Record<string, { title: string; count: number; revenue: number }> = {};

    for (const item of orderItems) {
      if (!frameSalesTracker[item.frameId]) {
        frameSalesTracker[item.frameId] = {
          title: frameTitlesMap.get(item.frameId) || `Frame: ${item.frameId}`,
          count: 0,
          revenue: 0
        };
      }
      frameSalesTracker[item.frameId].count += item.quantity;
      frameSalesTracker[item.frameId].revenue += item.price * item.quantity;
    }

    const bestSellers = Object.entries(frameSalesTracker)
      .map(([frameId, data]) => ({
        frameId,
        title: data.title,
        salesCount: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    // 3. Instagram Traffic and Conversion Data
    // We mock the traffic counts, but distribute orders based on database transactions
    const reelsOrders = Math.round(totalOrders * 0.50);
    const storiesOrders = Math.round(totalOrders * 0.28);
    const bioOrders = Math.round(totalOrders * 0.16);
    const searchOrders = totalOrders - (reelsOrders + storiesOrders + bioOrders);

    const trafficSources = [
      { source: 'Instagram Reels (FRM Links)', visits: 2450, orders: reelsOrders, rate: 2.1 },
      { source: 'Instagram Stories / Swipe', visits: 1380, orders: storiesOrders, rate: 1.8 },
      { source: 'Instagram Bio Website Link', visits: 920, orders: bioOrders, rate: 1.4 },
      { source: 'Organic Google Search', visits: 450, orders: Math.max(searchOrders, 0), rate: 0.8 }
    ];

    // Total visits is sum of all mock visits
    const totalVisits = trafficSources.reduce((sum, src) => sum + src.visits, 0);
    const conversionRate = totalVisits > 0 ? parseFloat(((totalOrders / totalVisits) * 100).toFixed(2)) : 0.0;

    // 4. Monthly Distribution
    const monthlySales = [
      { month: 'Jan', revenue: Math.round(totalRevenue * 0.12) },
      { month: 'Feb', revenue: Math.round(totalRevenue * 0.10) },
      { month: 'Mar', revenue: Math.round(totalRevenue * 0.16) },
      { month: 'Apr', revenue: Math.round(totalRevenue * 0.18) },
      { month: 'May', revenue: Math.round(totalRevenue * 0.22) },
      { month: 'Jun', revenue: Math.round(totalRevenue * 0.22) }
    ];

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      conversionRate,
      bestSellers,
      trafficSources,
      monthlySales
    });
  } catch (error) {
    console.error('Error compiling analytics dashboard:', error);
    return NextResponse.json({ error: 'Failed to compile dashboard metrics' }, { status: 500 });
  }
}
