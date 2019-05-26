'use strict';

loadNotes();

window.addEventListener('scroll', function() {
    progressive.value = window.pageYOffset / (document.body.scrollHeight - window.innerHeight) * 100;
});
