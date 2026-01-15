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
      cloneCommand.textContent = `git clone https://github.com/your-username/easy-static-website.git ${folder}`;
    }
  };

  domainInput.addEventListener("input", update);
  update();
}

/**
 * Updates CloudFormation launch button URL with parameters from form inputs.
 */
export function initCloudFormationButton() {
  const domainInput = document.getElementById("domain-input");
  const githubRepoInput = document.getElementById("github-repo-input");
  const arnInput = document.getElementById("arn-input");

  if (domainInput) {
    domainInput.addEventListener("input", updateCloudFormationUrl);
  }
  if (githubRepoInput) {
    githubRepoInput.addEventListener("input", updateCloudFormationUrl);
  }
  if (arnInput) {
    arnInput.addEventListener("input", updateCloudFormationUrl);
  }

  updateCloudFormationUrl();
}

function updateCloudFormationUrl() {
  const launchBtn = document.getElementById("cloudformation-launch-btn");
  if (!launchBtn) return;

  const domainInput = document.getElementById("domain-input");
  const githubRepoInput = document.getElementById("github-repo-input");
  const arnInput = document.getElementById("arn-input");

  const domain = (domainInput?.value || "").trim();
  const githubRepo = (githubRepoInput?.value || "").trim();
  const arn = (arnInput?.value || "").trim();
  const githubBranch = "main";

  // Build template URL from GitHub repo
  let templateUrl = "";
  if (githubRepo && githubRepo.includes("/")) {
    const [username, repo] = githubRepo.split("/");
    if (username && repo) {
      templateUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/assets/cloudformation.yaml`;
    }
  }

  // Build query params for after the hash fragment
  // CloudFormation console URLs have params after #/stacks/create/review?
  const hashParams = [];

  if (templateUrl) {
    hashParams.push(`templateUrl=${encodeURIComponent(templateUrl)}`);
  }
  if (domain) {
    // Generate stack name from domain
    const stackName = domain.replace(/\./g, "-") + "-site";
    hashParams.push(`stackName=${encodeURIComponent(stackName)}`);
    hashParams.push(`param_DomainName=${encodeURIComponent(domain)}`);
  }
  if (arn) {
    hashParams.push(`param_AcmCertificateArn=${encodeURIComponent(arn)}`);
  }
  if (githubRepo) {
    hashParams.push(`param_GitHubRepo=${encodeURIComponent(githubRepo)}`);
    hashParams.push(`param_GitHubBranch=${encodeURIComponent(githubBranch)}`);
  }

  // Build final URL
  const baseUrl = "https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review";
  
  if (hashParams.length > 0) {
    launchBtn.href = `${baseUrl}?${hashParams.join("&")}`;
  } else {
    launchBtn.href = baseUrl;
  }
}

/**
 * Update progress indicator based on checkbox completion
 */
export function updateProgress() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"][data-id]');
  const checkedBoxes = document.querySelectorAll('input[type="checkbox"][data-id]:checked');
  
  const total = checkboxes.length;
  const completed = checkedBoxes.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  const progressPercentage = document.getElementById('progress-percentage');
  const completedCount = document.getElementById('completed-count');
  const totalCount = document.getElementById('total-count');
  
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
