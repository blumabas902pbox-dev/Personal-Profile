document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const profilePic = document.getElementById('profile-pic');
    const imageUpload = document.getElementById('image-upload');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');

    // --- Part 1: Profile Image Logic ---
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

    // --- Inline Editing Logic (Name & Bio) ---
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

    // --- List Management (Skills & Hobbies) ---
    function setupListLogic(sectionId) {
        const section = document.getElementById(sectionId);
        const list = section.querySelector('ul');
        const addBtn = section.querySelector('.add');
        const deleteBtn = section.querySelector('.delete');
        const input = section.querySelector('.hidden-input');

        // Add Item
        addBtn.addEventListener('click', () => {
            input.style.display = 'block';
            input.focus();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== "") {
                const li = document.createElement('li');
                li.textContent = input.value;
                li.draggable = true;
                list.appendChild(li);
                console.log(`Item added to ${sectionId}: ${input.value}`);
                input.value = "";
                input.style.display = 'none';
                attachItemEvents(li);
            }
        });

        // Delete Selected
        deleteBtn.addEventListener('click', () => {
            const selected = list.querySelectorAll('.selected');
            selected.forEach(item => item.remove());
            console.log(`Deleted selected items from ${sectionId}`);
        });

        // Selection & Drag Events
        function attachItemEvents(li) {
            li.addEventListener('click', (e) => {
                if (!e.ctrlKey) {
                    list.querySelectorAll('li').forEach(el => { if(el !== li) el.classList.remove('selected'); });
                }
                li.classList.toggle('selected');
                console.log("Item selected/highlighted");
            });

            // Drag and Drop
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

    setupListLogic('skills-section');
    setupListLogic('hobbies-section');

    // --- Part 2: Global Controls (Storage) ---
    saveBtn.addEventListener('click', () => {
        const profileData = {
            name: document.getElementById('user-name').innerText,
            bio: document.getElementById('user-bio').innerText,
            pic: profilePic.src,
            skills: [...document.querySelectorAll('#skills-list li')].map(li => li.innerText),
            hobbies: [...document.querySelectorAll('#hobbies-list li')].map(li => li.innerText)
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

    // Load Data on Start
    (function loadData() {
        const saved = JSON.parse(localStorage.getItem('userProfile'));
        if (saved) {
            document.getElementById('user-name').innerText = saved.name;
            document.getElementById('user-bio').innerText = saved.bio;
            profilePic.src = saved.pic;
            
            // Rebuild lists if saved data exists
            const rebuildList = (id, data) => {
                const list = document.getElementById(id);
                list.innerHTML = '';
                data.forEach(text => {
                    const li = document.createElement('li');
                    li.textContent = text;
                    li.draggable = true;
                    list.appendChild(li);
                });
            };
            rebuildList('skills-list', saved.skills);
            rebuildList('hobbies-list', saved.hobbies);
            console.log("Profile restored from local storage");
        }
    })();
});

// Function to update the style of the control elements in both sections
function applyAestheticUpdate() {
  const css = `
    /* Style for the hidden input fields to match list items */
    .hidden-input {
      background-color: #222325 !important; /* Dark background */
      color: #F4F7F6 !important; /* Light text */
      border: 2px solid #121212 !important; /* Border color */
      padding: 10px !important; /* Spacing */
      border-radius: 6px !important; /* Rounded corners */
      width: calc(100% - 22px) !important; /* Account for padding & border */
      margin-bottom: 10px !important; /* Space between input and buttons */
      font-size: 0.9rem !important; /* Text size */
    }

    /* Target inputs specifically to ensure they match list items */
    #hobby-input {
      display: none; /* Initially hidden, list logic handles showing it */
    }

    /* Style for the action buttons within the controls div */
    .controls {
      display: flex;
      gap: 10px; /* Space between buttons */
    }

    .action-btn {
      background-color: #222325 !important; /* Dark background */
      color: #F4F7F6 !important; /* Light text */
      border: 2px solid #121212 !important; /* Border color */
      padding: 10px 15px !important; /* Spacing */
      border-radius: 6px !important; /* Rounded corners */
      cursor: pointer;
      font-size: 0.9rem !important; /* Text size */
      display: flex;
      align-items: center;
      gap: 5px; /* Space for icon */
      transition: background-color 0.2s;
    }

    /* Add hover effect similar to list items */
    .action-btn:hover {
      background-color: #232323 !important; /* Darken slightly on hover */
    }
  `;

  // Create a style element and add the CSS rules
  const styleEl = document.createElement('style');
  styleEl.textContent = css;

  // Append the style element to the head
  document.head.appendChild(styleEl);
}

// Call the function to apply the styling
applyAestheticUpdate();
