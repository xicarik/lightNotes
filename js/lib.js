const url = 'https://api.myjson.com/bins/lgcb2';

class Note {
    constructor(newNote) {
        this.title = newNote.title;
        this.contents = newNote.contents;
    }
    generate(place) {
        let noteTpl = `
            <div class="uk-grid-margin">
                <div class="uk-card uk-card-default uk-card-small">
                    <div class="uk-card-body">
                        <div class="uk-text-center">
                            <h3 class="uk-card-title">{{title}}</h3>
                            <p>{{contents}}</p>
                            <button class="uk-button uk-button-primary">
                                <span uk-icon="icon: pencil"></span> Edit
                            </button>
                            <button class="uk-button uk-button-danger">
                                <span uk-icon="icon: trash"></span> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        let tpl = Handlebars.compile(noteTpl);
        place.innerHTML += tpl(this);
    }
}

function loadNotes() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    let notes;
    let container = notesContainer;
    xhr.addEventListener('readystatechange', function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            notes = JSON.parse(xhr.responseText);
            container.innerHTML = '';
            for (let note of notes) {
                let newNote = new Note(note);
                newNote.generate(container);
            }
            for (let i = container.children.length - 1; i >= 0; --i) {
                container.children[i].querySelectorAll('button')[1].addEventListener('click', function(e) {
                    notes.splice(i, 1);
                    let xhr1 = new XMLHttpRequest();
                    xhr1.open('PUT', url, true);
                    xhr1.setRequestHeader('Content-type', 'application/json; charset=utf8');
                    xhr1.send(JSON.stringify(notes));
                    let tmp = e.currentTarget;
                    xhr1.addEventListener('readystatechange', function() {
                        if (xhr1.readyState == 4 && xhr1.status == 200)
                            tmp.parentElement.parentElement.parentElement.parentElement.remove();
                    });
                });
                container.children[i].querySelectorAll('button')[0].addEventListener('click', function() {
                    notes[i].edit = true;
                    let xhr1 = new XMLHttpRequest();
                    xhr1.open('PUT', url, true);
                    xhr1.setRequestHeader('Content-type', 'application/json; charset=utf8');
                    xhr1.send(JSON.stringify(notes));
                    xhr1.addEventListener('readystatechange', function() {
                        if (xhr1.readyState == 4 && xhr1.status == 200)
                            document.location.href = 'editNote.html';
                    });
                });
            }
        }
    });

}

function addNote() {
    const worker = new Tesseract.TesseractWorker();

    let cnvEl = document.querySelector('canvas');
    let ctx = cnvEl.getContext('2d');
    cnvEl.addEventListener('mousedown', function() {
        let checker = true;
        cnvEl.addEventListener('mousemove', function(e) {
            if (checker) {
                let x = e.clientX - cnvEl.getBoundingClientRect().left;
                let y = e.clientY - cnvEl.getBoundingClientRect().top;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        cnvEl.addEventListener('mouseup', function() {
            checker = false;
        });
    });

    convert.addEventListener('click', function() {
        UIkit.modal(modal).show();
        worker.recognize(cnvEl)
            .then((result) => {
                newContents.value += result.text;
                UIkit.modal(modal).hide();
            })
            .progress((p) => {
                if (p.status == 'recognizing text')
                    progressbar.value = p.progress;
            });
    });

    submit.addEventListener('click', function() {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send();
        xhr.addEventListener('readystatechange', function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let notes = JSON.parse(xhr.responseText);
                notes.push({
                    title: newTitle.value,
                    contents: newContents.value,
                    edit: false
                });
                let xhr1 = new XMLHttpRequest();
                xhr1.open('PUT', url, true);
                xhr1.setRequestHeader('Content-type', 'application/json; charset=utf8');
                xhr1.send(JSON.stringify(notes));
                xhr1.addEventListener('readystatechange', function() {
                    if (xhr1.readyState == 4 && xhr1.status == 200)
                        UIkit.modal.dialog('<p class="uk-modal-body">Note added!</p>');
                });
            }
        });
    });

    clean.addEventListener('click', function() {
        ctx.clearRect(0, 0, 800, 300);
    });
}

function editNote() {
    const worker = new Tesseract.TesseractWorker();

    let cnvEl = document.querySelector('canvas');
    let ctx = cnvEl.getContext('2d');
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.addEventListener('readystatechange', function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let notes = JSON.parse(xhr.responseText);
            let index = 0;
            for (let i = 0; i < notes.length; ++i)
                if (notes[i].edit) {
                    newTitle.value = notes[i].title;
                    newContents.value = notes[i].contents;
                    index = i;
                    break;
                }
            cnvEl.addEventListener('mousedown', function() {
                let checker = true;
                cnvEl.addEventListener('mousemove', function(e) {
                    if (checker) {
                        let x = e.clientX - cnvEl.getBoundingClientRect().left;
                        let y = e.clientY - cnvEl.getBoundingClientRect().top;
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                });
                cnvEl.addEventListener('mouseup', function() {
                    checker = false;
                });
            });

            convert.addEventListener('click', function() {
                UIkit.modal(modal).show();
                worker.recognize(cnvEl)
                    .then((result) => {
                        newContents.value += result.text;
                        UIkit.modal(modal).hide();
                    })
                    .progress((p) => {
                        if (p.status == 'recognizing text')
                            progressbar.value = p.progress;
                    });
            });

            submit.addEventListener('click', function() {
                notes[index] = {
                    title: newTitle.value,
                    contents: newContents.value,
                    edit: false
                };
                let xhr1 = new XMLHttpRequest();
                xhr1.open('PUT', url, true);
                xhr1.setRequestHeader('Content-type', 'application/json; charset=utf8');
                xhr1.send(JSON.stringify(notes));
                xhr1.addEventListener('readystatechange', function() {
                    if (xhr1.readyState == 4 && xhr1.status == 200)
                        UIkit.modal.dialog('<p class="uk-modal-body">Note edited!</p>');
                });
            });

            clean.addEventListener('click', function() {
                ctx.clearRect(0, 0, 800, 300);
            });
        }
    });
}
