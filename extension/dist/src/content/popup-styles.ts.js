export function getPopupStyles() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }

    .popup {
      width: 360px;
      background: #ffffff;
      border: 0.5px solid rgba(0,0,0,0.12);
      border-radius: 12px;
      overflow: hidden;
      font-size: 13px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }

    @media (prefers-color-scheme: dark) {
      .popup { background: #1e1e1e; border-color: rgba(255,255,255,0.12); color: #e0e0e0; }
      .popup-header { border-color: rgba(255,255,255,0.08); }
      .tab { border-color: rgba(255,255,255,0.12); }
      .tab.active { background: rgba(255,255,255,0.08); }
      .popup-footer { border-color: rgba(255,255,255,0.08); }
      .btn-dismiss { border-color: rgba(255,255,255,0.2); }
      .suggested-prompt { background: rgba(255,255,255,0.06); }
    }

    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 0.5px solid rgba(0,0,0,0.08);
      cursor: pointer;
      user-select: none;
    }

    .popup-header-left { display: flex; align-items: center; gap: 8px; }

    .badge {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 99px;
    }
    .badge-success { background: #EAF3DE; color: #3B6D11; }
    .badge-warn    { background: #FAEEDA; color: #854F0B; }

    .header-actions { display: flex; gap: 4px; }

    .tab-row { display: flex; gap: 4px; padding: 8px 14px; }
    .tab {
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 99px;
      border: 0.5px solid rgba(0,0,0,0.12);
      background: none;
      cursor: pointer;
      color: inherit;
    }
    .tab.active { background: rgba(0,0,0,0.06); }

    .popup-body {
      padding: 12px 14px;
      line-height: 1.6;
      max-height: 180px;
      overflow-y: auto;
    }

    .suggested-prompt {
      background: rgba(0,0,0,0.04);
      border-left: 2px solid #1D9E75;
      border-radius: 0 8px 8px 0;
      padding: 10px 12px;
      font-style: italic;
    }

    .popup-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 10px 14px;
      border-top: 0.5px solid rgba(0,0,0,0.08);
    }

    .btn-dismiss {
      background: none;
      border: 0.5px solid rgba(0,0,0,0.2);
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 12px;
      cursor: pointer;
      color: inherit;
    }
    .btn-apply {
      background: #1D9E75;
      border: none;
      border-radius: 6px;
      padding: 5px 12px;
      font-size: 12px;
      color: white;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-apply:hover { background: #178a64; }
    .btn-dismiss:hover { background: rgba(0,0,0,0.04); }

    .collapsed .popup-body,
    .collapsed .popup-footer,
    .collapsed .tab-row { display: none; }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      padding: 2px 4px;
      font-size: 12px;
      line-height: 1;
      border-radius: 4px;
    }
    .icon-btn:hover { background: rgba(0,0,0,0.06); }
  `;
}
