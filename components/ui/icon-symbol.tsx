// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

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
  "leaf.fill": "local-florist",
  "bag.fill": "store",
  gavel: "gavel",
  "cart.fill": "shopping-cart",
  truck: "local-shipping",
  "archivebox.fill": "archive",
  "dollarsign.circle.fill": "attach-money",
  "chart.bar.fill": "insert-chart",
  "bell.fill": "notifications",
  gear: "settings",
  "gearshape.fill": "settings",
  person: "person",
  "person.fill": "person",
  book: "menu-book",
  plus: "add",
  calendar: "calendar-today",
  "list.bullet": "format-list-bulleted",
  "sun.max.fill": "light-mode",
  "moon.fill": "dark-mode",
  "checkmark.circle.fill": "check-circle",
  "clock.fill": "schedule",
  "xmark.circle.fill": "cancel",
  checkmark: "check",
  xmark: "close",
  "doc.text.fill": "description",
  trash: "delete",
  "trash.fill": "delete",
  pencil: "edit",
  trash: "delete",
} as const satisfies Partial<
  Record<string, ComponentProps<typeof MaterialIcons>["name"]>
>;

type IconSymbolMappedName = keyof typeof MAPPING;

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
  name: IconSymbolMappedName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
