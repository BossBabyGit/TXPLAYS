/* Tailwind CDN configuration */
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ["Poppins", "ui-sans-serif", "system-ui"] },
      colors: {
        pink: { brand: "#ec4899" },
        blue: { brand: "#3b82f6" },
        violet: { brand: "#7c3aed" },
        indigo: { brand: "#4f46e5" },
        purple: { brand: "#a855f7" },
        discord: "#5865F2",
        discordDark: "#4752C4"
      },
      dropShadow: {
        neon: "0 0 10px rgba(59,130,246,0.75)",
        neonPink: "0 0 10px rgba(236,72,153,0.75)"
      },
      boxShadow: {
        card: "0 20px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)",
        ring: "0 0 0 1px rgba(255,255,255,.08)"
      }
    }
  }
};

(function () {
  const RAIL_KEY = "railCollapsed";
  const OLD_RAIL_KEY = "sidebar";

  const refreshIcons = (options) => {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons(options);
    }
  };

  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  onReady(() => {
    const page = document.body?.dataset?.page || "";
    refreshIcons();
    updateYear();
    normalizeHeroBackgrounds();

    const nav = initNavRail();
    initMagneticButtons();
    initSpotlight();

    switch (page) {
      case "home":
        initHomePage(nav);
        break;
      case "leaderboard":
        initLeaderboardPage(nav);
        break;
      case "bonuses":
        initBonusesPage();
        break;
      case "content":
        initContentPage();
        break;
      case "rewards":
        initRewardsPage();
        break;
      default:
        break;
    }
  });

  function updateYear() {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  function normalizeHeroBackgrounds() {
    const heroes = document.querySelectorAll(".hero-sun[data-hero-img]");
    heroes.forEach((hero) => {
      const rawPath = hero.getAttribute("data-hero-img");
      if (!rawPath) {
        return;
      }
      try {
        const resolved = new URL(rawPath, window.location.href);
        const value = `url("${resolved.href}")`;
        hero.style.setProperty("--hero-img", value);
        hero.style.backgroundImage = value;
      } catch (error) {
        const fallback = `url("${rawPath}")`;
        hero.style.setProperty("--hero-img", fallback);
        hero.style.backgroundImage = fallback;
      }
    });
  }

  function initNavRail() {
    const railWrap = document.querySelector(".nav-rail");
    if (!railWrap) return null;
    const rail = railWrap.querySelector(".rail") || railWrap;
    const indicator = rail.querySelector(".rail-active");
    const toggleBtn = document.getElementById("railToggle");
    const navItems = [...rail.querySelectorAll(".nav-item")];

    const stored = localStorage.getItem(RAIL_KEY);
    const oldValue = localStorage.getItem(OLD_RAIL_KEY);
    const hasStoredPreference = stored !== null || oldValue === "folded";
    let collapsed = stored === "1";
    if (!collapsed && oldValue === "folded") {
      collapsed = true;
    }

    const mediaQuery = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 1023px)") : null;
    const mobileRailQuery =
      typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 767px)") : null;
    if (!hasStoredPreference && mediaQuery?.matches) {
      collapsed = true;
    }

    let userInteracted = hasStoredPreference;

    const applyRailPadding = (isCollapsed) => {
      if (mobileRailQuery?.matches) {
        document.documentElement.style.setProperty("--rail-pad", "1.5rem");
      } else {
        document.documentElement.style.setProperty("--rail-pad", isCollapsed ? "4rem" : "14rem");
      }
    };

    const setCollapsed = (isCollapsed, { persist = true } = {}) => {
      railWrap.classList.toggle("collapsed", isCollapsed);
      applyRailPadding(isCollapsed);
      if (toggleBtn) {
        toggleBtn.innerHTML = isCollapsed
          ? '<i data-lucide="chevrons-right" class="w-4 h-4 text-white"></i>'
          : '<i data-lucide="chevrons-left" class="w-4 h-4 text-white"></i>';
        refreshIcons({ nameAttr: "data-lucide" });
      }
      if (persist) {
        localStorage.setItem(RAIL_KEY, isCollapsed ? "1" : "0");
      }
    };

    setCollapsed(collapsed, { persist: hasStoredPreference });
    if (oldValue) {
      localStorage.removeItem(OLD_RAIL_KEY);
    }

    if (!hasStoredPreference && mediaQuery) {
      const handleMediaChange = (event) => {
        if (!userInteracted) {
          setCollapsed(event.matches, { persist: false });
        }
      };
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleMediaChange);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(handleMediaChange);
      }
    }

    if (mobileRailQuery) {
      const handleMobileLayoutChange = () => {
        applyRailPadding(railWrap.classList.contains("collapsed"));
      };
      if (typeof mobileRailQuery.addEventListener === "function") {
        mobileRailQuery.addEventListener("change", handleMobileLayoutChange);
      } else if (typeof mobileRailQuery.addListener === "function") {
        mobileRailQuery.addListener(handleMobileLayoutChange);
      }
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const nextState = !railWrap.classList.contains("collapsed");
        userInteracted = true;
        setCollapsed(nextState);
      });
    }

    const moveIndicator = (link) => {
      if (!indicator || !link) return;
      const railRect = rail.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const top = linkRect.top - railRect.top + (linkRect.height - indicator.offsetHeight) / 2;
      indicator.style.top = `${Math.max(8, top)}px`;
      indicator.style.height = `${Math.max(28, Math.min(44, linkRect.height - 8))}px`;
      const accent = getComputedStyle(link).getPropertyValue("--accent").trim();
      indicator.style.background = `linear-gradient(180deg, ${accent || "#3b82f6"}, #ec4899)`;
      indicator.style.boxShadow = `0 0 18px ${accent || "rgba(59,130,246,.6)"}`;
    };

    const setActive = (link) => {
      navItems.forEach((item) => item.classList.remove("is-active"));
      if (link) {
        link.classList.add("is-active");
        moveIndicator(link);
      }
    };

    const initialActive = rail.querySelector(".nav-item.is-active") || navItems.find((item) => item.hasAttribute("href"));
    if (initialActive) {
      moveIndicator(initialActive);
    }

    navItems.forEach((item) => item.addEventListener("click", () => setActive(item)));

    return { railWrap, rail, indicator, navItems, setCollapsed, setActive, moveIndicator };
  }

  function initMagneticButtons() {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      let rect;
      btn.addEventListener("pointermove", (e) => {
        rect = rect || btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        btn.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
      });
      btn.addEventListener("pointerleave", () => {
        rect = undefined;
        btn.style.transform = "translate(0,0)";
      });
    });
  }

  function initSpotlight() {
    const cvs = document.getElementById("spotlight");
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      cvs.width = window.innerWidth * DPR;
      cvs.height = window.innerHeight * DPR;
      cvs.style.width = `${window.innerWidth}px`;
      cvs.style.height = `${window.innerHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    const frame = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const r = Math.min(window.innerWidth, window.innerHeight) * 0.25;
      const g = ctx.createRadialGradient(mx * DPR, my * DPR, 0, mx * DPR, my * DPR, r * DPR);
      g.addColorStop(0, "rgba(59,130,246,0.08)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }

  function initHomePage(nav) {
    if (nav?.rail) {
      const links = [...nav.rail.querySelectorAll('.nav-item[href^="#"]')];
      const linkTargets = links.map((link) => {
        const href = link.getAttribute("href");
        const id = href && href.startsWith("#") ? href.slice(1) : null;
        const el = id ? document.getElementById(id) : null;
        return { link, el };
      });

      if (linkTargets.length) {
        const observer = new IntersectionObserver((entries) => {
          let best = null;
          let bestRatio = 0;
          entries.forEach((entry) => {
            const target = linkTargets.find((lt) => lt.el === entry.target);
            if (target && entry.intersectionRatio > bestRatio) {
              best = target;
              bestRatio = entry.intersectionRatio;
            }
          });
          if (best) {
            nav.setActive(best.link);
          }
        }, { threshold: [0.25, 0.5, 0.75] });

        linkTargets.forEach(({ el }) => el && observer.observe(el));
        links.forEach((link) => link.addEventListener("click", () => nav.setActive(link)));
      }

      const homeLink = nav.rail.querySelector('.nav-item[href="#home"]');
      if (homeLink) {
        nav.setActive(homeLink);
      }
    }

    document.querySelectorAll(".tilt:not(.vcard)").forEach((group) => {
      group.addEventListener("pointermove", (e) => {
        const rect = group.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = y * -10;
        const ry = x * 10;
        group.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        [...group.children].forEach((child, index) => {
          child.style.transform = `translateZ(${30 + index * 8}px) translate(${x * 6}px, ${y * -6}px)`;
        });
      });

      group.addEventListener("pointerleave", () => {
        group.style.transform = "rotateX(0) rotateY(0)";
        [...group.children].forEach((child) => {
          child.style.transform = "translateZ(0)";
        });
      });
    });
  }

  function initLeaderboardPage() {
    const CURRENCY = "USD";
    const TIMEZONE = "Europe/Vienna";
    const formatter = new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });
    const nf = new Intl.NumberFormat(undefined);
    const q = (sel) => document.querySelector(sel);
    const formatMoney = (value) => formatter.format(value);

    const getZonedNow = (tz = TIMEZONE) => {
      const now = new Date();
      const tzNow = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      const diff = now.getTime() - tzNow.getTime();
      return new Date(now.getTime() + diff);
    };

    const nextWeeklyReset = () => {
      const d = getZonedNow();
      const day = d.getDay();
      const daysUntilMon = (8 - day) % 7;
      const target = new Date(d);
      target.setDate(d.getDate() + daysUntilMon);
      target.setHours(0, 0, 0, 0);
      return target;
    };

    const startCountdown = () => {
      const target = nextWeeklyReset();
      const ids = { d: q("#d"), h: q("#h"), m: q("#m"), s: q("#s") };
      const tick = () => {
        const now = getZonedNow();
        let diff = Math.max(0, target - now);
        const sec = Math.floor(diff / 1000) % 60;
        const min = Math.floor(diff / 60000) % 60;
        const hr = Math.floor(diff / 3600000) % 24;
        const day = Math.floor(diff / 86400000);
        if (ids.d) ids.d.textContent = day;
        if (ids.h) ids.h.textContent = String(hr).padStart(2, "0");
        if (ids.m) ids.m.textContent = String(min).padStart(2, "0");
        if (ids.s) ids.s.textContent = String(sec).padStart(2, "0");
      };
      tick();
      setInterval(tick, 1000);
      const sub = q("#countdown-sub");
      if (sub) {
        sub.textContent = `Resets Monthly (${TIMEZONE})`;
      }
    };

    const DATA_SOURCE = "/api/leaderboard?type=weekly";
    const MOCK = {
      prizes: { 1: 1000, 2: 500, 3: 250 },
      entries: Array.from({ length: 20 }).map((_, i) => ({
        rank: i + 1,
        username: [
          "AceHunter",
          "LuckyLuna",
          "SpinWizard",
          "CryptoCobra",
          "NeonNova",
          "RNGod",
          "FeverSpin",
          "StackShark",
          "HighRollHer",
          "TiltProof",
          "Jackspot",
          "MegaMidas",
          "StreakSeek",
          "VioletVibes",
          "DiceDyno",
          "BetBender",
          "Slotsy",
          "VaultViper",
          "GridGale",
          "PinkPhantom"
        ][i],
        total_wagered: Math.round((20 - i) * 2500 + Math.random() * 5000),
        prize: i < 3 ? [1000, 500, 250][i] : Math.max(0, Math.round(100 - i * 2))
      })),
      stats: { total_players: 5123, total_wagered: 3456789, highest_wager: 98765 }
    };

    let cachedData = null;
    const loadData = async () => {
      if (window.LEADERBOARD_DATA) return window.LEADERBOARD_DATA;
      if (cachedData) return cachedData;
      try {
        const res = await fetch(DATA_SOURCE, { headers: { Accept: "application/json" } });
        if (res.ok) {
          cachedData = await res.json();
          return cachedData;
        }
      } catch (err) {
        // ignore network errors and fall back to mock data
      }
      return MOCK;
    };

    const setPodium = (top3) => {
      const [a, b, c] = top3;
      const setText = (selector, value) => {
        const el = q(selector);
        if (el) el.textContent = value;
      };

      setText("#p1-name", a?.username ?? "—");
      setText("#p1-wager", `${formatMoney(a?.total_wagered || 0)} `);
      setText("#p1-prize", formatMoney(a?.prize || 0));

      setText("#p2-name", b?.username ?? "—");
      setText("#p2-wager", `${formatMoney(b?.total_wagered || 0)} `);
      setText("#p2-prize", formatMoney(b?.prize || 0));

      setText("#p3-name", c?.username ?? "—");
      setText("#p3-wager", `${formatMoney(c?.total_wagered || 0)} `);
      setText("#p3-prize", formatMoney(c?.prize || 0));

      q("#p1-prize-chip")?.style.setProperty("--tone", "#EFBF04");
      q("#p2-prize-chip")?.style.setProperty("--tone", "#C0C0C0");
      q("#p3-prize-chip")?.style.setProperty("--tone", "#CD7F32");
    };

    const renderRows = (entries) => {
      const wrap = q("#rows");
      if (!wrap) return;
      wrap.innerHTML = "";
      entries.slice(3, 20).forEach((entry) => {
        const row = document.createElement("div");
        row.className =
          "glass rounded-2xl p-4 grid grid-cols-[auto,1fr] sm:grid-cols-[40px,1fr,1fr,120px] gap-x-3 gap-y-2 items-start sm:items-center";
        row.innerHTML = `
          <div class="text-white/70 font-semibold">#${entry.rank}</div>
          <div class="flex items-center gap-3">
            <div class="grid h-8 w-8 place-items-center rounded-xl bg-white/10"><i data-lucide="user" class="h-4 w-4"></i></div>
            <div class="truncate">${entry.username}</div>
          </div>
          <div class="col-span-2 text-right text-white/80 sm:col-span-1 sm:text-left">${formatMoney(entry.total_wagered)}</div>
          <div class="col-span-2 flex items-center justify-end gap-2 text-right sm:col-span-1 sm:justify-end"><span class="gift" aria-hidden="true">
  <svg viewBox="0 0 24 24" class="gift-svg">
    <defs>
      <linearGradient id="gift-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0"  stop-color="var(--gift-a)"/>
        <stop offset="1"  stop-color="var(--gift-b)"/>
      </linearGradient>
    </defs>
    <rect class="fill" x="3.5" y="8" width="17" height="4" rx="1.2" stroke="var(--gift-stroke)"/>
    <rect class="fill" x="4.5" y="12" width="15" height="8.5" rx="1.6" stroke="var(--gift-stroke)"/>
    <rect x="11" y="8" width="2" height="12.5" rx="1" fill="white" opacity=".9" stroke="var(--gift-stroke)"/>
    <path d="M12 8 c-1.6-3 -4.2-3.6 -5.2-2.1 c-.9 1.4 .6 2.8 2.9 3.4 M12 8 c1.6-3 4.2-3.6 5.2-2.1 c.9 1.4 -.6 2.8 -2.9 3.4" fill="none" stroke="var(--gift-stroke)"/>
    <circle cx="12" cy="9" r="1.2" class="fill" stroke="var(--gift-stroke)"/>
  </svg>
</span><span>${formatMoney(entry.prize || 0)}</span></div>
        `;
        wrap.appendChild(row);
      });
      refreshIcons({ attrs: { "stroke-width": 1.8 } });
    };

    const renderStats = (stats) => {
      const setText = (selector, value) => {
        const el = q(selector);
        if (el) el.textContent = value;
      };
      setText("#stat-players", nf.format(stats.total_players || 0));
      setText("#stat-wagered", formatMoney(stats.total_wagered || 0));
      setText("#stat-highest", formatMoney(stats.highest_wager || 0));
    };

    const setRangeActive = (range) => {
      document.querySelectorAll(".range-btn").forEach((btn) => {
        if (btn.dataset.range === range) {
          btn.classList.add("bg-white/10");
        } else {
          btn.classList.remove("bg-white/10");
        }
      });
    };

    const hydrate = async (range = "weekly") => {
      setRangeActive(range);
      const data = await loadData();
      const dataset = data[range] || data;
      const entries = [...dataset.entries].sort((a, b) => (b.total_wagered || 0) - (a.total_wagered || 0)).slice(0, 20);
      const top3 = [entries[0], entries[1], entries[2]];
      setPodium(top3);
      renderRows(entries);
      renderStats(dataset.stats || {});
    };

    startCountdown();
    hydrate("weekly");
    document.querySelectorAll(".range-btn").forEach((btn) => {
      btn.addEventListener("click", () => hydrate(btn.dataset.range));
    });
  }

  function initBonusesPage() {
    const copyBonusCode = () => {
      const text = document.getElementById("bonusCodeText")?.textContent?.trim();
      if (!text) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          const pill = document.getElementById("bonusCode");
          if (!pill) return;
          pill.classList.add("ring-2", "ring-blue-brand");
          setTimeout(() => pill.classList.remove("ring-2", "ring-blue-brand"), 600);
        }).catch(() => {});
      }
    };

    const claimBonus = () => {
      window.open("https://discord.gg/txplays", "_blank");
    };

    window.copyBonusCode = copyBonusCode;
    window.claimBonus = claimBonus;
  }

  function initContentPage() {
    const markLoaded = (img) => {
      img.classList.add("loaded");
      const shimmer = img.parentElement?.querySelector(".vshimmer");
      if (shimmer) shimmer.remove();
    };

    document.querySelectorAll(".vthumb").forEach((img) => {
      if (img.complete) {
        markLoaded(img);
      } else {
        img.addEventListener("load", () => markLoaded(img));
        img.addEventListener("error", () => markLoaded(img));
      }
    });

    document.querySelectorAll(".tilt.vcard").forEach((card) => {
      let rect;
      card.addEventListener("pointerenter", () => {
        rect = card.getBoundingClientRect();
        card.style.setProperty("--tz", "18px");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--tz", "0px");
        rect = undefined;
      });
      card.addEventListener("pointermove", (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rx = ((0.5 - y) * 10).toFixed(2);
        const ry = ((x - 0.5) * 12).toFixed(2);
        card.style.setProperty("--rx", `${rx}deg`);
        card.style.setProperty("--ry", `${ry}deg`);
      });
    });

    let ang = 0;
    setInterval(() => {
      ang = (ang + 2) % 360;
      document.querySelectorAll(".vcard").forEach((card) => card.style.setProperty("--ang", `${ang}deg`));
    }, 60);
  }

  function initRewardsPage() {
    const REWARDS = [
      { level: 1, requirement: 5000, image: "assets/images/bronz.png", name: "Bronze Rank", amount: "$15" },
      { level: 2, requirement: 50000, image: "assets/images/bronz.png", name: "Silver Rank", amount: "$50" },
      { level: 3, requirement: 300000, image: "assets/images/bronz.png", name: "Gold Rank", amount: "$150" },
      { level: 4, requirement: 1050000, image: "assets/images/bronz.png", name: "Platinum Rank", amount: "$830" },
      { level: 5, requirement: 1800000, image: "assets/images/bronz.png", name: "Jade Rank", amount: "$900" },
      { level: 6, requirement: 4300000, image: "assets/images/bronz.png", name: "Sapphire Rank", amount: "$2500" }
    ];

    let userWagerAmount = 0;
    let isLoggedIn = false;
    let username = "Guest";

    const loadRewardsData = async () => {
      try {
        const res = await fetch("get_rewards_data.php");
        const data = await res.json();
        userWagerAmount = parseFloat(data.wager_amount) || 0;
        isLoggedIn = Boolean(data.is_logged_in);
        username = data.username || "Guest";
        renderRewards();
        document.getElementById("loading")?.classList.add("hidden");
        if (data.error && !isLoggedIn) {
          document.getElementById("error-message")?.classList.remove("hidden");
        }
      } catch (err) {
        console.error("Error loading rewards data:", err);
        userWagerAmount = 0;
        isLoggedIn = false;
        username = "Guest";
        renderRewards();
        document.getElementById("loading")?.classList.add("hidden");
        document.getElementById("error-message")?.classList.remove("hidden");
      }
    };

    const getRewardStatus = (requirement) => (userWagerAmount >= requirement ? "claimed" : "progress");
    const fmt = (num) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);

    const renderRewards = () => {
      const grid = document.getElementById("rewards-grid");
      if (!grid) return;
      grid.innerHTML = "";
      REWARDS.forEach((reward) => {
        const status = getRewardStatus(reward.requirement);
        const progress = Math.min(100, (userWagerAmount / reward.requirement) * 100);
        const remaining = Math.max(0, reward.requirement - userWagerAmount);
        const card = document.createElement("article");
        card.className = "glass rcard";
        card.innerHTML = `
          <div class="rcard-content p-5">
            <div class="flex items-start justify-between gap-4">
              <span class="rank-badge">
                <i data-lucide="shield" class="w-4 h-4"></i>
                <strong>Rank ${reward.level}</strong>
              </span>
              <span class="status-chip ${status === "claimed" ? "status-claimed" : "status-progress"}">
                <i data-lucide="${status === "claimed" ? "check-circle-2" : "chevrons-up"}" class="w-4 h-4"></i>
                ${status === "claimed" ? "Achieved" : "In Progress"}
              </span>
            </div>
            <div class="mt-4 flex items-center gap-4">
              <div class="w-20 h-20 rounded-xl overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center">
                <img src="${reward.image}" alt="${reward.name}" class="w-full h-full object-contain">
              </div>
              <div class="min-w-0">
                <h3 class="text-xl font-extrabold leading-tight">${reward.name}</h3>
                <div class="mt-1 muted small flex items-center gap-2">
                  <i data-lucide="target" class="w-4 h-4"></i>
                  Requirement: <strong class="text-white/90">${fmt(reward.requirement)}</strong>
                </div>
              </div>
            </div>
            <div class="mt-5">
              <div class="pbar" aria-label="Progress to ${reward.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.toFixed(1)}">
                <div class="pbar-fill" style="width:${progress}%;"></div>
                <div class="pbar-tip">${progress.toFixed(1)}%</div>
              </div>
              <div class="mt-2 muted small flex items-center gap-2">
                <i data-lucide="wallet" class="w-4 h-4"></i>
                ${status === "claimed" ? "Requirement met." : `${fmt(remaining)} remaining`}
              </div>
            </div>
            <div class="mt-5 flex items-center justify-between">
              <div class="amount">${reward.amount}</div>
              ${status === "claimed"
                ? `<button class="btn-primary" disabled aria-disabled="true" title="Already achieved"><i data-lucide="badge-check"></i><span>Achieved</span></button>`
                : `<button class="btn-primary" data-level="${reward.level}"><i data-lucide="info"></i><span>More Info</span></button>`
              }
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
      refreshIcons({ nameAttr: "data-lucide" });
      grid.querySelectorAll("button[data-level]").forEach((btn) => {
        btn.addEventListener("click", () => openMoreInfo(parseInt(btn.dataset.level, 10)));
      });
    };

    const openMoreInfo = (level) => {
      window.open("https://discord.gg/txplays", "_blank");
    };

    window.openMoreInfo = openMoreInfo;

    loadRewardsData();

    let ang = 0;
    setInterval(() => {
      ang = (ang + 2) % 360;
      document.querySelectorAll(".rcard").forEach((card) => card.style.setProperty("--ang", `${ang}deg`));
    }, 60);
  }
})();
