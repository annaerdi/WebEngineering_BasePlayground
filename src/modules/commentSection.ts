// functionality for showing/hiding the comments section
const initCommentsToggle = (): void => {
    const showHideBtn = document.querySelector('.show-hide') as HTMLDivElement | null;
    const commentWrapper = document.querySelector('.comment-wrapper') as HTMLDivElement | null;

    if (!showHideBtn || !commentWrapper) return;

    commentWrapper.style.display = 'none';

    showHideBtn.onclick = () => {
        const showHideText = showHideBtn.textContent;
        if(showHideText === 'Show comments') {
            showHideBtn.textContent = 'Hide comments';
            commentWrapper.style.display = 'block';
        } else {
            showHideBtn.textContent = 'Show comments';
            commentWrapper.style.display = 'none';
        }
    };
}

// functionality for adding a new comment via the comments form
const initCommentsForm = (): void => {
    const form = document.querySelector('.comment-form') as HTMLFormElement | null;
    const nameField = document.querySelector('#name') as HTMLInputElement | null;
    const commentField = document.querySelector('#comment') as HTMLInputElement | null;
    const list = document.querySelector('.comment-container') as HTMLUListElement | null;

    if (!form || !nameField || !commentField || !list) return;

    form.onsubmit = (e: Event) => {
        e.preventDefault();
        const listItem = document.createElement('li');
        const namePara = document.createElement('p');
        const commentPara = document.createElement('p');
        const nameValue = nameField.value;
        const commentValue = commentField.value;

        namePara.textContent = nameValue;
        commentPara.textContent = commentValue;

        list.appendChild(listItem);
        listItem.appendChild(namePara);
        listItem.appendChild(commentPara);

        nameField.value = '';
        commentField.value = '';
    };
}

export function initComments(): void {
    initCommentsToggle();
    initCommentsForm();
}
