export const generateJournalHtml = (questionList: string[], answerList: string[]): string => {
    let result = ""
    questionList.forEach((question, index) => {
        result += `<div class="mb-4"><h3>${question}</h3>
                    ${answerList[index]}</div>`
    })

    return result
}