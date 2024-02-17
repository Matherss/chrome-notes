document.addEventListener('DOMContentLoaded', function() {
  const noteForm = document.getElementById('noteForm');
  const noteTextArea = document.getElementById('noteTextArea');
  const noteList = document.getElementById('noteList');
  const actionInfo = document.getElementById('actionInfo');

  noteForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const notesInput = noteTextArea.value;

    chrome.storage.sync.get({ notes: [] }, function(data) {
      const existingNotes = data.notes;
      existingNotes.push(notesInput);
      chrome.storage.sync.set({ notes: existingNotes }, function() {
        renderNotes(existingNotes);
      });
    });
    noteTextArea.value = '';
    showInfo('Notes added')
  });

  function renderNotes(notes) {
    noteList.innerHTML = '';
    notes.forEach(note => {
      const li = document.createElement('li');
      li.textContent = note;

      const copyButton = document.createElement('button');
      copyButton.classList.add('action-icon')
      copyButton.innerHTML = '<img src="/images/copy.svg">';
      copyButton.addEventListener('click', function() {
        copyToClipboard(note);
        showInfo('Note "' + note + '" copied in clipboard')
      });

      const deleteButton = document.createElement('button');
      deleteButton.classList.add('action-icon')
      deleteButton.innerHTML = '<img src="/images/delete.svg">';
      deleteButton.addEventListener('click', function() {
        chrome.storage.sync.get({ notes: [] }, function(data) {
          const updatedNotes = data.notes.filter(n => n !== note);
          chrome.storage.sync.set({ notes: updatedNotes }, function() {
            renderNotes(updatedNotes);
          });
        });
        showInfo('Note "' + note + '" removed')
      });

      li.appendChild(copyButton);
      li.appendChild(deleteButton);
      noteList.appendChild(li);
    });
  }

  function copyToClipboard(note) {
    const textField = document.createElement('textarea');
    textField.innerText = note;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  }

  chrome.storage.sync.get({ notes: [] }, function(data) {
    renderNotes(data.notes);
  });

  function showInfo(value) {
    actionInfo.innerText = value
    setTimeout(() => {
      actionInfo.innerText = ''
    }, 2000);
  }
});