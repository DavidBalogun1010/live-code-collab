// Python execution using Pyodide (WebAssembly)
let pyodide: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

export const loadPyodide = async (): Promise<any> => {
  if (pyodide) return pyodide;
  
  if (isLoading && loadPromise) {
    return loadPromise;
  }
  
  isLoading = true;
  
  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // Load Pyodide from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      script.async = true;
      
      script.onload = async () => {
        try {
          // @ts-ignore - Pyodide is loaded globally
          pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          });
          isLoading = false;
          resolve(pyodide);
        } catch (e) {
          isLoading = false;
          reject(e);
        }
      };
      
      script.onerror = () => {
        isLoading = false;
        reject(new Error('Failed to load Pyodide'));
      };
      
      document.head.appendChild(script);
    } catch (e) {
      isLoading = false;
      reject(e);
    }
  });
  
  return loadPromise;
};

export const executePython = async (code: string): Promise<{ output: string; error: string | null }> => {
  try {
    const py = await loadPyodide();
    
    // Capture stdout/stderr
    py.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.stdout = StringIO()
        self.stderr = StringIO()
        
    def get_output(self):
        return self.stdout.getvalue(), self.stderr.getvalue()
        
    def clear(self):
        self.stdout = StringIO()
        self.stderr = StringIO()

_output_capture = OutputCapture()
sys.stdout = _output_capture.stdout
sys.stderr = _output_capture.stderr
    `);
    
    // Execute user code with timeout
    const timeoutMs = 5000;
    const startTime = Date.now();
    
    let result: any;
    try {
      result = py.runPython(code);
    } catch (e: any) {
      // Get any partial output before error
      const [stdout, stderr] = py.runPython('_output_capture.get_output()').toJs();
      py.runPython('_output_capture.clear()');
      
      const errorMsg = e.message || String(e);
      const cleanError = errorMsg.replace(/^PythonError:\s*/, '');
      
      return {
        output: stdout || '',
        error: cleanError,
      };
    }
    
    if (Date.now() - startTime > timeoutMs) {
      return {
        output: '',
        error: 'Execution timed out (5s limit)',
      };
    }
    
    // Get captured output
    const [stdout, stderr] = py.runPython('_output_capture.get_output()').toJs();
    py.runPython('_output_capture.clear()');
    
    let output = stdout || '';
    if (result !== undefined && result !== null) {
      const resultStr = py.runPython(`repr(${code.split('\n').pop()})`);
      if (resultStr && resultStr !== 'None') {
        output += (output ? '\n' : '') + `→ ${result}`;
      }
    }
    
    if (stderr) {
      output += (output ? '\n' : '') + `⚠️ ${stderr}`;
    }
    
    return {
      output: output.trim() || 'Code executed successfully (no output)',
      error: null,
    };
  } catch (error) {
    return {
      output: '',
      error: error instanceof Error ? error.message : 'Failed to execute Python code',
    };
  }
};

export const isPyodideLoaded = (): boolean => {
  return pyodide !== null;
};

export const isPyodideLoading = (): boolean => {
  return isLoading;
};
