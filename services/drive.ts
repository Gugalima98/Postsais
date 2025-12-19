// Helper to convert Markdown to basic HTML for Google Docs
export const convertMarkdownToHtml = (markdown: string, title: string) => {
    let html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n/gim, '<br>');
  
    return `
      <html>
        <head><meta charset='utf-8'><title>${title}</title></head>
        <body style="font-family: Arial; font-size: 11pt;">
          ${html}
        </body>
      </html>
    `;
  };
  
  export const uploadToDrive = async (accessToken: string, title: string, htmlContent: string) => {
    const metadata = {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
    };
  
    const multipart = [
      '--foo_bar_baz',
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      '--foo_bar_baz',
      'Content-Type: text/html',
      '',
      htmlContent,
      '--foo_bar_baz--',
    ].join('\r\n');
  
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary=foo_bar_baz',
      },
      body: multipart,
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Falha no upload para o Google Drive');
    }
  
    return await response.json(); // Returns { id, webViewLink }
  };