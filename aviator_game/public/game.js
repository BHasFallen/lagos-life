// Aviator Crash Game Engine
// Consumer-Faced Player Experience: Solo Arcade & 1v1 Staked Arena

(function() {
  const STATE_WAITING = 0;
  const STATE_FLYING = 1;
  const STATE_CRASHED = 2;

  class AviatorEngine {
    constructor() {
      this.canvas = document.getElementById("flightCanvas");
      this.ctx = this.canvas.getContext("2d");
      
      this.activeGameMode = "solo"; // "solo" or "multi"
      this.state = STATE_WAITING;
      this.stateTime = 0;
      this.lastFrame = performance.now();

      // Multiplier Physics
      this.currentMult = 1.00;
      this.targetCrashMult = 2.00;
      this.flightStartTime = 0;
      this.waitingDuration = 5.0; // 5s countdown
      this.crashedDuration = 3.0; // 3s display after crash
      
      // Coordinates & Visuals
      this.planeX = 0;
      this.planeY = 0;
      this.propellerAngle = 0;
      this.burstParticles = [];
      this.currentSkin = localStorage.getItem("aviator_plane_skin") || "red";

      // Solo Bet Slips
      this.bets = {
        1: { status: 'idle', amount: 500, autoCash: false, autoMult: 2.00, winAmount: 0 },
        2: { status: 'idle', amount: 1000, autoCash: false, autoMult: 1.50, winAmount: 0 }
      };

      // Multiplayer Match State
      this.selectedStake = 1000;
      this.multiStatus = 'idle';
      this.multiCashMult = 0;
      this.oppStatus = 'idle';
      this.oppCashMult = 0;
      this.oppTargetMult = 2.20;

      // History
      this.history = [1.34, 2.85, 1.12, 14.60, 4.18, 1.95, 3.20, 1.08];

      // Simulated Social Ticker
      this.liveBots = [];
      this.botNames = [
        "Tolu", "Emeka", "Fatima", "Kelechi", "Blessing", "Chidi", "Amaka",
        "Femi", "Zainab", "Dapo", "Ngozi", "Babatunde", "Folake", "Ibrahim"
      ];

      // UI Elements
      this.els = {
        multiplierDisplay: document.getElementById("multiplierDisplay"),
        multiplierText: document.getElementById("multiplierText"),
        countdownCard: document.getElementById("countdownCard"),
        countdownTimer: document.getElementById("countdownTimer"),
        countdownProgress: document.getElementById("countdownProgress"),
        crashedCard: document.getElementById("crashedCard"),
        crashedMult: document.getElementById("crashedMult"),
        winToast: document.getElementById("winToast"),
        winToastAmount: document.getElementById("winToastAmount"),
        winToastMult: document.getElementById("winToastMult"),
        historyRibbon: document.getElementById("historyRibbon"),
        playerBalance: document.getElementById("playerBalance"),
        playerName: document.getElementById("playerName"),
        playerAvatar: document.getElementById("playerAvatar"),
        badgeMode: document.getElementById("badgeMode"),
        liveBetsScroll: document.getElementById("liveBetsScroll"),
        activeBetsCount: document.getElementById("activeBetsCount"),
        // Mode switchers
        btnModeSolo: document.getElementById("btnModeSolo"),
        btnModeMulti: document.getElementById("btnModeMulti"),
        soloBettingFooter: document.getElementById("soloBettingFooter"),
        multiBettingFooter: document.getElementById("multiBettingFooter"),
        // Solo Bet 1
        btnAction1: document.getElementById("btnAction1"),
        inputAmount1: document.getElementById("inputAmount1"),
        checkAuto1: document.getElementById("checkAuto1"),
        inputAutoMult1: document.getElementById("inputAutoMult1"),
        // Solo Bet 2
        btnAction2: document.getElementById("btnAction2"),
        inputAmount2: document.getElementById("inputAmount2"),
        checkAuto2: document.getElementById("checkAuto2"),
        inputAutoMult2: document.getElementById("inputAutoMult2"),
        // Multiplayer Elements
        multiLobbyModal: document.getElementById("multiLobbyModal"),
        matchDuelHud: document.getElementById("matchDuelHud"),
        matchPotText: document.getElementById("matchPotText"),
        myPilotStatus: document.getElementById("myPilotStatus"),
        oppPilotName: document.getElementById("oppPilotName"),
        oppPilotStatus: document.getElementById("oppPilotStatus"),
        btnMultiCashout: document.getElementById("btnMultiCashout"),
        btnMultiLeave: document.getElementById("btnMultiLeave"),
      };

      this.isPaused = false;
      this.init();
    }

    async init() {
      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas());

      this.bindInputs();
      this.renderHistory();

      if (window.vatarBridge) {
        const info = await window.vatarBridge.init();
        if (info && info.player) {
          this.els.playerName.textContent = info.player.name || "Captain";
          if (info.player.avatar) {
            this.els.playerAvatar.innerHTML = `<img src="${info.player.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
          }
        }
        window.vatarBridge.onMatchUpdate((m) => this.handleMatchUpdate(m));
      }
      this.updateBalanceUI();

      this.startWaitingRound();
      requestAnimationFrame((t) => this.loop(t));
    }

    setSkin(skin) {
      this.currentSkin = skin;
    }

    resizeCanvas() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.resetTransform?.();
      this.ctx.scale(dpr, dpr);
      this.width = rect.width;
      this.height = rect.height;
    }

    generateCrashMultiplier() {
      const rand = Math.random();
      if (rand < 0.035) return 1.00 + parseFloat((Math.random() * 0.1).toFixed(2));
      const mult = 0.96 / (1 - rand);
      const bounded = Math.max(1.01, Math.min(100.0, mult));
      return parseFloat(bounded.toFixed(2));
    }

    startWaitingRound() {
      this.state = STATE_WAITING;
      this.stateTime = 0;
      this.currentMult = 1.00;
      this.targetCrashMult = this.generateCrashMultiplier();
      this.burstParticles = [];

      this.els.multiplierDisplay.classList.add("hidden");
      this.els.crashedCard.classList.add("hidden");
      this.els.countdownCard.classList.remove("hidden");

      if (this.activeGameMode === "multi" && window.vatarBridge.currentMatch?.status === "playing") {
        this.multiStatus = 'waiting';
        this.oppStatus = 'waiting';
        this.multiCashMult = 0;
        this.oppCashMult = 0;
        this.oppTargetMult = parseFloat((1.3 + Math.random() * 2.2).toFixed(2));
        this.updateMultiHUD();
      }

      this.generateLiveBots();
      this.updateBetButtons();
    }

    startFlight() {
      this.state = STATE_FLYING;
      this.flightStartTime = performance.now();
      this.currentMult = 1.00;

      this.els.countdownCard.classList.add("hidden");
      this.els.crashedCard.classList.add("hidden");
      this.els.multiplierDisplay.classList.remove("hidden");

      if (window.aviatorAudio) {
        window.aviatorAudio.startEngine();
      }

      [1, 2].forEach(p => {
        if (this.bets[p].status === 'queued') {
          this.bets[p].status = 'active';
        }
      });

      if (this.activeGameMode === "multi" && window.vatarBridge.currentMatch?.status === "playing") {
        this.multiStatus = 'in_flight';
        this.oppStatus = 'in_flight';
        this.els.btnMultiCashout.disabled = false;
        this.els.btnMultiCashout.querySelector(".btn-main-label").textContent = "JUMP / CASH OUT";
        this.updateMultiHUD();
      }

      this.updateBetButtons();
    }

    crashFlight() {
      this.state = STATE_CRASHED;
      this.stateTime = 0;

      if (window.aviatorAudio) {
        window.aviatorAudio.playCrash();
      }

      [1, 2].forEach(p => {
        if (this.bets[p].status === 'active') {
          this.bets[p].status = 'lost';
          if (this.activeGameMode === "solo" && window.vatarBridge) {
            window.vatarBridge.recordFlightResult({
              betAmount: this.bets[p].amount,
              cashed: false,
              cashMult: 0
            });
          }
        }
      });
      this.updateBetButtons();

      if (this.activeGameMode === "multi" && window.vatarBridge.currentMatch?.status === "playing") {
        this.settleMultiplayerDuel();
      }

      this.els.multiplierDisplay.classList.add("hidden");
      this.els.crashedCard.classList.remove("hidden");
      this.els.crashedMult.textContent = `@ ${this.currentMult.toFixed(2)}x`;

      this.createBurstParticles(this.planeX, this.planeY);

      this.history.unshift(this.currentMult);
      if (this.history.length > 20) this.history.pop();
      this.renderHistory();
    }

    createBurstParticles(x, y) {
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.burstParticles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 2,
          life: 1.0,
          color: (Math.random() > 0.4) ? '#e51b24' : '#ff7700'
        });
      }
    }

    loop(timestamp) {
      const dt = Math.min(0.1, (timestamp - this.lastFrame) / 1000);
      this.lastFrame = timestamp;

      if (!this.isPaused) {
        this.update(dt);
        this.render();
      }

      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      this.stateTime += dt;
      this.propellerAngle += 0.8;

      if (this.state === STATE_WAITING) {
        const remaining = Math.max(0, this.waitingDuration - this.stateTime);
        this.els.countdownTimer.textContent = `${remaining.toFixed(1)}s`;
        const pct = (remaining / this.waitingDuration) * 100;
        this.els.countdownProgress.style.width = `${pct}%`;

        if (this.stateTime >= this.waitingDuration) {
          this.startFlight();
        }
      } else if (this.state === STATE_FLYING) {
        const flightSecs = (performance.now() - this.flightStartTime) / 1000;
        this.currentMult = 1.00 + Math.pow(flightSecs * 0.45, 1.85);

        this.els.multiplierText.textContent = `${this.currentMult.toFixed(2)}x`;

        if (window.aviatorAudio) {
          window.aviatorAudio.updateEngineMultiplier(this.currentMult);
        }

        [1, 2].forEach(p => {
          const bet = this.bets[p];
          if (bet.status === 'active' && bet.autoCash && this.currentMult >= bet.autoMult) {
            this.cashOutBet(p);
          }
        });

        if (this.activeGameMode === "multi") {
          if (this.oppStatus === 'in_flight' && this.currentMult >= this.oppTargetMult) {
            this.oppStatus = 'cashed';
            this.oppCashMult = this.currentMult;
            this.updateMultiHUD();
          }

          if (this.multiStatus === 'in_flight') {
            const sub = this.els.btnMultiCashout.querySelector(".btn-sub-label");
            if (sub) sub.textContent = `@ ${this.currentMult.toFixed(2)}x`;
          }
        }

        this.updateActiveCashoutButtons();
        this.updateLiveBotsFlight();

        if (this.currentMult >= this.targetCrashMult) {
          this.currentMult = this.targetCrashMult;
          this.crashFlight();
        }
      } else if (this.state === STATE_CRASHED) {
        if (this.stateTime >= this.crashedDuration) {
          this.startWaitingRound();
        }
      }

      for (let i = this.burstParticles.length - 1; i >= 0; i--) {
        const p = this.burstParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 1.5;
        if (p.life <= 0) this.burstParticles.splice(i, 1);
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);
      this.drawRadarGrid(ctx, w, h);

      if (this.state === STATE_FLYING) {
        this.drawFlightCurveAndPlane(ctx, w, h);
      } else if (this.state === STATE_CRASHED) {
        this.drawCrashedState(ctx, w, h);
      } else {
        this.drawRestingPlane(ctx, w, h);
      }

      this.drawBurstParticles(ctx);
    }

    drawRadarGrid(ctx, w, h) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;

      const stepX = w / 6;
      for (let x = stepX; x < w; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const stepY = h / 5;
      for (let y = stepY; y < h; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.font = "10px JetBrains Mono";
      ctx.fillText("0m", 12, h - 14);
      ctx.fillText("2,500m", 12, h * 0.5);
      ctx.fillText("5,000m", 12, 24);
    }

    drawFlightCurveAndPlane(ctx, w, h) {
      const paddingBottom = 40;
      const paddingLeft = 30;

      const progress = Math.min(1.0, Math.log(this.currentMult) / Math.log(15));
      const targetX = paddingLeft + (w - paddingLeft - 80) * (0.2 + progress * 0.75);
      const targetY = (h - paddingBottom) - (h - paddingBottom - 60) * Math.pow(progress, 0.75);

      this.planeX = targetX;
      this.planeY = targetY;

      const startX = paddingLeft;
      const startY = h - paddingBottom;
      const cpX = (startX + targetX) * 0.5;
      const cpY = startY;

      const grad = ctx.createLinearGradient(0, targetY, 0, startY);
      grad.addColorStop(0, "rgba(229, 27, 36, 0.35)");
      grad.addColorStop(1, "rgba(229, 27, 36, 0.0)");

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
      ctx.lineTo(targetX, startY);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
      ctx.strokeStyle = "#e51b24";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#e51b24";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const angle = Math.atan2(targetY - cpY, targetX - cpX) * 0.5 - 0.15;
      this.drawMonoplane(ctx, targetX, targetY, angle);
    }

    drawRestingPlane(ctx, w, h) {
      const x = 50;
      const y = h - 55;
      this.drawMonoplane(ctx, x, y, -0.05);
    }

    drawCrashedState(ctx, w, h) {
      this.planeX += 16;
      this.planeY -= 8;
      if (this.planeX < w + 60) {
        this.drawMonoplane(ctx, this.planeX, this.planeY, -0.4);
      }
    }

    drawMonoplane(ctx, x, y, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const isGold = (this.currentSkin === "gold");
      const bodyColor = isGold ? "#f59e0b" : "#e51b24";
      const wingColor = isGold ? "#fbbf24" : "#ff334b";
      const highlight = isGold ? "#fef08a" : "#ffffff";

      ctx.beginPath();
      ctx.arc(-22, 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = isGold ? "rgba(245, 158, 11, 0.7)" : "rgba(255, 119, 0, 0.7)";
      ctx.shadowColor = isGold ? "#f59e0b" : "#ff7700";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = bodyColor;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(2, -3, 16, 2.5, -0.05, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.globalAlpha = 0.45;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.beginPath();
      ctx.ellipse(6, -4, 7, 4, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-14, 18);
      ctx.lineTo(8, 6);
      ctx.closePath();
      ctx.fillStyle = wingColor;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-18, -2);
      ctx.lineTo(-26, -15);
      ctx.lineTo(-14, -4);
      ctx.closePath();
      ctx.fillStyle = wingColor;
      ctx.fill();

      ctx.save();
      ctx.translate(24, 0);
      ctx.rotate(this.propellerAngle);
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.5, 15, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    drawBurstParticles(ctx) {
      this.burstParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    }

    bindInputs() {
      // Audio
      document.getElementById("btnAudio")?.addEventListener("click", () => {
        if (window.aviatorAudio) {
          const muted = window.aviatorAudio.toggleMute();
          document.getElementById("iconSoundOn").classList.toggle("hidden", muted);
          document.getElementById("iconSoundOff").classList.toggle("hidden", !muted);
        }
      });

      // Modals
      const shopModal = document.getElementById("shopModal");
      document.getElementById("btnShop")?.addEventListener("click", () => shopModal.classList.remove("hidden"));
      document.getElementById("btnCloseShop")?.addEventListener("click", () => shopModal.classList.add("hidden"));

      const helpModal = document.getElementById("helpModal");
      document.getElementById("btnHelp")?.addEventListener("click", () => helpModal.classList.remove("hidden"));
      document.getElementById("btnCloseHelp")?.addEventListener("click", () => helpModal.classList.add("hidden"));

      // Leaderboard Modal
      const leaderboardModal = document.getElementById("leaderboardModal");
      const showLeaderboard = async () => {
        await this.openLeaderboard();
        leaderboardModal.classList.remove("hidden");
      };
      document.getElementById("btnLeaderboard")?.addEventListener("click", showLeaderboard);
      document.getElementById("btnHistoryLeaderboard")?.addEventListener("click", showLeaderboard);
      document.getElementById("btnCloseLeaderboard")?.addEventListener("click", () => {
        leaderboardModal.classList.add("hidden");
      });
      leaderboardModal?.addEventListener("click", (e) => {
        if (e.target === leaderboardModal) leaderboardModal.classList.add("hidden");
      });

      // Mode Switchers
      this.els.btnModeSolo?.addEventListener("click", () => this.switchMode("solo"));
      this.els.btnModeMulti?.addEventListener("click", () => this.switchMode("multi"));

      // Multiplayer Lobby
      document.getElementById("btnCloseMultiLobby")?.addEventListener("click", () => {
        this.els.multiLobbyModal.classList.add("hidden");
      });

      document.querySelectorAll(".stake-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
          document.querySelectorAll(".stake-chip").forEach(c => c.classList.remove("active"));
          e.target.classList.add("active");
          this.selectedStake = parseInt(e.target.getAttribute("data-stake"), 10);
        });
      });

      document.getElementById("btnCreateRoom")?.addEventListener("click", async () => {
        try {
          const match = await window.vatarBridge.createMatch({ stake: this.selectedStake, seats: 2 });
          if (match) {
            document.getElementById("createdRoomCard")?.classList.remove("hidden");
            document.getElementById("displayRoomCode").textContent = match.code || "------";
            document.getElementById("arenaActionsWrap")?.classList.add("hidden");
            document.getElementById("stakeSelectorWrap")?.classList.add("hidden");
          }
        } catch (err) {
          alert(err.message || "Failed to create duel room");
        }
      });

      document.getElementById("btnCancelCreatedRoom")?.addEventListener("click", async () => {
        await window.vatarBridge.leaveMatch();
        document.getElementById("createdRoomCard")?.classList.add("hidden");
        document.getElementById("arenaActionsWrap")?.classList.remove("hidden");
        document.getElementById("stakeSelectorWrap")?.classList.remove("hidden");
      });

      document.getElementById("btnCancelExistingMatch")?.addEventListener("click", async () => {
        await window.vatarBridge.leaveMatch();
        document.getElementById("arenaExistingMatch")?.classList.add("hidden");
        document.getElementById("createdRoomCard")?.classList.add("hidden");
        document.getElementById("arenaActionsWrap")?.classList.remove("hidden");
        document.getElementById("stakeSelectorWrap")?.classList.remove("hidden");
      });

      document.getElementById("btnResumeMatch")?.addEventListener("click", () => {
        const match = window.vatarBridge.currentMatch;
        if (match) {
          this.els.multiLobbyModal.classList.add("hidden");
          this.handleMatchUpdate(match);
        }
      });

      document.getElementById("btnQuickMatch")?.addEventListener("click", async () => {
        try {
          this.els.multiLobbyModal.classList.add("hidden");
          await window.vatarBridge.quickMatch({ stake: this.selectedStake });
        } catch (err) {
          this.checkAndShowMultiLobby();
          alert(err.message || "Failed to start match");
        }
      });

      document.getElementById("btnJoinCode")?.addEventListener("click", async () => {
        const code = document.getElementById("inputRoomCode").value.trim();
        if (!code) return alert("Enter the 6-letter room code!");
        try {
          this.els.multiLobbyModal.classList.add("hidden");
          await window.vatarBridge.joinMatch(code);
        } catch (err) {
          this.checkAndShowMultiLobby();
          alert(err.message || "Match not found or already closed");
        }
      });

      const handleMultiCashoutAction = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (this.multiStatus === 'in_flight') {
          this.multiStatus = 'cashed';
          this.multiCashMult = this.currentMult;
          if (window.aviatorAudio) window.aviatorAudio.playCashout();
          this.els.btnMultiCashout.disabled = true;
          this.els.btnMultiCashout.querySelector(".btn-main-label").textContent = "CASHED OUT";
          const sub = this.els.btnMultiCashout.querySelector(".btn-sub-label");
          if (sub) sub.textContent = `@ ${this.multiCashMult.toFixed(2)}x`;
          this.updateMultiHUD();
        }
      };

      this.els.btnMultiCashout?.addEventListener("click", handleMultiCashoutAction);
      this.els.btnMultiCashout?.addEventListener("pointerdown", handleMultiCashoutAction);
      this.els.btnMultiCashout?.addEventListener("touchstart", handleMultiCashoutAction, { passive: false });

      this.els.btnMultiLeave?.addEventListener("click", async () => {
        if (confirm("Leave this 1v1 match?")) {
          await window.vatarBridge.leaveMatch();
          this.switchMode("solo");
        }
      });

      // Store Purchases
      document.querySelectorAll(".shop-buy-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const prod = e.target.getAttribute("data-product");
          try {
            if (window.vatarBridge) {
              await window.vatarBridge.purchase(prod);
              shopModal.classList.add("hidden");
            }
          } catch {
            // Cancelled
          }
        });
      });

      // Solo Tabs on mobile
      const tab1 = document.getElementById("tabBet1");
      const tab2 = document.getElementById("tabBet2");
      const panel1 = document.getElementById("panelBet1");
      const panel2 = document.getElementById("panelBet2");

      tab1?.addEventListener("click", () => {
        tab1.classList.add("active");
        tab2.classList.remove("active");
        panel1.classList.remove("hidden-mobile");
        panel2.classList.add("hidden-mobile");
      });

      tab2?.addEventListener("click", () => {
        tab2.classList.add("active");
        tab1.classList.remove("active");
        panel2.classList.remove("hidden-mobile");
        panel1.classList.add("hidden-mobile");
      });

      // Solo Steppers
      [1, 2].forEach(p => {
        const inputAmount = this.els[`inputAmount${p}`];
        const btnMinus = document.getElementById(`btnMinus${p}`);
        const btnPlus = document.getElementById(`btnPlus${p}`);
        const btnAction = this.els[`btnAction${p}`];
        const checkAuto = this.els[`checkAuto${p}`];
        const inputAuto = this.els[`inputAutoMult${p}`];

        btnMinus?.addEventListener("click", () => {
          let val = Math.max(100, parseInt(inputAmount.value, 10) - 100);
          inputAmount.value = val;
          this.bets[p].amount = val;
          this.updateBetButtons();
        });

        btnPlus?.addEventListener("click", () => {
          let val = Math.min(50000, parseInt(inputAmount.value, 10) + 100);
          inputAmount.value = val;
          this.bets[p].amount = val;
          this.updateBetButtons();
        });

        inputAmount?.addEventListener("change", () => {
          let val = Math.max(100, Math.min(50000, parseInt(inputAmount.value, 10) || 100));
          inputAmount.value = val;
          this.bets[p].amount = val;
          this.updateBetButtons();
        });

        document.querySelectorAll(`.chip-btn[data-panel="${p}"]`).forEach(chip => {
          chip.addEventListener("click", (e) => {
            const add = parseInt(e.target.getAttribute("data-val"), 10);
            let val = Math.min(50000, add);
            inputAmount.value = val;
            this.bets[p].amount = val;
            this.updateBetButtons();
          });
        });

        checkAuto?.addEventListener("change", (e) => {
          this.bets[p].autoCash = e.target.checked;
          inputAuto.disabled = !e.target.checked;
        });

        inputAuto?.addEventListener("change", (e) => {
          this.bets[p].autoMult = Math.max(1.05, parseFloat(e.target.value) || 2.00);
        });

        btnAction?.addEventListener("click", () => {
          this.handleBetActionClick(p);
        });
      });
    }

    async switchMode(mode) {
      this.activeGameMode = mode;
      this.updateBalanceUI();

      if (mode === "solo") {
        this.els.btnModeSolo.classList.add("active");
        this.els.btnModeMulti.classList.remove("active");
        this.els.soloBettingFooter.classList.remove("hidden");
        this.els.multiBettingFooter.classList.add("hidden");
        this.els.matchDuelHud.classList.add("hidden");
        this.els.multiLobbyModal.classList.add("hidden");
      } else {
        this.els.btnModeMulti.classList.add("active");
        this.els.btnModeSolo.classList.remove("active");
        this.els.soloBettingFooter.classList.add("hidden");
        this.els.multiBettingFooter.classList.remove("hidden");
        await this.checkAndShowMultiLobby();
      }
    }

    async checkAndShowMultiLobby() {
      const match = await window.vatarBridge?.getCurrentMatch();
      const existingBanner = document.getElementById("arenaExistingMatch");
      const existingCode = document.getElementById("existingMatchCode");
      const actionsWrap = document.getElementById("arenaActionsWrap");
      const createdCard = document.getElementById("createdRoomCard");
      const stakeWrap = document.getElementById("stakeSelectorWrap");

      if (match && (match.status === "open" || match.status === "playing")) {
        if (match.status === "playing") {
          this.els.multiLobbyModal.classList.add("hidden");
          this.els.matchDuelHud.classList.remove("hidden");
          this.startMultiplayerFlightRound(match);
          return;
        }

        if (match.code) {
          createdCard?.classList.remove("hidden");
          document.getElementById("displayRoomCode").textContent = match.code;
          actionsWrap?.classList.add("hidden");
          stakeWrap?.classList.add("hidden");
          existingBanner?.classList.add("hidden");
        } else {
          existingBanner?.classList.remove("hidden");
          if (existingCode) existingCode.textContent = match.id?.substring(0, 8) || "Active";
          actionsWrap?.classList.add("hidden");
          createdCard?.classList.add("hidden");
        }
      } else {
        existingBanner?.classList.add("hidden");
        createdCard?.classList.add("hidden");
        actionsWrap?.classList.remove("hidden");
        stakeWrap?.classList.remove("hidden");
      }
      this.els.multiLobbyModal.classList.remove("hidden");
    }

    handleMatchUpdate(match) {
      if (!match) {
        this.els.matchDuelHud.classList.add("hidden");
        return;
      }

      const pot = match.pot || ((match.stake || 1000) * (match.seats || 2));
      this.els.matchPotText.textContent = `₦${pot.toLocaleString()}`;
      if (match.players && match.players.length > 1) {
        const opp = match.players.find(p => (p.id || p.playerId) !== window.vatarBridge.player.id) || match.players[1];
        if (opp && this.els.oppPilotName) {
          this.els.oppPilotName.textContent = opp.name || "Rival Pilot";
        }
      }

      if (match.status === "open") {
        document.getElementById("createdRoomCard")?.classList.remove("hidden");
        const codeEl = document.getElementById("displayRoomCode");
        if (codeEl) codeEl.textContent = match.code || "WAITING";
        document.getElementById("arenaActionsWrap")?.classList.add("hidden");
        document.getElementById("stakeSelectorWrap")?.classList.add("hidden");
      } else if (match.status === "playing") {
        document.getElementById("createdRoomCard")?.classList.add("hidden");
        document.getElementById("arenaExistingMatch")?.classList.add("hidden");
        this.els.multiLobbyModal.classList.add("hidden");
        this.startMultiplayerFlightRound(match);
      }
    }

    startMultiplayerFlightRound(match) {
      this.activeGameMode = "multi";
      this.els.multiLobbyModal.classList.add("hidden");
      this.els.matchDuelHud.classList.remove("hidden");
      this.els.btnModeMulti.classList.add("active");
      this.els.btnModeSolo.classList.remove("active");
      this.els.soloBettingFooter.classList.add("hidden");
      this.els.multiBettingFooter.classList.remove("hidden");

      // Provably Fair flight synchronization from match seed/nonce
      const seed = String(match?.nonce || match?.id || "match_seed");
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
      }
      const rand = (Math.abs(hash) % 10000) / 10000;
      const mult = 0.96 / (1 - rand);
      this.targetCrashMult = parseFloat(Math.max(1.15, Math.min(50.0, mult)).toFixed(2));

      // Opponent bot target cashout
      this.oppTargetMult = parseFloat(Math.max(1.15, Math.min(this.targetCrashMult * 0.85, 1.25 + Math.random() * 2.2)).toFixed(2));

      // Reset directly to flight
      this.state = STATE_FLYING;
      this.flightStartTime = performance.now();
      this.currentMult = 1.00;
      this.stateTime = 0;

      this.multiStatus = 'in_flight';
      this.oppStatus = 'in_flight';
      this.multiCashMult = 0;
      this.oppCashMult = 0;

      // Enable cashout button immediately
      this.els.btnMultiCashout.disabled = false;
      this.els.btnMultiCashout.removeAttribute("disabled");
      this.els.btnMultiCashout.classList.remove("disabled");
      this.els.btnMultiCashout.querySelector(".btn-main-label").textContent = "JUMP / CASH OUT";
      const sub = this.els.btnMultiCashout.querySelector(".btn-sub-label");
      if (sub) sub.textContent = "@ 1.00x";

      this.els.countdownCard.classList.add("hidden");
      this.els.crashedCard.classList.add("hidden");
      this.els.multiplierDisplay.classList.remove("hidden");
      this.els.multiplierText.textContent = "1.00x";

      if (window.aviatorAudio) {
        window.aviatorAudio.startEngine();
      }

      this.updateMultiHUD();
    }

    updateMultiHUD() {
      if (this.multiStatus === 'cashed') {
        this.els.myPilotStatus.className = "pilot-status cashed";
        this.els.myPilotStatus.textContent = `Cashed @ ${this.multiCashMult.toFixed(2)}x`;
      } else if (this.multiStatus === 'in_flight') {
        this.els.myPilotStatus.className = "pilot-status";
        this.els.myPilotStatus.textContent = "Flying...";
      } else {
        this.els.myPilotStatus.className = "pilot-status";
        this.els.myPilotStatus.textContent = "Waiting...";
      }

      if (this.oppStatus === 'cashed') {
        this.els.oppPilotStatus.className = "pilot-status cashed";
        this.els.oppPilotStatus.textContent = `Cashed @ ${this.oppCashMult.toFixed(2)}x`;
      } else if (this.oppStatus === 'in_flight') {
        this.els.oppPilotStatus.className = "pilot-status";
        this.els.oppPilotStatus.textContent = "Flying...";
      } else {
        this.els.oppPilotStatus.className = "pilot-status";
        this.els.oppPilotStatus.textContent = "Waiting...";
      }
    }

    settleMultiplayerDuel() {
      const match = window.vatarBridge.currentMatch;
      if (!match) return;

      let winnerId = null;
      let outcomeText = "";

      const playerSurvived = (this.multiStatus === 'cashed');
      const oppSurvived = (this.oppStatus === 'cashed');

      const opp = match.players?.find(p => (p.id || p.playerId) !== window.vatarBridge.player.id) || match.players?.[1];
      const oppId = opp?.id || opp?.playerId || "draw";

      if (playerSurvived && !oppSurvived) {
        winnerId = window.vatarBridge.player.id;
        outcomeText = "VICTORY! Your rival crashed!";
      } else if (!playerSurvived && oppSurvived) {
        winnerId = oppId;
        outcomeText = "DEFEAT! Rival pilot cashed out first!";
      } else if (playerSurvived && oppSurvived) {
        if (this.multiCashMult > this.oppCashMult) {
          winnerId = window.vatarBridge.player.id;
          outcomeText = `VICTORY! Your ${this.multiCashMult.toFixed(2)}x beat ${this.oppCashMult.toFixed(2)}x!`;
        } else if (this.oppCashMult > this.multiCashMult) {
          winnerId = oppId;
          outcomeText = `DEFEAT! Rival achieved ${this.oppCashMult.toFixed(2)}x!`;
        } else {
          winnerId = "draw";
          outcomeText = "DRAW! Exact same cashout time!";
        }
      } else {
        winnerId = "draw";
        outcomeText = "DRAW! Both aircraft crashed!";
      }

      const pot = match.pot || ((match.stake || 1000) * (match.seats || 2));
      const potAfterCut = Math.floor(pot * 0.95);
      if (winnerId === "draw") {
        // SUDDEN DEATH ROLLOVER:
        // Neither pilot gets a refund! The pot stays locked on the table for an immediate rematch flight!
        alert("⚡ SUDDEN DEATH ROLLOVER! ⚡\nBoth pilots crashed! The prize pot stays locked on the table.\nNext flight takes off immediately — first to cash out wins the pot!");
        this.multiStatus = 'waiting';
        this.oppStatus = 'waiting';
        this.multiCashMult = 0;
        this.oppCashMult = 0;
        this.oppTargetMult = parseFloat((1.15 + Math.random() * 1.6).toFixed(2));
        this.els.btnMultiCashout.disabled = true;
        this.els.btnMultiCashout.querySelector(".btn-main-label").textContent = "SUDDEN DEATH LOCKED";
        this.updateMultiHUD();
        return;
      }

      if (winnerId === window.vatarBridge.player.id) {
        window.vatarBridge.addLagosMoney(potAfterCut);
        this.showWinToast(`+₦${potAfterCut.toLocaleString()}`, this.multiCashMult);
        alert(`🏆 ${outcomeText}\n₦${potAfterCut.toLocaleString()} added to your Lagos Life wallet!`);
      } else {
        alert(`💥 ${outcomeText}\nRival pilot took the pot.`);
      }

      window.vatarBridge.settleMatchResult(match.id, winnerId);
      this.els.btnMultiCashout.disabled = true;
      this.els.btnMultiCashout.querySelector(".btn-main-label").textContent = "MATCH COMPLETED";
    }

    handleBetActionClick(panelId) {
      if (window.aviatorAudio) window.aviatorAudio.playClick();
      const bet = this.bets[panelId];

      if (this.state === STATE_WAITING) {
        if (bet.status === 'idle') {
          if (window.vatarBridge && !window.vatarBridge.deductChips(bet.amount)) {
            alert("Insufficient Flight Chips! Refill in the Hangar Store.");
            return;
          }
          bet.status = 'queued';
        } else if (bet.status === 'queued') {
          if (window.vatarBridge) window.vatarBridge.addChips(bet.amount);
          bet.status = 'idle';
        }
      } else if (this.state === STATE_FLYING) {
        if (bet.status === 'active') {
          this.cashOutBet(panelId);
        }
      }
      this.updateBetButtons();
    }

    cashOutBet(panelId) {
      const bet = this.bets[panelId];
      if (bet.status !== 'active') return;

      bet.status = 'cashed';
      bet.winMult = this.currentMult;
      bet.winAmount = Math.floor(bet.amount * this.currentMult);

      if (window.vatarBridge) {
        window.vatarBridge.addChips(bet.winAmount);
        if (this.activeGameMode === "solo") {
          window.vatarBridge.recordFlightResult({
            betAmount: bet.amount,
            cashed: true,
            cashMult: this.currentMult
          });
        }
      }

      if (window.aviatorAudio) window.aviatorAudio.playCashout();
      this.showWinToast(`+${bet.winAmount.toLocaleString()} Chips`, this.currentMult);
      this.updateBetButtons();
    }

    showWinToast(amountLabel, mult) {
      this.els.winToastAmount.textContent = amountLabel;
      this.els.winToastMult.textContent = `@ ${mult.toFixed(2)}x`;
      this.els.winToast.classList.remove("hidden");
      setTimeout(() => {
        this.els.winToast.classList.add("hidden");
      }, 2400);
    }

    async openLeaderboard() {
      if (!window.vatarBridge) return;
      const data = await window.vatarBridge.getLeaderboard();
      if (!data) return;

      const myRankPos = document.getElementById("myRankPos");
      const myRankName = document.getElementById("myRankName");
      const myRankPeak = document.getElementById("myRankPeak");
      const myRankScore = document.getElementById("myRankScore");
      const listEl = document.getElementById("leaderboardList");

      if (data.me) {
        myRankPos.textContent = data.me.label || `#${data.me.rank}`;
        myRankName.textContent = `${window.vatarBridge.player.name} (You)`;
        if (myRankPeak) myRankPeak.textContent = `Peak: ${data.me.bestMult || '1.00x'}`;
        const profit = data.me.profit || 0;
        myRankScore.textContent = `${profit >= 0 ? '+' : ''}${profit.toLocaleString()} 🪙`;
        myRankScore.className = `rank-score ${profit < 0 ? 'negative' : ''}`;
      }

      listEl.innerHTML = "";
      (data.top || []).forEach(p => {
        const row = document.createElement("div");
        row.className = "leaderboard-row";
        if (p.rank === 1) row.classList.add("rank-gold");
        else if (p.rank === 2) row.classList.add("rank-silver");
        else if (p.rank === 3) row.classList.add("rank-bronze");

        const profitVal = p.profit || 0;
        const profitFormatted = `${profitVal >= 0 ? '+' : ''}${profitVal.toLocaleString()} 🪙`;

        row.innerHTML = `
          <div class="row-rank">#${p.rank}</div>
          <div class="row-avatar">${p.avatar || "👨🏾‍✈️"}</div>
          <div class="row-details">
            <span class="row-name">${p.name}</span>
            <span class="row-stat-peak">Peak ${p.bestMult}</span>
          </div>
          <div class="row-score ${profitVal < 0 ? 'negative' : ''}">${profitFormatted}</div>
        `;
        listEl.appendChild(row);
      });
    }

    updateBetButtons() {
      [1, 2].forEach(p => {
        const btn = this.els[`btnAction${p}`];
        const bet = this.bets[p];
        const labelMain = btn.querySelector(".btn-main-label");
        const labelSub = btn.querySelector(".btn-sub-label");

        btn.className = "action-btn";

        if (this.state === STATE_WAITING) {
          if (bet.status === 'idle') {
            btn.classList.add("btn-bet");
            labelMain.textContent = "BET";
            labelSub.textContent = `${bet.amount.toLocaleString()} Chips`;
          } else if (bet.status === 'queued') {
            btn.classList.add("btn-cancel");
            labelMain.textContent = "CANCEL";
            labelSub.textContent = "ARMED FOR FLIGHT";
          }
        } else if (this.state === STATE_FLYING) {
          if (bet.status === 'active') {
            btn.classList.add("btn-cashout");
            const liveWin = Math.floor(bet.amount * this.currentMult);
            labelMain.textContent = "CASH OUT";
            labelSub.textContent = `${liveWin.toLocaleString()} Chips`;
          } else if (bet.status === 'cashed') {
            btn.classList.add("btn-bet");
            labelMain.textContent = "CASHED";
            labelSub.textContent = `+${bet.winAmount.toLocaleString()} Chips`;
          } else {
            btn.classList.add("btn-bet");
            labelMain.textContent = "NEXT FLIGHT";
            labelSub.textContent = "IN AIR";
          }
        } else if (this.state === STATE_CRASHED) {
          btn.classList.add("btn-bet");
          if (bet.status === 'lost') {
            labelMain.textContent = "FLEW AWAY";
            labelSub.textContent = "TRY AGAIN";
          } else {
            labelMain.textContent = "NEXT ROUND";
            labelSub.textContent = "PREPARING";
          }
          bet.status = 'idle';
        }
      });
    }

    updateActiveCashoutButtons() {
      [1, 2].forEach(p => {
        const bet = this.bets[p];
        if (bet.status === 'active') {
          const btn = this.els[`btnAction${p}`];
          const labelSub = btn.querySelector(".btn-sub-label");
          const liveWin = Math.floor(bet.amount * this.currentMult);
          labelSub.textContent = `${liveWin.toLocaleString()} Chips (${this.currentMult.toFixed(2)}x)`;
        }
      });
    }

    updateBalanceUI() {
      if (!window.vatarBridge) return;
      if (this.activeGameMode === "solo") {
        this.els.playerBalance.textContent = `🪙 ${window.vatarBridge.flightChips.toLocaleString()}`;
      } else {
        this.els.playerBalance.textContent = `₦${window.vatarBridge.lagosMoney.toLocaleString()}`;
      }
    }

    renderHistory() {
      const ribbon = this.els.historyRibbon;
      ribbon.innerHTML = "";
      this.history.forEach(mult => {
        const pill = document.createElement("div");
        pill.className = "history-pill";
        if (mult < 2.0) pill.classList.add("pill-blue");
        else if (mult < 10.0) pill.classList.add("pill-purple");
        else pill.classList.add("pill-gold");
        pill.textContent = `${mult.toFixed(2)}x`;
        ribbon.appendChild(pill);
      });
    }

    generateLiveBots() {
      this.liveBots = [];
      const numBots = Math.floor(Math.random() * 8) + 8;
      for (let i = 0; i < numBots; i++) {
        const name = this.botNames[i % this.botNames.length];
        const amount = [500, 1000, 2000, 5000, 10000][Math.floor(Math.random() * 5)];
        const targetCash = 1.1 + Math.random() * 4.5;
        this.liveBots.push({ name, amount, targetCash, cashed: false });
      }
      this.els.activeBetsCount.textContent = `${this.liveBots.length} In Flight`;
      this.renderLiveBots();
    }

    updateLiveBotsFlight() {
      let changed = false;
      this.liveBots.forEach(bot => {
        if (!bot.cashed && this.currentMult >= bot.targetCash) {
          bot.cashed = true;
          bot.cashMult = this.currentMult;
          changed = true;
        }
      });
      if (changed) this.renderLiveBots();
    }

    renderLiveBots() {
      const scroll = this.els.liveBetsScroll;
      scroll.innerHTML = "";
      this.liveBots.forEach(bot => {
        const item = document.createElement("span");
        item.className = "live-bet-item";
        if (bot.cashed) {
          item.classList.add("cashed");
          item.innerHTML = `<b>${bot.name}</b>: @${bot.cashMult.toFixed(2)}x (+${Math.floor(bot.amount * bot.cashMult)})`;
        } else {
          item.innerHTML = `<b>${bot.name}</b>: ${bot.amount} chips`;
        }
        scroll.appendChild(item);
      });
    }

    pauseGame() {
      this.isPaused = true;
    }

    resumeGame() {
      this.isPaused = false;
      this.lastFrame = performance.now();
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.aviatorGame = new AviatorEngine();
  });
})();
