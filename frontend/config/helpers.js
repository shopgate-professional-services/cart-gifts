/**
 * Unescape html entities
 * @param {string} htmlString .
 * @returns {string}
 */
export const decodeHtmlEntities = (htmlString) => {
  /** @type {Element} */
  const textarea = document.createElement('textarea');
  textarea.innerHTML = htmlString;
  return textarea.textContent;
};
