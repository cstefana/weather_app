import FavHistTable from './FavHistTable';

export default function HistorySection({
  userId, history,
  histView, setHistView,
  onLoad, onClear,
}) {
  if (!userId || history.length === 0) return null;

  return (
    <div className="wx-history">
      <div className="wx-history-header">
        <span>🕐 Recent searches</span>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <button
            className="wx-view-toggle"
            onClick={() => setHistView((v) => v === 'cards' ? 'table' : 'cards')}
            title={histView === 'cards' ? 'Switch to table view' : 'Switch to card view'}
          >
            {histView === 'cards' ? 'Table' : 'Cards'}
          </button>
          <button className="wx-history-clear" onClick={onClear}>Clear</button>
        </div>
      </div>

      {histView === 'cards' ? (
        <div className="wx-history-items">
          {history.map((item) => (
            <button key={item.label} className="wx-history-item" onClick={() => onLoad(item)}>
              {item.label}
            </button>
          ))}
        </div>
      ) : (
        <FavHistTable data={history} onLoad={onLoad} />
      )}
    </div>
  );
}
