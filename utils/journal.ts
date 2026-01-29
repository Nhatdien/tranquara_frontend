export const generateJournalHtml = (questionAnswer: { [key: string]: string }): string => {
  let result = ""

  for (const key of Object.keys(questionAnswer)) {
    // Skip metadata entries (keys that are metadata, not actual questions)
    if (key.includes('mood_score') || key.includes('_score') || key.match(/^[a-z_]+_\d+$/)) {
      continue
    }

    const notEmptyAnswer = (questionAnswer[key] !== "") && (questionAnswer[key] !== "<p></p>")
    result += notEmptyAnswer ? `<div class="mb-4 journal-entry"><h3 class="journal-question">${key}</h3>
                    <p class="journal-answer">${questionAnswer[key]}<p></div>` : ""
  }

  return result
}

type parseResult = {
  [key: string]: string
}

export const parseJournalHtml = (
  html: string
): parseResult => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const result: parseResult = {};

  doc.querySelectorAll(".journal-entry").forEach((block) => {
    const question =
      block.querySelector(".journal-question")?.textContent?.trim() ?? "";

    const answerMarker = block.querySelector(".journal-answer");
    let answerHtml = "";

    if (answerMarker) {
      // collect all siblings after .journal-answer
      let node = answerMarker.nextSibling;
      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          answerHtml += (node as HTMLElement).outerHTML;
        } else if (node.nodeType === Node.TEXT_NODE) {
          answerHtml += node.textContent;
        }
        node = node.nextSibling;
      }
    }

    result[question] = answerHtml.trim()
  });

  return result;
};

export const isEmptyJournal = (journalContent: {[key: string]: string}) => {
  return Object.keys(journalContent).length < 1
}