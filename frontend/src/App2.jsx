import { useState } from 'react';

// Generate color swatches based on color season
const getColorPalette = (season) => {
  const palettes = {
    'bright spring': ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FFA502', '#FF4757', '#00D2D3', '#FEC02F', '#EA2C62'],
    'light spring': ['#FFB6C1', '#98D8C8', '#FFFACD', '#FFE4B5', '#FFD1DC', '#B2DFDB', '#FFF8DC', '#FFCCCB'],
    'bright winter': ['#FF0080', '#00BFA5', '#FFD600', '#FF1744', '#00E676', '#651FFF', '#00B8D4', '#C51162'],
    'dark winter': ['#880E4F', '#1A237E', '#B71C1C', '#4A148C', '#006064', '#263238', '#3E2723', '#212121'],
    'soft summer': ['#D8BFD8', '#B0C4DE', '#DDA0DD', '#9370DB', '#8FBC8F', '#BC8F8F', '#F0E68C', '#D3D3D3'],
    'light summer': ['#E6E6FA', '#F0F8FF', '#FFF0F5', '#F5FFFA', '#F0FFF0', '#F5F5DC', '#FFFAF0', '#FFF5EE'],
    'soft autumn': ['#CD853F', '#DEB887', '#D2691E', '#BC8F8F', '#8B7355', '#A0522D', '#D2B48C', '#F4A460'],
    'dark autumn': ['#8B4513', '#A52A2A', '#800000', '#696969', '#483D8B', '#2F4F4F', '#8B0000', '#556B2F'],
    'default': ['#E5E5E5', '#CCCCCC', '#B3B3B3', '#999999', '#808080', '#666666', '#4D4D4D', '#333333']
  };
  
  const normalizedSeason = season?.toLowerCase() || 'default';
  return palettes[normalizedSeason] || palettes['default'];
};

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
        setError('Please upload a JPG or PNG image');
        return;
      }
      setError('');
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'}}>
      {/* ULTRA PREMIUM HEADER */}
      <div className="sticky top-0 z-50" style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)'
      }}>
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #6b7280 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ✨ Kibbe & Color Analysis
              </h1>
              <p className="text-slate-600 mt-2 font-medium">AI-powered style archetype and color palette discovery</p>
            </div>
            <div className="flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-emerald-700">AI POWERED</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="max-w-2xl mx-auto">
          
          {/* PREMIUM UPLOAD */}
          <div className="mb-16">
            <div
              className="relative overflow-hidden rounded-3xl p-12 text-center transition-all duration-500 hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                border: '2px dashed rgba(148,163,184,0.5)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
              }}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="absolute inset-0 opacity-20" style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, transparent 50%, #e2e8f0 100%)'
              }}></div>
              
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer block relative z-10">
                {preview ? (
                  <div className="space-y-6">
                    <div className="relative inline-block">
                      <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-2xl shadow-2xl" style={{
                        border: '3px solid rgba(255,255,255,0.8)'
                      }} />
                      <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                        ✓ READY
                      </div>
                    </div>
                    <p className="text-slate-700 font-semibold text-lg">{file.name}</p>
                  </div>
                ) : (
                  <div className="py-12">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-transform duration-300 hover:scale-110" style={{
                      background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}>
                      <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mb-4">Upload Your Photo</div>
                    <div className="text-slate-600 mb-6 text-lg">
                      Drag and drop your image here, or click to select
                    </div>
                    <div className="flex justify-center space-x-8 text-sm text-slate-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <span>JPG, PNG supported</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <span>Max 5MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="mt-8 p-6 rounded-2xl" style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)'
              }}>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
                  <p className="text-red-700 font-semibold text-lg">{error}</p>
                </div>
              </div>
            )}

            {file && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="relative px-12 py-5 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:hover:scale-100"
                  style={{
                    background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                    color: loading ? '#94a3b8' : 'white',
                    boxShadow: loading ? 'none' : '0 20px 40px rgba(31,41,55,0.3)',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>ANALYZING YOUR STYLE...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span>✨ BEGIN ANALYSIS</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* PREMIUM RESULTS */}
          {results && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-3 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-200 mb-6">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-emerald-700 text-lg">ANALYSIS COMPLETE</span>
                </div>
                <h2 className="text-4xl font-bold text-slate-800">Your Personal Style Profile</h2>
              </div>

              <div className="space-y-8">
                {/* Kibbe Archetype */}
                <div className="p-10 rounded-3xl transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}>
                  <div className="flex items-start space-x-6">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 mt-2" style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    }}></div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">Kibbe Body Archetype</h3>
                      <p className="text-5xl font-black mb-4" style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {results.kibbe_archetype}
                      </p>
                      <div className="w-24 h-2 rounded-full" style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      }}></div>
                    </div>
                  </div>
                </div>

                {/* Color Season */}
                <div className="p-10 rounded-3xl transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}>
                  <div className="flex items-start space-x-6">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 mt-2" style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                    }}></div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">Seasonal Color Type</h3>
                      <p className="text-5xl font-black mb-4" style={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {results.color_season}
                      </p>
                      <div className="w-24 h-2 rounded-full" style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      }}></div>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="p-10 rounded-3xl transition-all duration-300 hover:scale-[1.02]" style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
                }}>
                  <div className="flex items-start space-x-6">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 mt-2" style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}></div>
                    <div className="w-full">
                      <h3 className="text-2xl font-bold text-slate-800 mb-6">Your Signature Color Palette</h3>
                      <div className="grid grid-cols-4 gap-4 mb-8">
                        {getColorPalette(results.color_season).map((color, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-2xl transition-all duration-300 hover:scale-110 hover:rotate-3 cursor-pointer"
                            style={{ 
                              backgroundColor: color,
                              boxShadow: `0 10px 30px ${color}40`,
                              border: '3px solid rgba(255,255,255,0.8)'
                            }}
                            title={color}
                          ></div>
                        ))}
                      </div>
                      <div className="p-6 rounded-2xl" style={{
                        background: 'rgba(248,250,252,0.8)',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <p className="text-slate-700 text-lg leading-relaxed font-medium">{results.palette_description}</p>
                      </div>
                      <div className="w-24 h-2 rounded-full mt-6" style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;