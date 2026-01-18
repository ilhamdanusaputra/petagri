// ================================================
// Service: Performance
// Description: Service for fetching mitra performance data from Supabase
// ================================================

import { PerformanceMetrics, PerformancePeriod, TopMitraPerformance } from "@/types/performance";
import { supabase } from "@/utils/supabase";

export class PerformanceService {
	/**
	 * Get date range for performance period
	 */
	static getDateRange(period: "month" | "quarter" | "year"): PerformancePeriod {
		const now = new Date();
		const endDate = now.toISOString().split("T")[0];
		let startDate: string;

		switch (period) {
			case "month":
				const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
				startDate = monthStart.toISOString().split("T")[0];
				break;
			case "quarter":
				const quarter = Math.floor(now.getMonth() / 3);
				const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
				startDate = quarterStart.toISOString().split("T")[0];
				break;
			case "year":
				const yearStart = new Date(now.getFullYear(), 0, 1);
				startDate = yearStart.toISOString().split("T")[0];
				break;
		}

		return { period, start_date: startDate, end_date: endDate };
	}

	/**
	 * Get performance metrics for the specified period
	 */
	static async getPerformanceMetrics(
		period: "month" | "quarter" | "year",
	): Promise<PerformanceMetrics> {
		try {
			const dateRange = this.getDateRange(period);

			// Get current period metrics
			const [revenueResult, ordersResult, partnersResult, ratingsResult] = await Promise.all([
				// Total revenue
				supabase
					.from("orders")
					.select("total_amount")
					.gte("created_at", dateRange.start_date)
					.lte("created_at", dateRange.end_date)
					.eq("status", "delivered"),

				// Total orders
				supabase
					.from("orders")
					.select("id")
					.gte("created_at", dateRange.start_date)
					.lte("created_at", dateRange.end_date),

				// Active partners (partners with orders in period)
				supabase
					.from("orders")
					.select("mitra_id")
					.gte("created_at", dateRange.start_date)
					.lte("created_at", dateRange.end_date),

				// Average rating
				supabase
					.from("mitra_ratings")
					.select("rating")
					.gte("created_at", dateRange.start_date)
					.lte("created_at", dateRange.end_date),
			]);

			// Calculate current metrics
			const currentRevenue =
				revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
			const currentOrders = ordersResult.data?.length || 0;
			const uniquePartners = new Set(partnersResult.data?.map((order) => order.mitra_id)).size;
			const avgRating = ratingsResult.data?.length
				? ratingsResult.data.reduce((sum, rating) => sum + rating.rating, 0) /
					ratingsResult.data.length
				: 0;

			// Get previous period for growth calculation
			const prevEndDate = dateRange.start_date;
			let prevStartDate: string;

			switch (period) {
				case "month":
					const prevMonth = new Date(
						new Date(dateRange.start_date).setMonth(new Date(dateRange.start_date).getMonth() - 1),
					);
					prevStartDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1)
						.toISOString()
						.split("T")[0];
					break;
				case "quarter":
					const prevQuarter = new Date(
						new Date(dateRange.start_date).setMonth(new Date(dateRange.start_date).getMonth() - 3),
					);
					prevStartDate = prevQuarter.toISOString().split("T")[0];
					break;
				case "year":
					const prevYear = new Date(
						new Date(dateRange.start_date).setFullYear(
							new Date(dateRange.start_date).getFullYear() - 1,
						),
					);
					prevStartDate = prevYear.toISOString().split("T")[0];
					break;
			}

			// Get previous period data for growth calculation
			const [prevRevenueResult, prevOrdersResult, prevPartnersResult, prevRatingsResult] =
				await Promise.all([
					supabase
						.from("orders")
						.select("total_amount")
						.gte("created_at", prevStartDate)
						.lt("created_at", prevEndDate)
						.eq("status", "delivered"),

					supabase
						.from("orders")
						.select("id")
						.gte("created_at", prevStartDate)
						.lt("created_at", prevEndDate),

					supabase
						.from("orders")
						.select("mitra_id")
						.gte("created_at", prevStartDate)
						.lt("created_at", prevEndDate),

					supabase
						.from("mitra_ratings")
						.select("rating")
						.gte("created_at", prevStartDate)
						.lt("created_at", prevEndDate),
				]);

			// Calculate previous metrics
			const prevRevenue =
				prevRevenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
			const prevOrders = prevOrdersResult.data?.length || 0;
			const prevPartners = new Set(prevPartnersResult.data?.map((order) => order.mitra_id)).size;
			const prevAvgRating = prevRatingsResult.data?.length
				? prevRatingsResult.data.reduce((sum, rating) => sum + rating.rating, 0) /
					prevRatingsResult.data.length
				: 0;

			// Calculate growth percentages
			const revenueGrowth =
				prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
			const ordersGrowth = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : 0;
			const partnersGrowth =
				prevPartners > 0 ? ((uniquePartners - prevPartners) / prevPartners) * 100 : 0;
			const ratingGrowth =
				prevAvgRating > 0 ? ((avgRating - prevAvgRating) / prevAvgRating) * 100 : 0;

			return {
				total_revenue: currentRevenue,
				total_orders: currentOrders,
				active_partners: uniquePartners,
				average_rating: Number(avgRating.toFixed(1)),
				revenue_growth: Number(revenueGrowth.toFixed(1)),
				orders_growth: Number(ordersGrowth.toFixed(1)),
				partners_growth: Number(partnersGrowth.toFixed(1)),
				rating_growth: Number(ratingGrowth.toFixed(1)),
			};
		} catch (error) {
			console.error("Error fetching performance metrics:", error);
			throw error;
		}
	}

	/**
	 * Get top performing mitra partners
	 */
	static async getTopPerformingMitra(
		period: "month" | "quarter" | "year",
		limit: number = 10,
	): Promise<TopMitraPerformance[]> {
		try {
			const dateRange = this.getDateRange(period);

			// Get mitra performance data with SQL query
			const { data, error } = await supabase.rpc("get_top_mitra_performance", {
				start_date: dateRange.start_date,
				end_date: dateRange.end_date,
				limit_count: limit,
			});

			if (error) throw error;

			// If RPC doesn't exist, fall back to manual calculation
			if (!data) {
				return await this.getTopMitraFallback(dateRange, limit);
			}

			return data;
		} catch (error) {
			console.error("Error fetching top performing mitra:", error);
			// Fallback to manual calculation
			return await this.getTopMitraFallback(this.getDateRange(period), limit);
		}
	}

	/**
	 * Fallback method for getting top mitra when RPC is not available
	 */
	private static async getTopMitraFallback(
		dateRange: PerformancePeriod,
		limit: number,
	): Promise<TopMitraPerformance[]> {
		try {
			// Get orders with mitra info
			const { data: ordersData, error: ordersError } = await supabase
				.from("orders")
				.select(
					`
					total_amount,
					items_count,
					created_at,
					mitra_id,
					mitra:mitra_id (
						id,
						company_name,
						contact_person
					)
				`,
				)
				.gte("created_at", dateRange.start_date)
				.lte("created_at", dateRange.end_date)
				.eq("status", "delivered");

			if (ordersError) throw ordersError;

			// Get ratings data
			const { data: ratingsData } = await supabase
				.from("mitra_ratings")
				.select("mitra_id, rating")
				.gte("created_at", dateRange.start_date)
				.lte("created_at", dateRange.end_date);

			// Group and calculate performance
			const mitraPerformance: { [key: string]: TopMitraPerformance } = {};

			ordersData?.forEach((order) => {
				const mitraId = order.mitra_id;
				if (!mitraPerformance[mitraId]) {
					mitraPerformance[mitraId] = {
						id: mitraId,
						company_name: (order.mitra as any)?.company_name || "Unknown",
						contact_person: (order.mitra as any)?.contact_person || "",
						revenue: 0,
						orders: 0,
						growth: 0,
						rating: 0,
						last_order_date: order.created_at,
					};
				}

				mitraPerformance[mitraId].revenue += order.total_amount || 0;
				mitraPerformance[mitraId].orders += 1;

				if (order.created_at > mitraPerformance[mitraId].last_order_date!) {
					mitraPerformance[mitraId].last_order_date = order.created_at;
				}
			});

			// Add ratings
			ratingsData?.forEach((rating) => {
				if (mitraPerformance[rating.mitra_id]) {
					const currentRating = mitraPerformance[rating.mitra_id].rating;
					mitraPerformance[rating.mitra_id].rating =
						currentRating > 0 ? (currentRating + rating.rating) / 2 : rating.rating;
				}
			});

			// Convert to array and sort by revenue
			const topMitra = Object.values(mitraPerformance)
				.map((mitra) => ({
					...mitra,
					rating: Number(mitra.rating.toFixed(1)),
					growth: Math.random() * 30 - 5, // Placeholder growth calculation
				}))
				.sort((a, b) => b.revenue - a.revenue)
				.slice(0, limit);

			return topMitra;
		} catch (error) {
			console.error("Error in fallback mitra calculation:", error);
			return [];
		}
	}
}
