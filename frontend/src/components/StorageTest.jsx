import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function StorageTest() {
  const [testResults, setTestResults] = useState([]);

  const testBuckets = async () => {
    const results = [];
    
    // Test each bucket
    const buckets = ['vendor-logos', 'vendor-banners', 'menu-images'];
    
    for (const bucketName of buckets) {
      try {
        // Test bucket access
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (error) {
          results.push({
            bucket: bucketName,
            status: 'ERROR',
            message: error.message
          });
        } else {
          results.push({
            bucket: bucketName,
            status: 'OK',
            message: 'Bucket accessible'
          });
        }
      } catch (error) {
        results.push({
          bucket: bucketName,
          status: 'ERROR',
          message: error.message
        });
      }
    }
    
    setTestResults(results);
  };

  const testUpload = async (bucketName) => {
    try {
      // Create a small test file
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const fileName = `test_${Date.now()}.txt`;
      
      // Try upload
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, testFile);
      
      if (error) {
        alert(`Upload test failed for ${bucketName}: ${error.message}`);
      } else {
        alert(`Upload test successful for ${bucketName}!`);
        
        // Clean up - delete the test file
        await supabase.storage
          .from(bucketName)
          .remove([fileName]);
      }
    } catch (error) {
      alert(`Upload test error for ${bucketName}: ${error.message}`);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5>🧪 Storage Bucket Test</h5>
        </div>
        <div className="card-body">
          <button className="btn btn-primary mb-3" onClick={testBuckets}>
            Test All Buckets
          </button>
          
          {testResults.length > 0 && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Bucket</th>
                    <th>Status</th>
                    <th>Message</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index}>
                      <td><code>{result.bucket}</code></td>
                      <td>
                        <span className={`badge ${result.status === 'OK' ? 'bg-success' : 'bg-danger'}`}>
                          {result.status}
                        </span>
                      </td>
                      <td>{result.message}</td>
                      <td>
                        {result.status === 'OK' && (
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => testUpload(result.bucket)}
                          >
                            Test Upload
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-4">
            <h6>How to create missing buckets:</h6>
            <ol>
              <li>Go to your <strong>Supabase Dashboard</strong></li>
              <li>Click <strong>"Storage"</strong> in the left sidebar</li>
              <li>Click <strong>"New bucket"</strong></li>
              <li>Create these buckets (make them <strong>public</strong>):
                <ul>
                  <li><code>vendor-logos</code></li>
                  <li><code>vendor-banners</code></li>
                  <li><code>menu-images</code></li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}