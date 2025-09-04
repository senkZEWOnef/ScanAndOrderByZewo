// Cash Drawer Control Utility
// Supports Web Serial API for modern browsers

class CashDrawerController {
  constructor() {
    this.port = null;
    this.isConnected = false;
    this.settings = {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none'
    };
  }

  // Check if Web Serial API is supported
  isSupported() {
    return 'serial' in navigator;
  }

  // Connect to cash drawer
  async connect() {
    if (!this.isSupported()) {
      throw new Error('Web Serial API not supported in this browser. Please use Chrome or Edge.');
    }

    try {
      // Request port selection from user
      this.port = await navigator.serial.requestPort({
        filters: [
          // Common cash drawer vendor IDs
          { usbVendorId: 0x04b8 }, // Epson
          { usbVendorId: 0x0425 }, // Citizen
          { usbVendorId: 0x154f }, // POS-X
          { usbVendorId: 0x0dd4 }, // Voltcraft
        ]
      });

      // Open the connection
      await this.port.open(this.settings);
      this.isConnected = true;
      
      console.log('Cash drawer connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to cash drawer:', error);
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  // Disconnect from cash drawer
  async disconnect() {
    if (this.port && this.isConnected) {
      try {
        await this.port.close();
        this.isConnected = false;
        this.port = null;
        console.log('Cash drawer disconnected');
      } catch (error) {
        console.error('Error disconnecting cash drawer:', error);
      }
    }
  }

  // Send ESC/POS command to open cash drawer
  async openDrawer() {
    if (!this.isConnected || !this.port) {
      throw new Error('Cash drawer not connected');
    }

    try {
      const writer = this.port.writable.getWriter();
      
      // ESC/POS command to open cash drawer
      // ESC p m t1 t2 (0x1B 0x70 0x00 0x19 0x19)
      // m = pin number (0 = pin 2, 1 = pin 5)
      // t1 = on time (25ms units)  
      // t2 = off time (25ms units)
      const openCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0x19]);
      
      await writer.write(openCommand);
      await writer.close();
      
      console.log('Cash drawer opened');
      return true;
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
      throw new Error(`Failed to open drawer: ${error.message}`);
    }
  }

  // Alternative command for different drawer types
  async openDrawerAlternative() {
    if (!this.isConnected || !this.port) {
      throw new Error('Cash drawer not connected');
    }

    try {
      const writer = this.port.writable.getWriter();
      
      // Alternative ESC/POS command (ESC p 0 100 100)
      const openCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x64, 0x64]);
      
      await writer.write(openCommand);
      await writer.close();
      
      console.log('Cash drawer opened (alternative command)');
      return true;
    } catch (error) {
      console.error('Failed to open cash drawer with alternative command:', error);
      throw error;
    }
  }

  // Test drawer connection and functionality
  async testDrawer() {
    try {
      await this.openDrawer();
      return { success: true, message: 'Cash drawer test successful' };
    } catch (error) {
      // Try alternative command
      try {
        await this.openDrawerAlternative();
        return { success: true, message: 'Cash drawer test successful (alternative command)' };
      } catch (altError) {
        return { 
          success: false, 
          message: `Test failed: ${error.message}` 
        };
      }
    }
  }

  // Get connection status
  getStatus() {
    return {
      isSupported: this.isSupported(),
      isConnected: this.isConnected,
      port: this.port ? 'Connected' : 'Not connected'
    };
  }
}

// Create singleton instance
const cashDrawer = new CashDrawerController();

export default cashDrawer;