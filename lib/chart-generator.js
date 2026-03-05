/**
 * Chart Generator Helper
 *
 * Utilities for generating Chart.js configurations and Mermaid diagrams.
 */

/**
 * Get default Chart.js colors based on theme or fallback
 */
function getChartColors() {
  return {
    primary: 'rgba(59, 130, 246, 0.8)',    // Blue
    secondary: 'rgba(16, 185, 129, 0.8)',   // Green
    tertiary: 'rgba(245, 158, 11, 0.8)',    // Amber
    quaternary: 'rgba(239, 68, 68, 0.8)',   // Red
    quinary: 'rgba(139, 92, 246, 0.8)',     // Purple
    senary: 'rgba(236, 72, 153, 0.8)',      // Pink
  };
}

/**
 * Generate a palette of colors for chart datasets
 * @param {number} count - Number of colors needed
 * @returns {string[]} Array of rgba color strings
 */
function generateColorPalette(count) {
  const baseColors = Object.values(getChartColors());

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors by adjusting hue
  const colors = [...baseColors];
  while (colors.length < count) {
    const hue = (colors.length * 137.5) % 360; // Golden angle for distribution
    colors.push(`hsla(${hue}, 70%, 50%, 0.8)`);
  }

  return colors;
}

/**
 * Create a bar chart configuration
 * @param {Object} options
 * @param {string[]} options.labels - X-axis labels
 * @param {Object[]} options.datasets - Array of {label, data} objects
 * @param {boolean} [options.horizontal=false] - Horizontal bar chart
 * @param {boolean} [options.stacked=false] - Stacked bar chart
 * @returns {Object} Chart.js configuration
 */
function createBarChart({ labels, datasets, horizontal = false, stacked = false }) {
  const colors = generateColorPalette(datasets.length);

  return {
    type: horizontal ? 'bar' : 'bar',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: colors[i],
        borderColor: colors[i].replace('0.8', '1'),
        borderWidth: 1,
      })),
    },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 16 } },
        },
      },
      scales: {
        x: {
          stacked,
          ticks: { font: { size: 14 } },
        },
        y: {
          stacked,
          ticks: { font: { size: 14 } },
        },
      },
    },
  };
}

/**
 * Create a line chart configuration
 * @param {Object} options
 * @param {string[]} options.labels - X-axis labels
 * @param {Object[]} options.datasets - Array of {label, data} objects
 * @param {boolean} [options.fill=false] - Fill area under lines
 * @param {boolean} [options.smooth=true] - Smooth curve
 * @returns {Object} Chart.js configuration
 */
function createLineChart({ labels, datasets, fill = false, smooth = true }) {
  const colors = generateColorPalette(datasets.length);

  return {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: colors[i].replace('0.8', '1'),
        backgroundColor: colors[i],
        fill,
        tension: smooth ? 0.4 : 0,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 16 } },
        },
      },
      scales: {
        x: {
          ticks: { font: { size: 14 } },
        },
        y: {
          ticks: { font: { size: 14 } },
        },
      },
    },
  };
}

/**
 * Create a pie/doughnut chart configuration
 * @param {Object} options
 * @param {string[]} options.labels - Segment labels
 * @param {number[]} options.data - Segment values
 * @param {boolean} [options.doughnut=false] - Use doughnut style
 * @returns {Object} Chart.js configuration
 */
function createPieChart({ labels, data, doughnut = false }) {
  const colors = generateColorPalette(labels.length);

  return {
    type: doughnut ? 'doughnut' : 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { font: { size: 16 } },
        },
      },
    },
  };
}

/**
 * Create a radar chart configuration
 * @param {Object} options
 * @param {string[]} options.labels - Axis labels
 * @param {Object[]} options.datasets - Array of {label, data} objects
 * @returns {Object} Chart.js configuration
 */
function createRadarChart({ labels, datasets }) {
  const colors = generateColorPalette(datasets.length);

  return {
    type: 'radar',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: colors[i].replace('0.8', '1'),
        backgroundColor: colors[i].replace('0.8', '0.3'),
        pointBackgroundColor: colors[i].replace('0.8', '1'),
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 16 } },
        },
      },
      scales: {
        r: {
          ticks: { font: { size: 12 } },
          pointLabels: { font: { size: 14 } },
        },
      },
    },
  };
}

/**
 * Convert chart config object to JSON string for embedding in HTML
 * @param {Object} config - Chart.js configuration
 * @returns {string} JSON string
 */
function chartConfigToString(config) {
  return JSON.stringify(config, null, 2);
}

// Mermaid diagram helpers

/**
 * Create a flowchart diagram
 * @param {Object} options
 * @param {string} [options.direction='LR'] - Direction: TB, BT, LR, RL
 * @param {Object[]} options.nodes - Array of {id, label, shape} objects
 * @param {Object[]} options.edges - Array of {from, to, label} objects
 * @returns {string} Mermaid diagram syntax
 */
function createFlowchart({ direction = 'LR', nodes, edges }) {
  const shapeMap = {
    rectangle: ['[', ']'],
    rounded: ['(', ')'],
    stadium: ['([', '])'],
    diamond: ['{', '}'],
    hexagon: ['{{', '}}'],
    circle: ['((', '))'],
  };

  let diagram = `graph ${direction}\n`;

  for (const node of nodes) {
    const [open, close] = shapeMap[node.shape] || shapeMap.rectangle;
    diagram += `    ${node.id}${open}${node.label}${close}\n`;
  }

  for (const edge of edges) {
    const arrow = edge.label ? `-->|${edge.label}|` : '-->';
    diagram += `    ${edge.from} ${arrow} ${edge.to}\n`;
  }

  return diagram;
}

/**
 * Create a sequence diagram
 * @param {Object} options
 * @param {string[]} options.participants - Participant names
 * @param {Object[]} options.messages - Array of {from, to, text, type} objects
 * @returns {string} Mermaid diagram syntax
 */
function createSequenceDiagram({ participants, messages }) {
  let diagram = 'sequenceDiagram\n';

  for (const p of participants) {
    diagram += `    participant ${p}\n`;
  }

  for (const msg of messages) {
    const arrow = msg.type === 'async' ? '-->>' : '->>';
    diagram += `    ${msg.from}${arrow}${msg.to}: ${msg.text}\n`;
  }

  return diagram;
}

/**
 * Create a pie chart diagram (Mermaid native)
 * @param {Object} options
 * @param {string} options.title - Chart title
 * @param {Object} options.data - Key-value pairs of label: value
 * @returns {string} Mermaid diagram syntax
 */
function createMermaidPieChart({ title, data }) {
  let diagram = `pie title ${title}\n`;

  for (const [label, value] of Object.entries(data)) {
    diagram += `    "${label}" : ${value}\n`;
  }

  return diagram;
}

/**
 * Create a Gantt chart
 * @param {Object} options
 * @param {string} options.title - Chart title
 * @param {string} options.dateFormat - Date format (e.g., 'YYYY-MM-DD')
 * @param {Object[]} options.sections - Array of {name, tasks} objects
 * @returns {string} Mermaid diagram syntax
 */
function createGanttChart({ title, dateFormat = 'YYYY-MM-DD', sections }) {
  let diagram = `gantt\n    title ${title}\n    dateFormat ${dateFormat}\n`;

  for (const section of sections) {
    diagram += `    section ${section.name}\n`;
    for (const task of section.tasks) {
      diagram += `    ${task.name} :${task.id || ''}, ${task.start}, ${task.duration}\n`;
    }
  }

  return diagram;
}

module.exports = {
  getChartColors,
  generateColorPalette,
  createBarChart,
  createLineChart,
  createPieChart,
  createRadarChart,
  chartConfigToString,
  createFlowchart,
  createSequenceDiagram,
  createMermaidPieChart,
  createGanttChart,
};
