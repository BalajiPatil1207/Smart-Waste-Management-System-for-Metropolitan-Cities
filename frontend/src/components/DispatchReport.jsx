import React, { useState } from 'react';
import { ClipboardList, CheckCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function DispatchReport({ dispatchLogs }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const totalPages = Math.max(1, Math.ceil(dispatchLogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = dispatchLogs.slice(startIndex, startIndex + itemsPerPage);

  const downloadCSV = () => {
    if (dispatchLogs.length === 0) return;
    const headers = ["Sr. No", "Bin ID", "Truck Number", "Date", "Time", "Status"];
    const csvRows = [headers.join(",")];
    
    dispatchLogs.forEach((log, index) => {
      const srNo = dispatchLogs.length - index;
      const row = [srNo, log.binId, log.truckNo, log.date, log.time, "Dispatched"];
      csvRows.push(row.join(","));
    });
    
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Dispatch_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '0.5rem' }}>
                <ClipboardList size={28} /> Automated Dispatch History
              </h2>
              <p style={{ color: '#94a3b8', margin: 0 }}>
                This report logs all automatically dispatched trucks when bins reach critical fill levels (≥ 95%).
              </p>
          </div>
          
          {dispatchLogs.length > 0 && (
              <button 
                onClick={downloadCSV} 
                className="ping-btn" 
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                  <Download size={18}/> Export Full Report (CSV)
              </button>
          )}
      </div>

      {dispatchLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          No trucks have been dispatched yet.
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', flexGrow: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '1rem' }}>Sr. No</th>
                  <th style={{ padding: '1rem' }}>Bin ID</th>
                  <th style={{ padding: '1rem' }}>Truck Number</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Time</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{dispatchLogs.length - (startIndex + index)}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#f8fafc' }}>{log.binId}</td>
                    <td style={{ padding: '1rem', color: '#38bdf8' }}>{log.truckNo}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{log.date}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{log.time}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <CheckCircle size={14} /> Dispatched
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, dispatchLogs.length)} of {dispatchLogs.length} entries
              </span>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', borderRadius: '8px',
                    background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(56, 189, 248, 0.1)',
                    color: currentPage === 1 ? '#64748b' : '#38bdf8',
                    border: '1px solid', borderColor: currentPage === 1 ? 'transparent' : 'rgba(56, 189, 248, 0.3)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontWeight: 'bold' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', borderRadius: '8px',
                    background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(56, 189, 248, 0.1)',
                    color: currentPage === totalPages ? '#64748b' : '#38bdf8',
                    border: '1px solid', borderColor: currentPage === totalPages ? 'transparent' : 'rgba(56, 189, 248, 0.3)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
