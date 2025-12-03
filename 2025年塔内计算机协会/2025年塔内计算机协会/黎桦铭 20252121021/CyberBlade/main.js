const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      hasEntered: false,
    };
  },
  mounted() {
    // 设置当前年份
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }

    // 返回顶部
    const backToTopBtn = document.getElementById("backToTop");
    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // 平滑滚动到锚点（兼容导航）
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;
        e.preventDefault();
        const headerOffset = 70;
        const rect = targetEl.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - headerOffset;
        window.scrollTo({ top: targetY, behavior: "smooth" });
      });
    });

    // 项目卡片按钮：点击时显示“文字掉落”提示（在点击位置附近出现）
    const spawnFallingText = (text, x, y) => {
      const el = document.createElement("div");
      el.className = "falling-text";
      el.textContent = text;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      // 随机一个水平偏移，制造向左上或右上的抛物线感觉（10~30 像素）
      const dir = Math.random() < 0.5 ? -1 : 1;
      const magnitude = 10 + Math.random() * 20;
      el.style.setProperty("--dx", `${dir * magnitude}px`);
      document.body.appendChild(el);
      const remove = () => {
        el.removeEventListener("animationend", remove);
        if (el.parentNode) el.parentNode.removeChild(el);
      };
      el.addEventListener("animationend", remove);
    };

    document.querySelectorAll(".project-links a").forEach((link) => {
      link.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          const rect = link.getBoundingClientRect();
          const clickX = e.clientX;
          const clickY = e.clientY;
          const kind = link.dataset.kind || "";
          if (kind === "preview") {
            spawnFallingText("正在赶来的路上", clickX, clickY);
          } else if (kind === "github") {
            spawnFallingText("作者会尽快开源的！", clickX, clickY);
          }
        },
        { passive: false },
      );
    });

    // 根据屏幕宽度自动调节首屏 CyberBlade 标题，避免在窄屏手机上两侧被裁切
    const adjustIntroForSmallScreen = () => {
      const appEl = document.getElementById("app");
      const titleEl = document.querySelector(".intro-title");
      if (!appEl || !titleEl) return;
      const rect = titleEl.getBoundingClientRect();
      const viewportW = window.innerWidth || document.documentElement.clientWidth;
      // 如果标题宽度接近屏幕宽度（> 98%），则启用紧凑模式
      const shouldCompact = rect.width > viewportW * 0.98;
      appEl.classList.toggle("intro-compact", shouldCompact);
    };
    adjustIntroForSmallScreen();
    window.addEventListener("resize", adjustIntroForSmallScreen);

    // 监听滚动，控制首屏 -> 小标题白色方框的切换
    const updateEnterState = () => {
      const threshold = window.innerHeight * 0.3;
      this.hasEntered = window.scrollY > threshold;
    };
    window.addEventListener("scroll", updateEnterState, { passive: true });
    updateEnterState();
  },
});

// 自定义指令：滚动进入视口时，上滑淡入
app.directive("scroll-reveal", {
  mounted(el) {
    const activate = () => {
      el.classList.add("reveal-active");
    };

    // 已经在可视区域内，直接显示
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      activate();
      return;
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activate();
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
        },
      );
      observer.observe(el);
    } else {
      // 兼容不支持 IntersectionObserver 的浏览器
      const onScroll = () => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.9) {
          activate();
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll);
      onScroll();
    }
  },
});

app.mount("#app");
