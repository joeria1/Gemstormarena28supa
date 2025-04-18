import React, { useState, useEffect } from 'react';
import { 
  testAllSounds, 
  testPlaySound, 
  detectPlaceholders,
  enhancedPlaySound
} from '../utils/soundTestUtility';
import gameSoundPaths from '../utils/gameSounds';

interface SoundTestResult {
  path: string;
  name: string;
  status: 'success' | 'failed' | 'placeholder' | 'untested';
}

const SoundTester: React.FC = () => {
  const [testResults, setTestResults] = useState<SoundTestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  
  // Initialize the test results with all available sounds
  useEffect(() => {
    const initialResults: SoundTestResult[] = Object.entries(gameSoundPaths).map(([name, path]) => ({
      path,
      name,
      status: 'untested'
    }));
    
    // Add cashout explicitly
    initialResults.push({
      path: '/sounds/cashout.mp3',
      name: 'cashout (direct)',
      status: 'untested'
    });
    
    setTestResults(initialResults);
  }, []);
  
  // Run sound tests
  const runSoundTests = async () => {
    setIsLoading(true);
    
    // First, detect placeholders
    const detectedPlaceholders = await detectPlaceholders();
    setPlaceholders(detectedPlaceholders);
    
    // Update UI with placeholder results
    setTestResults(prev => 
      prev.map(result => ({
        ...result,
        status: detectedPlaceholders.includes(result.path) ? 'placeholder' : result.status
      }))
    );
    
    // Run actual sound tests
    const { success, failed } = await testAllSounds();
    
    // Update test results
    setTestResults(prev => 
      prev.map(result => {
        if (success.includes(result.path)) {
          return { ...result, status: 'success' };
        } else if (failed.includes(result.path)) {
          return { ...result, status: 'failed' };
        }
        return result;
      })
    );
    
    setIsLoading(false);
    setTestCompleted(true);
  };
  
  // Play a specific sound for testing
  const playSingleSound = async (path: string) => {
    await enhancedPlaySound(path, 0.5);
  };
  
  // Get status icon based on result
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="text-green-500">✅</span>;
      case 'failed':
        return <span className="text-red-500">❌</span>;
      case 'placeholder':
        return <span className="text-yellow-500">⚠️</span>;
      default:
        return <span className="text-gray-400">⬜</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sound Test Utility</h1>
      
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Testing Tools</h2>
        <p className="mb-4 text-slate-300">
          This utility helps you test all game sounds to ensure they're working correctly.
          It will also detect placeholder sound files that need to be replaced with real sound files.
        </p>
        
        <button
          onClick={runSoundTests}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mr-4 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test All Sounds'}
        </button>
        
        {/* Quick test buttons for specific sounds */}
        <button
          onClick={() => enhancedPlaySound('/sounds/mine-explosion.mp3', 0.8)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md mr-2"
        >
          Test Mine Explosion
        </button>
        
        <button
          onClick={() => enhancedPlaySound('/sounds/cashout.mp3', 0.8)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
        >
          Test Cashout
        </button>
        
        {testCompleted && (
          <div className="mt-4">
            <p className="text-green-400">
              ✅ Working sounds: {testResults.filter(r => r.status === 'success').length}
            </p>
            <p className="text-red-400">
              ❌ Failed sounds: {testResults.filter(r => r.status === 'failed').length}
            </p>
            <p className="text-yellow-400">
              ⚠️ Placeholder sounds: {placeholders.length}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Sound Files</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-slate-900 rounded-lg overflow-hidden">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Sound Name</th>
                <th className="px-4 py-2 text-left">Path</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900'}>
                  <td className="px-4 py-2">
                    {getStatusIcon(result.status)}
                  </td>
                  <td className="px-4 py-2">{result.name}</td>
                  <td className="px-4 py-2 font-mono text-sm">{result.path}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => playSingleSound(result.path)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-2 rounded"
                    >
                      Play
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {placeholders.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Placeholder Sounds Detected</h3>
            <p className="text-slate-300 mb-4">
              The following sound files appear to be placeholders. Replace them with real sound files in the <code className="bg-slate-700 px-1 rounded">public/sounds/</code> directory:
            </p>
            <ul className="list-disc pl-5 text-yellow-300 space-y-1">
              {placeholders.map((path, index) => (
                <li key={index}>
                  <code className="font-mono bg-slate-700 px-1 rounded">{path}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">How to Replace Sound Files</h3>
          <ol className="list-decimal pl-5 text-slate-300 space-y-2">
            <li>Prepare your MP3 sound files</li>
            <li>Place them in the <code className="bg-slate-700 px-1 rounded">public/sounds/</code> directory</li>
            <li>Make sure the filenames match exactly what's shown in the Path column</li>
            <li>Run the sound test again to verify they're working</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SoundTester; 