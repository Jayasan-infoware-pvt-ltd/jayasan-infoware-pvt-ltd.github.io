 // Mobile menu toggle
  const hambtn = document.getElementById('hambtn');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;
  hambtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.style.display = menuOpen ? 'flex' : 'none';
    mobileMenu.setAttribute('aria-hidden', menuOpen ? 'false' : 'true');
  });
  // Close menu on outside click
  window.addEventListener('click', (e) => {
    if (!hambtn.contains(e.target) && !mobileMenu.contains(e.target) && menuOpen && window.innerWidth < 900) {
      menuOpen = false;
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden','true');
    }
  });

  // Tooltip for map markers
  const tooltip = document.getElementById('tooltip');
  const mapWrap = document.getElementById('mapWrap');
  const svg = document.querySelector('svg.india-map');

  function showTooltip(evt, content) {
    tooltip.style.display = 'block';
    tooltip.innerHTML = content;
    const rect = mapWrap.getBoundingClientRect();
    const left = Math.min(window.innerWidth - 160, Math.max(12, evt.clientX - rect.left + 12));
    const top = Math.max(12, evt.clientY - rect.top - 36);
    tooltip.style.left = (left + rect.left) + 'px';
    tooltip.style.top = (top + rect.top) + 'px';
    tooltip.setAttribute('aria-hidden','false');
  }
  function hideTooltip(){
    tooltip.style.display = 'none';
    tooltip.setAttribute('aria-hidden','true');
  }

  // Connect lines from HQ to others
  (function createConnectors(){
    const HQ = document.querySelector('#m-uttarakhand');
    const connectors = document.getElementById('connectors');
    const others = [...document.querySelectorAll('.marker')].filter(m=>m.id !== 'm-uttarakhand');
    const svgRect = svg.getBoundingClientRect();
    // create lines with coordinates taken from transform translate values
    others.forEach(o=>{
      const oTrans = o.getAttribute('transform'); // translate(x,y)
      const hTrans = HQ.getAttribute('transform');
      const ox = +oTrans.match(/translate\(([^,]+),([^)]+)\)/)[1];
      const oy = +oTrans.match(/translate\(([^,]+),([^)]+)\)/)[2];
      const hx = +hTrans.match(/translate\(([^,]+),([^)]+)\)/)[1];
      const hy = +hTrans.match(/translate\(([^,]+),([^)]+)\)/)[2];
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',hx);
      line.setAttribute('y1',hy);
      line.setAttribute('x2',ox);
      line.setAttribute('y2',oy);
      line.setAttribute('class','connecting');
      line.setAttribute('stroke','var(--accent2)');
      line.setAttribute('stroke-width','1.4');
      connectors.appendChild(line);
    });
  })();

  // Add event handlers to markers for tooltip & accessible focus
  const markers = document.querySelectorAll('.marker');
  markers.forEach(m=>{
    const name = m.getAttribute('data-name') || 'Location';
    const dot = m.querySelector('.dot');
    // pointer events
    m.addEventListener('mouseenter', (e)=> {
      dot.setAttribute('r', '6.8');
      showTooltip(e, '<strong>'+name+'</strong>');
    });
    m.addEventListener('mouseleave', (e)=>{
      dot.setAttribute('r', dot.classList.contains('dot') ? '5.2' : '5');
      hideTooltip();
    });
    // keyboard focus for accessibility
    m.addEventListener('focus', (e)=> {
      showTooltip(e, '<strong>'+name+'</strong>');
    });
    m.addEventListener('blur', (e)=> hideTooltip());
    // click to center (nice UX on narrow screens)
    m.addEventListener('click', (evt)=> {
      // small visual feedback
      m.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:300});
    });
  });

  // simple continuous scroll for client slider (css alternative could be used)
  (function animateClients(){
    const sliders = document.querySelectorAll('.clients .slider');
    sliders.forEach(sl=>{
      // duplicate children to create loop illusion (already duplicated in markup)
      let pos = 0;
      let speed = 0.3;
      function step(){
        pos -= speed;
        if (Math.abs(pos) >= sl.scrollWidth / 2) pos = 0;
        sl.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(step);
      }
      step();
    });
  })();

  // auto year
  document.getElementById('year2').textContent = new Date().getFullYear();

  // Simple counter animation when visible
  (function counters() {
    const counters = document.querySelectorAll('.stat .num');
    let started = false;
    function inView(el) {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    }
    function start() {
      if (started) return;
      if (Array.from(counters).some(c=>inView(c))) {
        started = true;
        counters.forEach(c=>{
          const target = c.getAttribute('data-val');
          let cur = 0;
          const total = isNaN(target) ? Number(target.replace(/\D/g,'')) : +target;
          const step = Math.max(1, Math.round(total/60));
          const tick = setInterval(()=>{
            cur += step;
            if (cur >= total) { c.textContent = target; clearInterval(tick); }
            else c.textContent = cur + (isNaN(target) ? '+' : '');
          }, 18);
        });
      }
    }
    window.addEventListener('scroll', start);
    window.addEventListener('load', start);
  })();

  // close tooltip on window scroll to avoid mismatch
  window.addEventListener('scroll', ()=> hideTooltip());

  // make map keyboard navigable: add tabindex to marker groups
  document.querySelectorAll('.marker').forEach(g=>{
    g.setAttribute('tabindex','0');
  });

// ✅ Initialize EmailJS
document.addEventListener("DOMContentLoaded", function() {
  emailjs.init("B9cRp5FtdvX1_JkvJ"); // your public key

  const form = document.getElementById("jobForm");
  const resumeFile = document.getElementById("resumeFile");
  const successMsg = document.getElementById("successMsg");
  const sendBtn = form.querySelector("button");

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    sendBtn.textContent = "Uploading...";
    sendBtn.disabled = true;

    // Step 1: Upload file to a free hosting service (like File.io API)
    const file = resumeFile.files[0];
    if (!file) return alert("Please attach your resume first.");

    let fileUrl = "";
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResponse = await fetch("https://file.io/?expires=1d", {
        method: "POST",
        body: formData
      });
      const uploadResult = await uploadResponse.json();
      fileUrl = uploadResult.link; // Get shareable link
    } catch (err) {
      alert("Failed to upload resume. Please try again.");
      console.error(err);
      sendBtn.textContent = "Send Application";
      sendBtn.disabled = false;
      return;
    }

    sendBtn.textContent = "Sending...";

    // Step 2: Send email with file link
    const formData = {
      user_name: form.user_name.value,
      user_email: form.user_email.value,
      user_number: form.user_number.value,
      position: form.position.value,
      resume_link: fileUrl,
    };

    emailjs.send("service_fb7aklu", "template_1tvlztd", formData)
      .then(() => {
        successMsg.style.display = "block";
        sendBtn.textContent = "Send Application";
        sendBtn.disabled = false;
        form.reset();
      })
      .catch((error) => {
        alert("Failed to send application. Please try again later.");
        console.error("EmailJS error:", error);
        sendBtn.textContent = "Send Application";
        sendBtn.disabled = false;
      });
  });
});
