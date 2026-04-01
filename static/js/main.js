// Theme Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // Skills input handling
    initSkillsInput();
    
    // Flash messages auto-dismiss
    initFlashMessages();
    
    // Search functionality
    initSearch();
    
    // Add skill forms
    initAddSkillForms();
});

// Skills Input for Signup
function initSkillsInput() {
    const skillsContainers = document.querySelectorAll('.skills-input-container');
    
    skillsContainers.forEach(container => {
        const input = container.querySelector('input');
        const hiddenInput = container.nextElementSibling;
        const skills = new Set();
        
        if (!input) return;
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const skill = input.value.trim().toLowerCase();
                
                if (skill && !skills.has(skill)) {
                    skills.add(skill);
                    addSkillTag(container, skill, skills, hiddenInput);
                    input.value = '';
                    updateHiddenInput(skills, hiddenInput);
                }
            }
            
            if (e.key === 'Backspace' && input.value === '') {
                const tags = container.querySelectorAll('.skill-tag');
                if (tags.length > 0) {
                    const lastTag = tags[tags.length - 1];
                    const skillName = lastTag.textContent.replace('×', '').trim();
                    skills.delete(skillName);
                    lastTag.remove();
                    updateHiddenInput(skills, hiddenInput);
                }
            }
        });
    });
}

function addSkillTag(container, skill, skillsSet, hiddenInput) {
    const tag = document.createElement('span');
    tag.className = 'skill-tag skill-have';
    tag.innerHTML = `${skill} <span class="skill-remove" onclick="removeSkillTag(this, '${skill}', '${hiddenInput.name}')">×</span>`;
    
    container.insertBefore(tag, container.querySelector('input'));
}

function removeSkillTag(element, skillName, inputName) {
    const tag = element.parentElement;
    const container = tag.parentElement;
    const hiddenInput = container.nextElementSibling;
    
    tag.remove();
    
    // Update hidden input
    const remainingTags = container.querySelectorAll('.skill-tag');
    const skills = Array.from(remainingTags).map(t => 
        t.textContent.replace('×', '').trim()
    );
    
    hiddenInput.value = skills.join(',');
}

function updateHiddenInput(skills, hiddenInput) {
    if (hiddenInput) {
        hiddenInput.value = Array.from(skills).join(',');
    }
}

// Flash Messages Auto-Dismiss
function initFlashMessages() {
    const flashes = document.querySelectorAll('.flash');
    
    flashes.forEach(flash => {
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(100%)';
            setTimeout(() => flash.remove(), 300);
        }, 5000);
    });
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('user-search');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput) return;
    
    let timeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(timeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        timeout = setTimeout(() => {
            fetch(`/api/search-users?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    displaySearchResults(data.users, searchResults);
                })
                .catch(err => console.error('Search error:', err));
        }, 300);
    });
}

function displaySearchResults(users, container) {
    if (users.length === 0) {
        container.innerHTML = '<div class="empty-state">No users found</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="card match-card">
            <div class="card-header">
                <div class="card-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="card-title">${user.name}</div>
                    <div class="card-subtitle">Rating: ${user.rating > 0 ? '⭐'.repeat(Math.round(user.rating)) : 'No ratings'}</div>
                </div>
            </div>
            <div class="skills-container">
                ${user.skills.map(s => `
                    <span class="skill-tag skill-${s.type}">${s.name}</span>
                `).join('')}
            </div>
            <div class="match-actions">
                <button class="btn btn-primary btn-sm" onclick="connectUser(${user.id})">
                    Connect
                </button>
            </div>
        </div>
    `).join('');
}

// Connect with User
function connectUser(userId) {
    fetch(`/api/connect/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification('Connected successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to connect', 'error');
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        showNotification('Failed to connect', 'error');
    });
}

// Add Skill Forms
function initAddSkillForms() {
    // Add "have" skill
    const addHaveBtn = document.getElementById('add-have-skill');
    if (addHaveBtn) {
        addHaveBtn.addEventListener('click', function() {
            const input = document.getElementById('new-have-skill');
            const skillName = input.value.trim();
            
            if (!skillName) return;
            
            fetch('/api/add-skill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    skill_name: skillName,
                    skill_type: 'have'
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    showNotification(data.error || 'Failed to add skill', 'error');
                }
            });
        });
    }
    
    // Add "want" skill
    const addWantBtn = document.getElementById('add-want-skill');
    if (addWantBtn) {
        addWantBtn.addEventListener('click', function() {
            const input = document.getElementById('new-want-skill');
            const skillName = input.value.trim();
            
            if (!skillName) return;
            
            fetch('/api/add-skill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    skill_name: skillName,
                    skill_type: 'want'
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    showNotification(data.error || 'Failed to add skill', 'error');
                }
            });
        });
    }
}

// Remove Skill
function removeSkill(skillId) {
    if (!confirm('Are you sure you want to remove this skill?')) return;
    
    fetch(`/api/remove-skill/${skillId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            showNotification(data.error || 'Failed to remove skill', 'error');
        }
    });
}

// Notification System
function showNotification(message, type = 'success') {
    const container = document.querySelector('.flash-messages') || createFlashContainer();
    
    const flash = document.createElement('div');
    flash.className = `flash ${type}`;
    flash.textContent = message;
    
    container.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        flash.style.transform = 'translateX(100%)';
        setTimeout(() => flash.remove(), 300);
    }, 5000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
}

// Form Validation
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let valid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                valid = false;
                field.style.borderColor = 'var(--error)';
            } else {
                field.style.borderColor = '';
            }
        });
        
        if (!valid) {
            e.preventDefault();
            showNotification('Please fill in all required fields', 'error');
        }
    });
});
