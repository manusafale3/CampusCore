import { createTheme } from '@mui/material/styles';

// Warm parchment palette
const parchment = {
  bg: '#F5F0E8',       // main background
  paper: '#FDFBF7',    // card surfaces
  sidebar: '#2C1810',  // deep espresso sidebar
  accent: '#8B4513',   // saddle brown - primary accent
  accentLight: '#A0522D', // sienna
  gold: '#B8860B',     // dark goldenrod for highlights
  ink: '#2C1810',      // deep brown text
  inkLight: '#6B5744', // muted brown secondary text
  inkFaint: '#A89880', // faint text
  border: 'rgba(44,24,16,0.08)',
  borderHover: 'rgba(44,24,16,0.15)',
  success: '#2D6A4F',
  warning: '#B8860B',
  error: '#9B2C2C',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: parchment.accent, light: parchment.accentLight, dark: '#6B3410' },
    secondary: { main: parchment.gold },
    background: { default: parchment.bg, paper: parchment.paper },
    success: { main: parchment.success },
    warning: { main: parchment.warning },
    error: { main: parchment.error },
    text: { primary: parchment.ink, secondary: parchment.inkLight },
    divider: parchment.border,
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h3: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 },
    h5: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    body2: { color: parchment.inkLight },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 3 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: parchment.bg,
          // Subtle paper texture via noise + warm gradient
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"),
            radial-gradient(ellipse at 30% 0%, rgba(184,134,11,0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(139,69,19,0.03) 0%, transparent 60%)
          `,
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
        '::-webkit-scrollbar': { width: 6 },
        '::-webkit-scrollbar-track': { background: parchment.bg },
        '::-webkit-scrollbar-thumb': { background: 'rgba(44,24,16,0.15)', borderRadius: 3 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: parchment.paper,
          border: `1px solid ${parchment.border}`,
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(44,24,16,0.06), 0 4px 16px rgba(44,24,16,0.03)',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(44,24,16,0.1), 0 8px 24px rgba(44,24,16,0.05)',
            borderColor: parchment.borderHover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', fontWeight: 600, borderRadius: 3,
          padding: '8px 20px', boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: parchment.accent, color: '#FDFBF7',
          '&:hover': {
            background: parchment.accentLight,
            boxShadow: '0 4px 12px rgba(139,69,19,0.25)',
          },
        },
        outlinedPrimary: {
          borderColor: parchment.border,
          '&:hover': { borderColor: parchment.accent, bgcolor: 'rgba(139,69,19,0.04)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 3, fontSize: '0.75rem' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700, background: '#F0EBE1',
            color: parchment.inkLight, fontSize: '0.7rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            borderBottom: `1px solid ${parchment.border}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${parchment.border}` },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(139,69,19,0.02) !important' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            '& fieldset': { borderColor: parchment.border },
            '&:hover fieldset': { borderColor: 'rgba(44,24,16,0.2)' },
            '&.Mui-focused fieldset': { borderColor: parchment.accent },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: parchment.paper,
          border: `1px solid ${parchment.border}`,
          borderRadius: 3,
          boxShadow: '0 8px 40px rgba(44,24,16,0.15)',
        },
      },
    },
  },
});

export { parchment };
export default theme;
