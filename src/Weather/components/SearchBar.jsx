export default function SearchBar({
  searchQuery, setSearchQuery,
  searchError, setSearchError,
  suggestions, setSuggestions,
  handleSearch, handleSuggestionSelect,
  blurDelay = 150,
}) {
  const showSuggestions = suggestions.length > 0;

  return (
    <>
      <form className="wx-search" onSubmit={handleSearch}>
        <div className="wx-search-wrapper">
          <input
            className="wx-search-input"
            type="text"
            placeholder="Search city…"
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
            onFocus={() => {}}
            onBlur={() => setTimeout(() => setSuggestions([]), blurDelay)}
          />
          {showSuggestions && (
            <ul className="wx-suggestions">
              {suggestions.map((s) => (
                <li
                  key={s.id}
                  className="wx-suggestion-item"
                  onMouseDown={() => handleSuggestionSelect(s)}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="wx-search-btn" type="submit">🔍</button>
      </form>
      {searchError && <p className="wx-search-error">{searchError}</p>}
    </>
  );
}
