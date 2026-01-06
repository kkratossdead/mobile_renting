// Thème inspiré du style web - Élégant et moderne
export const theme = {
  colors: {
    // Couleurs principales
    primary: "#1a1a1a",        // Noir élégant
    primaryLight: "#333333",
    accent: "#c8a24d",         // Or/Doré
    accentLight: "#e7d18f",
    
    // Arrière-plans
    background: "#f8f6f2",     // Beige clair
    backgroundDark: "#ebe7df",
    card: "#FFFFFF",
    cardHover: "#fafafa",
    
    // Textes
    text: "#1a1a1a",
    textSecondary: "#666666",
    muted: "#999999",
    
    // États
    border: "#e0dcd4",
    error: "#DC2626",
    success: "#10B981",
    warning: "#F59E0B",
    
    // Overlay
    overlay: "rgba(0, 0, 0, 0.55)",
  },
  
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 25,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: "600",
    },
    h3: {
      fontSize: 18,
      fontWeight: "600",
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
    },
    caption: {
      fontSize: 14,
      fontWeight: "400",
    },
    small: {
      fontSize: 12,
      fontWeight: "400",
    },
  },
};
