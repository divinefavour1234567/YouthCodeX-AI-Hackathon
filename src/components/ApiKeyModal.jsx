import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { X, Key, Shield, Eye, EyeOff } from "lucide-react";

export default function ApiKeyModal({ isOpen, onClose }) {
  const { apiKey, setApiKey } = useContext(AppContext);
  const [inputValue, setInputValue] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(inputValue.trim());
    onClose();
  };

  const handleClear = () => {
    setInputValue("");
    setApiKey("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Key className="modal-title-icon" />
            <h3>Gemini API Settings</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <p className="modal-desc">
            To experience real-time, dynamic AI generations, paste your Google Gemini API Key below. Your key is stored locally in your browser and is never sent to any external server (except directly to Google's API).
          </p>

          <div className="input-group-container">
            <label htmlFor="api-key" className="input-label">Gemini API Key</label>
            <div className="input-with-toggle">
              <input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="form-input"
              />
              <button 
                type="button" 
                className="btn-toggle-eye"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="help-box glass-card">
            <Shield size={16} className="help-icon" />
            <div className="help-text">
              <span>Don't have a key?</span>
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer"
                className="help-link"
              >
                Get a free key from Google AI Studio
              </a>
            </div>
          </div>

          <div className="modal-actions">
            {apiKey && (
              <button 
                type="button" 
                className="btn btn-secondary btn-clear"
                onClick={handleClear}
              >
                Clear Key
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={inputValue.trim() === apiKey}
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 5, 8, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 2rem !important;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-title-icon {
          color: var(--accent-secondary);
        }

        .btn-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .btn-close:hover {
          color: var(--accent-danger);
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .modal-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .input-group-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .input-with-toggle {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-toggle .form-input {
          padding-right: 3rem;
        }

        .btn-toggle-eye {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-toggle-eye:hover {
          color: var(--text-primary);
        }

        .help-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem !important;
          background: rgba(99, 102, 241, 0.05) !important;
          border-color: rgba(99, 102, 241, 0.15) !important;
        }

        .help-icon {
          color: var(--accent-primary);
        }

        .help-text {
          font-size: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          font-weight: 500;
        }

        .help-link {
          color: var(--accent-secondary);
          text-decoration: none;
          font-weight: 600;
          transition: border-bottom 0.2s ease;
          border-bottom: 1px dashed transparent;
        }

        .help-link:hover {
          border-bottom-color: var(--accent-secondary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .btn-clear {
          border-color: var(--accent-danger) !important;
          color: var(--accent-danger);
        }

        .btn-clear:hover {
          background: rgba(239, 68, 68, 0.08) !important;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
