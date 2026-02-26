import { useState, useMemo } from 'react';

const PAGE_SIZE = 5;

/**
 * Sortable / filterable table for both Favorites and History lists.
 *
 * Props:
 *  data      – CityEntry[]  { label, lat, lon }
 *  onLoad    – (item) => void
 *  onRemove  – (label) => void | undefined   (pass undefined to hide Remove column)
 */
export default function FavHistTable({ data, onLoad, onRemove }) {
  const [filter, setFilter]   = useState('');
  const [sortCol, setSortCol] = useState('label');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage]       = useState(0);

  const handleHeaderClick = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sortIcon = (col) => {
    if (sortCol !== col) return <span className="fht-sort-icon fht-sort-icon--idle">⇅</span>;
    return (
      <span className="fht-sort-icon fht-sort-icon--active">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? data.filter((r) => r.label.toLowerCase().includes(q)) : data;
  }, [data, filter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortCol];
      let bv = b[sortCol];
      if (typeof av === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated  = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="fht-root">
      {/* Filter bar */}
      <div className="fht-filter-row">
        <input
          className="fht-filter-input"
          type="text"
          placeholder="Filter locations…"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0); }}
        />
        {filter && (
          <button className="fht-filter-clear" onClick={() => setFilter('')} title="Clear filter">
            ×
          </button>
        )}
        <span className="fht-count">{sorted.length} / {data.length}</span>
      </div>

      {sorted.length === 0 ? (
        <p className="fht-empty">No results</p>
      ) : (
        <>
          <div className="fht-scroll-wrap">
            <table className="fht-table">
              <thead>
                <tr>
                  <th className="fht-th fht-th--sortable" onClick={() => handleHeaderClick('label')}>
                    Location {sortIcon('label')}
                  </th>
                  <th className="fht-th fht-th--sortable fht-th--coord" onClick={() => handleHeaderClick('lat')}>
                    Lat {sortIcon('lat')}
                  </th>
                  <th className="fht-th fht-th--sortable fht-th--coord" onClick={() => handleHeaderClick('lon')}>
                    Lon {sortIcon('lon')}
                  </th>
                  <th className="fht-th fht-th--actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item) => (
                  <tr key={item.label} className="fht-row">
                    <td className="fht-td fht-td--label">{item.label}</td>
                    <td className="fht-td fht-td--coord">{item.lat.toFixed(3)}</td>
                    <td className="fht-td fht-td--coord">{item.lon.toFixed(3)}</td>
                    <td className="fht-td fht-td--actions">
                      <button
                        className="fht-btn fht-btn--load"
                        onClick={() => onLoad(item)}
                        title={`Load weather for ${item.label}`}
                      >
                        Load
                      </button>
                      {onRemove && (
                        <button
                          className="fht-btn fht-btn--remove"
                          onClick={() => onRemove(item.label)}
                          title={`Remove ${item.label}`}
                        >
                          x
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="fht-pagination">
              <button
                className="fht-pg-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`fht-pg-btn${page === i ? ' fht-pg-btn--active' : ''}`}
                  onClick={() => setPage(i)}
                >{i + 1}</button>
              ))}
              <button
                className="fht-pg-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages - 1}
              >›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
