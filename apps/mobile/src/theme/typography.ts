import type { TextStyle } from 'react-native';
import { typography } from '@gymova/design-tokens';

export type TextVariant =
  | 'display'
  | 'page'
  | 'section'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'metric'
  | 'metricLarge';

const f = typography.fontFamily;

export const textVariants: Record<TextVariant, TextStyle> = {
  display: { fontSize: typography.size.display, lineHeight: typography.lineHeight.display, fontFamily: f.bold, letterSpacing: -0.5 },
  page: { fontSize: typography.size.page, lineHeight: typography.lineHeight.page, fontFamily: f.bold, letterSpacing: -0.3 },
  section: { fontSize: typography.size.section, lineHeight: typography.lineHeight.section, fontFamily: f.semibold },
  body: { fontSize: typography.size.body, lineHeight: typography.lineHeight.body, fontFamily: f.regular },
  bodySmall: { fontSize: typography.size.bodySmall, lineHeight: typography.lineHeight.bodySmall, fontFamily: f.regular },
  caption: { fontSize: typography.size.caption, lineHeight: typography.lineHeight.caption, fontFamily: f.regular },
  label: { fontSize: typography.size.label, lineHeight: typography.lineHeight.label, fontFamily: f.medium, letterSpacing: 0.2 },
  metric: { fontSize: typography.size.metric, lineHeight: typography.lineHeight.metric, fontFamily: f.bold, fontVariant: ['tabular-nums'] },
  metricLarge: { fontSize: typography.size.metricLarge, lineHeight: typography.lineHeight.metricLarge, fontFamily: f.bold, fontVariant: ['tabular-nums'], letterSpacing: -1 },
};
