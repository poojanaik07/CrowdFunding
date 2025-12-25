const API_URL = '/api/campaigns';

// State
let campaigns = [];
let currentView = 'dashboard';

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchCampaigns();
});

// View Navigation
function showView(viewName) {
    currentView = viewName;
    
    // Update Menu Active State
    document.querySelectorAll('.menu-item').forEach(btn => btn.classList.remove('active'));
    // Simple way to match buttons - usually use IDs or data attributes, but index works for now
    if(viewName === 'dashboard') document.querySelectorAll('.menu-item')[0].classList.add('active');
    if(viewName === 'list') document.querySelectorAll('.menu-item')[1].classList.add('active');
    if(viewName === 'add') document.querySelectorAll('.menu-item')[2].classList.add('active');

    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));

    // Show selected view
    document.getElementById(`view-${viewName}`).classList.add('active');

    // Update Header
    const titles = {
        'dashboard': 'Dashboard Overview',
        'list': 'All Campaigns',
        'add': 'Launch Campaign'
    };
    document.getElementById('page-title').innerText = titles[viewName];

    // Refresh Data if needed
    if (viewName === 'dashboard' || viewName === 'list') {
        fetchCampaigns();
    }
}

// Data Fetching
async function fetchCampaigns() {
    try {
        const response = await fetch(API_URL);
        campaigns = await response.json();
        updateDashboard(campaigns);
        renderCampaignList(campaigns);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
    }
}

function updateDashboard(data) {
    document.getElementById('dashboard-count').innerText = data.length;
}

// Render List
function renderCampaignList(data) {
    const container = document.getElementById('campaign-list-container');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary)">No campaigns found. Create one!</p>';
        return;
    }

    data.forEach(campaign => {
        const progress = (campaign.currentAmount / campaign.goal) * 100;
        
        const card = document.createElement('div');
        card.className = 'campaign-card';
        card.innerHTML = `
            <div class="card-img">
                <i class="fa-solid fa-image fa-2x"></i>
            </div>
            <div class="card-body">
                <h3>${campaign.title}</h3>
                <p>${campaign.description}</p>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                
                <div class="card-meta">
                    <span>Raised: $${campaign.currentAmount}</span>
                    <span>Goal: $${campaign.goal}</span>
                </div>

                <div class="card-actions">
                    <button class="btn-edit" onclick="editCampaign('${campaign.id}')">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteCampaign('${campaign.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Add / Edit Logic
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const id = document.getElementById('campaign-id').value;
    const title = document.getElementById('title').value;
    const goal = parseFloat(document.getElementById('goal').value);
    const description = document.getElementById('description').value;

    const data = { title, goal, description, currentAmount: 0 }; 
    // Note: currentAmount 0 resets on edit in this simple logic, 
    // ideally fetch existing full object first. 
    // For this demo, let's keep simplistic or improve safely.
    
    // Improvement: If Edit, preserve amount
    if (id) {
        const existing = campaigns.find(c => c.id === id);
        if (existing) data.currentAmount = existing.currentAmount;
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            resetForm();
            showView('list');
        }
    } catch (err) {
        console.error("Error saving:", err);
    }
}

function editCampaign(id) {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    document.getElementById('campaign-id').value = campaign.id;
    document.getElementById('title').value = campaign.title;
    document.getElementById('goal').value = campaign.goal;
    document.getElementById('description').value = campaign.description;
    
    document.getElementById('form-title').innerText = "Edit Campaign";
    showView('add');
}

async function deleteCampaign(id) {
    if (!confirm("Are you sure?")) return;
    
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchCampaigns();
    } catch (err) {
        console.error("Error deleting:", err);
    }
}

function resetForm() {
    document.getElementById('campaign-form').reset();
    document.getElementById('campaign-id').value = '';
    document.getElementById('form-title').innerText = "Launch a New Campaign";
}
