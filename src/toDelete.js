// src/toDelete.js
// You can delete/rename this file later. For now it centralizes the "template" behaviors.

const TODO_KEY = "todoState";

/**
 * Persist checkbox state to localStorage using data-id as the key.
 * IMPORTANT: data-id values must be unique across the page.
 */
export function initTodoCheckboxes() {
  const state = safeJsonParse(localStorage.getItem(TODO_KEY), {});

  document.querySelectorAll('input[type="checkbox"][data-id]').forEach((cb) => {
    const id = cb.dataset.id;
    if (!id) return;

    cb.checked = !!state[id];

    cb.addEventListener("change", () => {
      state[id] = cb.checked;
      localStorage.setItem(TODO_KEY, JSON.stringify(state));
      updateProgress();
    });
  });

  // Initialize progress on load
  updateProgress();
}

/**
 * Copy buttons.
 *
 * Supports:
 * - data-copy-text="some text"
 * - OR data-copy-target="#selector" (copies target element textContent)
 *
 * Recommended for your clone command button:
 *   data-copy-target="#clone-command"
 */
export function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const targetSel = button.getAttribute("data-copy-target");
      const staticText = button.getAttribute("data-copy-text") || "";

      let textToCopy = staticText;

      if (targetSel) {
        const el = document.querySelector(targetSel);
        textToCopy = el?.textContent?.trim() || "";
      }

      if (!textToCopy) return;

      const copyIcon = button.querySelector(".copy-icon");
      const copyText = button.querySelector(".copy-text");

      const originalIcon = copyIcon?.textContent ?? "";
      const originalText = copyText?.textContent ?? "";

      const setCopiedState = () => {
        if (copyIcon) copyIcon.textContent = "✓";
        if (copyText) copyText.textContent = "Copied!";
        button.classList.add(
          "bg-green-500",
          "hover:bg-green-600",
          "dark:bg-green-600",
          "dark:hover:bg-green-700"
        );
        button.classList.remove(
          "bg-purple-500",
          "hover:bg-purple-600",
          "dark:bg-purple-600",
          "dark:hover:bg-purple-700"
        );
      };

      const resetState = () => {
        if (copyIcon) copyIcon.textContent = originalIcon;
        if (copyText) copyText.textContent = originalText;
        button.classList.remove(
          "bg-green-500",
          "hover:bg-green-600",
          "dark:bg-green-600",
          "dark:hover:bg-green-700"
        );
        button.classList.add(
          "bg-purple-500",
          "hover:bg-purple-600",
          "dark:bg-purple-600",
          "dark:hover:bg-purple-700"
        );
      };

      const ok = await copyToClipboard(textToCopy);
      if (ok) {
        setCopiedState();
        setTimeout(resetState, 1200);
      }
    });
  });
}

/**
 * Domain input + project name generation + clone command.
 *
 * - Updates #project-name-display
 * - Updates #clone-command textContent
 *
 * If you want underscores instead of hyphens, swap the .replace(/\./g, "-") line.
 */
export function initDomainInput() {
  const domainInput = document.getElementById("domain-input");
  const projectNameDisplay = document.getElementById("project-name-display");
  const cloneCommand = document.getElementById("clone-command");
  const includeWwwToggle = document.getElementById("include-www-toggle");

  if (!domainInput) return;

  const update = () => {
    const domain = domainInput.value || "";
    const projectName = slugifyDomain(domain);

    document.documentElement.setAttribute("data-project-name", projectName);

    if (projectNameDisplay) {
      projectNameDisplay.textContent = projectName || "(enter domain name)";
    }

    if (cloneCommand) {
      const folder = projectName || "easy-static-website";
      cloneCommand.textContent = `git clone https://github.com/git-Pqrd/easy-static.git ${folder}`;
    }
  };

  const updateWwwInstructions = () => {
    const includeWww = includeWwwToggle?.checked ?? true;

    // Update toggle label and hint
    const toggleLabel = document.getElementById("www-toggle-label");
    const toggleHint = document.getElementById("www-toggle-hint");
    if (toggleLabel) {
      toggleLabel.textContent = includeWww
        ? "www.domain redirects to apex"
        : "Apex domain only (no www)";
    }
    if (toggleHint) {
      toggleHint.textContent = includeWww
        ? "Certificate must cover both domain.com and www.domain.com"
        : "Certificate only needs to cover domain.com";
    }

    // Update certificate instructions
    const certWww = document.getElementById("cert-www-instructions");
    const certNoWww = document.getElementById("cert-no-www-instructions");
    if (certWww) certWww.classList.toggle("hidden", !includeWww);
    if (certNoWww) certNoWww.classList.toggle("hidden", includeWww);

    // Update DNS validation instructions
    const dnsValWww = document.getElementById(
      "dns-validation-www-instructions"
    );
    const dnsValNoWww = document.getElementById(
      "dns-validation-no-www-instructions"
    );
    if (dnsValWww) dnsValWww.classList.toggle("hidden", !includeWww);
    if (dnsValNoWww) dnsValNoWww.classList.toggle("hidden", includeWww);

    // Update DNS CloudFront instructions
    const dnsCfWww = document.getElementById("dns-cloudfront-www-instructions");
    const dnsCfNoWww = document.getElementById(
      "dns-cloudfront-no-www-instructions"
    );
    if (dnsCfWww) dnsCfWww.classList.toggle("hidden", !includeWww);
    if (dnsCfNoWww) dnsCfNoWww.classList.toggle("hidden", includeWww);

    // Update CloudFormation URL
    updateCloudFormationUrl();
  };

  domainInput.addEventListener("input", update);
  if (includeWwwToggle) {
    includeWwwToggle.addEventListener("change", updateWwwInstructions);
  }

  update();
  updateWwwInstructions();
}

/**
 * Update git commands based on GitHub repo input
 */
function updateGitCommands() {
  const githubRepoInput = document.getElementById("github-repo-input");
  const gitRemoteCommand = document.getElementById("git-remote-command");

  if (!githubRepoInput || !gitRemoteCommand) return;

  const githubRepo = (githubRepoInput.value || "").trim();

  if (
    githubRepo &&
    githubRepo.includes("/") &&
    !githubRepo.includes(".git") &&
    !githubRepo.includes("github.com")
  ) {
    // Valid format: username/repo
    gitRemoteCommand.textContent = `git remote set-url origin https://github.com/${githubRepo}.git`;
  } else {
    // Default placeholder
    gitRemoteCommand.textContent =
      "git remote set-url origin https://github.com/USERNAME/REPO.git";
  }
}

/**
 * Update GitHub vars link based on GitHub repo input
 */
function updateGitHubVarsLink() {
  const githubRepoInput = document.getElementById("github-repo-input");
  const githubVarsLink = document.getElementById("github-vars-link");

  if (!githubRepoInput || !githubVarsLink) return;

  const githubRepo = (githubRepoInput.value || "").trim();

  if (
    githubRepo &&
    githubRepo.includes("/") &&
    !githubRepo.includes(".git") &&
    !githubRepo.includes("github.com")
  ) {
    // Valid format: username/repo
    githubVarsLink.href = `https://github.com/${githubRepo}/settings/variables/actions`;
  } else {
    // Default placeholder
    githubVarsLink.href =
      "https://github.com/USERNAME/REPO/settings/variables/actions";
  }
}

/**
 * Initialize GitHub repo validation in repo creation section
 */
export function initGitHubRepoValidation() {
  const githubRepoInput = document.getElementById("github-repo-input");
  const githubRepoError = document.getElementById("github-repo-error");

  if (!githubRepoInput) return;

  const validateRepo = () => {
    const githubRepo = (githubRepoInput?.value || "").trim();

    // Validate GitHub repo format if provided
    if (githubRepo) {
      if (githubRepo.includes(".git")) {
        if (githubRepoError) {
          githubRepoError.textContent = "Remove '.git' from repository name";
          githubRepoError.classList.remove("hidden");
        }
        if (githubRepoInput) {
          githubRepoInput.classList.add("border-red-500");
        }
      } else if (
        githubRepo.includes("github.com") ||
        githubRepo.includes("https://")
      ) {
        if (githubRepoError) {
          githubRepoError.textContent =
            "Use format: username/repo (not full URL)";
          githubRepoError.classList.remove("hidden");
        }
        if (githubRepoInput) {
          githubRepoInput.classList.add("border-red-500");
        }
      } else if (!githubRepo.includes("/")) {
        if (githubRepoError) {
          githubRepoError.textContent = "Use format: username/repo";
          githubRepoError.classList.remove("hidden");
        }
        if (githubRepoInput) {
          githubRepoInput.classList.add("border-red-500");
        }
      } else {
        if (githubRepoError) {
          githubRepoError.classList.add("hidden");
        }
        if (githubRepoInput) {
          githubRepoInput.classList.remove("border-red-500");
        }
      }
    } else {
      if (githubRepoError) {
        githubRepoError.classList.add("hidden");
      }
      if (githubRepoInput) {
        githubRepoInput.classList.remove("border-red-500");
      }
    }

    // Update git commands and secrets link whenever input changes
    updateGitCommands();
    updateGitHubVarsLink();
  };

  githubRepoInput.addEventListener("input", validateRepo);
  validateRepo();
  // Also update git commands and secrets link on initial load
  updateGitCommands();
  updateGitHubVarsLink();
}

/**
 * Updates CloudFormation launch button URL with parameters from form inputs.
 */
export function initCloudFormationButton() {
  const domainInput = document.getElementById("domain-input");
  const githubRepoInput = document.getElementById("github-repo-input");
  const arnInput = document.getElementById("arn-input");
  const includeWwwToggle = document.getElementById("include-www-toggle");

  if (domainInput) {
    domainInput.addEventListener("input", updateCloudFormationUrl);
  }
  if (githubRepoInput) {
    githubRepoInput.addEventListener("input", updateCloudFormationUrl);
  }
  if (arnInput) {
    arnInput.addEventListener("input", updateCloudFormationUrl);
  }
  if (includeWwwToggle) {
    includeWwwToggle.addEventListener("change", updateCloudFormationUrl);
  }

  // Handle click prevention for anchor tag when fields are missing
  const launchBtn = document.getElementById("cloudformation-launch-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", (e) => {
      const domain = (domainInput?.value || "").trim();
      const githubRepo = (githubRepoInput?.value || "").trim();
      const arn = (arnInput?.value || "").trim();

      if (!domain || !arn || !githubRepo) {
        e.preventDefault();
        // Scroll to error message
        const errorMsg = document.getElementById(
          "cloudformation-missing-fields-error"
        );
        if (errorMsg) {
          errorMsg.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });
  }

  updateCloudFormationUrl();
}

function updateCloudFormationUrl() {
  const launchBtn = document.getElementById("cloudformation-launch-btn");
  if (!launchBtn) return;

  const domainInput = document.getElementById("domain-input");
  const githubRepoInput = document.getElementById("github-repo-input");
  const arnInput = document.getElementById("arn-input");
  const includeWwwToggle = document.getElementById("include-www-toggle");

  const domain = (domainInput?.value || "").trim();
  const githubRepo = (githubRepoInput?.value || "").trim();
  const arn = (arnInput?.value || "").trim();
  const githubBranch = "main";
  const includeWww = includeWwwToggle?.checked ? "Yes" : "No";

  // Check for missing fields
  const missingFieldsError = document.getElementById(
    "cloudformation-missing-fields-error"
  );
  const missingFields = [];

  if (!domain) {
    missingFields.push("Domain name");
  }
  if (!arn) {
    missingFields.push("ACM certificate ARN");
  }
  if (!githubRepo) {
    missingFields.push(
      "GitHub repository (set it in the repo creation section)"
    );
  } else if (
    !githubRepo.includes("/") ||
    githubRepo.includes(".git") ||
    githubRepo.includes("github.com")
  ) {
    // Invalid GitHub repo format
    missingFields.push("Valid GitHub repository format (username/repo)");
  }

  // Show missing fields error if any
  if (missingFieldsError) {
    if (missingFields.length > 0) {
      const fieldsList = missingFields.join(", ");
      missingFieldsError.textContent = `Please enter: ${fieldsList}`;
      missingFieldsError.classList.remove("hidden");
    } else {
      missingFieldsError.classList.add("hidden");
    }
  }

  // Build CloudFormation URL with proper format
  const templateUrl =
    "https://s3.us-east-1.amazonaws.com/easy-static.piquard.codes-site-349499464670/assets/cloudformation.yaml";

  // Base URL with required templateURL parameter
  let finalUrl = `https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?templateURL=${encodeURIComponent(
    templateUrl
  )}`;

  // Add other parameters
  if (domain) {
    // Generate stack name from domain with date and time
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, "");
    const time = now.toTimeString().slice(0, 5).replace(/:/g, "");
    const stackName = domain.replace(/\./g, "-") + "-site-" + date + time;
    finalUrl += `&stackName=${encodeURIComponent(stackName)}`;
    finalUrl += `&param_DomainName=${encodeURIComponent(domain)}`;
  }
  // Always include IncludeWww parameter
  finalUrl += `&param_IncludeWww=${encodeURIComponent(includeWww)}`;
  if (arn) {
    finalUrl += `&param_AcmCertificateArn=${encodeURIComponent(arn)}`;
  }
  if (githubRepo) {
    finalUrl += `&param_GitHubRepo=${encodeURIComponent(githubRepo)}`;
    finalUrl += `&param_GitHubBranch=${encodeURIComponent(githubBranch)}`;
  }

  launchBtn.href = finalUrl;

  // Update button visual state based on required fields (anchor tags can't be disabled)
  const hasRequiredFields = missingFields.length === 0;
  if (!hasRequiredFields) {
    launchBtn.classList.add("opacity-50", "cursor-not-allowed");
    launchBtn.classList.remove("hover:from-orange-600", "hover:to-yellow-600");
    launchBtn.style.pointerEvents = "auto"; // Keep clickable to show error
  } else {
    launchBtn.classList.remove("opacity-50", "cursor-not-allowed");
    launchBtn.classList.add("hover:from-orange-600", "hover:to-yellow-600");
    launchBtn.style.pointerEvents = "";
  }
}

/**
 * Update progress indicator based on checkbox completion
 */
export function updateProgress() {
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"][data-id]'
  );
  const checkedBoxes = document.querySelectorAll(
    'input[type="checkbox"][data-id]:checked'
  );

  const total = checkboxes.length;
  const completed = checkedBoxes.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Update progress bar
  const progressBar = document.getElementById("progress-bar");
  const progressPercentage = document.getElementById("progress-percentage");
  const completedCount = document.getElementById("completed-count");
  const totalCount = document.getElementById("total-count");

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }

  if (progressPercentage) {
    progressPercentage.textContent = `${percentage}%`;
  }

  if (completedCount) {
    completedCount.textContent = completed;
  }

  if (totalCount) {
    totalCount.textContent = total;
  }
}

// ---------- helpers ----------

function safeJsonParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

function slugifyDomain(domain) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "")
    .replace(/\./g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}
