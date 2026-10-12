// Vatar SDK Bridge & Player Experience Controller
// Manages Solo Arcade Flight Chips & Lagos Life In-Game Currency

class VatarBridge {
  constructor() {
    this.isEmbedded = false;
    this.player = {
      id: "p_pilot_ayo",
      name: "Captain Ayo",
      avatar: null
    };
    this.session = null;
    this.mode = "live";

    // Player Balances: Clearly separated for player clarity
    this.flightChips = 50000;   // Used in Solo Flight Arcade
    this.lagosMoney = 150000;   // Lagos Life In-Game Wallet (used in 1v1 Arena)

    // Option A: Normalized Net Flight Profit & Fair Competition Engine
    // Real money chip purchases never add to profit — only successful flights do!
    this.netFlightProfit = parseInt(localStorage.getItem("aviator_net_profit") || "13600", 10);
    this.bestMultiplier = parseFloat(localStorage.getItem("aviator_best_mult") || "14.60");
    this.lastScoreSubmitTime = 0;

    // Multiplayer State
    this.currentMatch = null;
    this.matchListeners = [];
  }

  async init() {
    if (typeof window.Vatar !== "undefined" && typeof window.Vatar.init === "function") {
      try {
        const res = await window.Vatar.init();
        this.isEmbedded = true;
        this.player = res.player || this.player;
        this.session = res.session;
        this.mode = res.mode || "live";

        if (typeof window.Vatar.onPause === "function") {
          window.Vatar.onPause(() => {
            if (window.aviatorAudio) window.aviatorAudio.pauseAll();
            if (window.aviatorGame) window.aviatorGame.pauseGame();
          });
        }

        if (typeof window.Vatar.onResume === "function") {
          window.Vatar.onResume(() => {
            if (window.aviatorAudio) window.aviatorAudio.resumeAll();
            if (window.aviatorGame) window.aviatorGame.resumeGame();
          });
        }

        if (typeof window.Vatar.purchases === "function") {
          window.Vatar.purchases().then((list) => {
            if (list && list.length) {
              list.forEach((p) => this.handleClaim(p));
            }
          }).catch(() => {});
        }

        if (typeof window.Vatar.onPurchase === "function") {
          window.Vatar.onPurchase((p) => this.handleClaim(p));
        }

        if (window.Vatar.match && typeof window.Vatar.match.onUpdate === "function") {
          window.Vatar.match.onUpdate((m) => {
            console.log("[Bridge] Match update received:", m);
            this.currentMatch = m;
            this.notifyMatchListeners(m);
          });
        }

        if (window.Vatar.match && typeof window.Vatar.match.current === "function") {
          window.Vatar.match.current().then((m) => {
            if (m) {
              console.log("[Bridge] Found existing match on startup:", m);
              this.currentMatch = m;
              this.notifyMatchListeners(m);
            }
          }).catch(() => {});
        }

        return { player: this.player, mode: this.mode, isEmbedded: true };
      } catch (err) {
        console.warn("Vatar.init:", err.code || err.message);
      }
    }

    // Standalone Local preview
    const savedChips = localStorage.getItem("aviator_chips");
    if (savedChips) this.flightChips = parseInt(savedChips, 10) || 50000;

    const savedMoney = localStorage.getItem("aviator_lagos_money");
    if (savedMoney) this.lagosMoney = parseInt(savedMoney, 10) || 150000;

    return { player: this.player, mode: "live", isEmbedded: false };
  }

  // Record individual flight performance (Dynamic profit that increases or reduces)
  // Standardized base stake: Max 1,000 chips scored per bet so whales have zero unfair advantage
  recordFlightResult({ betAmount, cashed, cashMult }) {
    const scoredStake = Math.min(betAmount, 1000);

    if (cashed) {
      const profit = Math.round(scoredStake * (cashMult - 1));
      this.netFlightProfit += profit;
      if (cashMult > this.bestMultiplier) {
        this.bestMultiplier = Math.round(cashMult * 100) / 100;
        localStorage.setItem("aviator_best_mult", this.bestMultiplier.toString());
      }
    } else {
      // Lost/crashed flight
      this.netFlightProfit -= scoredStake;
    }

    localStorage.setItem("aviator_net_profit", this.netFlightProfit.toString());

    // Submit positive profit to Vatar platform leaderboard if available (respecting 20s rate limit)
    const now = Date.now();
    if (now - this.lastScoreSubmitTime > 20000 && this.netFlightProfit > 0) {
      this.lastScoreSubmitTime = now;
      this.submitScore(this.netFlightProfit);
    }

    return {
      netProfit: this.netFlightProfit,
      bestMult: this.bestMultiplier
    };
  }

  // Submit Solo High Scores to Leaderboard
  async submitScore(score) {
    if (this.isEmbedded && typeof window.Vatar !== "undefined") {
      try {
        return await window.Vatar.submitScore(score);
      } catch (e) {
        console.warn("Score update:", e.code || e);
      }
    }
    let localBest = parseInt(localStorage.getItem("aviator_best_score") || "0", 10);
    if (score > localBest) {
      localStorage.setItem("aviator_best_score", String(score));
    }
    return { best: Math.max(score, localBest), accepted: true };
  }

  // Fetch Solo Leaderboard (Top 50 + Personal Rank by Net Flight Profit)
  async getLeaderboard() {
    if (this.isEmbedded && window.Vatar?.leaderboard) {
      try {
        const liveBoard = await window.Vatar.leaderboard();
        if (liveBoard && liveBoard.top) {
          return {
            top: liveBoard.top.map(p => ({
              rank: p.rank,
              name: p.name,
              profit: p.score,
              bestMult: (p.bestMult || (Math.max(1.2, p.score / 1000 + 1)).toFixed(2)) + "x",
              avatar: p.avatar || "👨🏾‍✈️"
            })),
            me: {
              rank: liveBoard.me?.rank || this.calculateRank(this.netFlightProfit),
              label: liveBoard.me?.label || `#${this.calculateRank(this.netFlightProfit)}`,
              profit: this.netFlightProfit,
              bestMult: `${this.bestMultiplier.toFixed(2)}x`
            }
          };
        }
      } catch (e) {
        console.warn("Vatar.leaderboard error:", e);
      }
    }

    // High fidelity simulator for competitive Lagos Life flight community
    const top = [
      { rank: 1, name: "Capt. Femi (Lekki)", profit: 142500, bestMult: "142.50x", avatar: "🦅" },
      { rank: 2, name: "Zainab Sky Queen", profit: 98200, bestMult: "98.20x", avatar: "👑" },
      { rank: 3, name: "Emeka The Jet", profit: 74500, bestMult: "74.50x", avatar: "⚡" },
      { rank: 4, name: "Dapo Alagbado", profit: 52100, bestMult: "52.10x", avatar: "🛩️" },
      { rank: 5, name: "Folake High Flyer", profit: 38400, bestMult: "38.40x", avatar: "✨" },
      { rank: 6, name: "Babatunde Wings", profit: 29100, bestMult: "29.10x", avatar: "🚀" },
      { rank: 7, name: "Kelechi Cloud", profit: 22400, bestMult: "22.40x", avatar: "🌤️" },
      { rank: 8, name: "Fatima Supersonic", profit: 18900, bestMult: "18.90x", avatar: "🔥" }
    ];

    const myRank = this.calculateRank(this.netFlightProfit);

    return {
      top,
      me: {
        rank: myRank,
        label: `#${myRank}`,
        profit: this.netFlightProfit,
        bestMult: `${this.bestMultiplier.toFixed(2)}x`
      }
    };
  }

  calculateRank(profit) {
    if (profit >= 142500) return 1;
    if (profit >= 98200) return 2;
    if (profit >= 74500) return 3;
    if (profit >= 52100) return 4;
    if (profit >= 38400) return 5;
    if (profit >= 29100) return 6;
    if (profit >= 22400) return 7;
    if (profit >= 18900) return 8;
    if (profit >= 15000) return 10;
    if (profit >= 10000) return 12;
    if (profit >= 5000) return 22;
    if (profit >= 1000) return 45;
    if (profit >= 0) return 78;
    return 115;
  }

  // Real Money Purchases in Hangar Store
  async purchase(productId) {
    if (this.isEmbedded && typeof window.Vatar !== "undefined") {
      try {
        const p = await window.Vatar.purchase(productId);
        await this.handleClaim(p);
        return p;
      } catch (e) {
        throw e;
      }
    }

    // Standalone Preview: Player-friendly confirmation
    return new Promise((resolve, reject) => {
      let label = "this item";
      if (productId.includes("50k")) label = "50,000 Flight Chips for ₦100";
      else if (productId.includes("200k")) label = "200,000 Flight Chips for ₦500";
      else if (productId.includes("skin_gold")) label = "Golden Concorde Jet for ₦1,000";

      const confirmBuy = confirm(`Get ${label}?\n(Test mode: instant unlock, no real charge)`);
      if (confirmBuy) {
        const mockP = { purchaseId: "pur_" + Date.now(), productId };
        this.handleClaim(mockP);
        resolve(mockP);
      } else {
        const err = new Error("Cancelled by user");
        err.code = "cancelled";
        reject(err);
      }
    });
  }

  async handleClaim(p) {
    if (!p) return;
    const purchaseId = p.purchaseId || p.id;
    const productId = p.productId || "";
    console.log("[Bridge] Fulfilling purchase:", purchaseId, productId);

    if (this.isEmbedded) {
      try {
        const { session } = await (window.Vatar.session ? window.Vatar.session() : { session: this.session });
        const resp = await fetch("/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session, purchaseId })
        });
        const claimResult = await resp.json().catch(() => ({}));
        console.log("[Bridge] Claim result from server:", resp.status, claimResult);
        if (resp.ok) {
          this.applyProductReward(productId || claimResult.productId);
        }
      } catch (err) {
        console.warn("Claim fulfillment error:", err);
      }
    } else {
      this.applyProductReward(productId);
    }
  }

  applyProductReward(productId) {
    if (productId.includes("50k")) {
      this.addChips(50000);
      alert("🎉 50,000 Flight Chips added to your bankroll!");
    } else if (productId.includes("200k")) {
      this.addChips(200000);
      alert("🎉 200,000 Flight Chips added to your bankroll!");
    } else if (productId.includes("skin_gold")) {
      localStorage.setItem("aviator_plane_skin", "gold");
      if (window.aviatorGame) window.aviatorGame.setSkin("gold");
      alert("✨ Golden Concorde Jet Skin Unlocked!");
    }
  }

  // Chip Operations (Solo Mode)
  addChips(amount) {
    this.flightChips += amount;
    localStorage.setItem("aviator_chips", String(this.flightChips));
    if (window.aviatorGame) window.aviatorGame.updateBalanceUI();
  }

  deductChips(amount) {
    if (this.flightChips < amount) return false;
    this.flightChips -= amount;
    localStorage.setItem("aviator_chips", String(this.flightChips));
    if (window.aviatorGame) window.aviatorGame.updateBalanceUI();
    return true;
  }

  // Lagos Life In-Game Money Operations (1v1 Arena)
  addLagosMoney(amount) {
    this.lagosMoney += amount;
    localStorage.setItem("aviator_lagos_money", String(this.lagosMoney));
    if (window.aviatorGame) window.aviatorGame.updateBalanceUI();
  }

  deductLagosMoney(amount) {
    if (this.lagosMoney < amount) return false;
    this.lagosMoney -= amount;
    localStorage.setItem("aviator_lagos_money", String(this.lagosMoney));
    if (window.aviatorGame) window.aviatorGame.updateBalanceUI();
    return true;
  }

  // Multiplayer Match Handlers
  onMatchUpdate(fn) {
    this.matchListeners.push(fn);
    return () => {
      this.matchListeners = this.matchListeners.filter(l => l !== fn);
    };
  }

  notifyMatchListeners(m) {
    this.matchListeners.forEach(fn => fn(m));
  }

  async getCurrentMatch() {
    if (this.isEmbedded && window.Vatar?.match?.current) {
      try {
        const m = await window.Vatar.match.current();
        if (m) {
          this.currentMatch = m;
          this.notifyMatchListeners(m);
        }
        return m;
      } catch (e) {
        console.warn("[Bridge] getCurrentMatch error:", e);
      }
    }
    return this.currentMatch;
  }

  async createMatch({ stake, seats = 2 }) {
    if (this.isEmbedded && window.Vatar?.match?.create) {
      try {
        const m = await window.Vatar.match.create({ stake, seats });
        this.currentMatch = m;
        this.notifyMatchListeners(m);
        return m;
      } catch (err) {
        console.warn("[Bridge] createMatch error:", err);
        if (err.code === "already_in_match" || String(err).includes("already")) {
          const curr = await this.getCurrentMatch();
          if (curr) return curr;
        }
        throw err;
      }
    }

    if (!this.deductLagosMoney(stake)) {
      throw new Error("Insufficient Lagos Life wallet cash to cover this stake!");
    }

    const code = "AV" + Math.floor(1000 + Math.random() * 9000);
    this.currentMatch = {
      id: "match_" + Date.now(),
      code,
      status: "open",
      stake,
      seats,
      pot: stake * seats,
      players: [
        { id: this.player.id, name: this.player.name }
      ],
      winner: null
    };

    this.notifyMatchListeners(this.currentMatch);
    return this.currentMatch;
  }

  async quickMatch({ stake = 1000 }) {
    if (this.isEmbedded && window.Vatar?.match?.quick) {
      try {
        const m = await window.Vatar.match.quick({ stake });
        this.currentMatch = m;
        this.notifyMatchListeners(m);
        return m;
      } catch (err) {
        console.warn("[Bridge] quickMatch error:", err);
        if (err.code === "already_in_match" || String(err).includes("already")) {
          const curr = await this.getCurrentMatch();
          if (curr) return curr;
        }
        throw err;
      }
    }

    const match = await this.createMatch({ stake, seats: 2 });
    
    // Simulate opponent joining after 1.2s for offline preview
    setTimeout(() => {
      if (this.currentMatch && this.currentMatch.id === match.id) {
        this.currentMatch.players.push({
          id: "bot_babatunde",
          name: "Capt. Babatunde"
        });
        this.currentMatch.status = "playing";
        this.notifyMatchListeners(this.currentMatch);
      }
    }, 1200);

    return match;
  }

  async joinMatch(code) {
    if (this.isEmbedded && window.Vatar?.match?.join) {
      try {
        const m = await window.Vatar.match.join(code.toUpperCase());
        this.currentMatch = m;
        this.notifyMatchListeners(m);
        return m;
      } catch (err) {
        console.warn("[Bridge] joinMatch error:", err);
        throw err;
      }
    }

    const stake = 1000;
    if (!this.deductLagosMoney(stake)) {
      throw new Error("Insufficient Lagos Life wallet cash for this stake!");
    }

    const match = {
      id: "match_" + Date.now(),
      code: code.toUpperCase(),
      status: "playing",
      stake,
      seats: 2,
      pot: 2000,
      players: [
        { id: "pilot_chidi", name: "Capt. Chidi" },
        { id: this.player.id, name: this.player.name }
      ],
      winner: null
    };
    this.currentMatch = match;
    this.notifyMatchListeners(match);
    return match;
  }

  async leaveMatch() {
    console.log("[Bridge] Leaving match:", this.currentMatch?.id);
    if (this.isEmbedded && window.Vatar?.match?.leave) {
      try {
        await window.Vatar.match.leave();
      } catch (e) {
        console.warn("[Bridge] Vatar.match.leave error:", e);
      }
    }
    if (this.currentMatch && !this.isEmbedded && this.currentMatch.status === "open") {
      this.addLagosMoney(this.currentMatch.stake);
    }
    this.currentMatch = null;
    this.notifyMatchListeners(null);
  }

  async settleMatchResult(matchId, winnerId) {
    try {
      const resp = await fetch("/settle-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, winner: winnerId })
      });
      const data = await resp.json().catch(() => ({}));
      // In Lagos Life, freeing seat after round completion allows subsequent matches
      setTimeout(() => {
        this.leaveMatch();
      }, 3500);
      return data;
    } catch {
      setTimeout(() => {
        this.leaveMatch();
      }, 3500);
      return { settled: true, winner: winnerId };
    }
  }
}

window.vatarBridge = new VatarBridge();
