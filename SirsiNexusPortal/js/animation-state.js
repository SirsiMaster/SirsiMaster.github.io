// Animation State Machine
class AnimationStateMachine {
  constructor() {
    this.currentState = 'idle';
    this.states = {
      idle: {
        next: 'analyzing',
        timeout: 0
      },
      analyzing: {
        next: 'planning',
        timeout: 3000
      },
      planning: {
        next: 'deploying',
        timeout: 4000
      },
      deploying: {
        next: 'monitoring',
        timeout: 5000
      },
      monitoring: {
        next: 'optimizing',
        timeout: 4000
      },
      optimizing: {
        next: 'idle',
        timeout: 3000
      }
    };
    
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify(state, data) {
    this.subscribers.forEach(callback => callback(state, data));
  }

  async transition(targetState) {
    if (!this.states[targetState]) {
      console.error(`Invalid state: ${targetState}`);
      return;
    }

    this.currentState = targetState;
    this.notify(targetState, {
      timestamp: new Date().toISOString()
    });

    if (this.states[targetState].timeout > 0) {
      await new Promise(resolve => setTimeout(resolve, this.states[targetState].timeout));
      await this.transition(this.states[targetState].next);
    }
  }

  start() {
    if (this.currentState === 'idle') {
      this.transition('analyzing');
    }
  }

  stop() {
    this.currentState = 'idle';
    this.notify('idle', {
      timestamp: new Date().toISOString()
    });
  }
}

// Infrastructure Animation Controller
class InfrastructureAnimationController {
  constructor(stateMachine) {
    this.stateMachine = stateMachine;
    this.elements = {};
    this.progress = 0;
  }

  initialize() {
    // Find and store references to animation elements
    this.elements = {
      progressBar: document.getElementById('infrastructure-progress'),
      stateLabel: document.getElementById('current-state'),
      detailsPanel: document.getElementById('details-panel')
    };

    // Subscribe to state changes
    this.stateMachine.subscribe((state, data) => this.handleStateChange(state, data));
  }

  handleStateChange(state, data) {
    // Update UI elements based on state
    if (this.elements.stateLabel) {
      this.elements.stateLabel.textContent = state.charAt(0).toUpperCase() + state.slice(1);
    }

    // Update progress bar
    if (this.elements.progressBar) {
      switch(state) {
        case 'analyzing':
          this.updateProgress(20);
          break;
        case 'planning':
          this.updateProgress(40);
          break;
        case 'deploying':
          this.updateProgress(60);
          break;
        case 'monitoring':
          this.updateProgress(80);
          break;
        case 'optimizing':
          this.updateProgress(100);
          break;
        case 'idle':
          this.updateProgress(0);
          break;
      }
    }

    // Update details panel with state-specific information
    if (this.elements.detailsPanel) {
      this.updateDetailsPanel(state, data);
    }
  }

  updateProgress(value) {
    this.progress = value;
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${value}%`;
    }
  }

  updateDetailsPanel(state, data) {
    const details = {
      analyzing: 'Analyzing current infrastructure and requirements...',
      planning: 'Planning optimal deployment strategy...',
      deploying: 'Deploying infrastructure components...',
      monitoring: 'Monitoring system health and performance...',
      optimizing: 'Optimizing resource allocation...',
      idle: 'Ready to start infrastructure deployment'
    };

    this.elements.detailsPanel.innerHTML = `
      <div class="mb-4">
        <h3 class="text-lg font-semibold">${state.charAt(0).toUpperCase() + state.slice(1)}</h3>
        <p class="text-slate-600 dark:text-slate-400">${details[state]}</p>
        <div class="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Last updated: ${new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>
    `;
  }
}

// Initialize state machine and controller
function initializeAnimation() {
  console.log('Initializing animation...');
  const stateMachine = new AnimationStateMachine();
  const animationController = new InfrastructureAnimationController(stateMachine);

  // Make stateMachine globally available
  window.stateMachine = stateMachine;
  window.animationController = animationController;

  // Initialize immediately
  animationController.initialize();

  // Add button click handler
  const demoButton = document.querySelector('button[onclick="window.stateMachine.start()"]');
  if (demoButton) {
    console.log('Found demo button, adding click handler');
    demoButton.onclick = () => {
      console.log('Demo button clicked');
      if (window.stateMachine) {
        console.log('Starting state machine...');
        window.stateMachine.start();
      } else {
        console.error('State machine not found');
      }
    };
  } else {
    console.error('Demo button not found');
  }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAnimation);
