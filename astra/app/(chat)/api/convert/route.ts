// app/api/convert/route.ts
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import htmlToDocx from 'html-to-docx';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

export async function POST(req: Request) {
  const { markdown, extention } = await req.json();

  // convert Markdown to HTML
  const file = await unified().use(remarkParse).use(remarkHtml).process(markdown);
  var fileBuffer = null;
  if (extention === 'pdf') {
    const styledHtml = `
      <style>
        body { font-family: Arial; line-height: 1.6; padding: 20px; }
        h1 { color: #2d3748; }
        code { background: #f0f0f0; padding: 2px 4px; }
      </style>
      ${String(file)}
    `;

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(styledHtml);
    fileBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
  } else {
    fileBuffer = await htmlToDocx(String(file));
  }

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename=converted.docx'
    }
  });
}