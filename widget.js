(function () {
  // Prevent multiple injections
  if (window.__chatbotWidgetInjected) return;
  window.__chatbotWidgetInjected = true;

  // Create the widget container
  const container = document.createElement('div');
  container.id = 'chatbot-widget-container';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    width: '400px',
    height: '540px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e5e7eb',
  });

  // Create the close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '8px',
    right: '12px',
    background: 'rgba(0,0,0,0.08)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    fontSize: '20px',
    cursor: 'pointer',
    zIndex: '10',
    color: '#333',
    transition: 'background 0.2s',
  });
  closeBtn.onmouseenter = () => (closeBtn.style.background = 'rgba(0,0,0,0.18)');
  closeBtn.onmouseleave = () => (closeBtn.style.background = 'rgba(0,0,0,0.08)');
  closeBtn.onclick = () => container.remove();

  // Create the iframe for the chatbot UI
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('popup.html');
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'white',
    borderRadius: '16px',
    flex: '1 1 auto',
  });

  // Add elements to the container
  container.appendChild(closeBtn);
  container.appendChild(iframe);

  // Add the widget to the page
  document.body.appendChild(container);

  // Optional: Allow dragging the widget
  let isDragging = false, startX, startY, startLeft, startTop;
  closeBtn.style.cursor = 'grab';
  closeBtn.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = container.offsetLeft;
    startTop = container.offsetTop;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    container.style.left = (startLeft + dx) + 'px';
    container.style.top = (startTop + dy) + 'px';
    container.style.right = 'auto';
    container.style.bottom = 'auto';
    container.style.position = 'fixed';
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });
})();