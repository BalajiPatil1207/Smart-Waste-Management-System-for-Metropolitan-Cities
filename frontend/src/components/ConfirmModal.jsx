import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <AlertTriangle size={48} color="#f87171" style={{ marginBottom: '1rem' }} />
                <h3>Logout Confirmation</h3>
                <p>Are you sure you want to log out from the dashboard?</p>
                
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-confirm" onClick={() => { onConfirm(); onClose(); }}>Yes, Logout</button>
                </div>
            </div>
        </div>,
        document.body
    );
}
