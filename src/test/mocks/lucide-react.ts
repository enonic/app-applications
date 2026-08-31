// Icons render in the browser only — the node tests just need the imports to resolve.
// Add an export here when a component under test starts using another icon.
function icon(): null {
  return null;
}

export const BellDot = icon;
export const Box = icon;
export const Laptop = icon;
export const Settings = icon;
