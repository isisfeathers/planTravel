// Atrip foundation tokens. CommonJS; rename to .cjs in a type:module project.
const t = require('./atrip.tokens.json');

function flatten(object, prefix = '') {
  return Object.fromEntries(Object.entries(object).flatMap(([key, value]) => {
    const name = prefix ? `${prefix}-${key}` : key;
    return value && typeof value === 'object'
      ? Object.entries(flatten(value, name))
      : [[name, value]];
  }));
}
function namespaced(object) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [`atrip-${key}`, value]));
}

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...namespaced(flatten(t.color)),
        // Compatibility alias for the shared ticket's bg-brand-primary.
        'brand-primary': t.color.action.primary,
      },
      fontFamily: {
        atrip: t.font.family.map(name => name.includes(' ') ? `"${name}"` : name),
      },
      fontWeight: namespaced(t.font.weight),
      fontSize: Object.fromEntries(Object.entries(t.type).map(([key, value]) => [
        `atrip-${key}`, [value.fontSize, { lineHeight: value.lineHeight, fontWeight: String(value.fontWeight) }],
      ])),
      spacing: {
        ...namespaced(t.space),
        ...namespaced(t.size),
        ...namespaced(t.inset),
        'atrip-gutter': t.layout.gutter,
        'atrip-gutter-narrow': t.layout.gutterNarrow,
      },
      minHeight: namespaced(t.size),
      minWidth: { 'atrip-icon-button': t.size['icon-button'], 'atrip-card': t.layout.cardMinWidth },
      borderRadius: namespaced(t.radius),
      boxShadow: namespaced(t.shadow),
      borderWidth: namespaced(t.border),
      outlineWidth: { 'atrip-focus': t.focus.width },
      outlineOffset: { 'atrip-focus': t.focus.offset },
      transitionDuration: { atrip: t.motion.duration },
      transitionTimingFunction: { atrip: t.motion.easing },
      transitionProperty: { atrip: 'background-color, border-color, box-shadow' },
    },
  },
  plugins: [],
};
