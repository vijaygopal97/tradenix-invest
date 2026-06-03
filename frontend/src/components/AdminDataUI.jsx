export function AdminPageHeader({ title, subtitle, children }) {
  return (
    <header className="admin-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="lead">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}

const STATUS_LABELS = {
  '': 'All',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  paid: 'Paid',
};

export function AdminStatusFilters({ value, onChange, options, counts }) {
  return (
    <div className="admin-filter-bar" role="tablist" aria-label="Filter by status">
      {options.map((opt) => {
        const active = value === opt;
        const count = counts?.[opt];
        return (
          <button
            key={opt || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            className={`admin-filter-pill${active ? ' active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {STATUS_LABELS[opt] ?? opt}
            {typeof count === 'number' && <span className="admin-filter-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function AdminToolbar({ children }) {
  return <div className="admin-toolbar">{children}</div>;
}

export function AdminSearchForm({ value, onChange, onSubmit, placeholder = 'Search…' }) {
  return (
    <form
      className="admin-search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      <button type="submit" className="btn primary">
        Search
      </button>
    </form>
  );
}

export function AdminDataTable({ columns, children, empty, colSpan }) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.label} className={col.className}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr className="admin-table-empty">
                <td colSpan={colSpan || columns.length}>{empty}</td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminTableRow({ children }) {
  return <tr>{children}</tr>;
}

export function AdminCellUser({ name, email }) {
  return (
    <td className="admin-cell-user">
      <span className="admin-user-name">{name || '—'}</span>
      {email && <span className="admin-user-email">{email}</span>}
    </td>
  );
}

export function AdminCellMoney({ amount, formatMoney }) {
  return <td className="admin-cell-money">{formatMoney(amount)}</td>;
}

export function AdminCellDate({ date }) {
  return (
    <td className="admin-cell-date">
      <time dateTime={new Date(date).toISOString()}>{new Date(date).toLocaleString()}</time>
    </td>
  );
}

export function AdminCellInput({
  value,
  onChange,
  disabled,
  placeholder = 'Remarks…',
  id,
}) {
  return (
    <td className="admin-cell-input">
      <input
        id={id}
        className="admin-table-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </td>
  );
}

export function AdminCellActions({ children }) {
  return <td className="admin-cell-actions">{children && <div className="actions">{children}</div>}</td>;
}

export function AdminMetaStrip({ items }) {
  return (
    <div className="admin-meta-strip">
      {items.map(({ label, value }) => (
        <span key={label} className="admin-meta-item">
          <span className="admin-meta-label">{label}</span>
          <strong>{value}</strong>
        </span>
      ))}
    </div>
  );
}
