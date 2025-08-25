import React from 'react';

// Calendario simple que muestra una vista de 2 meses y marca fechas ocupadas.
export default function CalendarSimple({ blockedDates = [], onRangeSelect }) {
  // blockedDates: array of ISO date strings "YYYY-MM-DD"
  const [startMonth, setStartMonth] = React.useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const nextMonth = (m) => { const d = new Date(m); d.setMonth(d.getMonth()+1); return d; };

  const formatDate = (d) => d.toISOString().slice(0,10);

  const renderMonth = (m) => {
    const year = m.getFullYear();
    const month = m.getMonth();
    const firstDay = new Date(year, month, 1);
    const days = [];
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    for (let i=0;i<startOffset;i++) days.push(null);
    for (let d=1; d<=daysInMonth; d++) days.push(new Date(year, month, d));

    return (
      <div className="w-1/2 p-2">
        <div className="text-center font-semibold mb-2">{m.toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
        <div className="grid grid-cols-7 gap-1 text-sm">
          {['D','L','M','M','J','V','S'].map(h => <div key={h} className="text-center font-medium">{h}</div>)}
          {days.map((d, idx) => {
            if (!d) return <div key={idx} className="h-8"></div>;
            const iso = formatDate(d);
            const blocked = blockedDates.includes(iso);
            return (
              <button key={iso} onClick={() => onRangeSelect && onRangeSelect(iso)} className={`h-8 rounded ${blocked ? 'bg-red-200 text-red-800' : 'bg-white hover:bg-green-50'}`}>
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-white p-2 rounded shadow-sm">
      {renderMonth(startMonth)}
      {renderMonth(nextMonth(startMonth))}
    </div>
  );
}
