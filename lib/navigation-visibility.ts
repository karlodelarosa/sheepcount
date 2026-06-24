import { isGroupEnabled, isItemEnabled } from "@/lib/subscription/entitlements";
import {
  MODULE_ITEM_TO_GROUP,
  type ModuleItemKey,
  type ModulesConfig,
} from "@/lib/subscription/plans";
import {
  isMenuItemVisibleInNav,
  type OrganizationSettings,
} from "@/lib/types/organization-settings";

export function isWaterBaptismModuleActive(
  orgSettings: OrganizationSettings,
  modules: ModulesConfig,
): boolean {
  return (
    orgSettings.waterBaptismEnabled === true ||
    isItemEnabled(modules, "water_baptism")
  );
}

export function isMenuItemModuleActive(
  itemKey: ModuleItemKey,
  orgSettings: OrganizationSettings,
  modules: ModulesConfig,
): boolean {
  if (itemKey === "water_baptism") {
    return isWaterBaptismModuleActive(orgSettings, modules);
  }

  return isItemEnabled(modules, itemKey);
}

export function isMenuItemShownInNavigation(
  itemKey: ModuleItemKey,
  orgSettings: OrganizationSettings,
  modules: ModulesConfig,
): boolean {
  return (
    isMenuItemModuleActive(itemKey, orgSettings, modules) &&
    isMenuItemVisibleInNav(itemKey, orgSettings.hiddenMenuItems)
  );
}

export function isMenuItemConfigurableInSettings(
  itemKey: ModuleItemKey,
  modules: ModulesConfig,
): boolean {
  if (itemKey === "dashboard") {
    return isGroupEnabled(modules, "dashboard");
  }

  const groupKey = MODULE_ITEM_TO_GROUP[itemKey];
  if (!groupKey) {
    return false;
  }

  return isGroupEnabled(modules, groupKey);
}

export function getMenuItemVisibilityInSettings(
  itemKey: ModuleItemKey,
  orgSettings: OrganizationSettings,
  modules: ModulesConfig,
): boolean {
  return isMenuItemShownInNavigation(itemKey, orgSettings, modules);
}
