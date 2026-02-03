import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

export default function SuratJalanAssignDetail() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const assignId = (params.id as string) || null;

	const [loading, setLoading] = useState(true);
	const [assign, setAssign] = useState<any | null>(null);
	const [winnerOffering, setWinnerOffering] = useState<any | null>(null);
	const [winnerProfile, setWinnerProfile] = useState<any | null>(null);
	const [winnerMitra, setWinnerMitra] = useState<any | null>(null);

	useEffect(() => {
		const load = async () => {
			if (!assignId) return;
			setLoading(true);
			try {
				const { data: aData, error: aErr } = await supabase
					.from("tender_assigns")
					.select(`*, visits(*, farms (*)), tender_assign_products(*)`)
					.eq("id", assignId)
					.maybeSingle();
				if (aErr) throw aErr;
				setAssign(aData as any);

				// find approve -> offering (try both approaches)
				let offerId: string | null = null;

				// Approach 1: Query tender_approves by id
				const { data: approveData, error: approveErr } = await supabase
					.from("tender_approves")
					.select("tender_offering_id")
					.eq("id", assignId)
					.maybeSingle();

				console.log("Approach 1 - tender_approves by id:", { approveData, approveErr });

				if (!approveErr && approveData?.tender_offering_id) {
					offerId = approveData.tender_offering_id;
				}

				// Approach 2: If approach 1 fails, try finding offering via tender_assign_id
				if (!offerId) {
					const { data: offeringsData, error: offeringsErr } = await supabase
						.from("tender_offerings")
						.select("id, offered_by")
						.eq("tender_assign_id", assignId);

					console.log("Approach 2 - tender_offerings by tender_assign_id:", {
						offeringsData,
						offeringsErr,
					});

					// Check if any offering is approved
					if (!offeringsErr && offeringsData && offeringsData.length > 0) {
						// Find the approved offering
						for (const off of offeringsData) {
							const { data: checkApprove } = await supabase
								.from("tender_approves")
								.select("id")
								.eq("tender_offering_id", off.id)
								.maybeSingle();

							if (checkApprove) {
								offerId = off.id;
								break;
							}
						}

						// If no approval found, just use the first offering
						if (!offerId && offeringsData.length > 0) {
							offerId = offeringsData[0].id;
						}
					}
				}

				console.log("Final offerId:", offerId);

				if (offerId) {
					const { data: offData, error: offErr } = await supabase
						.from("tender_offerings")
						.select("*, tender_offerings_products(*)")
						.eq("id", offerId)
						.maybeSingle();

					console.log("Offering data:", { offData, offErr });

					if (!offErr && offData) {
						setWinnerOffering(offData as any);
						// fetch profile and mitra_toko for offered_by
						try {
							const offeredById = (offData as any)?.offered_by;
							console.log("offeredById:", offeredById);

							if (offeredById) {
								// Fetch profile
								const { data: profileData, error: profileErr } = await supabase
									.from("v_profiles")
									.select("id, full_name, phone, email")
									.eq("id", offeredById)
									.maybeSingle();
								console.log("Profile data:", { profileData, profileErr });
								if (!profileErr && profileData) setWinnerProfile(profileData as any);

								// Fetch mitra_toko data
								const { data: mitraData, error: mitraErr } = await supabase
									.from("mitra_toko")
									.select("*")
									.eq("id", offeredById)
									.maybeSingle();
								console.log("Mitra data:", { mitraData, mitraErr });
								if (!mitraErr && mitraData) setWinnerMitra(mitraData as any);
							}
						} catch (e) {
							console.warn(e);
						}
					}
				}
			} catch (err: any) {
				console.warn(err);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [assignId]);

	if (loading)
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" color="#065F46" />
			</ThemedView>
		);

	return (
		<ThemedView style={{ flex: 1 }}>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<ThemedText type="title">Atur Surat Jalan</ThemedText>

				{assign ? (
					<View style={{ marginTop: 12 }}>
						<ThemedText style={{ fontWeight: "600" }}>
							Tender: {assign.title || assign.id}
						</ThemedText>
						<ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
							Kebun: {assign?.visits?.farms?.name || "-"}
						</ThemedText>
						<ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
							Alamat: {assign?.visits?.farms?.location || "-"}
						</ThemedText>
						<ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
							Tanggal dibuat:{" "}
							{assign?.created_at ? new Date(assign.created_at).toLocaleString() : "-"}
						</ThemedText>

						<View style={{ height: 12 }} />

						<ThemedText style={{ fontWeight: "600" }}>Pemenang</ThemedText>
						{winnerOffering ? (
							<View style={{ marginTop: 8 }}>
								{/* Info Mitra Toko */}
								{winnerMitra ? (
									<View
										style={{
											backgroundColor: "#F0FDF4",
											padding: 12,
											borderRadius: 8,
											marginBottom: 12,
										}}>
										<ThemedText style={{ fontWeight: "700", fontSize: 16, color: "#065F46" }}>
											{winnerMitra.name}
										</ThemedText>
										{winnerMitra.owner_name && (
											<ThemedText style={{ color: "#047857", marginTop: 4 }}>
												Pemilik: {winnerMitra.owner_name}
											</ThemedText>
										)}
										{winnerMitra.handphone && (
											<ThemedText style={{ color: "#047857", marginTop: 4 }}>
												HP: {winnerMitra.handphone}
											</ThemedText>
										)}
										{winnerMitra.address && (
											<ThemedText style={{ color: "#047857", marginTop: 4 }}>
												Alamat: {winnerMitra.address}
											</ThemedText>
										)}
										{(winnerMitra.city || winnerMitra.province) && (
											<ThemedText style={{ color: "#047857", marginTop: 4 }}>
												{[winnerMitra.city, winnerMitra.province].filter(Boolean).join(", ")}
											</ThemedText>
										)}
										<ThemedText
											style={{
												marginTop: 6,
												color: winnerMitra.status === "active" ? "#059669" : "#DC2626",
												fontWeight: "600",
											}}>
											Status: {winnerMitra.status === "active" ? "Aktif" : "Nonaktif"}
										</ThemedText>
									</View>
								) : (
									<View>
										<ThemedText style={{ fontWeight: "600" }}>
											{winnerProfile?.full_name || winnerOffering.offered_by}
										</ThemedText>
										{winnerProfile?.phone ? (
											<ThemedText style={{ color: "#6B7280", marginTop: 4 }}>
												{winnerProfile.phone}
											</ThemedText>
										) : null}
									</View>
								)}

								{/* Produk yang ditawarkan */}
								<ThemedText style={{ fontWeight: "600", marginTop: 8 }}>
									Produk Ditawarkan:
								</ThemedText>
								{winnerOffering.tender_offerings_products?.map((p: any) => (
									<View
										key={p.id}
										style={{
											marginTop: 8,
											padding: 8,
											backgroundColor: "#F9FAFB",
											borderRadius: 6,
										}}>
										<ThemedText style={{ color: "#065F46", fontWeight: "600" }}>
											{p.product_name}
										</ThemedText>
										{p.price != null && (
											<ThemedText style={{ color: "#6B7280", marginTop: 2 }}>
												Harga: Rp {new Intl.NumberFormat("id-ID").format(p.price)}
											</ThemedText>
										)}
										{p.qty != null && (
											<ThemedText style={{ color: "#6B7280", marginTop: 2 }}>
												Qty: {p.qty}
											</ThemedText>
										)}
										{p.dosage && (
											<ThemedText style={{ color: "#6B7280", marginTop: 2 }}>
												Dosage: {p.dosage}
											</ThemedText>
										)}
										{p.note && (
											<ThemedText style={{ color: "#6B7280", marginTop: 2 }}>
												Catatan: {p.note}
											</ThemedText>
										)}
									</View>
								))}
							</View>
						) : (
							<ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
								Belum ada pemenang untuk tender ini.
							</ThemedText>
						)}
					</View>
				) : (
					<ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
						Tidak dapat menemukan data tender.
					</ThemedText>
				)}
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
