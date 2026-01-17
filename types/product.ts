// ================================================
// Product Types and Interfaces
// Description: TypeScript definitions for product management
// ================================================

export interface Product {
	id: string;
	name: string;
	slug: string;
	description?: string;
	short_description?: string;

	// Classification
	sku: string;
	category_id?: string;
	category?: ProductCategory;
	tags: string[];

	// Pricing
	price: number;
	sale_price?: number;
	cost_price?: number;
	currency: string;
	price_history?: PriceHistory[];

	// Inventory
	stock_quantity: number;
	track_inventory: boolean;
	allow_backorders: boolean;
	low_stock_threshold: number;
	inventory_transactions?: InventoryTransaction[];

	// Physical attributes
	weight?: number;
	dimensions?: ProductDimensions;

	// Media
	images: ProductImage[];
	featured_image?: string;

	// Status
	status: "draft" | "published" | "archived";
	visibility: "public" | "private" | "hidden";
	featured: boolean;

	// SEO
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;

	// Timestamps
	created_at: string;
	updated_at: string;
	created_by?: string;
	updated_by?: string;
}

export interface ProductCategory {
	id: string;
	name: string;
	slug: string;
	description?: string;
	image_url?: string;
	parent_id?: string;
	parent?: ProductCategory;
	children?: ProductCategory[];
	path: string;
	level: number;
	sort_order: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface ProductImage {
	id: string;
	product_id: string;
	image_url: string;
	alt_text?: string;
	sort_order: number;
	is_featured: boolean;
}

export interface ProductDimensions {
	length?: number;
	width?: number;
	height?: number;
	unit: "cm" | "inch";
}

export interface PriceHistory {
	id: string;
	product_id: string;
	price: number;
	sale_price?: number;
	effective_from: string;
	effective_to?: string;
	reason?: string;
	created_at: string;
	created_by?: string;
}

export interface InventoryTransaction {
	id: string;
	product_id: string;
	transaction_type:
		| "stock_in"
		| "stock_out"
		| "adjustment"
		| "transfer"
		| "return"
		| "waste"
		| "sold";
	reference_type?: "purchase" | "sale" | "adjustment" | "transfer" | "return" | "waste" | "manual";
	reference_id?: string;
	quantity_before: number;
	quantity_change: number;
	quantity_after: number;
	unit_cost?: number;
	total_cost?: number;
	warehouse_location?: string;
	storage_location?: string;
	reason?: string;
	notes?: string;
	batch_number?: string;
	expiry_date?: string;
	created_at: string;
	created_by?: string;
}

export interface InventoryAlert {
	id: string;
	product_id: string;
	alert_type: "low_stock" | "out_of_stock" | "overstock" | "expiring" | "expired";
	threshold_value?: number;
	current_value?: number;
	status: "active" | "acknowledged" | "resolved";
	priority: "low" | "medium" | "high" | "critical";
	message?: string;
	action_required?: string;
	notification_sent: boolean;
	notification_sent_at?: string;
	acknowledged_at?: string;
	acknowledged_by?: string;
	resolved_at?: string;
	resolved_by?: string;
	created_at: string;
	updated_at: string;
}

export interface StoreSettings {
	id: string;

	// Store basic info
	store_name: string;
	store_description?: string;
	store_logo_url?: string;
	store_banner_url?: string;

	// Contact information
	email?: string;
	phone?: string;
	address?: string;
	website_url?: string;

	// Business information
	business_registration_number?: string;
	tax_id?: string;
	business_type?: string;

	// Store configuration
	currency_code: string;
	timezone: string;
	language_code: string;

	// Operating hours
	operating_hours?: OperatingHours;

	// Payment settings
	payment_methods?: PaymentMethod[];
	payment_terms?: string;

	// Shipping settings
	shipping_zones?: ShippingZone[];
	free_shipping_threshold: number;

	// SEO settings
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;

	// Social media
	social_media_links?: SocialMediaLinks;

	// Policies
	return_policy?: string;
	privacy_policy?: string;
	terms_of_service?: string;

	// Notifications
	email_notifications?: NotificationSettings;
	sms_notifications?: NotificationSettings;

	// Analytics
	google_analytics_id?: string;
	facebook_pixel_id?: string;

	// Status
	status: "active" | "inactive" | "maintenance";
	is_public: boolean;

	// Timestamps
	created_at: string;
	updated_at: string;
	created_by?: string;
	updated_by?: string;
}

export interface OperatingHours {
	monday: DaySchedule;
	tuesday: DaySchedule;
	wednesday: DaySchedule;
	thursday: DaySchedule;
	friday: DaySchedule;
	saturday: DaySchedule;
	sunday: DaySchedule;
}

export interface DaySchedule {
	open: string;
	close: string;
	closed: boolean;
}

export interface PaymentMethod {
	id: string;
	name: string;
	type: "bank_transfer" | "credit_card" | "e_wallet" | "cod" | "other";
	enabled: boolean;
	configuration: Record<string, any>;
}

export interface ShippingZone {
	id: string;
	name: string;
	regions: string[];
	rates: ShippingRate[];
}

export interface ShippingRate {
	name: string;
	price: number;
	estimated_days: string;
}

export interface SocialMediaLinks {
	facebook?: string;
	instagram?: string;
	twitter?: string;
	youtube?: string;
	linkedin?: string;
	tiktok?: string;
}

export interface NotificationSettings {
	order_placed: boolean;
	order_paid: boolean;
	order_shipped: boolean;
	order_delivered: boolean;
	order_cancelled: boolean;
	low_stock: boolean;
	new_review: boolean;
}

// Form types
export interface ProductFormData {
	name: string;
	description?: string;
	short_description?: string;
	sku: string;
	category_id?: string;
	tags: string[];
	price: string;
	sale_price?: string;
	cost_price?: string;
	stock_quantity: string;
	track_inventory: boolean;
	allow_backorders: boolean;
	low_stock_threshold: string;
	weight?: string;
	dimensions?: {
		length?: string;
		width?: string;
		height?: string;
		unit: "cm" | "inch";
	};
	status: "draft" | "published" | "archived";
	visibility: "public" | "private" | "hidden";
	featured: boolean;
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;
}

export interface CategoryFormData {
	name: string;
	description?: string;
	parent_id?: string;
	sort_order: string;
	is_active: boolean;
}

export interface StoreSettingsFormData {
	store_name: string;
	store_description?: string;
	email?: string;
	phone?: string;
	address?: string;
	website_url?: string;
	business_registration_number?: string;
	tax_id?: string;
	business_type?: string;
	currency_code: string;
	timezone: string;
	language_code: string;
	operating_hours?: OperatingHours;
	payment_terms?: string;
	free_shipping_threshold: string;
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string;
	social_media_links?: SocialMediaLinks;
	return_policy?: string;
	privacy_policy?: string;
	terms_of_service?: string;
	google_analytics_id?: string;
	facebook_pixel_id?: string;
	status: "active" | "inactive" | "maintenance";
	is_public: boolean;
}

// API Response types
export interface ProductsResponse {
	data: Product[];
	pagination: {
		page: number;
		per_page: number;
		total: number;
		total_pages: number;
	};
}

export interface CategoriesResponse {
	data: ProductCategory[];
	pagination?: {
		page: number;
		per_page: number;
		total: number;
		total_pages: number;
	};
}

// Filter and search types
export interface ProductFilters {
	search?: string;
	category_id?: string;
	status?: string[];
	visibility?: string[];
	featured?: boolean;
	price_min?: number;
	price_max?: number;
	stock_status?: "in_stock" | "low_stock" | "out_of_stock";
	sort_by?: "name" | "price" | "created_at" | "stock_quantity";
	sort_direction?: "asc" | "desc";
	page?: number;
	per_page?: number;
}

export interface StockMovement {
	id: string;
	product_id: string;
	product_name: string;
	sku: string;
	transaction_type: string;
	reference_type?: string;
	quantity_before: number;
	quantity_change: number;
	quantity_after: number;
	unit_cost?: number;
	total_cost?: number;
	warehouse_location?: string;
	storage_location?: string;
	reason?: string;
	batch_number?: string;
	expiry_date?: string;
	created_at: string;
	created_by?: string;
}

export interface CurrentStock {
	product_id: string;
	product_name: string;
	sku: string;
	stock_quantity: number;
	low_stock_threshold: number;
	track_inventory: boolean;
	stock_status: "out_of_stock" | "low_stock" | "overstock" | "normal";
	total_stock_in: number;
	total_stock_out: number;
	transaction_count: number;
	last_transaction_date?: string;
}

export interface ProductAnalytics {
	product_id: string;
	product_name: string;
	total_views: number;
	total_sales: number;
	revenue: number;
	profit: number;
	profit_margin: number;
	conversion_rate: number;
	avg_rating: number;
	review_count: number;
	return_rate: number;
	period_start: string;
	period_end: string;
}
