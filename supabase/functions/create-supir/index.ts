import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const contentType = req.headers.get("content-type") || "";
		if (!contentType.includes("application/json")) {
			return new Response(JSON.stringify({ error: "Invalid content type" }), {
				status: 400,
				headers: corsHeaders,
			});
		}

		const body = await req.json();
		const { email, password, full_name, phone } = body;

		if (!email || !password || !full_name) {
			return new Response(JSON.stringify({ error: "Missing required fields" }), {
				status: 400,
				headers: corsHeaders,
			});
		}

		// create Supabase admin client
		const supabaseAdmin = createClient(
			Deno.env.get("SUPABASE_URL")!,
			Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
		);

		// 1️⃣ Create user di Auth
		const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { full_name, phone },
		});

		if (authError) {
			return new Response(JSON.stringify({ error: authError.message }), {
				status: 400,
				headers: corsHeaders,
			});
		}

		// 2️⃣ Create profile di table profiles
		const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
			id: userData.user.id,
			email,
			full_name,
			phone,
			roles: "supir",
		});

		if (profileError) {
			return new Response(JSON.stringify({ error: profileError.message }), {
				status: 400,
				headers: corsHeaders,
			});
		}

		return new Response(JSON.stringify({ success: true, user: userData.user }), {
			status: 200,
			headers: corsHeaders,
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message ?? "Internal error" }), {
			status: 500,
			headers: corsHeaders,
		});
	}
});
