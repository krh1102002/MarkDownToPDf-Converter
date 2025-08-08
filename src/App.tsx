import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import html2pdf from "html2pdf.js";
import { FileText, Download, Eye, Palette, Zap } from "lucide-react";

function App() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown to PDF Converter

This is a **powerful** tool that converts your *Markdown* content to PDF with custom styling.

## Features

- Real-time preview
- Custom CSS support
- Professional styling
- PDF generation

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### List Example

1. First item
2. Second item
3. Third item

- Bullet point one
- Bullet point two
- Bullet point three

> This is a blockquote with important information.

[Learn more about Markdown](https://www.markdownguide.org/)
`);

  const [customCSS, setCustomCSS] = useState(`/* Add your custom CSS here */
.markdown-body {
  font-family: Barlow, sans-serif;
  line-height: 1.6;
  padding: 20px;
  margin: 0;
}

.markdown-header {
  font-size: 2.2em;
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
  margin: 1.5rem 0;
}

.markdown-body h2.markdown-header {
  font-size: 1.8em;
  color: #34495e;
  margin: 1.5rem 0;
}

.markdown-body h3.markdown-header {
  font-size: 1.4em;
  color: #455a64;
}

.markdown-paragraph {
  margin-bottom: 1rem;
  text-align: justify;
}

.markdown-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.markdown-list li {
  margin-bottom: 0.5rem;
}

.markdown-body blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
}

.markdown-body pre {
  background: #2d2d2d;
  border-radius: 4px;
  margin: 0.5em 0;
  padding: 1rem;
  overflow-x: auto;
}

.markdown-body code {
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  color: #e83e8c;
}

:not(pre) > code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
}

.markdown-body img {
  max-width: 100%;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #ddd;
  padding: 8px;
}

.markdown-body th {
  background-color: #f4f4f4;
}

/* Highlight React hooks in pink like the image */
.markdown-body .highlight-hook {
  color: #e83e8c;
  font-weight: bold;
}
`);

  const [htmlContent, setHtmlContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const defaultCSS = `
    .markdown-body {
      max-width: 100%;
      margin: 0 auto;
      padding: 20px;
      font-family: Barlow, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }

    .markdown-header {
      font-size: 2.2em;
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 0.5rem;
      margin: 1.5rem 0;
    }

    .markdown-body h2.markdown-header {
      font-size: 1.8em;
      color: #34495e;
      margin: 1.5rem 0;
    }

    .markdown-body h3.markdown-header {
      font-size: 1.4em;
      color: #455a64;
    }

    .markdown-paragraph {
      margin-bottom: 1rem;
      text-align: justify;
    }

    .markdown-list {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    .markdown-list li {
      margin-bottom: 0.5rem;
    }

    .markdown-body blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin-left: 0;
      color: #666;
    }

    .markdown-body pre {
      background: #2d2d2d;
      border-radius: 4px;
      margin: 0.5em 0;
      padding: 1rem;
      overflow-x: auto;
    }

    .markdown-body code {
      font-family: 'Fira Code', Consolas, Monaco, monospace;
      color: #e83e8c;
    }

    :not(pre) > code {
      background: #f0f0f0;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .markdown-body img {
      max-width: 100%;
    }

    .markdown-body table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }

    .markdown-body th,
    .markdown-body td {
      border: 1px solid #ddd;
      padding: 8px;
    }

    .markdown-body th {
      background-color: #f4f4f4;
    }

    /* Highlight React hooks */
    .markdown-body .highlight-hook {
      color: #e83e8c;
      font-weight: bold;
    }
  `;

  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      highlight: (code) => {
        // Highlight React hooks in the code
        return code
          .replace(/\b(useState|useEffect|useRef|useContext|useReducer)\b/g, '<span class="highlight-hook">$1</span>');
      },
    });
  }, []);

  useEffect(() => {
    const convertMarkdown = async () => {
      try {
        let html = await marked(markdown);

        html = html
          .replace(/<h([1-6])>/g, '<h$1 class="markdown-header">')
          .replace(/<p>/g, '<p class="markdown-paragraph">')
          .replace(/<ul>/g, '<ul class="markdown-list">')
          .replace(/<ol>/g, '<ol class="markdown-list">');

        setHtmlContent(html);
      } catch (error) {
        console.error("Error parsing markdown:", error);
      }
    };

    convertMarkdown();
  }, [markdown]);

  const generatePDF = async () => {
    if (!previewRef.current) return;

    setIsGenerating(true);

    try {
      const tempContainer = document.createElement("div");
      tempContainer.className = "markdown-body";
      tempContainer.innerHTML = htmlContent;

      const styleElement = document.createElement("style");
      styleElement.textContent = `
        ${defaultCSS}
        ${customCSS}
      `;

      const tempDoc = document.createElement("div");
      tempDoc.appendChild(styleElement);
      tempDoc.appendChild(tempContainer);

      const options = {
        margin: [20, 20, 20, 20],
        filename: "markdown-document.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 800,
          height: tempContainer.scrollHeight + 100,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(options).from(tempDoc).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;

    setIsGenerating(true);

    try {
      const tempContainer = document.createElement("div");
      tempContainer.className = "markdown-body";
      tempContainer.innerHTML = htmlContent;

      const styleElement = document.createElement("style");
      styleElement.textContent = `
        ${defaultCSS}
        ${customCSS}
      `;

      const tempDoc = document.createElement("div");
      tempDoc.appendChild(styleElement);
      tempDoc.appendChild(tempContainer);

      const options = {
        margin: [20, 20, 20, 20],
        filename: "markdown-document.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 800,
          height: tempContainer.scrollHeight + 100,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      const pdf = await html2pdf().set(options).from(tempDoc).outputPdf("blob");
      const url = URL.createObjectURL(pdf);
      const a = document.createElement("a");
      a.href = url;
      a.download = "markdown-document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Markdown to PDF
              </h1>
              <p className="text-sm text-purple-600">
                Convert your Markdown with elegant styling
              </p>
            </div>
            <div className="space-x-4">
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Markdown Input
                  </h2>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Enter your Markdown content here..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Custom CSS Input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Custom CSS
                  </h2>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  placeholder="Add your custom CSS styles here..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Live Preview
                </h2>
              </div>
            </div>
            <div className="h-[600px] overflow-auto">
              <div
                ref={previewRef}
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{
                  minHeight: "100%",
                  background: "white",
                }}
              />
              <style
                dangerouslySetInnerHTML={{
                  __html: `${defaultCSS}\n${customCSS}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Available CSS Classes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                .markdown-body
              </code>
              <p className="text-blue-700 mt-1">Main container</p>
            </div>
            <div>
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                .markdown-header
              </code>
              <p className="text-blue-700 mt-1">All headings (h1-h6)</p>
            </div>
            <div>
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                .markdown-paragraph
              </code>
              <p className="text-blue-700 mt-1">Paragraph text</p>
            </div>
            <div>
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                .markdown-list
              </code>
              <p className="text-blue-700 mt-1">Ordered & unordered lists</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;