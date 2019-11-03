import { Injectable } from '@angular/core';

@Injectable()
export class EditorTemplateService {

  public JS_STARTER = `
		console.log('HELLO WORLD!');
	`;

  public HTML_STARTER = `
		<h1>CODEwME</h1>
		<p>By: Evan Lindsey</p>
	`;

  public CSS_STARTER = `
		body {
			background-color: #ffffff;
		}
	`;

  public codeResult(jsCode: string, htmlCode: string, cssCode: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <style>
            ${cssCode}
          </style>
          <script>
            try {
              console.log = (msg) => {
                window.parent.postMessage('CONSOLE: ' + msg, '*');
              };
              ${jsCode}
            } catch (err) {
              window.parent.postMessage('ERROR: ' + err.message, '*');
            }
          </script>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
  }

}
