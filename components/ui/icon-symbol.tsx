// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
	"house.fill": "home",
	"paperplane.fill": "send",
	"chevron.left.forwardslash.chevron.right": "code",
	"chevron.right": "chevron-right",
	"chevron.left": "chevron-left",
	"leaf.fill": "local-florist",
	"bag.fill": "store",
	gavel: "gavel",
	"cart.fill": "shopping-cart",
	truck: "local-shipping",
	"truck.fill": "local-shipping",
	"archivebox.fill": "archive",
	archivebox: "archive",
	"dollarsign.circle.fill": "attach-money",
	"dollarsign.circle": "monetization-on",
	"chart.bar.fill": "insert-chart",
	"bell.fill": "notifications",
	bell: "notifications-none",
	gear: "settings",
	book: "menu-book",
	xmark: "close",
	plus: "add",
	"doc.fill": "description",
	magnifyingglass: "search",
	"slider.horizontal.3": "tune",
	checkmark: "check",
	photo: "image",
	pencil: "edit",
	"arrow.left.arrow.right": "swap-horiz",
	"arrow.up.circle.fill": "trending-up",
	"lightbulb.fill": "lightbulb",
	"exclamationmark.triangle.fill": "warning",
	"checkmark.circle.fill": "check-circle",
	"star.fill": "star",
	"building.2.fill": "business",
	"clock.fill": "schedule",
	"creditcard.fill": "payment",
	globe: "public",
	"doc.text.fill": "article",
	"person.2.circle": "person.2",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
	name,
	size = 24,
	color,
	style,
}: {
	name: IconSymbolName;
	size?: number;
	color: string | OpaqueColorValue;
	style?: StyleProp<TextStyle>;
	weight?: SymbolWeight;
}) {
	return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
