let data = [];

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

async function loadData() {
    try {
        const response = await fetch('Sources/Source.csv');
        const csvText = await response.text();
        data = parseCSV(csvText);
        processData();
        createCharts();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).filter(line => line.trim() !== '');
    return rows.map(row => {
        const values = row.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : '';
        });
        obj.runs = parseInt(obj.runs) || 0;
        obj.Match_No = parseInt(obj.Match_No) || 0;
        obj.total = parseInt(obj.total) || 0;
        // Parse date
        if (obj.date) {
            obj.date = new Date(obj.date);
            obj.year = obj.date.getFullYear();
        }
        return obj;
    });
}

function processData() {
    const totalMatches = data.length;
    const totalRuns = data.reduce((sum, match) => sum + match.runs, 0);
    const averageRuns = (totalRuns / totalMatches).toFixed(2);
    const highestScore = Math.max(...data.map(match => match.runs));
    const centuries = data.filter(match => match.runs >= 100).length;
    const fifties = data.filter(match => match.runs >= 50 && match.runs < 100).length;

    document.getElementById('totalMatches').textContent = totalMatches;
    document.getElementById('totalRuns').textContent = totalRuns;
    document.getElementById('averageRuns').textContent = averageRuns;
    document.getElementById('highestScore').textContent = highestScore;
    document.getElementById('centuries').textContent = centuries;
    document.getElementById('fifties').textContent = fifties;

    // Populate table
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    data.forEach(match => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${match.Match_No}</td>
            <td>${match.runs}</td>
            <td>${match.opponent}</td>
            <td>${match.ground}</td>
            <td>${match.date ? match.date.toLocaleDateString() : ''}</td>
            <td>${match.match}</td>
            <td>${match.total}</td>
        `;
        tableBody.appendChild(row);
    });
}

function createCharts() {
    // Runs over time
    const sortedData = data.sort((a, b) => a.date - b.date);
    const dates = sortedData.map(match => match.date.toISOString().split('T')[0]);
    const runs = sortedData.map(match => match.runs);
    
    new Chart(document.getElementById('runsOverTimeChart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Runs',
                data: runs,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Runs Scored Over Time',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Runs by opponent
    const opponentRuns = {};
    data.forEach(match => {
        opponentRuns[match.opponent] = (opponentRuns[match.opponent] || 0) + match.runs;
    });
    const opponents = Object.keys(opponentRuns).sort((a, b) => opponentRuns[b] - opponentRuns[a]);
    const oppRuns = opponents.map(opp => opponentRuns[opp]);
    
    new Chart(document.getElementById('runsByOpponentChart'), {
        type: 'bar',
        data: {
            labels: opponents,
            datasets: [{
                label: 'Runs',
                data: oppRuns,
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: '#28a745',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Runs by Opponent',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Runs by match type
    const matchTypeRuns = {};
    data.forEach(match => {
        matchTypeRuns[match.match] = (matchTypeRuns[match.match] || 0) + match.runs;
    });
    const matchTypes = Object.keys(matchTypeRuns);
    const mtRuns = matchTypes.map(mt => matchTypeRuns[mt]);
    
    new Chart(document.getElementById('runsByMatchTypeChart'), {
        type: 'pie',
        data: {
            labels: matchTypes,
            datasets: [{
                data: mtRuns,
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Runs Distribution by Match Type',
                    font: {
                        size: 18
                    }
                }
            }
        }
    });

    // Year-wise performance
    const yearRuns = {};
    data.forEach(match => {
        if (match.year) {
            yearRuns[match.year] = (yearRuns[match.year] || 0) + match.runs;
        }
    });
    const years = Object.keys(yearRuns).sort();
    const yrRuns = years.map(year => yearRuns[year]);
    
    new Chart(document.getElementById('yearWiseChart'), {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Runs',
                data: yrRuns,
                backgroundColor: 'rgba(255, 193, 7, 0.8)',
                borderColor: '#ffc107',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Total Runs by Year',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function askQuestion() {
    const question = document.getElementById('questionInput').value.toLowerCase();
    let answer = '';
    
    if (question.includes('total runs') || question.includes('sum of runs')) {
        const total = data.reduce((sum, match) => sum + match.runs, 0);
        answer = `Total runs scored: ${total}`;
    } else if (question.includes('average runs') || question.includes('mean runs')) {
        const total = data.reduce((sum, match) => sum + match.runs, 0);
        const avg = (total / data.length).toFixed(2);
        answer = `Average runs per match: ${avg}`;
    } else if (question.includes('highest score') || question.includes('maximum runs')) {
        const max = Math.max(...data.map(match => match.runs));
        answer = `Highest score: ${max}`;
    } else if (question.includes('centuries')) {
        const count = data.filter(match => match.runs >= 100).length;
        answer = `Number of centuries: ${count}`;
    } else if (question.includes('fifties')) {
        const count = data.filter(match => match.runs >= 50 && match.runs < 100).length;
        answer = `Number of fifties: ${count}`;
    } else if (question.includes('matches') && question.includes('total')) {
        answer = `Total matches played: ${data.length}`;
    } else if (question.includes('opponent') && question.includes('most runs')) {
        const opponentRuns = {};
        data.forEach(match => {
            opponentRuns[match.opponent] = (opponentRuns[match.opponent] || 0) + match.runs;
        });
        const maxOpp = Object.keys(opponentRuns).reduce((a, b) => opponentRuns[a] > opponentRuns[b] ? a : b);
        answer = `Most runs against ${maxOpp}: ${opponentRuns[maxOpp]}`;
    } else if (question.includes('year') && question.includes('most runs')) {
        const yearRuns = {};
        data.forEach(match => {
            if (match.year) {
                yearRuns[match.year] = (yearRuns[match.year] || 0) + match.runs;
            }
        });
        const maxYear = Object.keys(yearRuns).reduce((a, b) => yearRuns[a] > yearRuns[b] ? a : b);
        answer = `Most runs in ${maxYear}: ${yearRuns[maxYear]}`;
    } else {
        answer = "Sorry, I can answer questions about total runs, average runs, highest score, centuries, fifties, total matches, most runs against an opponent, or most runs in a year. Please rephrase your question.";
    }
    
    const answerDiv = document.getElementById('answer');
    answerDiv.textContent = answer;
    answerDiv.style.display = 'block';
}

// Load data on page load
window.onload = loadData;