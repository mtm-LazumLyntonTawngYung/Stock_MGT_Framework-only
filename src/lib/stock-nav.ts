export type StockNavSource = 'dashboard' | 'stock-mgt';

const STORAGE_KEY = 'stockNavSource';

export function setStockNavSource(source: StockNavSource) {
  sessionStorage.setItem(STORAGE_KEY, source);
}

export function getStockNavSource(): StockNavSource {
  const value = sessionStorage.getItem(STORAGE_KEY);
  return value === 'stock-mgt' ? 'stock-mgt' : 'dashboard';
}

export function isMonthStockPath(pathname: string): boolean {
  return /^\/stock\/\d+\/\d+/.test(pathname);
}
