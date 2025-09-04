import { useState, useEffect } from "react";
import cashDrawer from "../utils/cashDrawer";

export default function CashDrawerSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [autoOpen, setAutoOpen] = useState(true);

  useEffect(() => {
    checkSupport();
    loadSettings();
  }, []);

  const checkSupport = () => {
    const supported = cashDrawer.isSupported();
    setIsSupported(supported);
    
    if (!supported) {
      setConnectionStatus('Not supported in this browser');
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('cashDrawerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoOpen(settings.autoOpen ?? true);
    }
  };

  const saveSettings = (settings) => {
    localStorage.setItem('cashDrawerSettings', JSON.stringify(settings));
  };

  const handleConnect = async () => {
    if (!isSupported) {
      alert('Cash drawer control is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    setConnecting(true);
    try {
      await cashDrawer.connect();
      setIsConnected(true);
      setConnectionStatus('Connected');
      alert('✅ Cash drawer connected successfully!');
    } catch (error) {
      alert(`❌ Connection failed: ${error.message}`);
      setConnectionStatus(`Connection failed: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await cashDrawer.disconnect();
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleTest = async () => {
    if (!isConnected) {
      alert('Please connect to cash drawer first');
      return;
    }

    setTesting(true);
    try {
      const result = await cashDrawer.testDrawer();
      if (result.success) {
        alert('✅ Cash drawer test successful! The drawer should have opened.');
      } else {
        alert(`❌ Test failed: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleAutoOpenToggle = (enabled) => {
    setAutoOpen(enabled);
    saveSettings({ autoOpen: enabled });
  };

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <h4 className="fw-bold text-dark mb-2">💰 Cash Drawer Settings</h4>
          <p className="text-muted">Connect and configure your cash drawer for automatic opening</p>
        </div>

        {/* Browser Support Check */}
        <div className="mb-4">
          <div className={`alert ${isSupported ? 'alert-success' : 'alert-warning'} border-0`} 
               style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center">
              <span className="fs-4 me-2">
                {isSupported ? '✅' : '⚠️'}
              </span>
              <div>
                <strong>Browser Compatibility:</strong>
                <div className="small">
                  {isSupported 
                    ? 'Your browser supports cash drawer control'
                    : 'Cash drawer control requires Chrome or Edge browser'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card border-0 bg-light" style={{ borderRadius: '12px' }}>
              <div className="card-body text-center p-3">
                <div className={`fs-1 mb-2 ${isConnected ? 'text-success' : 'text-muted'}`}>
                  {isConnected ? '🔗' : '🔌'}
                </div>
                <h6 className="fw-bold mb-1">Connection Status</h6>
                <p className={`small mb-0 ${isConnected ? 'text-success' : 'text-muted'}`}>
                  {connectionStatus}
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 bg-light" style={{ borderRadius: '12px' }}>
              <div className="card-body text-center p-3">
                <div className={`fs-1 mb-2 ${autoOpen ? 'text-primary' : 'text-muted'}`}>
                  ⚙️
                </div>
                <h6 className="fw-bold mb-1">Auto-Open</h6>
                <p className={`small mb-0 ${autoOpen ? 'text-primary' : 'text-muted'}`}>
                  {autoOpen ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Controls */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Hardware Connection</h6>
          <div className="d-grid gap-2 d-md-flex justify-content-md-start">
            {!isConnected ? (
              <button
                className="btn btn-primary btn-lg me-md-2"
                style={{ borderRadius: '12px' }}
                onClick={handleConnect}
                disabled={!isSupported || connecting}
              >
                {connecting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    🔌 Connect Cash Drawer
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-success btn-lg me-md-2"
                  style={{ borderRadius: '12px' }}
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      🧪 Test Drawer
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-secondary btn-lg"
                  style={{ borderRadius: '12px' }}
                  onClick={handleDisconnect}
                >
                  🔌 Disconnect
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Drawer Settings</h6>
          
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoOpenSwitch"
              checked={autoOpen}
              onChange={(e) => handleAutoOpenToggle(e.target.checked)}
            />
            <label className="form-check-label fw-semibold" htmlFor="autoOpenSwitch">
              Auto-open drawer when creating cash orders
            </label>
            <div className="form-text">
              When enabled, the cash drawer will automatically open when you complete a cash order
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="alert alert-info border-0" style={{ borderRadius: '12px' }}>
          <h6 className="fw-bold mb-2">📋 Setup Instructions:</h6>
          <ol className="mb-0 small">
            <li><strong>Connect Hardware:</strong> Plug your cash drawer into a USB port or connect via serial cable</li>
            <li><strong>Browser Permission:</strong> Click "Connect" and select your cash drawer from the list</li>
            <li><strong>Test Connection:</strong> Use the "Test Drawer" button to verify it opens correctly</li>
            <li><strong>Start Using:</strong> The drawer will now open automatically when you process cash orders</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="mt-3">
          <details>
            <summary className="fw-semibold text-primary" style={{ cursor: 'pointer' }}>
              🔧 Troubleshooting Tips
            </summary>
            <div className="mt-2 small text-muted">
              <ul>
                <li><strong>Drawer not listed:</strong> Ensure it's properly connected and powered on</li>
                <li><strong>Connection fails:</strong> Try a different USB port or restart your browser</li>
                <li><strong>Drawer doesn't open:</strong> Check that it's not locked or jammed</li>
                <li><strong>No response:</strong> Some drawers need specific ESC/POS commands - contact support</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}