export function calcolaPageSize(
  container: HTMLElement
): number {
  const tableHeader = container.querySelector('.table-header') as HTMLElement;
  const tableFooter = container.querySelector('.table-footer') as HTMLElement;
  const filtriBox = container.querySelector('.filtri-generici-container') as HTMLElement;
  const tableBody = container.querySelector('tbody') as HTMLElement;

  let rowHeight = 60; // fallback

  // Calcola la media delle altezze delle righe dati
  let totalHeight = 0;
  let count = 0;
  if (tableBody && tableBody.children.length > 0) {
    for (let i = 0; i < tableBody.children.length; i++) {
      const row = tableBody.children[i] as HTMLElement;
      if (
        row.tagName === 'TR' &&
        !row.classList.contains('empty-row') &&
        !row.classList.contains('empty-rows') &&
        !row.classList.contains('no-data') &&
        row.offsetHeight > 0
      ) {
        totalHeight += row.offsetHeight;
        count++;
      }
    }
    if (count > 0) {
      rowHeight = totalHeight / count;
    } else {
      // Nessuna riga dati reale: ritorna fallback
      return Math.max(1, Math.floor(container.clientHeight / rowHeight));
    }
  }

  const headerHeight = tableHeader ? tableHeader.offsetHeight : 0;
  const footerHeight = tableFooter ? tableFooter.offsetHeight : 0;
  const filtriHeight = filtriBox ? filtriBox.offsetHeight : 0;

  // Calcola anche il margin-bottom del box filtri
  let filtriMarginBottom = 0;
  if (filtriBox) {
    const style = window.getComputedStyle(filtriBox);
    filtriMarginBottom = parseFloat(style.marginBottom) || 0;
  }

  const containerHeight = container.clientHeight;
  const available = containerHeight - headerHeight - footerHeight - filtriHeight - filtriMarginBottom;

  return Math.max(1, Math.floor(available / rowHeight));
}