import React from "react";

interface MarkdownRendererProps {
  content: string;
}

// 简单的Markdown渲染器
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 处理代码块 ```code```
  const renderCodeBlocks = (text: string) => {
    const codeBlockRegex = /```([a-z]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // 添加代码块前的文本
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>
            {renderInlineElements(text.slice(lastIndex, match.index))}
          </span>
        );
      }

      const language = match[1] || "plaintext";
      const code = match[2];

      // 添加代码块
      elements.push(
        <pre
          key={`code-${match.index}`}
          style={{
            backgroundColor: "#f6f8fa",
            padding: "16px",
            borderRadius: "6px",
            overflow: "auto",
            fontFamily: "monospace",
            fontSize: "14px",
            margin: "8px 0",
          }}
        >
          <code
            style={{
              display: "block",
              whiteSpace: "pre",
              color: "#333",
            }}
          >
            {code}
          </code>
          {language && (
            <div
              style={{
                position: "relative",
                top: "-5px",
                right: "0",
                fontSize: "12px",
                color: "#666",
                textAlign: "right",
              }}
            >
              {language}
            </div>
          )}
        </pre>
      );

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余文本
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>{renderInlineElements(text.slice(lastIndex))}</span>
      );
    }

    return elements;
  };

  // 处理内联元素 **bold**, *italic*, `code`
  const renderInlineElements = (text: string) => {
    // 处理加粗 **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 处理斜体 *italic*
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // 处理行内代码 `code`
    text = text.replace(/`(.*?)`/g, "<code>$1</code>");

    // 处理链接 [text](url)
    text = text.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // 处理表格
    if (text.includes("|")) {
      const lines = text.split("\n");
      const tableLines = [];
      let isTable = false;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i]);
          isTable = true;
        } else if (isTable) {
          // 表格结束
          break;
        }
      }

      if (tableLines.length >= 2) {
        // 有表头和分隔行，可能是表格
        const tableHtml = renderTable(tableLines);
        if (tableHtml) {
          text = text.replace(tableLines.join("\n"), tableHtml);
        }
      }
    }

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  // 处理表格
  const renderTable = (tableLines: string[]) => {
    if (tableLines.length < 3) return null; // 至少需要表头、分隔行和一行数据

    // 检查第二行是否为分隔行
    const separatorLine = tableLines[1].trim();
    if (!/^\|[-: |]+\|$/.test(separatorLine)) return null;

    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';

    // 添加表头
    const headers = tableLines[0]
      .split("|")
      .filter(cell => cell.trim() !== "")
      .map(cell => cell.trim());

    tableHtml += "<thead><tr>";
    headers.forEach(header => {
      tableHtml += `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${header}</th>`;
    });
    tableHtml += "</tr></thead>";

    // 添加表格内容
    tableHtml += "<tbody>";
    for (let i = 2; i < tableLines.length; i++) {
      const rowCells = tableLines[i]
        .split("|")
        .filter(cell => cell.trim() !== "")
        .map(cell => cell.trim());

      tableHtml += "<tr>";
      rowCells.forEach(cell => {
        tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
      });
      tableHtml += "</tr>";
    }
    tableHtml += "</tbody></table>";

    return tableHtml;
  };

  // 处理标题 # Heading
  const processHeadings = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let currentText = "";

    lines.forEach((line, index) => {
      if (/^#{1,6}\s/.test(line)) {
        // 如果有累积的文本，先处理它
        if (currentText) {
          elements.push(<div key={`text-${index}`}>{renderCodeBlocks(currentText)}</div>);
          currentText = "";
        }

        // 处理标题
        const match = line.match(/^(#{1,6})\s(.*)/);
        if (match) {
          const level = match[1].length;
          const content = match[2];

          let fontSize;
          const fontWeight = "bold";
          const margin = "16px 0 8px 0";

          switch (level) {
            case 1:
              fontSize = "24px";
              break;
            case 2:
              fontSize = "22px";
              break;
            case 3:
              fontSize = "20px";
              break;
            case 4:
              fontSize = "18px";
              break;
            case 5:
              fontSize = "16px";
              break;
            default:
              fontSize = "14px";
              break;
          }

          elements.push(
            <div key={`heading-${index}`} style={{ fontSize, fontWeight, margin }}>
              {renderInlineElements(content)}
            </div>
          );
        }
      } else {
        // 累积普通文本
        currentText += line + "\n";
      }
    });

    // 处理最后累积的文本
    if (currentText) {
      elements.push(<div key="text-last">{renderCodeBlocks(currentText)}</div>);
    }

    return elements;
  };

  return <div>{processHeadings(content)}</div>;
};

export default MarkdownRenderer;
