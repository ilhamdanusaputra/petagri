// ================================================
// Tender Service
// Description: Service layer for tender/bidding operations
// ================================================

import type {
	BidFilters,
	CreateBidForm,
	CreateTenderForm,
	SelectWinnerForm,
	Tender,
	TenderBid,
	TenderBidHistory,
	TenderBidWithDetails,
	TenderFilters,
	TenderStatistics,
	TenderWithDetails,
	UpdateBidForm,
	UpdateTenderForm,
} from "@/types/tender";
import { supabase } from "@/utils/supabase";

// ================================================
// Tender CRUD Operations
// ================================================

export async function createTender(data: CreateTenderForm): Promise<Tender> {
	const { data: tender, error } = await supabase
		.from("tenders")
		.insert({
			...data,
			status: "open",
		})
		.select()
		.single();

	if (error) throw error;
	return tender;
}

export async function getTenders(filters: TenderFilters = {}): Promise<TenderWithDetails[]> {
	let query = supabase
		.from("tenders")
		.select(
			`
      *,
      winner_mitra:mitra(*)
    `,
		)
		.order("created_at", { ascending: false });

	// Apply filters
	if (filters.status && filters.status.length > 0) {
		query = query.in("status", filters.status);
	}

	if (filters.consultation_visit_id) {
		query = query.eq("consultation_visit_id", filters.consultation_visit_id);
	}

	if (filters.min_quantity) {
		query = query.gte("quantity", filters.min_quantity);
	}

	if (filters.max_quantity) {
		query = query.lte("quantity", filters.max_quantity);
	}

	if (filters.min_price) {
		query = query.gte("estimated_price", filters.min_price);
	}

	if (filters.max_price) {
		query = query.lte("estimated_price", filters.max_price);
	}

	if (filters.search) {
		query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
	}

	const { data, error } = await query;

	if (error) throw error;
	return data || [];
}

export async function getTenderById(id: string): Promise<TenderWithDetails> {
	const { data, error } = await supabase
		.from("tenders")
		.select(
			`
      *,
      winner_mitra:mitra(*),
      bids:tender_bids(
        *,
        mitra:mitra(*)
      )
    `,
		)
		.eq("id", id)
		.single();

	if (error) throw error;

	// Calculate bid statistics
	const bids = data.bids || [];
	const bidPrices = bids.map((b: any) => b.bid_price);

	return {
		...data,
		bid_count: bids.length,
		lowest_bid: bidPrices.length > 0 ? Math.min(...bidPrices) : undefined,
		highest_bid: bidPrices.length > 0 ? Math.max(...bidPrices) : undefined,
	};
}

export async function updateTender(id: string, data: UpdateTenderForm): Promise<Tender> {
	const { data: tender, error } = await supabase
		.from("tenders")
		.update(data)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return tender;
}

export async function deleteTender(id: string): Promise<void> {
	const { error } = await supabase.from("tenders").delete().eq("id", id);

	if (error) throw error;
}

// ================================================
// Tender Status Management
// ================================================

export async function openTender(id: string): Promise<Tender> {
	const { data, error } = await supabase
		.from("tenders")
		.update({
			status: "open",
			open_date: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function closeTender(id: string): Promise<Tender> {
	const { data, error } = await supabase
		.from("tenders")
		.update({
			status: "closed",
			close_date: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function lockTender(id: string): Promise<Tender> {
	const { data, error } = await supabase
		.from("tenders")
		.update({
			status: "locked",
			locked_at: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function selectWinner(id: string, winnerData: SelectWinnerForm): Promise<Tender> {
	const { data, error } = await supabase
		.from("tenders")
		.update({
			status: "completed",
			winner_mitra_id: winnerData.winner_mitra_id,
			winning_bid_id: winnerData.winning_bid_id,
			winner_selected_at: new Date().toISOString(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;

	// Update the winning bid status
	await supabase
		.from("tender_bids")
		.update({ status: "accepted" })
		.eq("id", winnerData.winning_bid_id);

	// Update other bids to rejected
	await supabase
		.from("tender_bids")
		.update({ status: "rejected" })
		.eq("tender_id", id)
		.neq("id", winnerData.winning_bid_id)
		.eq("status", "submitted");

	return data;
}

// ================================================
// Bid CRUD Operations
// ================================================

export async function createBid(data: CreateBidForm): Promise<TenderBid> {
	// Ensure at least one of mitra_id or user_id is set for database constraint
	const bidData = {
		...data,
		mitra_id: data.mitra_id || null,
		user_id: data.user_id || null,
		status: "submitted",
		submitted_at: new Date().toISOString(),
	};

	const { data: bid, error } = await supabase.from("tender_bids").insert(bidData).select().single();

	if (error) throw error;
	return bid;
}

export async function getBids(filters: BidFilters = {}): Promise<TenderBidWithDetails[]> {
	let query = supabase
		.from("tender_bids")
		.select(
			`
      *,
      tender:tenders(*),
      mitra:mitra(*)
    `,
		)
		.order("submitted_at", { ascending: false });

	// Apply filters
	if (filters.tender_id) {
		query = query.eq("tender_id", filters.tender_id);
	}

	if (filters.mitra_id) {
		query = query.eq("mitra_id", filters.mitra_id);
	}

	if (filters.status && filters.status.length > 0) {
		query = query.in("status", filters.status);
	}

	if (filters.min_price) {
		query = query.gte("bid_price", filters.min_price);
	}

	if (filters.max_price) {
		query = query.lte("bid_price", filters.max_price);
	}

	const { data, error } = await query;

	if (error) throw error;
	return data || [];
}

export async function getBidById(id: string): Promise<TenderBidWithDetails> {
	const { data, error } = await supabase
		.from("tender_bids")
		.select(
			`
      *,
      tender:tenders(*),
      mitra:mitra(*),
      history:tender_bid_history(*)
    `,
		)
		.eq("id", id)
		.single();

	if (error) throw error;
	return data;
}

export async function updateBid(id: string, data: UpdateBidForm): Promise<TenderBid> {
	const { data: bid, error } = await supabase
		.from("tender_bids")
		.update(data)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return bid;
}

export async function withdrawBid(id: string): Promise<TenderBid> {
	const { data, error } = await supabase
		.from("tender_bids")
		.update({ status: "withdrawn" })
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return data;
}

/**
 * Accept a bid - updates bid status and marks tender as awarded
 * Automatically creates an order and delivery record
 */
export async function acceptBid(bidId: string): Promise<void> {
	// Get the bid details first with all necessary related data
	const { data: bid, error: bidError } = await supabase
		.from("tender_bids")
		.select("*, tender:tenders(*)")
		.eq("id", bidId)
		.single();

	if (bidError) throw bidError;
	if (!bid) throw new Error("Bid not found");

	// Update bid status to accepted
	const { error: updateBidError } = await supabase
		.from("tender_bids")
		.update({ status: "accepted" })
		.eq("id", bidId);

	if (updateBidError) throw updateBidError;

	// Update tender with winning bid information
	const { error: updateTenderError } = await supabase
		.from("tenders")
		.update({
			status: "completed",
			winning_bid_id: bidId,
			winner_mitra_id: bid.mitra_id,
			winner_selected_at: new Date().toISOString(),
		})
		.eq("id", bid.tender_id);

	if (updateTenderError) throw updateTenderError;

	// Reject all other bids for this tender
	const { error: rejectOthersError } = await supabase
		.from("tender_bids")
		.update({ status: "rejected" })
		.eq("tender_id", bid.tender_id)
		.neq("id", bidId)
		.eq("status", "submitted");

	if (rejectOthersError) throw rejectOthersError;

	// Create order for the accepted bid
	const orderNumber = `ORD-${Date.now()}-${bidId.substring(0, 8)}`;
	const { data: order, error: orderError } = await supabase
		.from("orders")
		.insert({
			mitra_id: bid.mitra_id,
			order_number: orderNumber,
			total_amount: bid.bid_price,
			status: "confirmed",
			items_count: 1,
			notes: `Order created from tender: ${bid.tender?.title || bid.tender_id}`,
			delivery_date: bid.tender?.close_date,
			created_by: bid.tender?.created_by,
		})
		.select()
		.single();

	if (orderError) {
		console.error("Error creating order:", orderError);
		throw orderError;
	}

	if (!order) {
		throw new Error("Failed to create order");
	}

	// Create delivery record linked to the farm via consultation_visit_id
	const deliveryNumber = `DEL-${Date.now()}-${order.id.substring(0, 8)}`;
	const scheduledDeliveryDate = new Date();
	scheduledDeliveryDate.setDate(scheduledDeliveryDate.getDate() + 3); // Schedule delivery 3 days from now

	const { error: deliveryError } = await supabase.from("deliveries").insert({
		order_id: order.id,
		tender_id: bid.tender_id,
		mitra_id: bid.mitra_id,
		consultation_visit_id: bid.tender?.consultation_visit_id,
		delivery_number: deliveryNumber,
		quantity: bid.quantity,
		unit: bid.unit,
		delivery_address: "Will be populated by trigger from consultation_visit",
		status: "pending",
		scheduled_delivery_date: scheduledDeliveryDate.toISOString(),
		delivery_notes: `Delivery for tender: ${bid.tender?.title || bid.tender_id}. Bid price: ${bid.bid_price}`,
		created_by: bid.tender?.created_by,
	});

	if (deliveryError) {
		console.error("Error creating delivery:", deliveryError);
		// Don't throw error here, order is already created
		// Just log for manual intervention if needed
		console.error("Delivery creation failed but order was created successfully:", order.id);
	} else {
		console.info(
			`Order ${orderNumber} and delivery ${deliveryNumber} created successfully for accepted bid ${bidId}`,
		);
	}
}

/**
 * Reject a bid - updates bid status to rejected
 */
export async function rejectBid(bidId: string): Promise<TenderBid> {
	const { data, error } = await supabase
		.from("tender_bids")
		.update({ status: "rejected" })
		.eq("id", bidId)
		.select()
		.single();

	if (error) throw error;
	return data;
}

export async function deleteBid(id: string): Promise<void> {
	const { error } = await supabase.from("tender_bids").delete().eq("id", id);

	if (error) throw error;
}

// ================================================
// Bid History Operations
// ================================================

export async function getBidHistory(bidId: string): Promise<TenderBidHistory[]> {
	const { data, error } = await supabase
		.from("tender_bid_history")
		.select(
			`
      *,
      mitra:mitra(*)
    `,
		)
		.eq("tender_bid_id", bidId)
		.order("changed_at", { ascending: false });

	if (error) throw error;
	return data || [];
}

// ================================================
// Statistics and Analytics
// ================================================

export async function getTenderStatistics(tenderId: string): Promise<TenderStatistics> {
	const tender = await getTenderById(tenderId);
	const bids = await getBids({ tender_id: tenderId, status: ["submitted"] });

	const bidPrices = bids.map((b) => b.bid_price);
	const uniqueMitra = new Set(bids.map((b) => b.mitra_id));

	return {
		tender_id: tender.id,
		tender_title: tender.title,
		bid_count: bids.length,
		lowest_bid: bidPrices.length > 0 ? Math.min(...bidPrices) : 0,
		highest_bid: bidPrices.length > 0 ? Math.max(...bidPrices) : 0,
		average_bid: bidPrices.length > 0 ? bidPrices.reduce((a, b) => a + b, 0) / bidPrices.length : 0,
		participating_mitra: uniqueMitra.size,
		status: tender.status,
	};
}

// ================================================
// Helper Functions
// ================================================

export async function canMitraBid(tenderId: string, mitraId: string): Promise<boolean> {
	const tender = await getTenderById(tenderId);

	if (tender.status !== "open") {
		return false;
	}

	if (tender.close_date && new Date(tender.close_date) < new Date()) {
		return false;
	}

	return true;
}

export async function getMitraBidsForTender(
	tenderId: string,
	mitraId: string,
): Promise<TenderBid[]> {
	const { data, error } = await supabase
		.from("tender_bids")
		.select("*")
		.eq("tender_id", tenderId)
		.eq("mitra_id", mitraId)
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data || [];
}
