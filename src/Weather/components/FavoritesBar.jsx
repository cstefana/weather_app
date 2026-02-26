import FavHistTable from './FavHistTable';

export default function FavoritesBar({
  userId, favorites, activeLocation,
  favView, setFavView,
  onLoad, onRemove,
}) {
  if (!userId || favorites.length === 0) return null;

  return (
    <div className="wx-favorites-bar">
      <span className="wx-favorites-label">⭐ Saved</span>
      <button
        className="wx-view-toggle"
        onClick={() => setFavView((v) => v === 'cards' ? 'table' : 'cards')}
        title={favView === 'cards' ? 'Switch to table view' : 'Switch to card view'}
      >
        {favView === 'cards' ? 'Table' : 'Cards'}
      </button>

      {favView === 'cards' ? (
        favorites.map((fav) => (
          <div
            key={fav.label}
            className={`wx-fav-chip${fav.label === activeLocation ? ' wx-fav-chip--active' : ''}`}
          >
            <button className="wx-fav-chip-name" onClick={() => onLoad(fav)}>
              {fav.label}
            </button>
            <button
              className="wx-fav-chip-remove"
              title="Remove from favorites"
              onClick={() => onRemove(fav.label)}
            >
              x
            </button>
          </div>
        ))
      ) : (
        <div style={{ width: '100%' }}>
          <FavHistTable data={favorites} onLoad={onLoad} onRemove={onRemove} />
        </div>
      )}
    </div>
  );
}
