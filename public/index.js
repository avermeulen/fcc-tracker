const findProgressBtn = document.querySelector('.findProgress');
const usernameElem = document.querySelector('.username');
const resultsElem = document.querySelector('.results');
const progressElem = document.querySelector('.progress');
const progressTemplateElem = document.querySelector('.progressTemplate');
const spinner = document.querySelector('.spinner');

function toggleSpinner () {
    spinner.classList.toggle('hidden');
}

const progressTemplate = Handlebars.compile(progressTemplateElem.innerHTML);

findProgressBtn.addEventListener('click', function () {

    const username = usernameElem.value;
    toggleSpinner();
    resultsElem.innerHTML = '';

    const url = `/api/progress/${username}`;

    axios
        .get(url)
        .then(function (res) {
            resultsElem.innerHTML = progressTemplate(res.data);
            toggleSpinner();
        })
        .catch(function (err) {
            toggleSpinner();
            resultsElem.innerHTML = err;
        });
});
