let current = 0,
    total = 0;
    correct = [];
    incorrect = [],
    quizItems = [];

function initializeView() {
    current = 0;
    total = 0;
    correct = [];
    incorrect = [];
    quizItems = [];
    showSelectionView(true);
    showQuizView(false);
    displayAnswerNotif("hide");
    resetProgressBar();
    setSavedDirectoryPath();
}

function showSelectionView(show) {
    if (show) {
        document.getElementById("selectionView").style.display = "block";
    } else {
        document.getElementById("selectionView").style.display = "none";
    }
}

function showQuizView(show, showSummary = false) {
    if (show) {
        document.getElementById("startQuizView").style.display = "block";
        document.getElementById("questionsView").style.display = "block";
    } else {
        document.getElementById("startQuizView").style.display = "none";
        document.getElementById("questionsView").style.display = "none";
    }

    if (showSummary) {
        document.getElementById("startQuizView").style.display = "block";
        document.getElementById("summaryView").style.display = "block";

        document.getElementById("correctList").innerText = `${ correct.join(",") }`
        document.getElementById("incorrectList").innerText = `${ incorrect.join(",") }`
    } else {
        document.getElementById("summaryView").style.display = "none";
    }
}

function displayQuestions() {
    if (current < total) {
        let questionText = document.getElementById("questionText");
        questionText.innerText = quizItems[current].Q;
    }
}

function displayAnswerNotif(action) {
    switch(action) {
        case "correct":
            document.getElementById("notifCorrect").style.display = "block";
            document.getElementById("notifIncorrect").style.display = "none";
            break;
        case "incorrect":
            document.getElementById("notifCorrect").style.display = "none";
            document.getElementById("notifIncorrect").style.display = "block";
            break;
        case "hide":
            document.getElementById("notifCorrect").style.display = "none";
            document.getElementById("notifIncorrect").style.display = "none";
            break;
        default:
            console.error("Invalid action");
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];  // Swap elements
    }
    return arr;
}

function resetProgressBar() {
    document.getElementById("progressBar").style.width = `0%`;
    document.getElementById("progressBar").setAttribute("aria-valuenow", 0);
}

function setSavedDirectoryPath() {
    let directoryPath = window.myApi.getSelectedFileDirectory();
    console.log("directoryPath: ", directoryPath);

    if (directoryPath) {
        document.getElementById("filePathTxt").value = directoryPath;
        loadDirectoryPathFiles(directoryPath);
    }
}

async function loadDirectoryPathFiles(filePath) {
    let filePathTxt = document.getElementById("filePathTxt");
    filePathTxt.value = filePath;

    let filesToLoad = await window.myApi.getFilesToLoad(filePath);

    if (filesToLoad.length == 0) return console.log("No files available");

    // Clean all child elements
    document.getElementById("loadedFiles").innerHTML = '';

    filesToLoad.forEach((file) => {
        let fileName = file;

        const colDiv = document.createElement("div");
        colDiv.className = "col-sm-3";

        const cardDiv = document.createElement("div");
        cardDiv.className = "card";

        const cardBodyDiv = document.createElement("div");
        cardBodyDiv.className = "card-body";

        const title = document.createElement("h6");
        title.className = "card-title";
        title.innerText = `${ fileName }`;

        const button = document.createElement("button");
        button.className = "btn btn-primary w-100";
        button.innerText = "Go";
        button.id = `fileName-${ fileName }`
        button.value = 

        cardBodyDiv.appendChild(title);
        cardBodyDiv.appendChild(button);
        cardDiv.appendChild(cardBodyDiv);
        colDiv.appendChild(cardDiv);
        document.getElementById("loadedFiles").appendChild(colDiv)

        button.addEventListener("click", async () => {
            console.log(`Button clicked: ${button.id}`);
            
            let quizFilePath = window.myApi.getFormattedPath(filePath, fileName);
            try {
                quizItems = await window.myApi.readFile(quizFilePath);
                quizItems = shuffleArray(quizItems);
                showSelectionView(false);
                showQuizView(true);
                // reset
                total = quizItems.length;
                current = 0;
                correct = [];
                incorrect = [];
                resetProgressBar();
                displayQuestions();
            } catch (err) {
                console.error(err);
                location.reload();
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initializeView();

    document.getElementById("configureBtn").addEventListener("click", async () => {
        let filePath = await window.myApi.selectFile();
        console.log("filePath: ", filePath);

        if (!filePath) return console.log("No directory selected");

        window.myApi.saveSelectedFileDirectory(filePath);

        loadDirectoryPathFiles(filePath);
    });

    document.getElementById("backBtn").addEventListener("click", () => {
        showSelectionView(true);
        showQuizView(false);
    });

    document.getElementById("submitBtn").addEventListener("click", () => {
        let submittedAnswer = document.getElementById("answerInput").value;
        if (quizItems[current].A == submittedAnswer) {
            displayAnswerNotif("correct");
            correct.push(quizItems[current].Q);
        } else {
            displayAnswerNotif("incorrect");
            incorrect.push(quizItems[current].Q);
        }

        let currentProgress = ((current + 1) / total) * 100;            
        document.getElementById("progressBar").style.width = `${ currentProgress }%`;
        document.getElementById("progressBar").setAttribute("aria-valuenow", currentProgress);
        
        setTimeout(() => {
            current++;

            if (current >= total) {
                showQuizView(false, true);
            }

            document.getElementById("answerInput").value = "";
            displayAnswerNotif("hide");
            displayQuestions();
        }, 500);
    });

    document.getElementById("refreshBtn").addEventListener("click", () => {
        location.reload();
    })
});