import parse from './Markdown.js';


const mdTest = /(^#{1,6}\s)|(^\s*[-*+]\s)|(^\s*\d+\.\s)|(\*\*.*?\*\*)|(__.*?__)|(\*.*?\*)|(_.*?_)|(!?\[.*?\]\(.*?\))|(^>\s)|(`[^`]+`)|(^-{3,}$)/m;

/**
 * 
 * @param {srting} html 
 * @returns Document
 */
export const parseHtml = (html) => {

  // Détecte du Markdown avant de parser
  if (mdTest.test(html)) {
    html = parse(html);
  }

  if (typeof DOMParser === 'undefined') {
    const doc = document.implementation?.createHTMLDocument
      ? document.implementation.createHTMLDocument('')
      : document;
    doc.body.innerHTML = html || '';
    return doc;
  }
  try {
    return new DOMParser().parseFromString(html || '', 'text/html');
  } catch (error) {
    console.warn('DOMParser failed, falling back to createHTMLDocument', error);
    const doc = document.implementation?.createHTMLDocument
      ? document.implementation.createHTMLDocument('')
      : document;
    doc.body.innerHTML = html || '';
    return doc;
  }
};
