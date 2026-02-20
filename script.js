// ===== Year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Progress + Back to Top =====
const progress = document.getElementById("progress");
const toTop = document.getElementById("toTop");

function onScroll(){
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = pct + "%";

  if (scrollTop > 450) toTop.classList.add("show");
  else toTop.classList.remove("show");
}
window.addEventListener("scroll", onScroll);
onScroll();

toTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== Mobile overlay =====
const overlay = document.getElementById("overlay");
const navBtn = document.getElementById("navBtn");
const closeOverlay = document.getElementById("closeOverlay");

function openMenu(){
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
  navBtn.setAttribute("aria-expanded", "true");
}
function closeMenu(){
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
  navBtn.setAttribute("aria-expanded", "false");
}
navBtn.addEventListener("click", openMenu);
closeOverlay.addEventListener("click", closeMenu);
overlay.addEventListener("click", (e) => { if (e.target === overlay) closeMenu(); });
document.querySelectorAll(".overlay-link").forEach(a => a.addEventListener("click", closeMenu));

// ===== Reveal on scroll =====
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("show"); });
}, { threshold: 0.12 });
reveals.forEach(el => io.observe(el));

// ===== Accordion =====
document.querySelectorAll(".acc-head").forEach(btn => {
  btn.addEventListener("click", () => {
    const acc = btn.parentElement;
    const body = acc.querySelector(".acc-body");
    const plus = acc.querySelector(".acc-plus");

    // close others
    document.querySelectorAll(".acc-body").forEach(b => {
      if (b !== body) {
        b.style.maxHeight = null;
        b.parentElement.querySelector(".acc-plus").textContent = "+";
      }
    });

    if (body.style.maxHeight) {
      body.style.maxHeight = null;
      plus.textContent = "+";
    } else {
      body.style.maxHeight = body.scrollHeight + "px";
      plus.textContent = "–";
    }
  });
});

// ===== Form validation + EmailJS =====
const form = document.getElementById("contactForm");

// ✅ Status element (works with either id="status" OR id="formStatus")
let statusEl =
  document.getElementById("formStatus") ||
  document.getElementById("status");

// If status element is missing, create it automatically inside the form
if (!statusEl && form) {
  statusEl = document.createElement("p");
  statusEl.id = "formStatus";
  statusEl.className = "status";
  statusEl.setAttribute("aria-live", "polite");

  const sendBtnCandidate = document.getElementById("sendBtn");
  if (sendBtnCandidate && sendBtnCandidate.parentElement) {
    sendBtnCandidate.parentElement.insertBefore(statusEl, sendBtnCandidate);
  } else {
    form.appendChild(statusEl);
  }
}

const sendBtn = document.getElementById("sendBtn");

const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const msgEl = document.getElementById("message");

const nameErr = document.getElementById("nameErr");
const emailErr = document.getElementById("emailErr");
const phoneErr = document.getElementById("phoneErr");
const msgErr = document.getElementById("messageErr");

function setErr(el, msg){ if (el) el.textContent = msg; }

function clearFieldErrors(){
  setErr(nameErr, "");
  setErr(emailErr, "");
  setErr(phoneErr, "");
  setErr(msgErr, "");
}

// ✅ Professional alert feedback
function setStatus(type, title, subtitle = ""){
  if (!statusEl) return;

  const icon = type === "success" ? "✓" : type === "error" ? "!" : "i";
  statusEl.innerHTML = `
    <div class="alert ${type}">
      <div class="icon">${icon}</div>
      <div class="text">
        ${title}
        ${subtitle ? `<span class="sub">${subtitle}</span>` : ""}
      </div>
    </div>
  `;
}

function validEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
function validPhone(v){
  if (!v.trim()) return true;
  return /^0\d{3}-?\d{7}$/.test(v.trim());
}

function validate(){
  clearFieldErrors();
  let ok = true;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const phone = phoneEl.value.trim();
  const msg = msgEl.value.trim();

  if (name.length < 3){
    setErr(nameErr, "Name must be at least 3 characters.");
    ok = false;
  }
  if (!validEmail(email)){
    setErr(emailErr, "Enter a valid email.");
    ok = false;
  }
  if (!validPhone(phone)){
    setErr(phoneErr, "Use 03xx-xxxxxxx or 03xxxxxxxxx.");
    ok = false;
  }
  if (msg.length < 10){
    setErr(msgErr, "Message must be at least 10 characters.");
    ok = false;
  }

  return ok;
}

/*
  ===== EmailJS Setup =====
*/
const EMAILJS_PUBLIC_KEY = "cJIJzO6dSDFub0EJb";
const EMAILJS_SERVICE_ID = "service_c7y7e9y";
const EMAILJS_TEMPLATE_ID = "template_dmv42dc";

// init EmailJS
(function initEmailJS(){
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
})();

// ✅ Submit handler (THIS WAS MISSING IN YOUR CODE)
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()){
      setStatus("error", "Please fix the errors.", "Check the highlighted fields and try again.");
      return;
    }

    // show sending
    setStatus("info", "Sending your message…", "Please wait a moment.");
    sendBtn.disabled = true;
    const oldBtnText = sendBtn.textContent;
    sendBtn.textContent = "Sending...";

    const params = {
      from_name: nameEl.value.trim(),
      from_email: emailEl.value.trim(),
      phone: phoneEl.value.trim(),
      message: msgEl.value.trim(),
      title: "PAF-IAST Dummy Contact"
    };

    try{
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);

      setStatus("success", "Message sent successfully!", "We will reply as soon as possible.");
      form.reset();
      clearFieldErrors();
    }catch(err){
      console.error(err);
      setStatus("error", "Message failed to send.", "Please try again or check EmailJS settings.");
    }finally{
      sendBtn.disabled = false;
      sendBtn.textContent = oldBtnText || "Send Email";
    }
  });
}