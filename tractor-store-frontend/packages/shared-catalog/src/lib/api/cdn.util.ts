/** Blueprint CDN uses numeric widths (200 product/store, 500 scene), not `md`. */
const defaultCdnSize = (path: string): string => {
  if (path.includes('/scene/')) return '500';
  return '200';
};

export const resolveCdnUrl = (path: string, cdnBase: string, size?: string): string => {
  if (path.startsWith('http')) return path;
  const resolvedSize = size ?? defaultCdnSize(path);
  const normalized = path.replace('[size]', resolvedSize);
  return `${cdnBase.replace(/\/$/, '')}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
};
