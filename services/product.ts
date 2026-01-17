// ================================================
// Product Service
// Description: Service layer for product management operations
// ================================================

import {
	CategoriesResponse,
	CategoryFormData,
	CurrentStock,
	InventoryAlert,
	InventoryTransaction,
	Product,
	ProductAnalytics,
	ProductCategory,
	ProductFilters,
	ProductFormData,
	ProductsResponse,
	StockMovement,
	StoreSettings,
	StoreSettingsFormData,
} from "@/types/product";
import { supabase } from "@/utils/supabase";

export class ProductService {
	// ================================================
	// Product CRUD Operations
	// ================================================

	static async createProduct(data: ProductFormData): Promise<Product> {
		try {
			const productData = {
				name: data.name,
				slug: data.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, ""),
				description: data.description,
				short_description: data.short_description,
				sku: data.sku,
				category_id: data.category_id || null,
				tags: data.tags,
				price: parseFloat(data.price),
				sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
				cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
				stock_quantity: parseInt(data.stock_quantity),
				track_inventory: data.track_inventory,
				allow_backorders: data.allow_backorders,
				low_stock_threshold: parseInt(data.low_stock_threshold),
				weight: data.weight ? parseFloat(data.weight) : null,
				dimensions: data.dimensions
					? {
							length: data.dimensions.length ? parseFloat(data.dimensions.length) : null,
							width: data.dimensions.width ? parseFloat(data.dimensions.width) : null,
							height: data.dimensions.height ? parseFloat(data.dimensions.height) : null,
							unit: data.dimensions.unit,
						}
					: null,
				status: data.status,
				visibility: data.visibility,
				featured: data.featured,
				meta_title: data.meta_title,
				meta_description: data.meta_description,
				meta_keywords: data.meta_keywords,
				images: [], // Will be updated separately
			};

			const { data: product, error } = await supabase
				.from("products")
				.insert([productData])
				.select()
				.single();

			if (error) throw error;

			// Create initial inventory transaction if tracking inventory
			if (data.track_inventory && parseInt(data.stock_quantity) > 0) {
				await this.createInventoryTransaction({
					product_id: product.id,
					transaction_type: "stock_in",
					reference_type: "manual",
					quantity_before: 0,
					quantity_change: parseInt(data.stock_quantity),
					quantity_after: parseInt(data.stock_quantity),
					reason: "Initial stock entry",
				});
			}

			return product;
		} catch (error) {
			console.error("Error creating product:", error);
			throw error;
		}
	}

	static async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
		try {
			let query = supabase.from("products").select(`
          *,
          category:product_categories(*)
        `);

			// Apply filters
			if (filters.search) {
				query = query.or(
					`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
				);
			}

			if (filters.category_id) {
				query = query.eq("category_id", filters.category_id);
			}

			if (filters.status && filters.status.length > 0) {
				query = query.in("status", filters.status);
			}

			if (filters.visibility && filters.visibility.length > 0) {
				query = query.in("visibility", filters.visibility);
			}

			if (filters.featured !== undefined) {
				query = query.eq("featured", filters.featured);
			}

			if (filters.price_min !== undefined) {
				query = query.gte("price", filters.price_min);
			}

			if (filters.price_max !== undefined) {
				query = query.lte("price", filters.price_max);
			}

			if (filters.stock_status) {
				switch (filters.stock_status) {
					case "out_of_stock":
						query = query.eq("stock_quantity", 0);
						break;
					case "low_stock":
						query = query
							.gt("stock_quantity", 0)
							.filter("stock_quantity", "lte", "low_stock_threshold");
						break;
					case "in_stock":
						query = query.gt("stock_quantity", "low_stock_threshold");
						break;
				}
			}

			// Apply sorting
			const sortBy = filters.sort_by || "created_at";
			const sortDirection = filters.sort_direction || "desc";
			query = query.order(sortBy, { ascending: sortDirection === "asc" });

			// Apply pagination
			const page = filters.page || 1;
			const perPage = filters.per_page || 20;
			const from = (page - 1) * perPage;
			const to = from + perPage - 1;

			query = query.range(from, to);

			const { data: products, error, count } = await query;

			if (error) throw error;

			return {
				data: products || [],
				pagination: {
					page,
					per_page: perPage,
					total: count || 0,
					total_pages: Math.ceil((count || 0) / perPage),
				},
			};
		} catch (error) {
			console.error("Error fetching products:", error);
			throw error;
		}
	}

	static async getProduct(id: string): Promise<Product | null> {
		try {
			const { data: product, error } = await supabase
				.from("products")
				.select(
					`
          *,
          category:product_categories(*),
          images:product_images(*),
          price_history(*),
          inventory_transactions(*)
        `,
				)
				.eq("id", id)
				.single();

			if (error) throw error;
			return product;
		} catch (error) {
			console.error("Error fetching product:", error);
			throw error;
		}
	}

	static async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
		try {
			const updateData: any = {};

			// Convert form data to database format
			if (data.name) {
				updateData.name = data.name;
				updateData.slug = data.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "");
			}

			if (data.description !== undefined) updateData.description = data.description;
			if (data.short_description !== undefined)
				updateData.short_description = data.short_description;
			if (data.sku) updateData.sku = data.sku;
			if (data.category_id !== undefined) updateData.category_id = data.category_id || null;
			if (data.tags) updateData.tags = data.tags;
			if (data.price) updateData.price = parseFloat(data.price);
			if (data.sale_price !== undefined)
				updateData.sale_price = data.sale_price ? parseFloat(data.sale_price) : null;
			if (data.cost_price !== undefined)
				updateData.cost_price = data.cost_price ? parseFloat(data.cost_price) : null;

			// Handle inventory changes
			if (data.stock_quantity !== undefined) {
				const oldQuantity = await this.getProductStock(id);
				const newQuantity = parseInt(data.stock_quantity);
				updateData.stock_quantity = newQuantity;

				// Create inventory transaction for stock adjustment
				if (oldQuantity !== newQuantity) {
					await this.createInventoryTransaction({
						product_id: id,
						transaction_type: "adjustment",
						reference_type: "manual",
						quantity_before: oldQuantity,
						quantity_change: newQuantity - oldQuantity,
						quantity_after: newQuantity,
						reason: "Stock adjustment via product update",
					});
				}
			}

			if (data.track_inventory !== undefined) updateData.track_inventory = data.track_inventory;
			if (data.allow_backorders !== undefined) updateData.allow_backorders = data.allow_backorders;
			if (data.low_stock_threshold)
				updateData.low_stock_threshold = parseInt(data.low_stock_threshold);
			if (data.weight !== undefined)
				updateData.weight = data.weight ? parseFloat(data.weight) : null;

			if (data.dimensions !== undefined) {
				updateData.dimensions = data.dimensions
					? {
							length: data.dimensions.length ? parseFloat(data.dimensions.length) : null,
							width: data.dimensions.width ? parseFloat(data.dimensions.width) : null,
							height: data.dimensions.height ? parseFloat(data.dimensions.height) : null,
							unit: data.dimensions.unit,
						}
					: null;
			}

			if (data.status) updateData.status = data.status;
			if (data.visibility) updateData.visibility = data.visibility;
			if (data.featured !== undefined) updateData.featured = data.featured;
			if (data.meta_title !== undefined) updateData.meta_title = data.meta_title;
			if (data.meta_description !== undefined) updateData.meta_description = data.meta_description;
			if (data.meta_keywords !== undefined) updateData.meta_keywords = data.meta_keywords;

			const { data: product, error } = await supabase
				.from("products")
				.update(updateData)
				.eq("id", id)
				.select()
				.single();

			if (error) throw error;
			return product;
		} catch (error) {
			console.error("Error updating product:", error);
			throw error;
		}
	}

	static async deleteProduct(id: string): Promise<void> {
		try {
			const { error } = await supabase.from("products").delete().eq("id", id);

			if (error) throw error;
		} catch (error) {
			console.error("Error deleting product:", error);
			throw error;
		}
	}

	// ================================================
	// Category Operations
	// ================================================

	static async createCategory(data: CategoryFormData): Promise<ProductCategory> {
		try {
			const categoryData = {
				name: data.name,
				slug: data.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, ""),
				description: data.description,
				parent_id: data.parent_id || null,
				sort_order: parseInt(data.sort_order),
				is_active: data.is_active,
			};

			const { data: category, error } = await supabase
				.from("product_categories")
				.insert([categoryData])
				.select()
				.single();

			if (error) throw error;
			return category;
		} catch (error) {
			console.error("Error creating category:", error);
			throw error;
		}
	}

	static async getCategories(): Promise<CategoriesResponse> {
		try {
			const { data: categories, error } = await supabase
				.from("product_categories")
				.select(
					`
          *,
          parent:product_categories!parent_id(*),
          children:product_categories!parent_id(*)
        `,
				)
				.order("sort_order", { ascending: true });

			if (error) throw error;

			return {
				data: categories || [],
			};
		} catch (error) {
			console.error("Error fetching categories:", error);
			throw error;
		}
	}

	// ================================================
	// Inventory Operations
	// ================================================

	static async createInventoryTransaction(
		data: Omit<InventoryTransaction, "id" | "created_at" | "created_by">,
	): Promise<InventoryTransaction> {
		try {
			const { data: transaction, error } = await supabase
				.from("inventory_transactions")
				.insert([data])
				.select()
				.single();

			if (error) throw error;
			return transaction;
		} catch (error) {
			console.error("Error creating inventory transaction:", error);
			throw error;
		}
	}

	static async getStockMovements(productId?: string): Promise<StockMovement[]> {
		try {
			let query = supabase.from("stock_movements").select("*");

			if (productId) {
				query = query.eq("product_id", productId);
			}

			query = query.order("created_at", { ascending: false }).limit(100);

			const { data: movements, error } = await query;

			if (error) throw error;
			return movements || [];
		} catch (error) {
			console.error("Error fetching stock movements:", error);
			throw error;
		}
	}

	static async getCurrentStock(): Promise<CurrentStock[]> {
		try {
			const { data: stock, error } = await supabase
				.from("current_stock")
				.select("*")
				.order("product_name", { ascending: true });

			if (error) throw error;
			return stock || [];
		} catch (error) {
			console.error("Error fetching current stock:", error);
			throw error;
		}
	}

	static async getInventoryAlerts(): Promise<InventoryAlert[]> {
		try {
			const { data: alerts, error } = await supabase
				.from("inventory_alerts")
				.select(
					`
          *,
          product:products(name, sku)
        `,
				)
				.eq("status", "active")
				.order("priority", { ascending: false })
				.order("created_at", { ascending: false });

			if (error) throw error;
			return alerts || [];
		} catch (error) {
			console.error("Error fetching inventory alerts:", error);
			throw error;
		}
	}

	static async acknowledgeAlert(alertId: string): Promise<void> {
		try {
			const { error } = await supabase
				.from("inventory_alerts")
				.update({
					status: "acknowledged",
					acknowledged_at: new Date().toISOString(),
				})
				.eq("id", alertId);

			if (error) throw error;
		} catch (error) {
			console.error("Error acknowledging alert:", error);
			throw error;
		}
	}

	// ================================================
	// Store Settings Operations
	// ================================================

	static async getStoreSettings(): Promise<StoreSettings | null> {
		try {
			const { data: settings, error } = await supabase
				.from("store_settings")
				.select("*")
				.order("created_at", { ascending: false })
				.limit(1)
				.single();

			if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
			return settings;
		} catch (error) {
			console.error("Error fetching store settings:", error);
			throw error;
		}
	}

	static async updateStoreSettings(data: StoreSettingsFormData): Promise<StoreSettings> {
		try {
			const settingsData = {
				store_name: data.store_name,
				store_description: data.store_description,
				email: data.email,
				phone: data.phone,
				address: data.address,
				website_url: data.website_url,
				business_registration_number: data.business_registration_number,
				tax_id: data.tax_id,
				business_type: data.business_type,
				currency_code: data.currency_code,
				timezone: data.timezone,
				language_code: data.language_code,
				operating_hours: data.operating_hours,
				payment_terms: data.payment_terms,
				free_shipping_threshold: parseFloat(data.free_shipping_threshold),
				meta_title: data.meta_title,
				meta_description: data.meta_description,
				meta_keywords: data.meta_keywords,
				social_media_links: data.social_media_links,
				return_policy: data.return_policy,
				privacy_policy: data.privacy_policy,
				terms_of_service: data.terms_of_service,
				google_analytics_id: data.google_analytics_id,
				facebook_pixel_id: data.facebook_pixel_id,
				status: data.status,
				is_public: data.is_public,
			};

			// Check if settings exist
			const existing = await this.getStoreSettings();

			if (existing) {
				// Update existing settings
				const { data: settings, error } = await supabase
					.from("store_settings")
					.update(settingsData)
					.eq("id", existing.id)
					.select()
					.single();

				if (error) throw error;
				return settings;
			} else {
				// Create new settings
				const { data: settings, error } = await supabase
					.from("store_settings")
					.insert([settingsData])
					.select()
					.single();

				if (error) throw error;
				return settings;
			}
		} catch (error) {
			console.error("Error updating store settings:", error);
			throw error;
		}
	}

	// ================================================
	// Helper Methods
	// ================================================

	private static async getProductStock(productId: string): Promise<number> {
		try {
			const { data: product, error } = await supabase
				.from("products")
				.select("stock_quantity")
				.eq("id", productId)
				.single();

			if (error) throw error;
			return product?.stock_quantity || 0;
		} catch (error) {
			console.error("Error fetching product stock:", error);
			return 0;
		}
	}

	// ================================================
	// Analytics Operations
	// ================================================

	static async getProductAnalytics(
		productId?: string,
		periodStart?: string,
		periodEnd?: string,
	): Promise<ProductAnalytics[]> {
		try {
			// This would typically come from a more complex analytics system
			// For now, we'll return mock data structure
			const analytics: ProductAnalytics[] = [];

			// In a real implementation, you would:
			// 1. Query sales data from orders/sales tables
			// 2. Query view data from analytics/tracking tables
			// 3. Calculate metrics like conversion rate, profit margin, etc.
			// 4. Aggregate data by product and time period

			return analytics;
		} catch (error) {
			console.error("Error fetching product analytics:", error);
			throw error;
		}
	}

	static async getTopSellingProducts(limit: number = 10): Promise<Product[]> {
		try {
			// This would typically join with sales/order data
			// For now, return products ordered by featured status and creation date
			const { data: products, error } = await supabase
				.from("products")
				.select("*")
				.eq("status", "published")
				.eq("visibility", "public")
				.order("featured", { ascending: false })
				.order("created_at", { ascending: false })
				.limit(limit);

			if (error) throw error;
			return products || [];
		} catch (error) {
			console.error("Error fetching top selling products:", error);
			throw error;
		}
	}

	static async getLowStockProducts(): Promise<Product[]> {
		try {
			const { data: products, error } = await supabase
				.from("products")
				.select("*")
				.eq("track_inventory", true)
				.filter("stock_quantity", "lte", "low_stock_threshold")
				.order("stock_quantity", { ascending: true });

			if (error) throw error;
			return products || [];
		} catch (error) {
			console.error("Error fetching low stock products:", error);
			throw error;
		}
	}
}
