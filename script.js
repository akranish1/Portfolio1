const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const themeLabel = document.querySelector(".theme-toggle-text");
const menuToggle = document.getElementById("menu-toggle");
const navPanel = document.getElementById("nav-panel");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const revealItems = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const counterItems = document.querySelectorAll(".counter");
const certificateButtons = document.querySelectorAll("[data-certificate]");
const modal = document.getElementById("certificate-modal");
const modalImage = document.getElementById("certificate-modal-image");
const modalTitle = document.getElementById("certificate-modal-title");
const modalClose = document.getElementById("modal-close");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const downloadResumeButton = document.getElementById("download-resume");
const resumeFilePath = "assets/resume/resume.pdf";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("portfolio-theme", theme);
  themeLabel.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

function initializeTheme() {
  const storedTheme = localStorage.getItem("portfolio-theme");
  setTheme(storedTheme || "dark");
}

function toggleMenu(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !navPanel.classList.contains("is-open");
  navPanel.classList.toggle("is-open", shouldOpen);
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
}

function animateCounter(counter) {
  const target = Number(counter.dataset.target || 0);
  const duration = 1400;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(target * eased).toString();
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = target.toString();
    }
  }

  requestAnimationFrame(tick);
}

function initializeRevealAnimations() {
  revealItems.forEach((item) => {
    const delay = item.dataset.delay || 0;
    item.style.setProperty("--delay", `${delay}ms`);
  });

  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    counterItems.forEach((counter) => {
      counter.textContent = counter.dataset.target || "0";
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counterItems.forEach((counter) => counterObserver.observe(counter));
}

function setActiveNavLink(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initializeScrollSpy() {
  let ticking = false;

  function updateActiveSection() {
    const navHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const scrollMarker = window.scrollY + navHeight + 120;
    let activeSectionId = sections[0]?.id || "home";

    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollMarker >= top && scrollMarker < bottom) {
        activeSectionId = section.id;
      }
    });

    if (window.scrollY < 120) {
      activeSectionId = "home";
    }

    setActiveNavLink(activeSectionId);
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateActiveSection);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
}

function openCertificateModal(imageSrc, title) {
  modalImage.src = imageSrc;
  modalImage.alt = `${title} certificate preview`;
  modalTitle.textContent = title;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCertificateModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modalImage.src = "";
  modalImage.alt = "";
}

function validateContactForm() {
  const values = {
    name: contactForm.name.value.trim(),
    email: contactForm.email.value.trim(),
    message: contactForm.message.value.trim(),
  };

  const errors = { name: "", email: "", message: "" };

  if (values.name.length < 2) {
    errors.name = "Please enter at least 2 characters.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (values.message.length < 20) {
    errors.message = "Please enter at least 20 characters.";
  }

  contactForm.querySelectorAll(".field-error").forEach((field) => {
    const key = field.dataset.errorFor;
    field.textContent = errors[key];
  });

  return {
    isValid: !errors.name && !errors.email && !errors.message,
    values,
  };
}

function downloadResume() {
  const anchor = document.createElement("a");
  const resumeFileName = resumeFilePath.split("/").pop() || "resume.pdf";
  anchor.href = resumeFilePath;
  anchor.download = resumeFileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

initializeTheme();
initializeRevealAnimations();
initializeScrollSpy();

themeToggle.addEventListener("click", () => {
  const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

menuToggle.addEventListener("click", () => {
  toggleMenu();
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 959) {
      toggleMenu(false);
    }
  });
});

certificateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openCertificateModal(button.dataset.certificate, button.dataset.title);
  });
});

modal.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
    closeCertificateModal();
  }
});

modalClose.addEventListener("click", closeCertificateModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeCertificateModal();
  }
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  const { isValid, values } = validateContactForm();

  if (!isValid) {
    formStatus.textContent = "Please fix the highlighted fields and try again.";
    return;
  }

  formStatus.textContent = `Thanks ${values.name}. Your message is validated and ready to send. Replace this handler with your email service or backend endpoint.`;
  contactForm.reset();
});

downloadResumeButton.addEventListener("click", downloadResume);
