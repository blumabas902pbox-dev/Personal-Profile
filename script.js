/*Programmer: Bryan Jay M. Lumabas*/
document.addEventListener('DOMContentLoaded', () => {

    const profilePic = document.getElementById('profile-pic');
    const imageUpload = document.getElementById('image-upload');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');

    profilePic.parentElement.addEventListener('click', () => imageUpload.click());

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePic.src = event.target.result;
                console.log("Profile picture updated");
            };
            reader.readAsDataURL(file);
        }
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            const originalText = targetEl.innerText;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = originalText;
            input.className = 'inline-edit-input';

            const saveChange = () => {
                const newValue = input.value.trim() || originalText;
                targetEl.innerText = newValue;
                input.replaceWith(targetEl);
                console.log(`${targetId} edited to: ${newValue}`);
            };

            input.addEventListener('blur', saveChange);
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveChange(); });

            targetEl.replaceWith(input);
            input.focus();
        });
    });

    function setupListLogic(sectionId) {
        const section = document.getElementById(sectionId);
        const list = section.querySelector('ul');
        const addBtn = section.querySelector('.add');
        const deleteBtn = section.querySelector('.delete');
        const input = section.querySelector('.hidden-input');

        addBtn.addEventListener('click', () => {
            input.style.display = 'block';
            input.focus();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== "") {
                const li = document.createElement('li');
                li.innerHTML = `<span>${input.value}</span>`;
                li.draggable = true;
                list.appendChild(li);
                console.log(`Item added to ${sectionId}: ${input.value}`);
                input.value = "";
                input.style.display = 'none';
                attachItemEvents(li);
            }
        });

        deleteBtn.addEventListener('click', () => {
            const selected = list.querySelectorAll('.selected');
            selected.forEach(item => item.remove());
            console.log(`Deleted selected items from ${sectionId}`);
        });

        function attachItemEvents(li) {
            li.addEventListener('click', (e) => {
                if (!e.ctrlKey) {
                    list.querySelectorAll('li').forEach(el => { if(el !== li) el.classList.remove('selected'); });
                }
                li.classList.toggle('selected');
                console.log("Item selected/highlighted");
            });

            li.addEventListener('dragstart', () => li.classList.add('dragging'));
            li.addEventListener('dragend', () => li.classList.remove('dragging'));
        }

        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            const siblings = [...list.querySelectorAll('li:not(.dragging)')];
            const nextSibling = siblings.find(sibling => e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2);
            list.insertBefore(draggingItem, nextSibling);
        });

        list.querySelectorAll('li').forEach(attachItemEvents);
    }

    // Load saved configurations first so that setupListLogic targets elements that have already been populated.
    (function loadData() {
        const saved = JSON.parse(localStorage.getItem('userProfile'));
        if (saved) {
            document.getElementById('user-name').innerText = saved.name;
            document.getElementById('user-bio').innerText = saved.bio;
            profilePic.src = saved.pic;
            
            const rebuildList = (id, data) => {
                const list = document.getElementById(id);
                if (!list || !data) return;
                list.innerHTML = '';
                data.forEach(htmlContent => {
                    const li = document.createElement('li');
                    li.innerHTML = htmlContent;
                    li.draggable = true;
                    list.appendChild(li);
                });
            };
            rebuildList('skills-list', saved.skills);
            rebuildList('hobbies-list', saved.hobbies);
            rebuildList('education-list', saved.education);
            rebuildList('work-experience-list', saved.work);
            console.log("Profile restored from local storage");
        }
    })();

    setupListLogic('skills-section');
    setupListLogic('hobbies-section');
    setupListLogic('education-section');
    setupListLogic('work-experience-section');

    saveBtn.addEventListener('click', () => {
        const profileData = {
            name: document.getElementById('user-name').innerText,
            bio: document.getElementById('user-bio').innerText,
            pic: profilePic.src,
            skills: [...document.querySelectorAll('#skills-list li')].map(li => li.innerHTML),
            hobbies: [...document.querySelectorAll('#hobbies-list li')].map(li => li.innerHTML),
            education: [...document.querySelectorAll('#education-list li')].map(li => li.innerHTML),
            work: [...document.querySelectorAll('#work-experience-list li')].map(li => li.innerHTML)
        };
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log("Changes saved to local storage");
        alert("Profile Saved!");
    });

    resetBtn.addEventListener('click', () => {
        if(confirm("Reset all data to default?")) {
            localStorage.clear();
            console.log("Local storage cleared");
            location.reload();
        }
    });
});

function applyAestheticUpdate() {
  const css = `
    .hidden-input {
      background-color: #222325 !important;
      color: #F4F7F6 !important;
      border: 2px solid #121212 !important;
      padding: 10px !important;
      border-radius: 6px !important;
      width: calc(100% - 22px) !important;
      margin-bottom: 10px !important;
      font-size: 0.9rem !important;
    }

    #skills-input, #hobby-input {
      display: none;
    }

    .controls {
      display: flex;
      gap: 10px;
    }

    .action-btn {
      background-color: #222325 !important;
      color: #F4F7F6 !important;
      border: 2px solid #121212 !important;
      padding: 10px 15px !important;
      border-radius: 6px !important;
      cursor: pointer;
      font-size: 0.9rem !important;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background-color 0.2s;
    }

    .action-btn:hover {
      background-color: #232323 !important;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;

  document.head.appendChild(styleEl);
}

applyAestheticUpdate();

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.list-section');
    sections.forEach(section => {
        const editBtn = section.querySelector('[id*="edit-"]');
        const list = section.querySelector('ul');

        if (editBtn && list) {
            editBtn.addEventListener('click', () => {
                const selectedItem = list.querySelector('li.selected');

                if (!selectedItem) {
                    alert("Please click an item first to select it for editing.");
                    return;
                }

                const targetTextNode = selectedItem.querySelector('span:last-child') || selectedItem;
                const originalValue = targetTextNode.innerText;

                const input = document.createElement('input');
                input.type = 'text';
                input.value = originalValue;
                input.className = 'inline-edit-input';
                input.style.width = "90%";

                const saveEdit = () => {
                    const newValue = input.value.trim() || originalValue;
                    targetTextNode.innerText = newValue;
                    input.replaceWith(targetTextNode);
                    console.log(`Item in ${section.id} updated to: ${newValue}`);
                };

                input.addEventListener('blur', saveEdit);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') saveEdit();
                });

                targetTextNode.replaceWith(input);
                input.focus();
            });
        }
    });
});
