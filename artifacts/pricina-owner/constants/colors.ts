/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F4F7FC',
    tint: '#63B6FF',

    // Core surfaces
    background: '#07101F',
    foreground: '#F4F7FC',

    // Cards / elevated surfaces
    card: '#0D1A2D',
    cardForeground: '#F4F7FC',

    // Primary action color (buttons, links, active states)
    primary: '#63B6FF',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#13243B',
    secondaryForeground: '#C8D6E8',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#132238',
    mutedForeground: '#8EA1BA',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#172E4B',
    accentForeground: '#DCEBFF',

    // Destructive actions (delete, error states)
    destructive: '#F36F82',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#1C3553',
    input: '#213C5E',
  },

  dark: {
    text: '#F4F7FC',
    tint: '#63B6FF',
    background: '#07101F',
    foreground: '#F4F7FC',
    card: '#0D1A2D',
    cardForeground: '#F4F7FC',
    primary: '#63B6FF',
    primaryForeground: '#07101F',
    secondary: '#13243B',
    secondaryForeground: '#C8D6E8',
    muted: '#132238',
    mutedForeground: '#8EA1BA',
    accent: '#172E4B',
    accentForeground: '#DCEBFF',
    destructive: '#F36F82',
    destructiveForeground: '#FFFFFF',
    border: '#1C3553',
    input: '#213C5E',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
