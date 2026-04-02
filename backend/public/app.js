const API_URL = '/tasks';

// DOM Elements
const taskForm = document.getElementById('task-form');
const dynamicFieldsList = document.getElementById('dynamic-fields-list');
const btnAddField = document.getElementById('btn-add-field');
const tasksContainer = document.getElementById('tasks-container');

// State
let tasks = [];

// Initialize app
document.addEventListener('DOMContentLoaded', fetchTasks);

// Event Listeners
taskForm.addEventListener('submit', handleAdd);
btnAddField.addEventListener('click', addDynamicFieldRow);

function addDynamicFieldRow() {
  const row = document.createElement('div');
  row.className = 'dynamic-input-row';
  row.innerHTML = `
    <input type="text" class="dyn-key" placeholder="Attribute (e.g. Priority)" required>
    <input type="text" class="dyn-val" placeholder="Value (Optional)">
    <button type="button" class="btn btn-outline-danger btn-icon" onclick="this.parentElement.remove()" title="Remove Field">×</button>
  `;
  dynamicFieldsList.appendChild(row);
}

// Functions
async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    console.error('Error fetching tasks:', err);
    tasksContainer.innerHTML = `<div class="empty-state">Error loading tasks. Is the backend running?</div>`;
  }
}

async function handleAdd(e) {
  e.preventDefault();
  
  const title = document.getElementById('title').value;
  const status = document.getElementById('status').value;
  let dynamicFields = {};
  const rows = dynamicFieldsList.querySelectorAll('.dynamic-input-row');
  
  rows.forEach(row => {
    const key = row.querySelector('.dyn-key').value.trim();
    const val = row.querySelector('.dyn-val').value.trim();
    if (key) {
      if (val === '') {
        dynamicFields[key] = '';
      } else if (!isNaN(val)) {
        dynamicFields[key] = Number(val);
      } else if (val.toLowerCase() === 'true') {
        dynamicFields[key] = true;
      } else if (val.toLowerCase() === 'false') {
        dynamicFields[key] = false;
      } else {
        try {
          // Automatically attempt to parse booleans or arrays
          dynamicFields[key] = JSON.parse(val);
        } catch(e) {
          // Keep as string if parsing fails
          dynamicFields[key] = val;
        }
      }
    }
  });
  
  const newTask = { title, status, dynamicFields };
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    
    if (!res.ok) throw new Error('Failed to create task');
    
    // Reset form & fetch
    taskForm.reset();
    dynamicFieldsList.innerHTML = '';
    fetchTasks();
  } catch (err) {
    console.error('Error creating task:', err);
    alert('Failed to create task');
  }
}

async function handleUpdateStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Failed to update status');
    fetchTasks();
  } catch (err) {
    console.error('Error updating status:', err);
    alert('Failed to update status');
  }
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
    fetchTasks();
  } catch (err) {
    console.error('Error deleting task:', err);
    alert('Failed to delete task');
  }
}

function renderTasks() {
  if (tasks.length === 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <p>No tasks found. Create one to see MongoDB's dynamic fields in action!</p>
      </div>
    `;
    return;
  }
  
  tasksContainer.innerHTML = '';
  
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card card glass';
    
    const statusClass = `status-${task.status.replace(' ', '').toLowerCase()}`;
    
    let dynamicFieldsHTML = '';
    
    if (task.dynamicFields && Object.keys(task.dynamicFields).length > 0) {
      const fields = Object.entries(task.dynamicFields).map(([key, value]) => {
        let displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        return `<div class="attr-chip"><span class="attr-key">${key}:</span> ${displayValue}</div>`;
      }).join('');
      
      const rawJSON = JSON.stringify(task.dynamicFields, null, 2);
      
      dynamicFieldsHTML = `
        <div class="task-dynamic-fields">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
            <div style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Dynamic Attributes (Schema-less Data)</div>
            <button class="btn-json-toggle" onclick="toggleJSON('${task._id}')">Toggle Raw JSON</button>
          </div>
          <div class="chip-container" id="chips-${task._id}">
            ${fields}
          </div>
          <pre class="raw-json-block" id="json-block-${task._id}"><code>${escapeHTML(rawJSON)}</code></pre>
        </div>
      `;
    } else {
      dynamicFieldsHTML = `
        <div class="task-dynamic-fields" style="display:flex; align-items:center; justify-content:center; color:#94a3b8; font-style:italic; font-size:0.85rem;">
          No dynamic fields added
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="task-header">
        <h3 class="task-title">${escapeHTML(task.title)}</h3>
        <select class="task-status-select ${statusClass}" onchange="handleUpdateStatus('${task._id}', this.value)">
          <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
      </div>
      
      ${dynamicFieldsHTML}
      
      <div class="comments-section">
        <h4>Comments</h4>
        <div class="comments-list">
          ${task.comments && task.comments.length > 0 ? task.comments.map(c => `
            <div class="comment" style="display:flex; flex-direction:column; gap:2px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="comment-user">${escapeHTML(c.user || 'Guest')}</span>
                <div>
                  <span class="comment-timestamp">${new Date(c.createdAt).toLocaleDateString()} ${new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <button class="btn-json-toggle" style="margin-left: 6px; color: #ef4444; font-size: 0.65rem;" onclick="handleDeleteComment('${task._id}', '${c._id}')">Delete</button>
                </div>
              </div>
              <span class="comment-text" style="color: #475569;">${escapeHTML(c.text)}</span>
            </div>
          `).join('') : '<div class="no-comments">No comments yet.</div>'}
        </div>
        <div class="add-comment-form">
          <input type="text" id="comment-user-${task._id}" placeholder="Name" class="comment-input comment-user-input" required>
          <input type="text" id="comment-text-${task._id}" placeholder="Write a comment..." class="comment-input" style="flex:1" required>
          <button class="btn btn-secondary btn-small" onclick="handleAddComment('${task._id}')">Post</button>
        </div>
      </div>

      <div class="task-actions" style="margin-top: 1rem;">
        <button class="btn btn-small btn-outline-danger" onclick="handleDelete('${task._id}')">Delete Task</button>
      </div>
    `;
    
    tasksContainer.appendChild(card);
  });
}

async function handleAddComment(id) {
  const user = document.getElementById(`comment-user-${id}`).value.trim() || "Guest";
  const text = document.getElementById(`comment-text-${id}`).value.trim();
  if (!text) return;
  
  try {
    const res = await fetch(`${API_URL}/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, text })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    fetchTasks();
  } catch (err) {
    console.error('Error adding comment:', err);
    alert('Failed to add comment');
  }
}

async function handleDeleteComment(taskId, commentId) {
  if (!confirm('Delete this comment?')) return;
  
  try {
    const res = await fetch(`${API_URL}/${taskId}/comments/${commentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete comment');
    fetchTasks();
  } catch (err) {
    console.error('Error deleting comment:', err);
    alert('Failed to delete comment');
  }
}

// Utility to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

// Global Toggle Action
window.toggleJSON = function(taskId) {
  const block = document.getElementById(`json-block-${taskId}`);
  const chips = document.getElementById(`chips-${taskId}`);
  if (block.classList.contains('active')) {
    block.classList.remove('active');
    chips.style.display = 'flex';
  } else {
    block.classList.add('active');
    chips.style.display = 'none';
  }
};
